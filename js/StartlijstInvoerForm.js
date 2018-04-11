var StartlijstInvoerForm_GRID = null;
var StartlijstInvoerForm_GRIDPAGE = null;

Ext.StartlijstInvoerForm = function(){		
    return {
		// Deze functie wordt aangeroepen als het start invoer window wordt geopend
		onStartInvoerWindowShow: function(abstractcomponent, options, ID, GRID, GRIDPAGE)
		{
			StartlijstInvoerForm_GRID = GRID;
			StartlijstInvoerForm_GRIDPAGE = GRIDPAGE;
			
			// Reset alle filters van de comboboxen
			Ext.getCmp('StartInvoer_Vliegtuig').store.clearFilter();
			Ext.getCmp('StartInvoer_OpRekening').store.clearFilter();Ext.getCmp('StartInvoer_OpRekening').store.clearFilter();
			Ext.getCmp('StartInvoer_Gezagvoerder').store.clearFilter();
			Ext.data.StoreManager.lookup('Startlijst_Vlieger_Store').clearFilter();
			Ext.data.StoreManager.lookup('Startlijst_Inzittende_Store').clearFilter();
			
			// Deze drie velden worden later bij de functie SoortVlucht gebruikt om de hoeveelheid
			// aanroepen naar de server te beperken
			lastVliegtuigID 	= -1;
			lastLidID 			= -1;
			lastInzittendeID 	= -1;
		
			console.log(sprintf("%s: onStartInvoerWindowShow(%s)", TijdStempel(), ID));
			var form = Ext.getCmp('StartInvoer_InvoerForm');
			form.show();
			DisableFormEvents(form);	// ivm performance, schakel alls events uit	
			
			var InvoerVliegtuig = Ext.getCmp('StartInvoer_Vliegtuig');			// combobox vliegtuig
			var InvoerSoortVlucht = Ext.getCmp('StartInvoer_SoortVlucht');		// checkbox grid
			var InvoerStartMethode = Ext.getCmp('StartInvoer_StartMethode');	// checkbox grid
		
			
			// Welke vliegtuigen worden standaard getoond in de combobox 
			if (appSettings.Aanwezigheid)
			{
				console.log(sprintf("%s: onStartInvoerWindowShow, aanwezig vliegtuigen", TijdStempel()));

				InvoerVliegtuig.primaryFilterBy = 
				"function myfilter(record,id) " 							+
				"{" 														+
					"    var InvoerVliegtuig = Ext.getCmp('StartInvoer_Vliegtuig');" 	 	+
					"    if (record.data.ID == InvoerVliegtuig.getValue()) return true;" 	+
					"    if (record.data.AANWEZIG == '0') return false;" 	+
					"    if (record.data.CLUBKIST == '1')" 					+
					"    {" 													+
					"        if (record.data.OVERLAND == 1) return false;"		+
					"    }" 													+
					"    else" 													+
					"    {" 													+
					"        if (record.data.VLIEGT != null) return false;"		+
					"    }" 													+
					"    return true;" 											+
				"}"; 			

				eval("var sif2=" + InvoerVliegtuig.primaryFilterBy);
				InvoerVliegtuig.store.filterBy(sif2);	
				
				if (InvoerVliegtuig.store.count() == 0)
					InvoerVliegtuig.store.clearFilter();
			}
			else				
			{
				console.log(sprintf("%s: onStartInvoerWindowShow, alle vliegtuigen", TijdStempel()));
				
				InvoerVliegtuig.primaryFilterBy = 
				"function myfilter(record,id) " 							+
				"{" 														+
					"    var InvoerVliegtuig = Ext.getCmp('StartInvoer_Vliegtuig');" 	 	+
					"    if (record.data.ID == InvoerVliegtuig.getValue()) return true;" 	+
					"    if (record.data.CLUBKIST == '1')" 					+
					"    {" 													+
					"        if (record.data.OVERLAND == 1) return false;"		+
					"    }" 													+
					"    else" 													+
					"    {" 													+
					"        if (record.data.VLIEGT != null) return false;"		+
					"    }" 													+
					"    return true;" 											+
				"}"; 
				eval("var sif3 =" + InvoerVliegtuig.primaryFilterBy);
				InvoerVliegtuig.store.filterBy(sif3);
			}
			
			var lstore = Ext.data.StoreManager.lookup('Startlijst_Vlieger_Store');	// de store met potentiele vliegers
			lstore.clearFilter();
			lstore.slimLaden(null, false);

			// koppel de Startlijst_Vlieger_Store aan de combobox
			Ext.getCmp('StartInvoer_Gezagvoerder').bindStore(lstore);		
			
			// haal startlijst record op, of maak een nieuw record
			var record;
			if (ID == -1)		// nieuwe start
			{
				Ext.getCmp('StartInvoer_Titel').setText('Nieuwe vlucht');
			
				var datum = Ext.getCmp('StartlijstDatum').getValue();
				if (datum === null)
					datum = new Date();
				
				record = Ext.create('GeZC_StartAdministratie.model.Startlijst_Model', 
				{
					ID: -1,
					DATUM: sprintf("%s-%s-%s", datum.getFullYear(), datum.getMonth()+1, datum.getDate())
				});				
				
				form.loadRecord(record); 	// laad het record in het formulier
				form.OpRekeningOvernemen = true;	// bij het wijzigen van de vlieger wordt ook de op rekening automatisch aangepast
				
				console.log(sprintf("%s: Tonen start invoer form", TijdStempel()));
				Ext.StartlijstInvoerForm.DynamischFormulier();
				InvoerVliegtuig.focus(false, true);				
			}
			else				// aanpassen bestaande start
			{
				Ext.getCmp('StartInvoer_Titel').setText('Aanpassen vlucht');
				
				var store = Ext.data.StoreManager.lookup(StartlijstInvoerForm_GRID); 

				// We halen de data opnieuw uit de datbase op, de data in get grid zou door een andere gebruiker aangepast kunnen zijn
				Ext.Ajax.request(
				{
					url: 'php/main.php?Action=Startlijst.GetObjectJSON',
					method: 'GET',
					params: 
					{
						'_:ID':ID
					},
					failure: function(record, operation) 
					{
						Ext.MessageBox.alert ('Fout bij ophalen data', operation.response.responseText);
					},
					success: function(result, request)
					{					
						if (Ext.getCmp('StartInvoer_InvoerForm') != undefined)	// controleer of het form nog aanwezig is, het window kan afgesloten zijn
						{
							// We hebben nu de data uit de grid store en het record uit de database
							// Het kan zijn dat het grid niet de laatste informatie bevat, we moeten dan de database gegevens gebruiken
							// Wanneer we de velden in het form overschrijven, dan worden de wijzingen door de gebruiker ondertussen gemaakt zijn, overschreven
							// Dat gaat we dus slimmer doen, helaas wel meer code
							var recordDB =  Ext.decode(result.responseText);
							var recordForm = form.getRecord();
							
							if (recordDB.data.LAATSTE_AANPASSING != recordForm.data.LAATSTE_AANPASSING) 	// ok, er zijn wijzigingen
							{
								if (recordDB.data.VLIEGTUIG_ID != recordForm.data.VLIEGTUIG_ID)		// Data is ongelijk
								{
									var InvoerVliegtuig = Ext.getCmp('StartInvoer_Vliegtuig');
									
									if (InvoerVliegtuig.getValue() == recordForm.data.VLIEGTUIG_ID) // Gebruiker heeft nog niets aangepast
									{
										InvoerVliegtuig.setValue(recordDB.data.VLIEGTUIG_ID);
									}
								}
								if (recordDB.data.SLEEPKIST_ID != recordForm.data.SLEEPKIST_ID)		// Data is ongelijk
								{
									var InvoerSleepkist = Ext.getCmp('StartInvoer_Sleepkist');		
									
									if (InvoerSleepkist.getValue() == recordForm.data.SLEEPKIST_ID) // Gebruiker heeft nog niets aangepast
									{
										InvoerSleepkist.setValue(recordDB.data.SLEEPKIST_ID);
									}
								}
								if (recordDB.data.VLIEGER_ID != recordForm.data.VLIEGER_ID)		// Data is ongelijk
								{
									var GezagvoerderInvoer = Ext.getCmp('StartInvoer_Gezagvoerder');		
									
									if (GezagvoerderInvoer.getValue() == recordForm.data.VLIEGER_ID) // Gebruiker heeft nog niets aangepast
									{
										GezagvoerderInvoer.setValue(recordDB.data.VLIEGER_ID);
									}
								}		
								if (recordDB.data.VLIEGERNAAM != recordForm.data.VLIEGERNAAM)		// Data is ongelijk
								{
									var InvoerGezagvoerderNaam = Ext.getCmp('StartInvoer_GezagvoerderNaam');		
									
									if (InvoerGezagvoerderNaam.getValue() == recordForm.data.VLIEGERNAAM) // Gebruiker heeft nog niets aangepast
									{
										InvoerGezagvoerderNaam.setValue(recordDB.data.VLIEGERNAAM);
									}
								}	
								if (recordDB.data.INZITTENDE_ID != recordForm.data.INZITTENDE_ID)		// Data is ongelijk
								{
									var InzittendeID = Ext.getCmp('StartInvoer_Inzittende');		
									
									if (InzittendeID.getValue() == recordForm.data.INZITTENDE_ID) // Gebruiker heeft nog niets aangepast
									{
										InzittendeID.setValue(recordDB.data.INZITTENDE_ID);
									}
								}	
								if (recordDB.data.INZITTENDENAAM != recordForm.data.INZITTENDENAAM)		// Data is ongelijk
								{
									var InvoerInzittendeNaam = Ext.getCmp('StartInvoer_InzittendeNaam');	
									
									if (InzittendeID.getValue() == recordForm.data.INZITTENDENAAM) // Gebruiker heeft nog niets aangepast
									{
										InzittendeID.setValue(recordDB.data.INZITTENDENAAM);
									}
								}		
								if (recordDB.data.OP_REKENING_ID != recordForm.data.OP_REKENING_ID)		// Data is ongelijk
								{
									var InvoerOpRekening = Ext.getCmp('StartInvoer_OpRekening');	
									
									if (InvoerOpRekening.getValue() == recordForm.data.OP_REKENING_ID) // Gebruiker heeft nog niets aangepast
									{
										InvoerOpRekening.setValue(recordDB.data.OP_REKENING_ID);
									}
								}
								if (recordDB.data.STARTMETHODE_ID != recordForm.data.STARTMETHODE_ID)		// Data is ongelijk
								{
									var InvoerStartMethode = Ext.getCmp('StartInvoer_StartMethode');	
									
									if (InvoerStartMethode.haalWaarde() == recordForm.data.STARTMETHODE_ID) // Gebruiker heeft nog niets aangepast
									{
										InvoerStartMethode.zetWaarde(recordDB.data.STARTMETHODE_ID);
									}
								}		
								if (recordDB.data.SOORTVLUCHT_ID != recordForm.data.SOORTVLUCHT_ID)		// Data is ongelijk
								{
									var InvoerSoortVlucht = Ext.getCmp('StartInvoer_SoortVlucht');
									
									if (InvoerSoortVlucht.haalWaarde() == recordForm.data.SOORTVLUCHT_ID) // Gebruiker heeft nog niets aangepast
									{
										InvoerSoortVlucht.zetWaarde(recordDB.data.SOORTVLUCHT_ID);
									}
								}	
								if (recordDB.data.OPMERKING != recordForm.data.OPMERKING)		// Data is ongelijk
								{
									var InvoerOpmerking = Ext.getCmp('StartInvoer_Opmerking');	
									
									if (InvoerOpmerking.getValue() == recordForm.data.OPMERKING) // Gebruiker heeft nog niets aangepast
									{
										InvoerOpmerking.setValue(recordDB.data.OPMERKING);
									}
								}	
								if (recordDB.data.SLEEP_HOOGTE != recordForm.data.SLEEP_HOOGTE)		// Data is ongelijk
								{
									var InvoerSleephoogte = Ext.getCmp('StartInvoer_Sleephoogte');	
									
									if (InvoerSleephoogte.getValue() == recordForm.data.SLEEP_HOOGTE) // Gebruiker heeft nog niets aangepast
									{
										InvoerSleephoogte.setValue(recordDB.data.SLEEP_HOOGTE);
									}
								}							
							}
						}
					}
				});
								
				var store = Ext.data.StoreManager.lookup(StartlijstInvoerForm_GRID);
				var record = store.getById(ID);
							
				if (record.data.VLIEGER_ID == record.data.OP_REKENING_ID)
					form.OpRekeningOvernemen = true;						// bij het wijzigen van de vlieger wordt ook de op rekening automatisch aangepast
				else
					form.OpRekeningOvernemen = false;						// omdat de verschillend zijn, is de automatisch koppeling uit
				
				if ((record.data.STARTTIJD == "") || (record.data.STARTTIJD == null))
				{
					Ext.StartlijstInvoerForm.OphalenGezagvoerders(record.data.VLIEGTUIG_ID, record.data.VLIEGER_ID);
				}
				else
				{
					var lstore = Ext.data.StoreManager.lookup('Startlijst_Vlieger_Store');
					lstore.clearFilter();
					if (appSettings.Aanwezigheid)
					{
						var storeFilterBy = 
						"function myfilter(record, id)" 											+ 
						"{"																			+ 
						"	if (record.data.LIDTYPE_ID == '612') return false;" 					+		//  612 is lidtype penningmeester
						"	if (record.data.AANWEZIG_GEWEEST == '1') return true;" 					+
						"	if (record.data.ID == '" + record.data.VLIEGER_ID + "') return true;"    +
						"	return false;"															+
						"}";
									
						eval("var sif4=" + storeFilterBy)
						lstore.filterBy(sif4);		
					}								
				}
				
				// zorg dat de filters goed zijn, dit hoeft niet voor nieuwe records omdat die filter puur op invoer gebasseerd zijn
				Ext.StartlijstInvoerForm.SoortVlucht(record);
				Ext.StartlijstInvoerForm.OpRekening(record);
				Ext.StartlijstInvoerForm.FilterInzittende(record)
				
				// Filtering van de dropdown. Alleen vliegtuigen die aanwezig zijn worden getoond
				InvoerVliegtuig.store.clearFilter();
				if (appSettings.Aanwezigheid)
				{
					InvoerVliegtuig.primaryFilterBy = 
					"function myfilter(record,id) " 											+
					"{" 																		+
						"    if (record.data.ID == " + record.data.VLIEGTUIG_ID + ") return true;" 	+
						"    if (record.data.AANWEZIG == '1') return true;" 				+
						"    return false;" 														+        
					"}";  	
					
					eval("var sif5 =" + InvoerVliegtuig.primaryFilterBy);
					InvoerVliegtuig.store.filterBy(sif5);
				}
				form.loadRecord(record); 		// laad het record in het formulier
				Ext.StartlijstInvoerForm.FilterGezagvoerder();
				
				// zet waarde in hidden text veld. Via events wordt checkbox in grid gezet
				Ext.getCmp('StartInvoer_SoortVlucht').zetWaarde(record.data.SOORTVLUCHT_ID);	 // veld met soortvlucht
				Ext.getCmp('StartInvoer_StartMethode').zetWaarde(record.data.STARTMETHODE_ID);	 // veld met startmethode
				
				console.log(sprintf("%s: Tonen start invoer form", TijdStempel()));
				form.show();		// ok, laat maar zien wat er geladen is
				
				// Dynamisch formulier opmaak
				Ext.StartlijstInvoerForm.DynamischFormulier(record);

				form.soortVluchtAangepast = true;
							
				InvoerVliegtuig.focus(false, true);				
			}
			// Zorg dat de store's geladen zijn met de laatste data
			Ext.data.StoreManager.lookup('Startlijst_Vliegtuigen_Store').slimLaden(null, false);
			Ext.data.StoreManager.lookup('Startlijst_SleepKisten_Store').slimLaden(null, false);
			Ext.data.StoreManager.lookup('Startlijst_Vlieger_Store').slimLaden(null, false);
			
			EnableFormEvents(form);			// Zet de events weer aan			
		},
	
		// Deze functie verbergt, toont velden op basis van de ingevoerde waarde
		// Wanneer een bestaand record gewijzigd wordt, bevat het veld "geladenRecord" het record
		// tijdens de eerste aanroep zijn de velden op het formulier namelijk nog gevuld
        DynamischFormulier : function(geladenRecord)
		{	
			// input form
			var InvoerForm = Ext.getCmp('StartInvoer_InvoerForm');
			
			// Stores
			var StartLijstStore = Ext.data.StoreManager.lookup('Startlijst_GridStore');

			var VliegtuigenStore = Ext.data.StoreManager.lookup('Startlijst_Vliegtuigen_Store');
			var StartMethodeStore = Ext.data.StoreManager.lookup('Types_StartMethode_Store');

			// Invoer Controls
			var InvoerVliegtuig = Ext.getCmp('StartInvoer_Vliegtuig');							// combobox
			var InvoerSleepkist = Ext.getCmp('StartInvoer_Sleepkist');							// combobox
			var InvoerSleephoogte = Ext.getCmp('StartInvoer_Sleephoogte');						// numeric
			var InvoerGezagvoerderContainer = Ext.getCmp('StartInvoer_GezagvoerderContainer');	// combobox + de toevoegen button
			var InvoerGezagvoerderNaam = Ext.getCmp('StartInvoer_GezagvoerderNaam');			// textbox
			var InvoerInzittendeContainer = Ext.getCmp('StartInvoer_InzittendeContainer');		// combobox + de wissel button
			var InvoerInzittendeNaam = Ext.getCmp('StartInvoer_InzittendeNaam');				// textbox
			var InvoerOpRekening = Ext.getCmp('StartInvoer_OpRekening');						// combobox
			
			var InvoerStartMethode = Ext.getCmp('StartInvoer_StartMethode');
			var InvoerStartMethodePanel = Ext.getCmp('StartInvoer_StartMethodePanel');
			var InvoerSoortVlucht = Ext.getCmp('StartInvoer_SoortVlucht');
			var InvoerSoortVluchtPanel = Ext.getCmp('StartInvoer_SoortVluchtPanel');
			
			var PapierenControle = Ext.getCmp('PapierenControle');
			var Euro = Ext.getCmp('Euro');
			
			var InvoerID = Ext.getCmp('StartInvoer_ID');
				
			if (geladenRecord != null)
				console.log(sprintf("%s: DynamischFormulier(%s)", TijdStempel(), JSON.stringify(geladenRecord.data)));
			else
				console.log(sprintf("%s: DynamischFormulier()", TijdStempel()));
				
			var VliegtuigID = InvoerVliegtuig.getValue();
			var LidID = Ext.getCmp('StartInvoer_Gezagvoerder').getValue();
			
			if ((geladenRecord != null) && (geladenRecord != undefined))
			{
				console.log(sprintf("%s: SoortVlucht, geladenRecord ID=%s", TijdStempel(), geladenRecord.data.ID));
			
				VliegtuigID = geladenRecord.data.VLIEGTUIG_ID;
				LidID = geladenRecord.data.VLIEGER_ID;
			}			
			
			
			if ((VliegtuigID == undefined) || (VliegtuigID == null) || (VliegtuigID == ''))
			{			
				// vliegtuig is nog niet ingevoerd, verberg alle velden. Vliegtuig MOET als eerste ingevuld worden
				InvoerGezagvoerderContainer.hide();
				InvoerGezagvoerderNaam.hide();
				InvoerSleepkist.hide();
				InvoerSleephoogte.hide();
				InvoerInzittendeContainer.hide();
				InvoerInzittendeNaam.hide();
				InvoerOpRekening.hide();
				InvoerStartMethodePanel.hide();
				InvoerSoortVluchtPanel.hide();
				
				console.log(sprintf("%s: DynamischFormulier, VliegtuigID onbekend, isValid", TijdStempel()));
				InvoerForm.getForm().isValid();		// valideer alle velden
				return;
			}
			
			var VliegtuigRecord = VliegtuigenStore.getById(VliegtuigID);
			
			//************************************************************************************************************************
			// als het vliegtuig niet gevonden is, hebben we een probleem
			//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
			if (VliegtuigRecord == null)
			{
				console.log(sprintf("%s: DynamischFormulier, VliegtuigRecord == null", TijdStempel()));
				return;
			}			
			
			var SoortVluchtStore = Ext.data.StoreManager.lookup('Types_SoortVlucht_Store');
			if (SoortVluchtStore.getCount() > 0)
			{
				InvoerSoortVluchtPanel.show();		// Toon het grid panel met de checkboxes voor soortvlucht
			}
			else
			{
				InvoerSoortVluchtPanel.hide();		// Verberg het grid panel met de checkboxes voor soortvlucht
			}
			
			var WaardeInvoerSoortVlucht = InvoerSoortVlucht.haalWaarde();
			if ((InvoerForm.WaardeInvoerSoortVlucht == undefined) || (InvoerForm.WaardeInvoerSoortVlucht != WaardeInvoerSoortVlucht))	// performance 
			{
				InvoerForm.WaardeInvoerSoortVlucht = WaardeInvoerSoortVlucht;
				
				if (WaardeInvoerSoortVlucht == "806")	// 806 = 'Proefstart privekist eenzitter'
					InvoerGezagvoerderContainer.hide();	
				else
					InvoerGezagvoerderContainer.show();
					
				if (WaardeInvoerSoortVlucht == "810")	// 810 = 'Solostart met tweezitter'
					InvoerInzittendeContainer.hide();	
				else
					InvoerInzittendeContainer.show();					
			}				
			
			//************************************************************************************************************************
			// Zet velden aan/uit op basis van het ingevoerde vliegtuig
			//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		    if (VliegtuigRecord.data.TMG == '1')
			{		
				// het ingevoerde vliegtuig is een TMG, dan weten we ook de start methode
				console.log(sprintf("%s: DynamischFormulier, Vliegtuig == TMG", TijdStempel()));
				
				var storeFilterBy = 
				"function myfilter(record, id)" 					+ 
				"{"													+ 
				"	if (record.data.ID == '507') return true;" 		+			// 507 = 'Zelfstart (TMG)'
				"	return false;"									+
				"}";
				
				if ((InvoerForm.StartMethodeStoreCurrentFilter == undefined) || (InvoerForm.StartMethodeStoreCurrentFilter != storeFilterBy)) // performance 
				{	
					InvoerForm.StartMethodeStoreCurrentFilter = storeFilterBy;
						
					StartMethodeStore.clearFilter();
					eval("var sif6=" + storeFilterBy)
					StartMethodeStore.filterBy(sif6);
					
					InvoerStartMethode.suspendEvents(false);
					InvoerStartMethode.zetWaarde("507");		// alleen default zetten als we nieuwe invoer doen
					InvoerStartMethode.resumeEvents();
					
					var InvoerStartMethodeID = Ext.getCmp('StartInvoer_StartMethodeID');
					InvoerStartMethodeID.setValue("507");
				}
			}
			else
			{		
				// er is een vliegtuig ingevoerd, we gaan puzzelen welke startmethode voldoet
				// Als er geen startmethode ingevoerd is, dan zetten we een default waarde uit de daginfo.
				var InvoerSM = InvoerStartMethode.haalWaarde();
				if ((InvoerForm.InvoerSM == undefined) || (InvoerForm.InvoerSM != InvoerSM)) // performance 
				{					
					if ((InvoerSM == null) || (InvoerSM == ""))
					{
						InvoerStartMethode.suspendEvents(false);
						InvoerStartMethode.zetWaarde(dagInfo.data.STARTMETHODE_ID);
						InvoerStartMethode.resumeEvents();
						
						var InvoerStartMethodeID = Ext.getCmp('StartInvoer_StartMethodeID');
						InvoerStartMethodeID.setValue(dagInfo.data.STARTMETHODE_ID);
					}
					InvoerForm.InvoerSM = InvoerStartMethode.haalWaarde();
				}

				console.log(sprintf("%s: DynamischFormulier, Startmethode van de dag = %s", TijdStempel(), dagInfo.data.STARTMETHODE_ID));
					
				// Als er een lier startmethode is ingevoerd in de daginfo, dan halen we de andere methode eruit. Het is niet waarschijnlijk
				// dat er twee lieren zijn, van verschillende clubs. Mocht dat wel zo zijn, vul dan geen daginfo in.
				var c = "";		// tijdelijke variable, waar we het filter script in stoppen
				
				if (dagInfo.data.STARTMETHODE_ID != "501")		// als de standaard methode slepen is, is er geen lier opgesteld
				{
					switch(dagInfo.data.STARTMETHODE_ID)
					{
						case "550": c = "if (record.data.ID == '550') return true;"; break; 	//550 = 'Lierstart m.b.v.  Gelderse lier'
						case "551": c = "if (record.data.ID == '551') return true;"; break;		//551 = 'Lierstart m.b.v. de DSA-lier'
						case "552": c = "if (record.data.ID == '552') return true;"; break; 	//552 = 'Lierstart m.b.v. de ZCD/ZCR lier'
						case "553": c = "if (record.data.ID == '553') return true;"; break; 	//553 = 'Lierstart m.b.v. de GAE lier'
						default: c = "if (record.data.ID.substring(0,2) == '55') return true;";	// alles wat begint met 55 wordt gekozen, dus alle lierstart methode
					}
				}
				
				var z = ""		// tijdelijke variable, waar we het filter script in stoppen
				if (VliegtuigRecord.data.ZELFSTART == '1')
				{
					console.log(sprintf("%s: DynamischFormulier, Vliegtuig == SLEEPKIST", TijdStempel()));
					z = "if (record.data.ID == '506') return true;"						// 506 = 'Zelfstart (zweefkist)'
				}

				var storeFilterBy = 
					"function myfilter(record, id)" 					+ 
					"{"													+ 
					c + z +															// c & Z zijn hierboven voorzien van een string
					"	if (record.data.ID == '501') return true;" 		+			// 501 = 'Slepen (start van de zweefkist)'
					"	return false;"									+
					"}";
				
				if ((InvoerForm.StartMethodeStoreCurrentFilter == undefined) || (InvoerForm.StartMethodeStoreCurrentFilter != storeFilterBy))  // performance 
				{
					InvoerForm.StartMethodeStoreCurrentFilter = storeFilterBy;
				
					StartMethodeStore.clearFilter();
					eval("var sif9=" + storeFilterBy)
					StartMethodeStore.filterBy(sif9);
				}
			}
			InvoerStartMethodePanel.show();
			//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
			// Einde van aan/uit zetten van velden op basis van het ingevoerde vliegtuig
			//************************************************************************************************************************
			
			//************************************************************************************************************************
			// Als startmethode slepen is, moet het veld van sleepvliegtuig zichtbaar worden
			// En we vullen een default waarde in
			//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
			if (InvoerStartMethode.haalWaarde() == '501')		// 501 = 'Slepen (start van de zweefkist)'
			{
				console.log(sprintf("%s: DynamischFormulier, Sleepstart", TijdStempel()));
				InvoerSleepkist.show();
				if ((appSettings.isBeheerder) || (appSettings.isBeheerderDDWV))
				{
					InvoerSleephoogte.show();
				}
				
				if ((InvoerSleepkist.getValue() == null) || (InvoerSleepkist.getValue() == ""))
				{
					// er is geen sleepkist ingevuld. Kijken welke sleepkist vandaag aanwezig is
					var n = InvoerSleepkist.store.findBy(
						function findSleepkist(record, id)
						{
							if (record.data.AANWEZIG == '1')
								return true;
							return false;
						});
						
					if (n>=0)	// sleepkist gevonden. We gaan er vanuit dat er maar 1 sleepkist is
					{
						var sleepkist = InvoerSleepkist.store.getAt(n);
						InvoerSleepkist.setValue(sleepkist.data.ID);
					}
				}
			}
			else
			{
				InvoerSleepkist.hide();
				InvoerSleephoogte.hide();
			}
			//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
			// Einde van startmethode slepen
			//************************************************************************************************************************
			
			//************************************************************************************************************************
			// voor een nieuw lid, of zusterclub moeten we de naam handmatig invoeren
			//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
			var LidRecord = Ext.data.StoreManager.lookup('Startlijst_Vlieger_Store').getById(LidID); 			
			if (LidRecord == null)		// lid is nog niet ingevoerd
			{
				console.log(sprintf("%s: DynamischFormulier, lid is nog niet ingevoerd", TijdStempel()));
				
			//	InvoerOpRekening.show();
				InvoerInzittendeNaam.hide();

				if (WaardeInvoerSoortVlucht == "806")	// 806 = 'Proefstart privekist eenzitter'
				{
					InvoerGezagvoerderNaam.show();
				}
				else
				{
					InvoerGezagvoerderNaam.hide();
				}
				
				if (WaardeInvoerSoortVlucht != "810")	// 810 = 'Solostart met tweezitter'	
				{				
					if (VliegtuigRecord.data.ZITPLAATSEN == 1)
					{
						InvoerInzittendeNaam.hide();
						InvoerInzittendeContainer.hide();
					}
					else
					{
						InvoerInzittendeContainer.show();
					}
				}
			}
			else
			{ 
				console.log(sprintf("%s: DynamischFormulier, LIDTYPE_ID=%s", TijdStempel(), LidRecord.data.LIDTYPE_ID));
				switch (LidRecord.data.LIDTYPE_ID)
				{
					case '600':			// diversen
					case '607': 		// zusterclub
					case '609':			// nieuw lid
					{
						InvoerOpRekening.hide();
						InvoerGezagvoerderNaam.show();	
						
						if (VliegtuigRecord.data.ZITPLAATSEN == 1)
						{
							InvoerInzittendeNaam.hide();
							InvoerInzittendeContainer.hide();
						}
						else if (LidRecord.data.LIDTYPE_ID == '607')  // zusterclub
						{
							InvoerInzittendeNaam.show();	
							InvoerInzittendeContainer.hide();
						}
						else
						{
							InvoerInzittendeNaam.hide();
							InvoerInzittendeContainer.show();
						}
						break;
					}					
					default:
					{
						if (WaardeInvoerSoortVlucht == "806")	// 806 = 'Proefstart privekist eenzitter'
						{
							InvoerGezagvoerderNaam.show();
						}
						else
						{
							InvoerGezagvoerderNaam.hide();
						}
												
						if (VliegtuigRecord.data.ZITPLAATSEN == 1)
						{
							InvoerInzittendeContainer.hide();
							InvoerInzittendeNaam.hide();
							InvoerOpRekening.hide();
						}
						else
						{
							// 801	Passagierstart (kosten 40€)
							// 802	Relatiestart
							if ((WaardeInvoerSoortVlucht == "801") || (WaardeInvoerSoortVlucht == "802"))
							{
								InvoerInzittendeContainer.hide();
								InvoerInzittendeNaam.show();
								
								if (WaardeInvoerSoortVlucht == "801")
								{
									InvoerOpRekening.show();
								}
								else
								{
									InvoerOpRekening.hide();
								}
							}
							else if (WaardeInvoerSoortVlucht != "810")	// 810 = 'Solostart met tweezitter'
							{
								InvoerInzittendeContainer.show();
								InvoerInzittendeNaam.hide();
								InvoerOpRekening.hide();
							}
						}
						
						/****
						if (LidRecord.data.LIDTYPE_ID != "625")			// 625 = DDWV 				
							InvoerOpRekening.show();
						else
							InvoerOpRekening.hide();
						*****/
					}
				}
			}
			//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
			// Einde oprot kabel, zusterclub
			//************************************************************************************************************************
			
			// Zijn de papieren verlopen ?
			if ((!appSettings.ControleerPapieren) || (LidRecord == null))			// instelling om functie aan/uit te zetten
			{
				PapierenControle.hide();
			}
			else if (LidRecord !== null)
			{
				switch (LidRecord.data.LIDTYPE_ID)
				{
					case '601':			// Erelid
					case '602': 		// lid
					case '603':			// Jeugdlid
					case '606':			// Donateur
					{
						if (Ext.StartlijstInvoerForm.PapierenVerlopen(LidRecord))
							PapierenControle.show();
						else
							PapierenControle.hide();
						break; 
					}
					default:
						PapierenControle.hide();								
				}
			}
			// einde papieren verlopen
			
			// Heeft lid betaald ?
			if ((!appSettings.Betaald) || (LidRecord == null))			// instelling om functie aan/uit te zetten
			{
				Euro.hide();
			}
			else
			{
				switch (LidRecord.data.LIDTYPE_ID)
				{
					case '601':			// Erelid
					case '602': 		// lid
					case '603':			// Jeugdlid
					case '606':			// Donateur
					{	
						if (Ext.StartlijstInvoerForm.HeeftBetaald(LidRecord) == false)
							Euro.show();
						else
							Euro.hide();
						break; 
					}
					default:
						Euro.hide();								
				}
			}
			// einde papieren verlopen			
			
			console.log(sprintf("%s: DynamischFormulier, isValid", TijdStempel()));
			InvoerForm.getForm().isValid();		// valideer alle velden
        },
	
		//************************************************************************************************************************
		// Het invoer veld voor het sleepvliegtuig krijgt de focus
		//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		onFocusInvoerSleepkist: function(field, options)
		{
			console.log(sprintf("%s: onFocusInvoerSleepkist()", TijdStempel()));
			
			field.store.clearFilter();
			var f = eval(field.primaryFilter);
			field.store.filter(f);

			// uitklappen als een nieuwe invoer doen
			var ID = Ext.getCmp('StartInvoer_ID').getValue();
			if (ID < 0)
				field.expand();		
		},
		
		//************************************************************************************************************************
		// Het invoer veld voor het sleepvliegtuig wordt verlaten
		//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		onBlurInvoerSleepkist: function(field, options)
		{
			console.log(sprintf("%s: onBlurInvoerSleepkist()", TijdStempel()));
			Ext.StartlijstInvoerForm.DynamischFormulier();
		},
		
		//************************************************************************************************************************
		// Valideren of sleepvliegtuig ingevuld is
		//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		ValiderenVliegtuig: function(value)
		{		
			var Vliegtuig = Ext.getCmp('StartInvoer_Vliegtuig')
			if (Vliegtuig == undefined)
			{
				console.log(sprintf("%s: StartInvoer_Vliegtuig niet gedefineerd, OK", TijdStempel()));
				return true;				
			}
			if (!Vliegtuig.isVisible())
			{
				console.log(sprintf("%s: %s verborgen, OK", TijdStempel(), Vliegtuig.id));
				return true;
			}
				
			if ((value == "") || (value == null))
			{	
				console.log(sprintf("%s: %s Het vliegtuig moet ingevoerd worden.", TijdStempel(), Vliegtuig.id));			
				return "Het vliegtuig moet ingevoerd worden.";
			}	
			
			var v = Vliegtuig.getValue() + "";
			var rv = Vliegtuig.getRawValue() + "";
			if ((v.length + rv.length) > 0)
			{
				if (v == rv)
				{
					console.log(sprintf("%s: %s Er moet een vliegtuig uit de lijst gekozen worden. Of voeg het vliegtuig toe.", TijdStempel(), Vliegtuig.id));
					return "Er moet een vliegtuig uit de lijst gekozen worden. Of voeg het vliegtuig toe.";
				}
			}
			console.log(sprintf("%s: %s OK", TijdStempel(), Vliegtuig.id));
			return true;
		},		
		
		//************************************************************************************************************************
		// Het vliegtuig invoer veld krijgt nu de focus
		//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		onFocusInvoerVliegtuig: function(field, options)
		{
			console.log(sprintf("%s: onFocusInvoerVliegtuig()", TijdStempel()));

			var InvoerVliegtuig = Ext.getCmp('StartInvoer_Vliegtuig');
			var ID = Ext.getCmp('StartInvoer_ID').getValue();

			// uitklappen als een nieuwe invoer doen
			if ((ID < 0) && (InvoerVliegtuig.store.count() < 25))
				field.expand();		
		},
		
		onStartInvoerVliegtuigChange: function(field, newValue, oldValue, options)
		{
			console.log(sprintf("%s: onStartInvoerVliegtuigChange()", TijdStempel()));
			
			var GezagvoerderInvoer = Ext.getCmp('StartInvoer_Gezagvoerder');
			var ID = Ext.getCmp('StartInvoer_ID').getValue();
			var OphalenGezagvoerders = false;								
			
			if (field.isValid() == false)
			{
				console.log("Vliegtuig heeft geen geldige waarde");
				return;
			}
				
			if ((ID < 0) || (ID == ""))
			{
				OphalenGezagvoerders = true;
			}	
			else
			{
				var store = Ext.data.StoreManager.lookup('Startlijst_GridStore');
				var record = store.getById(ID);
				
				// als er al gevlogen wordt, gebruiken we de hele leden lijst. Het ophalen mogen we overslaan
				if ((record.data.STARTTIJD == "") || (record.data.STARTTIJD == null))
					OphalenGezagvoerders = true;
			}
			
			if (OphalenGezagvoerders == true)
				Ext.StartlijstInvoerForm.OphalenGezagvoerders(field.getValue(), GezagvoerderInvoer.getValue());
			
			Ext.StartlijstInvoerForm.FilterGezagvoerder();
			Ext.StartlijstInvoerForm.SoortVlucht();			
			Ext.StartlijstInvoerForm.DynamischFormulier();
		},
							
		//************************************************************************************************************************
		// Als we de startmethode wijzigt, moet er gekeken worden of het sleepvliegtuig misschien ingevuld moet worden
		//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		onStartInvoer_StartMethodeSelectionChange: function(tablepanel, selections, options)
		{
			var form = Ext.getCmp('StartInvoer_InvoerForm');
			
			var InvoerStartMethode = Ext.getCmp('StartInvoer_StartMethode');
			var InvoerStartMethodeID = Ext.getCmp('StartInvoer_StartMethodeID');
			InvoerStartMethodeID.setValue(InvoerStartMethode.haalWaarde());
			
			console.log(sprintf("%s: onStartInvoer_StartMethodeSelectionChange()", TijdStempel()));
			Ext.StartlijstInvoerForm.DynamischFormulier();	
		},
		
		//************************************************************************************************************************
		// Controleren of start methode ingevuld is
		//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		ValiderenStartMethode: function(value)
		{
			var panel = Ext.getCmp('StartInvoer_StartMethodePanel');
			if (panel == undefined)
			{
				console.log(sprintf("%s: StartInvoer_StartMethodePanel niet gedefineerd, OK", TijdStempel()));
				return true;				
			}
			
			if (!panel.isVisible())
			{
				console.log(sprintf("%s: StartInvoer_StartMethodePanel verborgen, OK", TijdStempel()));
				return true;
			}
			
			var form = Ext.getCmp('StartInvoer_InvoerForm');
			
			var StartMethodeStore = Ext.data.StoreManager.lookup('Types_StartMethode_Store');
			var StartMethodeGrid = Ext.getCmp('StartInvoer_StartMethode');
			var StartMethodeView = StartMethodeGrid.getView();

			var InvoerStartMethode = Ext.getCmp('StartInvoer_StartMethode');
			var StartMethode = InvoerStartMethode.haalWaarde();
			
			if ((StartMethode == null) || (StartMethode == ""))
			{
				StartMethodeStore.each(function(record,idx)
				{
					var cell = StartMethodeView.getCellByPosition({row: idx, column: 1});
					if (cell != false) cell.addCls("x-form-invalid-field");		// onderlijnen van de records
				});
				console.log(sprintf("%s: ValiderenStartMethode, Startmethode moet nog ingevuld worden", TijdStempel()));
				return "Startmethode moet nog ingevuld worden";
			}
			else
			{
				StartMethodeStore.each(function(record,idx)
				{
					var cell = StartMethodeView.getCellByPosition({row: idx, column: 1});
					if (cell != false) cell.removeCls("x-form-invalid-field");	// verwijderen onderlijning
				});			
			}
			console.log(sprintf("%s: ValiderenStartMethode, OK", TijdStempel()));
			return true;			
		},		

		//************************************************************************************************************************
		// Het invoer veld voor het sleepvliegtuig krijgt de focus
		//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		onFocusInvoerSleepkist: function(field, options)
		{
			console.log(sprintf("%s: onFocusInvoerSleepkist()", TijdStempel()));
			
			field.store.clearFilter();
			var f = eval(field.primaryFilter);
			field.store.filter(f);

			// uitklappen als een nieuwe invoer doen
			var ID = Ext.getCmp('StartInvoer_ID').getValue();
			if (ID < 0)
				field.expand();		
		},
		
		//************************************************************************************************************************
		// Het invoer veld voor het sleepvliegtuig wordt verlaten
		//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		onBlurInvoerSleepkist: function(field, options)
		{
			console.log(sprintf("%s: onBlurInvoerSleepkist()", TijdStempel()));
			Ext.StartlijstInvoerForm.DynamischFormulier();
		},
		
		//************************************************************************************************************************
		// Valideren of sleepvliegtuig ingevuld is
		//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		ValiderenSleepvliegtuig: function(value)
		{				
			var Sleepkist = Ext.getCmp('StartInvoer_Sleepkist')
			if (Sleepkist == undefined)
			{
				console.log(sprintf("%s: StartInvoer_Sleepkist niet gedefineerd, OK", TijdStempel()));
				return true;				
			}
			if (!Sleepkist.isVisible())
			{
				console.log(sprintf("%s: %s verborgen, OK", TijdStempel(), Sleepkist.id));
				return true;
			}
				
			if ((value == "") || (value == null))
			{		
				console.log(sprintf("%s: %s Het sleepvliegtuig moet ingevoerd worden.", TijdStempel(), Sleepkist.id));			
				return "Het sleepvliegtuig moet ingevoerd worden.";
			}	
			
			var v = Sleepkist.getValue() + "";
			var rv = Sleepkist.getRawValue() + "";
			if ((v.length + rv.length) > 0)
			{
				if (v == rv)
				{
					console.log(sprintf("%s: %s Er moet een sleepkist uit de lijst gekozen worden.", TijdStempel(), Sleepkist.id));	
					return "Er moet een sleepkist uit de lijst gekozen worden.";
				}
			}
			console.log(sprintf("%s: %s OK", TijdStempel(), Sleepkist.id));	
			return true;
		},
		
		//************************************************************************************************************************
		// Ga eens aan de server vragen wie in aanmerking komen om op dit vliegtuig te vliegen
		//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++		
		OphalenGezagvoerders: function(VliegtuigID, VliegerID)
		{	
			console.log(sprintf("%s: Ophalen potentiele lijst met gezagvoerders", TijdStempel()));
			
			if (!appSettings.Aanwezigheid)
			{
				Ext.getCmp('StartInvoer_Gezagvoerder').store.clearFilter();
				
				console.log(sprintf("%s: Aanwezigheid=false", TijdStempel()));
				return;
			}
			
			// nu we weten welk vliegtuig gekozen is, kunnen we ook een keuze maken wie er gaat vliegen
			// potentiele gezagvoerders laden
			var gstore = Ext.data.StoreManager.lookup('Startlijst_Gezagvoerder_Store');
			gstore.clearData();		// eerst leegmaken, ander krijgt de gebruiker even een oude lijst te zien
			gstore.load(
			{
				context: this,
				params: 
				{
					'_:VliegtuigID':VliegtuigID,
					'_:VliegerID': VliegerID
				},
				callback: function(records, operation, success)
				{
					if(success)
					{
						var GezagvoerderInvoer = Ext.getCmp('StartInvoer_Gezagvoerder');
						var store;
						
						if (GezagvoerderInvoer != undefined)	// als control undefined is, dan heeft de gebruiker het window al gesloten
						{					
							if (records.length ==0)		// Er is niets, dan maar de hele lijst tonen
							{
								console.log(sprintf("%s: OphalenGezagvoerders, alle leden", TijdStempel()));
								store = Ext.data.StoreManager.lookup('Startlijst_Vlieger_Store');
							}
							else
							{
								console.log(sprintf("%s: OphalenGezagvoerders, alleen gezagvoerders", TijdStempel()));
								store = gstore;
							}

							GezagvoerderInvoer.bindStore(store);
							Ext.StartlijstInvoerForm.FilterGezagvoerder();	

							if ((store.storeId == gstore.storeId) &&
								(GezagvoerderInvoer.getValue() == null))
							{
								var Vliegtuig = Ext.getCmp('StartInvoer_Vliegtuig');	
								var VliegtuigID = Vliegtuig.getValue();	
							
								if (VliegtuigID != null)
								{
									var conn = new Ext.data.Connection();
									conn.request
									({
										url:"php/main.php?Action=Aanwezig.DefaultGezagvoerder",
										method:'POST',
										params: 
										{
											'VLIEGTUIG_ID': VliegtuigID
										},
										success: function(response) 
										{
											console.log(sprintf("%s: SoortVlucht, default waarde=%s",TijdStempel(), response.responseText));
											
											var GezagvoerderInvoer = Ext.getCmp('StartInvoer_Gezagvoerder')
											
											if (response.responseText != "")
											{
												GezagvoerderInvoer.suspendEvents(false);					
												GezagvoerderInvoer.setValue(response.responseText);
												GezagvoerderInvoer.resumeEvents();
											}
										}
									});
								}							
							}
						}
					}
				}
			});
		},
		
		//************************************************************************************************************************
		// Het invoer veld voor het invoeren van de gezagvoerder krijgt de focus
		//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		onFocusInvoerGezagvoerder: function(field, options)
		{
			console.log(sprintf("%s: onFocusInvoerGezagvoerder()", TijdStempel()));
			
			// uitklappen als een nieuwe invoer doen
			var ID = Ext.getCmp('StartInvoer_ID').getValue();
			if (ID < 0)
				field.expand();		
		},
	
		//************************************************************************************************************************
		// Er wordt een toets op het toesenbord ingedrukt. We schakelen over naar de volledige ledenlijst
		// later (in de combox) wordt er een filter geplaatst
		//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		onKeyPressInvoerGezagvoerder: function(textfield, e, options)
		{
			console.log(sprintf("%s: onKeyPressInvoerGezagvoerder()", TijdStempel()));
				
			var newStoreName = 'Startlijst_Vlieger_Store';
			if (textfield.store.storeId != newStoreName)
			{
				var store = Ext.data.StoreManager.lookup(newStoreName);
				store.clearFilter();

				textfield.bindStore(store);		
				Ext.StartlijstInvoerForm.FilterGezagvoerder();
			}
		},
		
		// Zorg dat de lijst met namen alleen relevant informatie bevat
		// Alle lidtypes in FilterArray worden eruit gehaald
		FilterGezagvoerder: function()
		{
			console.log(sprintf("%s: FilterGezagvoerder()", TijdStempel()));
			var InvoerGezagvoerder = Ext.getCmp('StartInvoer_Gezagvoerder');
			
			if (InvoerGezagvoerder.store.storeId == 'Startlijst_Gezagvoerder_Store')
			{
				InvoerGezagvoerder.primaryFilterBy = null;
				InvoerGezagvoerder.store.clearFilter();
				return;
			}
		
			var FilterArray = new Array();
			FilterArray.push(600);					// 600 is Diverse (Bijvoorbeeld bedrijven- of jongerendag)
			FilterArray.push(612);					// 612 is lidtype penningmeester
			
			if (dagInfo.data.SOORTBEDRIJF_ID == 701)	// 701 = aleen clubbedrijf
				FilterArray.push(625);				// 625 = DDWV vlieger
			
			var VliegtuigenStore = Ext.data.StoreManager.lookup('Startlijst_Vliegtuigen_Store');
			var InvoerVliegtuig = Ext.getCmp('StartInvoer_Vliegtuig');
			var VliegtuigID = InvoerVliegtuig.getValue();
			var VliegtuigRecord = VliegtuigenStore.getById(VliegtuigID);
			
			if (VliegtuigRecord != null)
			{
				if (VliegtuigRecord.data.CLUBKIST == '1') 
				{
					FilterArray.push(625);				// 625 = DDWV vlieger
					FilterArray.push(607);				// 607 is zusterclub								
					
					if (VliegtuigRecord.data.ZITPLAATSEN < 2)
					{
						FilterArray.push(606);			// donateur mag niet vliegen op een club eenzitter
						FilterArray.push(611);			// cursist mag niet vliegen op een club eenzitter
						FilterArray.push(608);			// 5-rittenkaarthouder mag niet vliegen op een club eenzitter
					}
				}
				
			}	
			
			InvoerGezagvoerder.primaryFilterBy = 
				"function myfilter(record,id)" + 
				"{" + 
				"	var FilterField = '" + FilterArray.join() +"';" 						+
				"	if (FilterField.indexOf(record.data.LIDTYPE_ID) == -1) return true;" 			+						
				"	return false;" + 
				"}";			
			
			InvoerGezagvoerder.store.clearFilter();
			eval("var sif10 =" + InvoerGezagvoerder.primaryFilterBy)
			InvoerGezagvoerder.store.filterBy(sif10);			
		},
		
		//************************************************************************************************************************
		// Het invoer veld voor de gezagvoerder wordt gewijzigd. Zet de default waarde die gaat betalen
		//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		onChangeInvoerGezagvoerder: function(field, options)
		{
			var Gezagvoerder = Ext.getCmp('StartInvoer_Gezagvoerder');
			if (Gezagvoerder == undefined)
			{
				console.log(sprintf("%s: StartInvoer_Gezagvoerder niet gedefineerd, OK", TijdStempel()));
				return true;				
			}
			
			if (Gezagvoerder.value == null)
				return;
				
			console.log(sprintf("%s: onChangeInvoerGezagvoerder()", TijdStempel()));
			
			Ext.StartlijstInvoerForm.OpRekening();

			var VliegtuigenStore = Ext.data.StoreManager.lookup('Startlijst_Vliegtuigen_Store');
			var InvoerVliegtuig = Ext.getCmp('StartInvoer_Vliegtuig');
			var VliegtuigID = InvoerVliegtuig.getValue();
			var VliegtuigRecord = VliegtuigenStore.getById(VliegtuigID);

			if (VliegtuigRecord != null)
			{
				Ext.StartlijstInvoerForm.SoortVlucht();						
			}
			
			Ext.StartlijstInvoerForm.DynamischFormulier();			
		},
		
		ValiderenGezagvoerder: function(value)
		{
			var Gezagvoerder = Ext.getCmp('StartInvoer_Gezagvoerder');
			
			if (Gezagvoerder == undefined)
			{
				console.log(sprintf("%s: StartInvoer_Gezagvoerder niet gedefineerd, OK", TijdStempel()));
				return true;				
			}
			
			var InzittendeID = Ext.getCmp('StartInvoer_Inzittende').getValue();
			
			if (!Ext.getCmp('StartInvoer_GezagvoerderContainer').isVisible())
			{
				console.log(sprintf("%s: StartInvoer_GezagvoerderContainer verborgen, OK", TijdStempel()));
				return true;			
			}
			
			if (!Gezagvoerder.isVisible())
			{
				console.log(sprintf("%s: %s verborgen, OK", TijdStempel(), Gezagvoerder.id));
				return true;
			}
				
			var VliegtuigenStore = Ext.data.StoreManager.lookup('Startlijst_Vliegtuigen_Store');
			var InvoerVliegtuig = Ext.getCmp('StartInvoer_Vliegtuig');
			var VliegtuigID = InvoerVliegtuig.getValue();
			var VliegtuigRecord = VliegtuigenStore.getById(VliegtuigID);
						
			if (VliegtuigRecord != null)
			{
				if (VliegtuigRecord.data.ZITPLAATSEN> 1)
				{	
					if (Ext.getCmp('StartInvoer_InzittendeContainer').isVisible())
					{				
						if ((Gezagvoerder.getValue() == InzittendeID) && ((Gezagvoerder.getValue() != null) && (Gezagvoerder.getValue() != "")))
						{
							console.log(sprintf("%s: %s De gezagvoerder en de inzittende moeten verschillende personen zijn.", TijdStempel(), Gezagvoerder.id));
							return "De gezagvoerder en de inzittende moeten verschillende personen zijn.";
						}
					}
				}
			}
			if (((Gezagvoerder.getValue() == null) || (Gezagvoerder.getValue() == "")) && ((InzittendeID != null) && (InzittendeID != "")))
			{
				console.log(sprintf("%s: %s De gezagvoerder moet nog ingevuld worden.", TijdStempel(), Gezagvoerder.id));
				return "De gezagvoerder moet nog ingevuld worden.";
			}
			
			var LidID = Gezagvoerder.getValue() + "";
			var rv = Gezagvoerder.getRawValue() + "";
			if ((LidID.length + rv.length) > 0)
			{
				if (LidID == rv)
				{
					console.log(sprintf("%s: %s Er moet een naam uit de lijst gekozen worden.", TijdStempel(), Gezagvoerder.id));
					return "Er moet een naam uit de lijst gekozen worden.";
				}
			}
			
			if (VliegtuigRecord != null) 
			{
				if (VliegtuigRecord.data.CLUBKIST == '1')
				{
					var LidRecord = Ext.data.StoreManager.lookup('Startlijst_Vlieger_Store').getById(LidID);
					
					if (LidRecord != null)
					{
						console.log(sprintf("%s: LidRecord Naam=%s LidType", TijdStempel(), LidRecord.data.NAAM, LidRecord.data.LIDTYPE_ID));
						switch (LidRecord.data.LIDTYPE_ID)
						{
							case "601":	break; 	// 601	Erelid
							case "602":	break; 	// 602	Lid
							case "603":	break; 	// 603	Jeugdlid
							case "606":	break; 	// 606	Donateur
							case "608":	break; 	// 608	5-rittenkaarthouder
							case "609":	break;	// 609	nieuw lid, nog niet verwerkt in ledenadministratie
							case "611":	break; 	// 611	Cursist
								
							default:		
								console.log(sprintf("%s: %s Op club vliegtuigen mogen alleen leden vliegen", TijdStempel(), Gezagvoerder.id));
								return "Op club vliegtuigen mogen alleen leden vliegen.";
						}
					}
				}
			}
			
			console.log(sprintf("%s: %s OK", TijdStempel(), Gezagvoerder.id));
			return true;
		},
		
		WisselVliegerInzittende: function()
		{
			var form = Ext.getCmp('StartInvoer_InvoerForm');
			var InvoerGezagvoerder = Ext.getCmp('StartInvoer_Gezagvoerder');
			var InvoerInzittende = Ext.getCmp('StartInvoer_Inzittende');
			
			var HuidigeVlieger = InvoerGezagvoerder.getValue();
			

			var store = Ext.data.StoreManager.lookup("Startlijst_Vlieger_Store");
			store.clearFilter();

			InvoerGezagvoerder.bindStore(store);	
			InvoerGezagvoerder.setValue(InvoerInzittende.getValue())			
			Ext.StartlijstInvoerForm.FilterGezagvoerder();
			
			InvoerInzittende.store.clearFilter();				
			InvoerInzittende.setValue(HuidigeVlieger);
			Ext.StartlijstInvoerForm.FilterInzittende();
			
			if (form.OpRekeningOvernemen)
			{
				var InvoerOpRekening = Ext.getCmp('StartInvoer_OpRekening');
				InvoerOpRekening.setValue(InvoerGezagvoerder.getValue())
			}
		},
			
		//************************************************************************************************************************
		// Controleer of de gezagvoernaam is ingevuld
		//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++		
		ValiderenGezagvoerderNaam: function(value)
		{		
			var veld = Ext.getCmp('StartInvoer_GezagvoerderNaam');
			if (veld == undefined)
			{
				console.log(sprintf("%s: StartInvoer_GezagvoerderNaam niet gedefineerd, OK", TijdStempel()));
				return true;				
			}
			if (!veld.isVisible())
			{
				console.log(sprintf("%s: %s verborgen, OK", TijdStempel(), veld.id));
				return true;
			}
				
			if ((value == "") || (value == null))
			{		
				console.log(sprintf("%s: %s De naam van de gezagvoerder is verplicht.", TijdStempel(), veld.id));			
				return "De naam van de gezagvoerder is verplicht.";
			}	
			console.log(sprintf("%s: %s OK", TijdStempel(), veld.id));	
			return true;
		},
		
		//************************************************************************************************************************
		// Filter wie de inzittende kan zijn
		//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		FilterInzittende: function(geladenRecord)
		{
			var InvoerInzittende = Ext.getCmp('StartInvoer_Inzittende');
			InvoerInzittende.primaryFilterOnKeyInput = false;
				
			console.log(sprintf("%s: FilterInzittende()", TijdStempel()));

			var HuidigeInzittende = "";
			if ((geladenRecord != null) && (geladenRecord != undefined))
				HuidigeInzittende = "if (record.data.ID == '" + geladenRecord.data.INZITTENDE_ID + "') return true;"
			else
				HuidigeInzittende = "if (record.data.ID == '" + InvoerInzittende.getValue() + "') return true;"
			
			var VliegtuigenStore = Ext.data.StoreManager.lookup('Startlijst_Vliegtuigen_Store');
			var LidID = Ext.getCmp('StartInvoer_Gezagvoerder').getValue();
			var VliegtuigID = Ext.getCmp('StartInvoer_Vliegtuig').getValue();
			var VliegtuigRecord = VliegtuigenStore.getById(VliegtuigID);
			
			var LidRecord = Ext.data.StoreManager.lookup('Startlijst_Vlieger_Store').getById(LidID);
			
			var LIDTYPE_ID = -1;
			if (LidRecord != null)
			{
				console.log(sprintf("%s: FilterInzittende, LidRecord Naam=%s", TijdStempel(), LidRecord.data.NAAM));
				LIDTYPE_ID = LidRecord.data.LIDTYPE_ID;
			}
			
			InvoerInzittende.primaryFilterBy = 
			"function myfilter(record,id)" + 
			"{" + 
				HuidigeInzittende									+					
				"	if (record.data.ID == '" + LidID + "') return false;";   				// de gezagvoerder is geen inzittende
				
				var ID = Ext.getCmp('StartInvoer_ID').getValue();
				if ((ID < 0) && (appSettings.Aanwezigheid)) // Voor nieuwe invoer, laten we voor de ASK21 alleen instructeurs zien. Deze wordt namelijk meestal gebruikt voor instructie
				{
					InvoerInzittende.primaryFilterBy = InvoerInzittende.primaryFilterBy +
					"	if ( " + VliegtuigRecord.data.TYPE_ID + " == 406)" 				+  												// 406 = ASK21 = lesvliegtuig
					"	{	" 															+ 				
					"		if (record.data.INSTRUCTEUR == '0')	" 					+												// voor de 21 alleen instructeurs			
					"		{" 															+ 	
					"			return false;" + 
					"		}" +     
					"	}" + 	
					"	if (record.data.AANWEZIG == '0') return false;" 															// Alleen leden die nu aanwezig zijn
				}
				else
				{
					if (appSettings.Aanwezigheid)
					{
						InvoerInzittende.primaryFilterBy = InvoerInzittende.primaryFilterBy + "	if (record.data.AANWEZIG == '0') return false;"  				
					}
				}
				
				if (LIDTYPE_ID == "611")											// 611 = cursist
				{
					InvoerInzittende.primaryFilterOnKeyInput = true;
					InvoerInzittende.primaryFilterBy = InvoerInzittende.primaryFilterBy +
					"		if (record.data.INSTRUCTEUR == '0')	" 					+		
					"		{" 															+ 	
					"			return false;" + 
					"		}";
				}
				
				if ((LIDTYPE_ID == "606") && (VliegtuigRecord.data.CLUBKIST = '1'))		// 606 = donateur
				{
					InvoerInzittende.primaryFilterOnKeyInput = true;
					InvoerInzittende.primaryFilterBy = InvoerInzittende.primaryFilterBy +
					"		if (record.data.INSTRUCTEUR == '0')	" 					+		
					"		{" 															+ 	
					"			return false;" + 
					"		}";
				}
				InvoerInzittende.primaryFilterBy = InvoerInzittende.primaryFilterBy +						
				"	return true;" + 
			"}";

			InvoerInzittende.store.clearFilter();
			eval("var sif11=" + InvoerInzittende.primaryFilterBy)
			InvoerInzittende.store.filterBy(sif11);
		},
		//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
		// Einde Filter inzittende
		//************************************************************************************************************************
		
		//************************************************************************************************************************
		// Het invoer veld voor het invoeren van de tweede inzittende krijgt de focus
		//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		onFocusInvoerInzittende: function(field, options)
		{
			console.log(sprintf("%s: onFocusInvoerInzittende()", TijdStempel()));
			Ext.StartlijstInvoerForm.FilterInzittende();
			
			// uitklappen als een nieuwe invoer doen
			var ID = Ext.getCmp('StartInvoer_ID').getValue();
			if (ID < 0)
				field.expand();		
		},
		
		//************************************************************************************************************************
		// Het invoer veld voor het invoeren van de tweede inztittende is gewijzigd
		//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		onStartInvoer_InzittendeChange: function(field, newValue, oldValue, options)
		{
			var form = Ext.getCmp('StartInvoer_InvoerForm');
			
			var InvoerInzittende = Ext.getCmp('StartInvoer_Inzittende');
			
			var v = InvoerInzittende.getValue() + "";
			var rv = InvoerInzittende.getRawValue() + "";
			if ((v.length + rv.length) > 0)
			{
				if (v == rv)
				{
					return; // er is nog niets in de lijst gevonden
				}
			}
			
			console.log(sprintf("%s: onStartInvoer_InzittendeChange()", TijdStempel()));
			Ext.StartlijstInvoerForm.SoortVlucht();
			Ext.StartlijstInvoerForm.OpRekening();			
			Ext.StartlijstInvoerForm.DynamischFormulier();		
		},
		
		//************************************************************************************************************************
		// Controleer of de inzittende een keuze uit de dropdown lijst is
		//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++	
		ValiderenInzittende: function(value)
		{
			var Inzittende = Ext.getCmp('StartInvoer_Inzittende');
			if (Inzittende == undefined)
			{
				console.log(sprintf("%s: StartInvoer_Inzittende niet gedefineerd, OK", TijdStempel()));
				return true;				
			}
			
			if (!Inzittende.isVisible())
			{
				console.log(sprintf("%s: %s verborgen, OK", TijdStempel(), Inzittende.id));
				return true;
			}
			
			var v = Inzittende.getValue() + "";
			var rv = Inzittende.getRawValue() + "";
			if ((v.length + rv.length) > 0)
			{
				if (v == rv)
				{
					console.log(sprintf("%s: %s Er moet een naam uit de lijst gekozen worden.", TijdStempel(), Inzittende.id));
					return "Er moet een naam uit de lijst gekozen worden.";
				}
			}
			
			var VliegerID = Ext.getCmp('StartInvoer_Gezagvoerder').getValue();	
			var VliegerRecord = Ext.data.StoreManager.lookup('Startlijst_Vlieger_Store').getById(VliegerID);
			
			var InzittendeID = Ext.getCmp('StartInvoer_Inzittende').value;
			var InzittendeRecord = Ext.data.StoreManager.lookup('Startlijst_Vlieger_Store').getById(InzittendeID);
			
			var LIDTYPE_ID = -1;
			if (VliegerRecord != null)
			{
				console.log(sprintf("%s: ValiderenInzittende, VliegerRecord Naam=%s", TijdStempel(), VliegerRecord.data.NAAM));
				LIDTYPE_ID = VliegerRecord.data.LIDTYPE_ID;
			}
			
			if (LIDTYPE_ID == "611")			// 611 = cursist
			{					
				if (InzittendeRecord === null)
				{
					console.log(sprintf("%s: %s Inzittende moet een instructeur zijn.", TijdStempel(), Inzittende.id));
					return "Inzittende moet een instructeur zijn.";					
				}
				
				console.log(sprintf("%s: ValiderenInzittende, InzittendeRecord Naam=%s", TijdStempel(), InzittendeRecord.data.NAAM));	
				
				if (InzittendeRecord.data.INSTRUCTEUR == "0")
				{
					console.log(sprintf("%s: %s Inzittende moet een instructeur zijn.", TijdStempel(), Inzittende.id));
					return "Inzittende moet een instructeur zijn.";
				}
					
			}
			console.log(sprintf("%s: %s OK", TijdStempel(), Inzittende.id));
			return true;
		},

		//************************************************************************************************************************
		// Wat voor soort vlucht is het. Filter de verschillende methoden. De bedoeling is dat we gebruiker zoveel mogelijk helpen
		// Wanneer een bestaand record gewijzigd wordt, bevat het veld "geladenRecord" het record
		// tijdens de eerste aanroep zijn de velden op het formulier namelijk nog gevuld
		//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		SoortVlucht: function(geladenRecord)
		{	
			if (geladenRecord != null)
				console.log(sprintf("%s: SoortVlucht(%s)", TijdStempel(), JSON.stringify(geladenRecord.data)));
			else
				console.log(sprintf("%s: SoortVlucht()", TijdStempel()));
				
				
			Ext.StartlijstInvoerForm.FilterSoortVlucht(geladenRecord);
				
			// We gaan alleen maar verder als form klaar is met laden
			var form = Ext.getCmp('StartInvoer_InvoerForm');
				
			// Als het eenmaal ingevuld is, dan hoeft de default waarde niet meer opgehaald te worden
			if (form.soortVluchtAangepast == true)
				return;				
				
			//var InvoerSoortVluchtPanel = Ext.getCmp('StartInvoer_SoortVluchtPanel');
			//InvoerSoortVluchtPanel.show();
				
			var VliegtuigID = Ext.getCmp('StartInvoer_Vliegtuig').getValue();				
			var VliegtuigRecord = Ext.data.StoreManager.lookup('Startlijst_Vliegtuigen_Store').getById(VliegtuigID);
			
			// als record al geladen is, hoeft de default waarde niet meer gezet te worden en als er geen vliegtuig is, doen we ook niets
			if ((geladenRecord != null) || (VliegtuigRecord == null))
				return;
			
			var LidID = Ext.getCmp('StartInvoer_Gezagvoerder').getValue();
			var InzittendeID = Ext.getCmp('StartInvoer_Inzittende').value;
			
			// als alles hetzelfde is, hoeven we niet nog eens de informatie op te vragen
			if ((lastVliegtuigID == VliegtuigID) && (lastLidID == LidID) && (lastInzittendeID == InzittendeID)) 
				return;

			lastVliegtuigID 	= VliegtuigID;
			lastLidID 			= LidID;
			lastInzittendeID 	= InzittendeID;
			
			var conn = new Ext.data.Connection();
			conn.request
			({
				url:"php/main.php?Action=Startlijst.SoortVlucht",
				method:'POST',
				params: 
				{
					'VLIEGTUIG_ID': VliegtuigID,
					'VLIEGER_ID': LidID,
					'INZITTENDE_ID': InzittendeID
				},
				success: function(response) 
				{
					console.log(sprintf("%s: SoortVlucht, default waarde=%s",TijdStempel(), response.responseText));
					
					var InvoerSoortVlucht = Ext.getCmp('StartInvoer_SoortVlucht');
					
					InvoerSoortVlucht.suspendEvents(false);					
					InvoerSoortVlucht.zetWaarde(response.responseText);
					InvoerSoortVlucht.resumeEvents();
					
					var InvoerSoortVluchtID = Ext.getCmp('StartInvoer_SoortVluchtID');
					InvoerSoortVluchtID.setValue(InvoerSoortVlucht.haalWaarde());
					InvoerSoortVluchtID.isValid();
				}
			});							
		},
		
		// Zorg dat de lijst alleen relevante informatie weergeeft. 
		// Alles in FilterArray komt erin
		FilterSoortVlucht: function(geladenRecord)
		{
			// filter soort vlucht
			// 801	Passagierstart (kosten 40€)
			// 802	Relatiestart
			// 803	Zusterclub
			// 804	Oprotkabel
			// 805	Normale GeZC start
			// 806	Proefstart privekist eenzitter
			// 807	Privestart
			// 809	Instructie of checkvlucht
			// 810	Solostart met tweezitter
			// 811	Invliegen, Dienststart
			// 812	Donateursstart
			// 813	5- of 10-rittenkaarthouder
			// 814	DDWV: Midweekvliegen
			// 815	Sleepkist, Dienststart
			
			var VliegtuigID = Ext.getCmp('StartInvoer_Vliegtuig').getValue();
			var VliegerID = Ext.getCmp('StartInvoer_Gezagvoerder').getValue();
			var InzittendeID = Ext.getCmp('StartInvoer_Inzittende').getValue();
			
			if (geladenRecord != null)
			{
				console.log(sprintf("%s: FilterSoortVlucht, geladenRecord ID=%s", TijdStempel(), geladenRecord.data.ID));
			
				VliegtuigID = geladenRecord.data.VLIEGTUIG_ID;
				VliegerID = geladenRecord.data.VLIEGER_ID;	
				InzittendeID = geladenRecord.data.INZITTENDE_ID;
			}	
					
			var VliegtuigRecord = Ext.data.StoreManager.lookup('Startlijst_Vliegtuigen_Store').getById(VliegtuigID);	
			var VliegerRecord = Ext.data.StoreManager.lookup('Startlijst_Vlieger_Store').getById(VliegerID);           
			var InzittendeRecord = Ext.data.StoreManager.lookup('Startlijst_Inzittende_Store').getById(InzittendeID);
			
			var CLUBKIST = '0';
			var TMG = '0';
			if (VliegtuigRecord != null)
			{
				CLUBKIST = VliegtuigRecord.data.CLUBKIST;
				TMG = VliegtuigRecord.data.TMG;
			}
			
			var FilterArray = new Array();
			
			var VLIEGER_LIDTYPE_ID = -1;
			if (VliegerRecord != null)
			{
				VLIEGER_LIDTYPE_ID = VliegerRecord.data.LIDTYPE_ID;			
				console.log(sprintf("%s: FilterSoortVlucht, VliegerRecord Naam=%s VLIEGER_LIDTYPE_ID=%s", TijdStempel(), VliegerRecord.data.NAAM,VLIEGER_LIDTYPE_ID));
			}		
			
			// Soort vlucht wordt door All-in tarief bijna niet ingevuld in de toren en is het gevuld met de default waarde. De beheerder kan Soortvlucht altijd invullen
			if (appSettings.isBeheerder)
			{				
				if (VLIEGER_LIDTYPE_ID == 607)    // 607 = Zusterclub
				{
					console.log(sprintf("%s: FilterSoortVlucht, Zusterclub", TijdStempel()));
					FilterArray.push(803);    
				}
				else if (VLIEGER_LIDTYPE_ID == 609)    // 609 = Nieuw lid
				{
					console.log(sprintf("%s: FilterSoortVlucht, Instructie start", TijdStempel()));
					FilterArray.push(809);
				}
				else if (VLIEGER_LIDTYPE_ID == "611")	// 611 = cursist
				{
					console.log(sprintf("%s: FilterSoortVlucht, Cursist", TijdStempel()));
					FilterArray.push(809);
				}
				else if (VLIEGER_LIDTYPE_ID == 625)    // 625 = DDWV vlieger
				{
					console.log(sprintf("%s: FilterSoortVlucht, DDWV vlieger", TijdStempel()));
					FilterArray.push(814);
				}
				else if (VLIEGER_LIDTYPE_ID == 606)		// 606 = Donateur
				{
					console.log(sprintf("%s: FilterSoortVlucht, Donateursstart", TijdStempel()));	
					FilterArray.push(812);    
				}
				else if (VLIEGER_LIDTYPE_ID == 608)    // 608 = 5 rittenkaart
				{
					console.log(sprintf("%s: FilterSoortVlucht, 5- of 10-rittenkaarthouder", TijdStempel()));	
					FilterArray.push(813);   
				}
			}			
			//else
			{					
				if (VliegerRecord != null)
				{
					if (VliegtuigRecord != null)
					{
						var HeeftGPL = false;
						
						if (VliegerRecord.data.GPL_VERLOOPT != null)
						{
							HeeftGPL = true;
						}
						
						// 28-02-2013 Het meerendeel van de leden heeft nit ingevuld of hij/zij GPL heeft. Gaat dus helemaal fout. 
						// Dan maar iedereen een GPL.
						HeeftGPL = true;
						
						// 601 = Erelid, 602 = lid, 603 = jeugdlid
						if ((VLIEGER_LIDTYPE_ID == 601) || (VLIEGER_LIDTYPE_ID == 602) || (VLIEGER_LIDTYPE_ID == 603))
						{
							if (TMG == "0")
							{
								if ((HeeftGPL) && (VliegtuigRecord.data.ZITPLAATSEN> 1))
								{
									console.log(sprintf("%s: FilterSoortVlucht, Passagierstart-Relatiestart", TijdStempel()));
									
									FilterArray.push(801);	// 801 = Passagierstart (kosten 40€)
									
									if (CLUBKIST == '1')
									{
										FilterArray.push(802);  // 802 = Relatie start
									}
								}
							}
							
							// Soort vlucht wordt door All-in tarief bijna niet ingevuld in de toren en is het gevuld met de default waarde. De beheerder kan Soortvlucht altijd invullen
							if (appSettings.isBeheerder)
							{
								if ((CLUBKIST == '1') && (HeeftGPL))
								{
									console.log(sprintf("%s: FilterSoortVlucht, Invliegen", TijdStempel()));	
									FilterArray.push(811);    
								}
							}
						}
					}
				}
				
				// Soort vlucht wordt door All-in tarief bijna niet ingevuld in de toren en is het gevuld met de default waarde. De beheerder kan Soortvlucht altijd invullen
				if (appSettings.isBeheerder)
				{
					if (VliegtuigRecord != null)
					{
						if ((CLUBKIST == '0') && (VliegtuigRecord.data.ZITPLAATSEN == 1))
						{	
							console.log(sprintf("%s: FilterSoortVlucht, Proefstart privekist eenzitter", TijdStempel()));				
							FilterArray.push(806);
						}

						if (VliegtuigRecord.data.ZITPLAATSEN > 1)
						{
							if (InzittendeRecord == null)
							{
								if (CLUBKIST == '1') 
								{
									console.log(sprintf("%s: FilterSoortVlucht, Solostart met tweezitter", TijdStempel()));						
									FilterArray.push(810);
									
									console.log(sprintf("%s: FilterSoortVlucht, Instructie of checkvlucht, inzittende niet ingevuld", TijdStempel()));	
									FilterArray.push(809);
								}
							}
							else
							{		
								if (InzittendeRecord.data.INSTRUCTEUR == '1')
								{
									console.log(sprintf("%s: FilterSoortVlucht, Instructie of checkvlucht", TijdStempel()));	
									FilterArray.push(809);
								}
								
								if (InzittendeRecord.data.LIDTYPE_ID == 606)  		// 606 = Donateur
								{
									console.log(sprintf("%s: FilterSoortVlucht, Donateursstart", TijdStempel()));	
									FilterArray.push(812);    
								}		
							}
						}
						
						if (CLUBKIST == '1')  
						{
							console.log(sprintf("%s: FilterSoortVlucht, Normale GeZC start", TijdStempel()));
							FilterArray.push(805);			
						}
						else
						{
							console.log(sprintf("%s: FilterSoortVlucht, Privestart", TijdStempel()));					
							FilterArray.push(807);					
						}
					}
				}
			}
			
			// Het kan alleen een DDWV start zijn als we we hebben aangegeven dat het een DDWV dag is
			if ((dagInfo.data.SOORTBEDRIJF_ID == 702) || (dagInfo.data.SOORTBEDRIJF_ID == 703))		// 702 = Club bedrijf + DDWV 	// 703 = DDWV 
			{
				console.log(sprintf("%s: FilterSoortVlucht, DDWV: Midweekvliegen", TijdStempel()));	
				FilterArray.push(814); 
			}
			
			// Als we een bestaand record wijzigen, dan moeten we zeker weten dat de vorige soortvlucht nu ook weer in de lijst aanwezig is 		
			var s = "";
			if (geladenRecord != null)
			{
				s = "if (record.data.ID == " + geladenRecord.data.SOORTVLUCHT_ID + ") return true;";
			}
				
			var storeFilterBy = 
			"function myfilter(record,id)" + 
			"{" + 
				"var FilterField = '" + FilterArray.join() +"';" +
				"if (FilterField.indexOf(record.data.ID) != -1) return true;" 	+
				s 																+				
				"return false;" +
			"}";

			var SoortVluchtStore = Ext.data.StoreManager.lookup('Types_SoortVlucht_Store');
			SoortVluchtStore.clearFilter();
			eval("var sif14=" + storeFilterBy)
			SoortVluchtStore.filterBy(sif14);		
		},

		//************************************************************************************************************************
		// Als we de startmethode wijzigt, moet er gekeken worden of het sleepvliegtuig misschien ingevuld moet worden
		//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		onStartInvoer_SoortVluchtSelectionChange: function(tablepanel, selections, options)
		{
			console.log(sprintf("%s: onStartInvoer_SoortVluchtSelectionChange()", TijdStempel()));
			
			var form = Ext.getCmp('StartInvoer_InvoerForm');
			
			var InvoerSoortVlucht = Ext.getCmp('StartInvoer_SoortVlucht');
			var InvoerSoortVluchtID = Ext.getCmp('StartInvoer_SoortVluchtID');

			InvoerSoortVluchtID.setValue(InvoerSoortVlucht.haalWaarde());
			
			Ext.StartlijstInvoerForm.DynamischFormulier();	
		},		
		
		onStartInvoer_SoortVluchtItemClick: function (tablepanel, record, item, index, e, options)
		{
			var form = Ext.getCmp('StartInvoer_InvoerForm');
			form.soortVluchtAangepast = true;
		},
		
		//************************************************************************************************************************
		// Controleren of start methode ingevuld is
		//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		ValiderenSoortVlucht: function(value)
		{			
			/******
			if (!Ext.getCmp('StartInvoer_SoortVluchtPanel').isVisible())
			{
				console.log(sprintf("%s: StartInvoer_SoortVluchtPanel, not visible()", TijdStempel()));			
				return true;
			}
				
			var form = Ext.getCmp('StartInvoer_InvoerForm');
			
			var SoortVluchtStore = Ext.data.StoreManager.lookup('Types_SoortVlucht_Store');
			var SoortVluchtGrid = Ext.getCmp('StartInvoer_SoortVlucht');
			var SoortVluchtView = SoortVluchtGrid.getView();

			var LidID = Ext.getCmp('StartInvoer_Gezagvoerder').getValue();
					
			var InvoerSoortVlucht = Ext.getCmp('StartInvoer_SoortVlucht');
			var SoortVlucht = InvoerSoortVlucht.haalWaarde();
			
			if (((SoortVlucht == null) || (SoortVlucht == "")) && ((LidID != "") && (LidID != null)))
			{
				SoortVluchtStore.each(function(record,idx)
				{
					var cell = SoortVluchtView.getCellByPosition({row: idx, column: 1});
					if (cell != false) cell.addCls("x-form-invalid-field");		// onderlijnen van de records
				});
				console.log(sprintf("%s: %s, Soortvlucht moet nog ingevuld worden", TijdStempel(), InvoerSoortVlucht.id));
				return "Soortvlucht moet nog ingevuld worden";
			}
			else
			{
				SoortVluchtStore.each(function(record,idx)
				{
					var cell = SoortVluchtView.getCellByPosition({row: idx, column: 1});
					if (cell != false) cell.removeCls("x-form-invalid-field");	// verwijderen onderlijning
				});			
			}
			console.log(sprintf("%s: %s, OK", TijdStempel(), InvoerSoortVlucht.id));
			******/
			return true;			
		},		

		//************************************************************************************************************************
		// Wie betaald de vlucht? Deze functie zet het filter en zet de default waarde. Wordt aangeroepen zodra de gezagvoerder 
		// is ingevoerd. Of wanneer het veld de focus krijgt
		//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		OpRekening: function(geladenRecord)
		{	
			if (geladenRecord != null)
				console.log(sprintf("%s: OpRekening(%s)", TijdStempel(), JSON.stringify(geladenRecord.data)));
			else
				console.log(sprintf("%s: OpRekening()", TijdStempel()));
			
			var OpRekeningInvoer = Ext.getCmp('StartInvoer_OpRekening');
			if (geladenRecord != null)		// We zijn een record aan het wijzigen, het form is nog niet geladen
			{
				console.log(sprintf("%s: OpRekening, geladenRecord ID=%s", TijdStempel(), geladenRecord.data.ID));
				OpRekeningInvoer.primaryFilterBy = 
				"function myfilter(record,id)" + 
				"{" + 							
					"	if (record.data.ID == " + geladenRecord.data.VLIEGER_ID + ") return true;" +  		// de gezagvoerder 
					"	if (record.data.ID == " + geladenRecord.data.INZITTENDE_ID + ") return true;" +  	// de inzittende 	
					"	if (record.data.ID == " + geladenRecord.data.OP_REKENING_ID + ") return true;" +  	    // op rekening 
					"	return false;" + 
				"}";			
			}
			else
			{	
				var pmeester = "";
				
				var InvoerSoortVlucht = Ext.getCmp('StartInvoer_SoortVlucht');
				var SoortVlucht = InvoerSoortVlucht.haalWaarde();
				
				if (SoortVlucht == "801")		// 801	Passagierstart (kosten 40€)
				{
					pmeester = "if (record.data.LIDTYPE_ID == 612) return true;";   // 612 = 'Penningmeester'
				}
				
				var inzittende = ""
				var InvoerInzittende = Ext.getCmp('StartInvoer_Inzittende');
				if (InvoerInzittende.isVisible())
					inzittende = "if (record.data.ID == Ext.getCmp('StartInvoer_Inzittende').getValue()) return true;"; 
				
				OpRekeningInvoer.primaryFilterBy = 
				"function myfilter(record,id)" + 
				"{" + 		
					"	var InvoerSoortVlucht = Ext.getCmp('StartInvoer_SoortVlucht');" +				
					"	if (record.data.ID == Ext.getCmp('StartInvoer_Gezagvoerder').getValue()) return true;" +  					// de gezagvoerder 	
					"	if (record.data.ID == Ext.getCmp('StartInvoer_OpRekening').getValue()) return true;" +  	    			// op rekening
					pmeester + inzittende +
					"	return false;" + 
				"}";
			}

			OpRekeningInvoer.store.clearFilter();
			eval("var sif15=" + OpRekeningInvoer.primaryFilterBy);
			OpRekeningInvoer.store.filterBy(sif15);

			// Hier wordt de default waarde gezet. Alleen nodig bij nieuwe invoer of wanneer de vlieger betaald
			// OpRekeningOvernemen wordt gezet in het openen van het window
			var form = Ext.getCmp('StartInvoer_InvoerForm');
			if (form.OpRekeningOvernemen == true)
			{
				var InvoerGezagvoerder = Ext.getCmp('StartInvoer_Gezagvoerder');
			
				if ((InvoerGezagvoerder.getValue() != null) && (InvoerGezagvoerder.getValue() != ""))
				{
					OpRekeningInvoer.setValue(InvoerGezagvoerder.getValue().toString());
				}
			}			
		},
				
		//************************************************************************************************************************
		// Het invoer veld voor het invoeren wie de rekening moet betalen krijgt de focus
		//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++		
		onStartInvoerOpRekeningFocus: function(field, options)
		{
			Ext.StartlijstInvoerForm.OpRekening();
		},
		
		//************************************************************************************************************************
		// Het invoer veld OpRekening is gewijzigd
		//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		onStartInvoer_OpRekeningChange: function(field, newValue, oldValue, options)
		{	
			Ext.StartlijstInvoerForm.DynamischFormulier();

			var form = Ext.getCmp('StartInvoer_InvoerForm');
			var InvoerGezagvoerder = Ext.getCmp('StartInvoer_Gezagvoerder');
			var InvoerOpRekening = Ext.getCmp('StartInvoer_OpRekening');
			
			if (InvoerGezagvoerder.getValue() == InvoerOpRekening.getValue())
				form.OpRekeningOvernemen = true;
			else
				form.OpRekeningOvernemen = false;
		},
		
		//************************************************************************************************************************
		// Controleren of oprekening ingevuld is
		//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		ValiderenOpRekening: function(value)
		{
			var InvoerOpRekening = Ext.getCmp('StartInvoer_OpRekening');

			if (InvoerOpRekening == undefined)
			{
				console.log(sprintf("%s: StartInvoer_OpRekening niet gedefineerd, OK", TijdStempel()));
				return true;				
			}
			
			if (!InvoerOpRekening.isVisible())
			{
				console.log(sprintf("%s: %s verborgen, OK", TijdStempel(), InvoerOpRekening.id));
				return true;
			}
				
			var form = Ext.getCmp('StartInvoer_InvoerForm');
			
			var InvoerSoortVlucht = Ext.getCmp('StartInvoer_SoortVlucht');
			var LidID = Ext.getCmp('StartInvoer_Gezagvoerder').getValue();

			var v = InvoerOpRekening.getValue() + "";
			var rv = InvoerOpRekening.getRawValue() + "";
			
			if (((LidID != "") && (LidID != null)) || (InvoerSoortVlucht.haalWaarde() == "806"))
			{		
				if (v.length == 0)
				{
					console.log(sprintf("%s: %s Invullen wie de rekening moet betalen", TijdStempel(), InvoerOpRekening.id));
					return "Invullen wie de rekening moet betalen";
				}
			}

			if ((v.length + rv.length) > 0)
			{
				if (v == rv)
				{
					console.log(sprintf("%s: %s Er moet een naam uit de lijst gekozen worden.", TijdStempel(), InvoerOpRekening.id));
					return "Er moet een naam uit de lijst gekozen worden.";
				}
			}				
			console.log(sprintf("%s: %s OK", TijdStempel(), InvoerOpRekening.id));			
			return true;			
		},
		
		beforeClose: function(panel, eOpts)
		{
		//	setTimeout(Ext.StartlijstInvoerForm.resetStore,5 * 1000);	// over 5 sec in de achtergrond, gebruiker heeft dan geen vertraging
		},	
		
		//************************************************************************************************************************
		// We gaan de data opslaan in de database
		//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		onEnter: function()
		{
			console.log(sprintf("%s: onEnter()", TijdStempel()));
			
			var button = Ext.getCmp('StartInvoer_Opslaan');
			Ext.StartlijstInvoerForm.onButtonClick(button, null, null);
		},
		
		onButtonClick: function(button, e, options)
		{
			console.log(sprintf("%s: onButtonClick()", TijdStempel()));
			
			var form = Ext.getCmp('StartInvoer_InvoerForm');
			var valid = form.getForm().isValid();
			
			if (!valid)
			{
				Ext.MessageBox.show({
				   title: 'Onvolledige invoer',
				   msg: 'Niet alle velden zijn correct ingevoerd',
				   buttons: Ext.MessageBox.OK,
				   icon:  Ext.MessageBox.WARNING
			   });
			   return;
			}
					
			if (Ext.getCmp('Euro').isVisible())
			{
				Ext.MessageBox.show({
						   title: 'Onderneem aktie',
						   msg: 'Neem contact op met de pennningmeester',
						   buttons: Ext.MessageBox.OK,
						   icon: Ext.MessageBox.ERROR
					   });			
			}
			
			if (Ext.getCmp('PapierenControle').isVisible())
			{
				Ext.MessageBox.show({
						   title: 'Onderneem aktie',
						   msg: 'Controleer papieren van de vlieger',
						   buttons: Ext.MessageBox.OK,
						   icon: Ext.MessageBox.ERROR
					   });			
			}			
			
			var InvoerSoortVlucht = Ext.getCmp('StartInvoer_SoortVlucht');
			var vluchtSoort = InvoerSoortVlucht.haalWaarde();
			if (vluchtSoort == "801") // passagier start
			{
				Ext.Msg.confirm("Bevestiging", "Weet je zeker dat het een passagier start is en geen relatie start?", function(btn)
				{
					if (btn == 'yes')
					{
						Ext.StartlijstInvoerForm.opslaanStart(button);
					}
				});
			}
			else
			{
				Ext.StartlijstInvoerForm.opslaanStart(button);
			}
		},
		
		opslaanStart: function(button)
		{			
			Ext.getCmp('StartInvoer_Opslaan').disable();
			Ext.win.showSaving(true);
			
			var form = Ext.getCmp('StartInvoer_InvoerForm');

			var dWindow = Ext.getCmp("ControleDetailsWindow"); 
			if (dWindow != undefined)
			{
				dWindow.close();
			}
			
			form.getForm().submit
			({
				submitEmptyText: false,
				success: function ()
				{   
					Ext.win.msg("Start is opgeslagen");
										
					if (StartlijstInvoerForm_GRIDPAGE < 0)
						Ext.data.StoreManager.lookup(StartlijstInvoerForm_GRID).load();
					else
						Ext.data.StoreManager.lookup(StartlijstInvoerForm_GRID).loadPage(StartlijstInvoerForm_GRIDPAGE);
				},
				failure: function(res,req) 
				{	
					if (req.response.status == 200)
						Ext.MessageBox.alert ('Fout bij opslaan', req.result.error);
					else
						Ext.MessageBox.alert ('Server fout', req.response.responseText);
				}
			});		
			Ext.win.showSaving(false);
			button.up('.window').close();
			setTimeout(Ext.StartlijstInvoerForm.resetStore,5 * 1000);	// over 5 sec in de achtergrond, gebruiker heeft dan geen vertraging	
		},	
		
				
		PapierenVerlopen: function(LidRecord)
		{
			var Vandaag = new Date();
			var Verlopen = false;
			if ((LidRecord.data.GPL_VERLOOPT != null) && (LidRecord.data.GPL_VERLOOPT != ""))
			{
				var GplVerloopt = new Date(LidRecord.data.GPL_VERLOOPT);
				
				if (GplVerloopt < Vandaag)
					Verlopen = true;
			}
			if ((LidRecord.data.MEDICAL_VERLOOPT != null) && (LidRecord.data.MEDICAL_VERLOOPT != ""))
			{
				var MedicalVerloopt = new Date(LidRecord.data.MEDICAL_VERLOOPT);
				
				if (MedicalVerloopt < Vandaag)
					Verlopen = true;
			}		
			return Verlopen
		},
		
		HeeftBetaald: function(LidRecord)
		{
			if (LidRecord.data.HEEFT_BETAALD == '1')
			{	
				return true;
			}
			return false;
		},	
		
		resetStore: function()
		{
			var StartInvoerWindow = Ext.getCmp('StartInvoerWindow');
			if (StartInvoerWindow == null)
			{	
				Ext.data.StoreManager.lookup('Startlijst_Vlieger_Store').clearFilter();
				Ext.data.StoreManager.lookup('Startlijst_Inzittende_Store').clearFilter();
				Ext.data.StoreManager.lookup('Startlijst_OpRekening_Store').clearFilter();
				Ext.data.StoreManager.lookup('Startlijst_Gezagvoerder_Store').clearFilter();
				
				Ext.data.StoreManager.lookup('Startlijst_Vliegtuigen_Store').load();
				Ext.data.StoreManager.lookup('Startlijst_Vlieger_Store').load();
			}
		},
		
		Copy_Vlieger_Inzittende_Store: function ()
		{
			var store1 = Ext.data.StoreManager.lookup("Startlijst_Vlieger_Store");
			var store2 = Ext.data.StoreManager.lookup("Startlijst_Inzittende_Store");

			// sommige lidsoorten worden niet ingevoerd als passagier
			var FilterArray = new Array();
			FilterArray.push(600);		// Diverse (Bijvoorbeeld bedrijven- of jongerendag)
			FilterArray.push(607);		// Zusterclub
			FilterArray.push(609);		// Nieuw lid
			FilterArray.push(612);		// lidtype penningmeester
			
			var di = Ext.data.StoreManager.lookup('Daginfo_Store');
			if (di.count() > 0)
			{
				var daginfo = di.getAt(0);
				if (daginfo.data.SOORTBEDRIJF_ID == 701)			// 701 is alleen clubbedrijf
					FilterArray.push(625);		// DDWV
			}		
			var FilterField = FilterArray.join();
					
			var records = [];
			store1.each(function(r)
			{
				if (FilterField.indexOf(r.data.LIDTYPE_ID) == -1)
				{
					records.push(r.copy());
				}
			});
			store2.loadData(records,false);
		},
		
		Copy_Vlieger_OpRekening_Store: function ()
		{
			var store1 = Ext.data.StoreManager.lookup("Startlijst_Vlieger_Store");
			var store2 = Ext.data.StoreManager.lookup("Startlijst_OpRekening_Store");

			// sommige lidsoorten worden niet ingevoerd als OpRekening
			var FilterArray = new Array();
			FilterArray.push(625);		// DDWV
					
			var FilterField = FilterArray.join();
					
			var records = [];
			store1.each(function(r)
			{
				if (FilterField.indexOf(r.data.LIDTYPE_ID) == -1)
				{
					records.push(r.copy());
				}
			});
			store2.loadData(records,false);
		},
		
        init : function()
		{
        }
	
    };
}();



