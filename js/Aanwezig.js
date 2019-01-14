// javascript functie die nodig zijn voor het aanmelden
    
Ext.AanmeldenForm = function(){		
    return {
		// Deze functie wordt aangeroepen als het invoer window wordt geopend
        onInvoerWindowShow: function(abstractcomponent, options, ID, LID_ID)
		{
            Ext.data.StoreManager.lookup('Startlijst_Vlieger_Store').slimLaden(null, false);

            var aanmeldenstore = Ext.data.StoreManager.lookup('Aanmelden_Lid_Store');

            aanmeldenstore.load (
            {
                scope: this,
                callback: function(records, operation, success)
                {
                    if (success)
                    {
                        var vstore = Ext.data.StoreManager.lookup('Startlijst_Vlieger_Store');

                        var lid = null;
                        var aanmelding = null;
            
                        if (LID_ID > 0)             // haal het lid op als we het LID_ID weten
                        {
                            var l = vstore.find('ID', LID_ID);
                            lid = vstore.getAt(l);
            
                            var vliegerComboBox = Ext.getCmp('Aanmelden.VliegerCombobox');
                            vliegerComboBox.hide();                             
                        }
                        if (ID > 0)                 // lid is eerder aangemeld, haal data op
                        {
                            var a = aanmeldenstore.find('ID', ID);  
                            aanmelding = aanmeldenstore.getAt(a); 
            
                            if ((LID_ID < 0) && (aanmelding != null))   // We hadden geen lid, nu wel
                            {
                                var l = vstore.find('ID', aanmelding.data.LID_ID);
                                lid = vstore.getAt(l);      
                                LID_ID = lid.data.ID;  
                                
                                var vliegerComboBox = Ext.getCmp('Aanmelden.VliegerCombobox');
                                vliegerComboBox.hide();   
                            }
                        }

                        Ext.AanmeldenForm.FilterVliegers(LID_ID);
                        
                        // aanmaken nieuw record
                        if (aanmelding == null)
                        {
                            if (LID_ID < 0)
                            {
                                aanmelding = Ext.create('GeZC_StartAdministratie.model.LedenAanwezig_Model');
                            }
                            else
                            {
                                aanmelding = Ext.create('GeZC_StartAdministratie.model.LedenAanwezig_Model',
                                {
                                    LID_ID : LID_ID
                                });
                            }
                        }
            
                        // laden record in form
                        var form = Ext.getCmp('LidAanmeldInvoerForm');
                        form.loadRecord(aanmelding);
            
                        // zetten van vliegtuig types
                        var VliegtuigType = Ext.getCmp('Aanwezig_InvoerTypeVliegtuig');
                        VliegtuigType.zetWaarde(aanmelding.data.VOORKEUR_VLIEGTUIG_TYPE);
                    }
                }
            });
        },

        onVliegerComboboxChange: function(field, newValue, oldValue, eOpts)
        {
            var vstore = Ext.data.StoreManager.lookup('Startlijst_Vlieger_Store');
            var vliegerComboBox = Ext.getCmp('Aanmelden.VliegerCombobox');

            if (isNumeric(vliegerComboBox.getValue()))
            {
                var l = vstore.find('ID', newValue);
                lid = vstore.getAt(l);

                if (lid != null)
                {
                    var avstore = Ext.data.StoreManager.lookup('Aanmelden_Vliegtuig_Store');
    
                    if (lid.data.LIDTYPE_ID != "625")		// 625 = DDWV vlieger
                    {
                        avstore.load();
    
                        Ext.getCmp('Aanwezig_InvoerTypeVliegtuig').show();		// toon op welk vliegtuig men overland wil gaan vliegen
                        Ext.getCmp('LabelVliegtuigType').show();				// toon op welke club vliegtuig types er gevlogen kan worden
                    }
                    else
                    {
                        Ext.getCmp('Aanwezig_InvoerTypeVliegtuig').hide();		// Een DDWV vlieger mag niet op clubvliegtuigen vliegen
                        Ext.getCmp('LabelVliegtuigType').hide();				// Een DDWV vlieger mag niet op clubvliegtuigen vliegen
    
                        avstore.load(                                           // Laden van vliegtuigen waaruit gekozen kan worden, geen clubkisten
                        {
                            params:
                            {
                                '_:clubkist':false
                            }
                        });
                    }                
                }                
            }
        },

        FilterVliegers: function(LID_ID)
		{
			console.log(sprintf("%s: FilterVliegers(%s)", TijdStempel(), LID_ID));
            var vliegerComboBox = Ext.getCmp('Aanmelden.VliegerCombobox');
            
            vliegerComboBox.store.clearFilter();
            
            if (LID_ID > 0)
                return;

            var FilterArray = new Array();
            var di = Ext.data.StoreManager.lookup('Daginfo_Store');
			if (di.count() > 0)
			{
				var daginfo = di.getAt(0);
				if (daginfo.data.SOORTBEDRIJF_ID == 701)			// 701 is alleen clubbedrijf
					FilterArray.push(625);		                    // DDWV kunnen niet aangemeld worden
            }
            
            // Deze lidtypes kunnen nooit aangemeld worden
            FilterArray.push(609);		// Nieuw lid
            FilterArray.push(612);		// lidtype penningmeester

            vliegerComboBox.primaryFilterBy = 
                "function myfilter(record,id)" + 
                "{" + 
                "	var FilterField = '" + FilterArray.join() +"';" 						+
                "	if (FilterField.indexOf(record.data.LIDTYPE_ID) == -1) return true;" 			+						
                "	return false;" + 
                "}";			
        
            eval("var vlf =" + vliegerComboBox.primaryFilterBy);
            vliegerComboBox.store.filterBy(vlf);	
        },

        onButtonClick: function(button, e, options)
		{
			console.log(sprintf("%s: onButtonClick()", TijdStempel()));
			
			var form = Ext.getCmp('LidAanmeldInvoerForm');
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
            
			Ext.getCmp('Opslaan_AanwezigButton').disable();
			Ext.win.showSaving(true);
			
			var form = Ext.getCmp('LidAanmeldInvoerForm');
			
			form.getForm().submit
			({
				submitEmptyText: false,
				success: function ()
				{   
					Ext.win.msg("Aanmelding is opgeslagen");
										
                    Ext.data.StoreManager.lookup('Aanmelden_Lid_Store').slimLaden(null, false);
                    Ext.data.StoreManager.lookup('Aanwezig_Leden_GridStore').slimLaden(null, false);
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
        },
        
        onStartInvoer_VliegtuigTypeSelectionChange: function(tablepanel, selections, options)			
        {
            var form = Ext.getCmp('LidAanmeldInvoerForm');
			
            var VliegtuigType = Ext.getCmp('Aanwezig_InvoerTypeVliegtuig');
            var AanmeldenVliegtuigTypeID = Ext.getCmp('Aanmelden_VliegtuigTypeID');
            AanmeldenVliegtuigTypeID.setValue(VliegtuigType.haalWaarde());
            
            console.log(sprintf("%s: onStartInvoer_StartMethodeSelectionChange()", TijdStempel()));
        }
    };
}();

