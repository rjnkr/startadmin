Ext.Controle = function(){
    return {
	
		//************************************************************************************************************************
		// Deze functie wordt aangeroepen vanuit het grid
		//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		OpenStartCopyWindow: function(ID)
		{
			var store = Ext.data.StoreManager.lookup('ControleStartlijstFlarm_Store');
			var start = store.getById(ID.toString());
	
			var title = "Vlucht: #" + start.data.DAGNUMMER + ", " + start.data.SA_REG_CALL + ", " + start.data.SA_VLIEGERNAAM;
			
			var win = Ext.widget('CopyStarttijdWindow', {'title': title, 'ID': ID});
			win.show();
		},
	
		//************************************************************************************************************************
		// Deze functie wordt aangeroepen als het starttijd window wordt geopend
		//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		onStartCopyWindowShow: function(abstractcomponent, options, ID)
		{
			var form = Ext.getCmp('StartCopyForm');

			// haal startlijst record op
			var store = Ext.data.StoreManager.lookup('ControleStartlijstFlarm_Store');
			var record = store.getById(ID.toString());
			
			form.loadRecord(record);
		},

		//************************************************************************************************************************
		// Deze functie wordt aangeroepen om de flarm starttijd top copieren naar de sa starttijd
		//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		onStartCopy_OvernemenClick: function(button, e, eOpts)		
		{
			var startflarm = Ext.getCmp("StartFlarm_Text");
			var startsa = Ext.getCmp("StartSA_Text");

			startsa.setValue(startflarm.getValue());
		},
		
		
		//************************************************************************************************************************
		// Het opslaan van de starttijd
		//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++				
		onStartCopy_OpslaanClick: function(button, e, options)
		{
			Ext.getCmp('StartCopy_Opslaan').disable();
			Ext.win.showSaving(true);
		
			var form = Ext.getCmp('StartCopyForm');
			
			form.getForm().submit
			({
				success: function ()
				{   
					Ext.win.showSaving(false);
					Ext.win.msg("Starttijd is opgeslagen");

					Ext.data.StoreManager.lookup('Startlijst_GridStore').load();

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
		// Deze functie wordt aangeroepen vanuit het grid
		//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		OpenLandingCopyWindow: function(ID)
		{
			var store = Ext.data.StoreManager.lookup('ControleStartlijstFlarm_Store');
			var start = store.getById(ID.toString());
	
			var title = "Vlucht: #" + start.data.DAGNUMMER + ", " + start.data.SA_REG_CALL + ", " + start.data.SA_VLIEGERNAAM;
			
			var win = Ext.widget('CopyLandingstijdWindow', {'title': title, 'ID': ID});
			win.show();
		},
	
		//************************************************************************************************************************
		// Deze functie wordt aangeroepen als het starttijd window wordt geopend
		//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		onLandingCopyWindowShow: function(abstractcomponent, options, ID)
		{
			var form = Ext.getCmp('LandingCopyForm');

			// haal startlijst record op
			var store = Ext.data.StoreManager.lookup('ControleStartlijstFlarm_Store');
			var record = store.getById(ID.toString());
			
			form.loadRecord(record);
		},

		//************************************************************************************************************************
		// Deze functie wordt aangeroepen om de flarm starttijd top copieren naar de sa starttijd
		//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		onLandingCopy_OvernemenClick: function(button, e, eOpts)		
		{
			var landingflarm = Ext.getCmp("LandingFlarm_Text");
			var landingsa = Ext.getCmp("LandingSA_Text");

			landingsa.setValue(landingflarm.getValue());
		},
		
		
		//************************************************************************************************************************
		// Het opslaan van de starttijd
		//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++				
		onLandingCopy_OpslaanClick: function(button, e, options)
		{
			Ext.getCmp('LandingCopy_Opslaan').disable();
			Ext.win.showSaving(true);
		
			var form = Ext.getCmp('LandingCopyForm');
			
			form.getForm().submit
			({
				success: function ()
				{   
					Ext.win.showSaving(false);
					Ext.win.msg("Landingstijd is opgeslagen");

					Ext.data.StoreManager.lookup('Startlijst_GridStore').load();

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
		// Open het window om vluchten voor het lid te tonen
		//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++	
		OpenControleDetailsWindow: function(ID)
		{
			var store = Ext.data.StoreManager.lookup('ControleDagOverzicht_GridStore');
			var details = store.getById(ID.toString());
	
			var title = "Details: " + details.data.NAAM;
			
			var win = Ext.widget('ControleDetailsWindow', {'title': title, 'ID': ID});
			win.show();
		},
		
		
		onControleDetailsWindowShow: function(abstractcomponent, options, ID)
		{
			var store = Ext.data.StoreManager.lookup('ControleDagOverzichtLidStore');
			store.load(
			{
				params: 
				{
					'_:ID':ID
				}
			});
		},
		
		
        init : function()
		{
        },
		
		//************************************************************************************************************************
		// Tijdelijke leden (lidtype 609) zijn in de toren ingevoerd en moeten omgezet worden naar een perment lid uit de leden administratie
		//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++	
		
		
		OpenAanpassenTijdelijkLidWindow: function(Type, ID, TijdelijkLidID)
		{
			var store = Ext.data.StoreManager.lookup('ControleDagOverzicht_GridStore');
			var details = store.getById(ID.toString());
	
			var title = "Details: " + details.data.NAAM;
			
			var win = Ext.widget('ControleDetailsWindow', {'title': title, 'ID': ID});
			win.show();
		}
    };
}();