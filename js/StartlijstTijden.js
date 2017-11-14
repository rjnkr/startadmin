Ext.StartlijstTijdenForm = function(){
    return {
	
		//************************************************************************************************************************
		// Deze functie wordt aangeroepen vanuit het grid
		//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		OpenStartWindow: function(ID)
		{
			var store = Ext.data.StoreManager.lookup('Startlijst_GridStore');
			var start = store.getById(ID.toString());
			
			var regCall = start.data.REGISTRATIE + '(' + start.data.CALLSIGN + ')';
			var title = "Vlucht: #" + start.data.DAGNUMMER + ", " + regCall + ", " + start.data.VLIEGERNAAM;
			
			var win = Ext.widget('StarttijdWindow', {'title': title, 'ID': ID});
			win.show();
		},
	
		//************************************************************************************************************************
		// Deze functie wordt aangeroepen als het starttijd window wordt geopend
		//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		onStarttijdWindowShow: function(abstractcomponent, options, ID)
		{
			var objectNaam = 'StartInvoer_StartTijd';
			var form = Ext.getCmp('StartInvoer_StarttijdForm');

			// haal startlijst record op
			var store = Ext.data.StoreManager.lookup('Startlijst_GridStore');
			var record = store.getById(ID.toString());
			
			form.loadRecord(record);
			
			if (record.data.STARTTIJD == null)
			{
				Ext.StartlijstTijdenForm.TijdAanpassen(form, objectNaam);			// volgt de actuele tijd
			}
			else
			{	
				Ext.getCmp(objectNaam).tijd = record.data.STARTTIJD;
				
				Ext.StartlijstTijdenForm.TijdInvoerBeperking(form, objectNaam);			// eenmalig
				
				Ext.getCmp(objectNaam).setValue(record.data.STARTTIJD);
				form.getForm().clearDirty();
			}
		},	
		
		//************************************************************************************************************************
		// Het opslaan van de starttijd
		//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++				
		SaveStartTijd: function(button, e, options)
		{
			Ext.getCmp('StartInvoerStarttijd_Opslaan').disable();
			Ext.win.showSaving(true);
		
			var form = Ext.getCmp('StartInvoer_StarttijdForm');
			
			form.getForm().submit
			({
				success: function ()
				{   
					Ext.win.showSaving(false);
					Ext.win.msg("Starttijd is opgeslagen");

					store = Ext.data.StoreManager.lookup('Startlijst_GridStore');
					store.load();
					button.up('.window').close();
				},
				failure: function(res,req) 
				{
					Ext.win.showSaving(false);
					if (req.response.status == 200)
						Ext.MessageBox.alert ('Fout bij opslaan', req.result.error);
					else
						Ext.MessageBox.alert ('Server fout', req.response.responseText);

					button.up('.window').close();
				}
			});		
		},
		
		//************************************************************************************************************************
		// Controleer of starttijd ingevuld is en binnen de gestelde grenzen is
		//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++	
		ValidateStartTijd: function(value)
		{
			var starttijd = Ext.getCmp('StartInvoer_StartTijd');
			var landingstijd = Ext.getCmp('StartInvoer_LandingsTijd');
			
			if ((starttijd.getValue() == null) || (starttijd.getValue() == "")) 
			{
				if ((landingstijd.getValue() != null) && (landingstijd.getValue() != ""))
				{
					return "Starttijd mag niet leeg zijn als landingstijd is ingevoerd";
				}
				return true;
			}
			
			var startSec= stringNaarSec(starttijd.getValue());				// starttijd is een date
			var landingsSec = stringNaarSec(landingstijd.getValue()); 		// landingstijd is een string
			
			if (startSec>= landingsSec)
			{
				return sprintf("De starttijd moet voor %s liggen", landingstijd.getValue());
			}		
			
			if (isVandaag())
			{			
				if (startSec< tijdNaarSec(Ext.StartlijstTijdenForm.zonOp()))
				{
					return sprintf("De starttijd moet na zonsopkomst (%s) liggen", TijdStempel(Ext.StartlijstTijdenForm.zonOp()));
				}	

				if (startSec > tijdNaarSec(Ext.StartlijstTijdenForm.zonOnder()))
				{
					return sprintf("De starttijd moet voor zonsondergang (%s) liggen", TijdStempel(Ext.StartlijstTijdenForm.zonOnder()));
				}				
				
				var mt = new Date(); 
				mt.setMinutes(mt.getMinutes()+5);
				if	(startSec > tijdNaarSec(mt))
				{
					return "De starttijd is te ver in de toekomst";
				}
			}
			return true;
		},
		

		//************************************************************************************************************************
		// Deze functie wordt aangeroepen vanuit het grid
		//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		OpenLandingWindow: function(ID)
		{
			var store = Ext.data.StoreManager.lookup('Startlijst_GridStore');
			var start = store.getById(ID.toString());
			
			var regCall = start.data.REGISTRATIE + '(' + start.data.CALLSIGN + ')';
			var title = "Vlucht: #" + start.data.DAGNUMMER + ", " + regCall + ", " + start.data.VLIEGERNAAM;
			
			var win = Ext.widget('LandingstijdWindow', {'title': title, 'ID': ID});
			win.show();
		},
		
		//************************************************************************************************************************
		// Deze functie wordt aangeroepen als het landingstijd window wordt geopend
		//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		onLandingstijdWindowShow: function(abstractcomponent, options, ID)
		{
			var objectNaam = 'StartInvoer_LandingsTijd';
			
			var form = Ext.getCmp('StartInvoer_LandingstijdForm');
			
			// haal startlijst record op
			var store = Ext.data.StoreManager.lookup('Startlijst_GridStore');
			var record = store.getById(ID.toString());
			
			form.loadRecord(record);	
			
			if (record.data.LANDINGSTIJD == null)
			{
				Ext.StartlijstTijdenForm.TijdAanpassen(form, objectNaam);			// volgt de actuele tijd
			}
			else
			{
				var tijdInvoer = Ext.getCmp(objectNaam);
				tijdInvoer.tijd = record.data.LANDINGSTIJD;
			
				Ext.StartlijstTijdenForm.TijdInvoerBeperking(form, objectNaam);			// eenmalig
				
				Ext.getCmp(objectNaam).setValue(record.data.LANDINGSTIJD);
				form.getForm().clearDirty();
			}			
		},	

		//************************************************************************************************************************
		// Controleer of landingstijd binnen de gestelde grenzen is
		//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++				
		ValidateLandingsTijd: function(value)
		{
			var starttijd = Ext.getCmp('StartInvoer_StartTijd');
			var landingstijd = Ext.getCmp('StartInvoer_LandingsTijd');		
			
			if ((landingstijd.getValue() == null) || (landingstijd.getValue() == ""))	
				return true;
				
			if ((starttijd.getValue() == null) || (starttijd.getValue() == ""))
				return "Starttijd moet eerst ingevoerd worden";
				
			var startSec= stringNaarSec(starttijd.getValue());			// starttijd is een string
			var landingsSec = stringNaarSec(landingstijd.getValue());		// landingstijd is een date
			
			if (startSec>= landingsSec)
			{
				return sprintf("De landingstijd moet na %s liggen", starttijd.getValue());
			}
			
			if (isVandaag())
			{
				if (landingsSec > tijdNaarSec(Ext.StartlijstTijdenForm.zonOnder()))
				{
					return sprintf("De landingstijd moet voor zonsondergang (%s) liggen", TijdStempel(Ext.StartlijstTijdenForm.zonOnder()));
				}
			
				var mt = new Date(); 
				mt.setMinutes(mt.getMinutes()+5);
				if	(landingsSec > tijdNaarSec(mt))
				{
					return "De landingstijd is te ver in de toekomst";
				}
			}
			
			return true;
		},
		
		//************************************************************************************************************************
		// Het opslaan van de landingstijd
		//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++		
		SaveLandingsTijd: function(button, e, options)
		{
			Ext.getCmp('StartInvoerLandingstijd_Opslaan').disable();
			Ext.win.showSaving(true);
			
			var form = Ext.getCmp('StartInvoer_LandingstijdForm');
			form.getForm().submit
			({
				success: function ()
				{   
					Ext.win.showSaving(false);
					Ext.win.msg("Landingstijd is opgeslagen");

					store = Ext.data.StoreManager.lookup('Startlijst_GridStore');
					store.load();
					button.up('.window').close();
				},
				failure: function(res,req) 
				{
					Ext.win.showSaving(false);
					
					if (req.response.status == 200)
						Ext.MessageBox.alert ('Fout bij opslaan', req.result.error);
					else
						Ext.MessageBox.alert ('Server fout', req.response.responseText);

					button.up('.window').close();
				}
			});		
		},	
		
		//************************************************************************************************************************
		// Help de gebruiker een handje 
		//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		onStartInvoer_Keypress: function(textfield, e, options)
		{
			if (textfield.manualInput != true)
			{	
				textfield.tijd = "00:00";
				
				var form, button;
				if (textfield.id == 'StartInvoer_StartTijd')
				{
					form = Ext.getCmp('StartInvoer_StarttijdForm');
					button = Ext.getCmp('StartInvoerStarttijd_Opslaan')
				}
				else
				{
					form = Ext.getCmp('StartInvoer_LandingstijdForm');
					button = Ext.getCmp('StartInvoerLandingstijd_Opslaan')
				}
				
				Ext.StartlijstTijdenForm.TijdInvoerBeperking(form, textfield.id);
				
				textfield.manualInput = true;	
			}
		},
		
		//************************************************************************************************************************
		// Help de gebruiker een handje met automatisch aanvullen 
		//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		onChangeTijd: function(field)
		{
			var rv = field.getRawValue();

			if (this.lastKey != Ext.EventObject.BACKSPACE)
			{
				if ((this.lastLength != undefined) && (this.lastLength < rv.length) && (rv.length == 2))
				{
					field.setRawValue(rv + ':');
				}
			}
			this.lastLength = rv.length;
			field.manualInput = true;	
			
			var form, button;
			if (field.id == 'StartInvoer_StartTijd')
			{
				form = Ext.getCmp('StartInvoer_StarttijdForm');
				button = Ext.getCmp('StartInvoerStarttijd_Opslaan')
			}
			else
			{
				form = Ext.getCmp('StartInvoer_LandingstijdForm');
				button = Ext.getCmp('StartInvoerLandingstijd_Opslaan')
			}
		},
		
		//************************************************************************************************************************
		// Als er nog geen tijd ingevuld is passen we dynamisch de tijd aan. Dan hoeft de gebruiker alleen maar op OK te drukken
		// Doen we niet als de tijd gecoorigeerd moet worden (dus edit van de tijd)
		//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++		
		TijdAanpassen: function (form, objectNaam)
		{
			if (Ext.StartlijstTijdenForm.TijdInvoerBeperking(form, objectNaam))
			{
				var f = function() { Ext.StartlijstTijdenForm.TijdAanpassen(form, objectNaam); };
				setTimeout(f,5 * 1000);	//  roep de functie iedere 5 seconde aan
			}
		},
		
		//************************************************************************************************************************
		// Deze functie zorg voor een dynamisch tijd invoer veld
		// Voor nieuwe tijd, wordt de tijd automatisch aangepast todat de gebruiker invoer gebruikt (manualInput == true)
		// Wordt bij edit eenmalig aangeroepen
		//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++	
		TijdInvoerBeperking: function (form, objectNaam)
		{
			console.log(sprintf("%s: TijdInvoerBeperking()", TijdStempel()));
			var tijdInvoer = Ext.getCmp(objectNaam);
						
			// als het window niet meer bestaat doen we niets			
			if (tijdInvoer === undefined) 
			{
				console.log(sprintf("%s: tijdInvoer === undefined", TijdStempel()));
				return false;
			}

			if (tijdInvoer.manualInput === true) 
			{
				console.log(sprintf("%s: tijdInvoer handmatig ingevoerd", TijdStempel()));
				return false;
			}
			
			if (isVandaag() == false)
			{
				var Min = new Date(); Min.setHours(6,0);
				var Max = new Date(); Max.setHours(22,30);
				
				Ext.StartlijstTijdenForm.ZetMinMaxTijd(tijdInvoer, Min, Max);
				return false;
			}
				
			if (tijdInvoer.tijd == null) 	// er is nog geen tijd ingevoerd, kies huidige tijd en beperk invoer
			{
				var Nu = new Date();

				var Min = new Date(); Min.setMinutes(Min.getMinutes()-10);
				var Max = new Date(); Max.setMinutes(Max.getMinutes()+5);				

				if (Max > Ext.StartlijstTijdenForm.zonOnder())
					Max = Ext.StartlijstTijdenForm.zonOnder();
					
				if (Min < Ext.StartlijstTijdenForm.zonOp())
					Min = Ext.StartlijstTijdenForm.zonOp();			
			
				if ((Nu < Min) || (Nu > Max))
				{
					Min = Ext.StartlijstTijdenForm.zonOp();	
					Max = Ext.StartlijstTijdenForm.zonOnder();
				}
				
				Ext.StartlijstTijdenForm.ZetMinMaxTijd(tijdInvoer, Min, Max);	
				
				tijdInvoer.suspendEvents(false);
				tijdInvoer.setValue(sprintf("%02d:%02d", Nu.getHours(), Nu.getMinutes()));
				tijdInvoer.resumeEvents();
				
				var button;
				if (tijdInvoer.id == 'StartInvoer_StartTijd')
					button = Ext.getCmp('StartInvoerStarttijd_Opslaan')
				else
					button = Ext.getCmp('StartInvoerLandingstijd_Opslaan')
			}
			else
			{
				if (objectNaam == 'StartInvoer_StartTijd')
				{		
					var Landingstijd = Ext.getCmp('StartInvoer_LandingsTijd').getValue();
					if ((Landingstijd != null) && (Landingstijd != ""))
					{
						var d= new Date();
						var uren = Landingstijd.substring(0,2) * 1;
						var minuten = Landingstijd.substring(3,5)*1-1;
						
						d.setHours(uren, minuten);
			
						Ext.StartlijstTijdenForm.ZetMinMaxTijd(tijdInvoer, Ext.StartlijstTijdenForm.zonOp(), d);	
					}
					else
					{	
						var Max = new Date(); Max.setMinutes(Max.getMinutes()+5);
						
						if (Max < Ext.StartlijstTijdenForm.zonOnder())
							Ext.StartlijstTijdenForm.ZetMinMaxTijd(tijdInvoer, Ext.StartlijstTijdenForm.zonOp(), Max);
						else	
							Ext.StartlijstTijdenForm.ZetMinMaxTijd(tijdInvoer, Ext.StartlijstTijdenForm.zonOp(), Ext.StartlijstTijdenForm.zonOnder());	
					}
				}
				else
				{	
					var Max = new Date(); Max.setMinutes(Max.getMinutes()+5);
				
					var Starttijd = Ext.getCmp('StartInvoer_StartTijd').getValue();
					if ((Starttijd != null) && (Starttijd != ""))
					{
						var d= new Date();
						var uren = Starttijd.substring(0,2) * 1;
						var minuten = Starttijd.substring(3,5)*1 +1;
						
						d.setHours(uren, minuten);
			
						if (Max < Ext.StartlijstTijdenForm.zonOnder())
							Ext.StartlijstTijdenForm.ZetMinMaxTijd(tijdInvoer, d, Max);
						else	
							Ext.StartlijstTijdenForm.ZetMinMaxTijd(tijdInvoer, d, Ext.StartlijstTijdenForm.zonOnder());						
					}
					else
					{					
						if (Max < Ext.StartlijstTijdenForm.zonOnder())
							Ext.StartlijstTijdenForm.ZetMinMaxTijd(tijdInvoer, Ext.StartlijstTijdenForm.zonOp(), Max);
						else	
							Ext.StartlijstTijdenForm.ZetMinMaxTijd(tijdInvoer, Ext.StartlijstTijdenForm.zonOp(), Ext.StartlijstTijdenForm.zonOnder());				
					}
				}
			}
			return true;			
		},
		
		//************************************************************************************************************************
		// We gebruiken geen tijd combo omdat niet lekker werkt, dan maar ons eigen control, waarbij de items zelf toevoegen
		// aan de dropdown lijst
		//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++	
		ZetMinMaxTijd: function (timeControl, min, max)
		{
			console.log(sprintf("%s: ZetMinMaxTijd(%s,%s)", TijdStempel(), TijdStempel(min), TijdStempel(max)));

			if (timeControl.store.count() > 0)
			{
				var MinNow = timeControl.store.first().data['tijd'];
				var MaxNow = timeControl.store.last().data['tijd'];
				
				if ((MinNow == sprintf("%02d:%02d", min.getHours(), min.getMinutes())) &&
					(MaxNow == sprintf("%02d:%02d", max.getHours(), max.getMinutes())))
				{
					return; 	// min & max staan al goed
				}
			}
			
			var times = [];
			while(min <= max)
			{
				times.push([sprintf("%02d:%02d", min.getHours(), min.getMinutes())]);
				min = addMinutes(min, 1);
			}
			
			var store = new Ext.data.ArrayStore({
				data   : times,
				fields : ['tijd']});
			
			timeControl.store = store;
		},
		
		zonOp: function ()
		{
			var z = new Date (zonOpkomst);
			z.setMinutes(z.getMinutes() - 30);		// geef een half uur ruimte
			return z;
		},
		
		zonOnder: function()
		{
			var z = new Date(zonOndergang);
			z.setMinutes(z.getMinutes() + 30);		// geef een half uur ruimte
			return z;
		},
		
        init : function()
		{
        }
    };
}();


function isVandaag()
{
	var vandaag = new Date();
	var v = sprintf("%s-%s-%s", vandaag.getFullYear(), vandaag.getMonth()+1, vandaag.getDate());
	
	var datumVeld = Ext.getCmp('StartlijstDatum').getValue();
	if (datumVeld == null)
		datumVeld = new Date();
	var d = sprintf("%s-%s-%s", datumVeld.getFullYear(), datumVeld.getMonth()+1, datumVeld.getDate());

	if (v != d)
	{
		return false;
	}
	return true;
}
