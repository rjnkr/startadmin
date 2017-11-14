Ext.StartlijstDetailWindow = function(){
    return {
		onStartDetailsWindowShow: function(abstractcomponent, options, ID)
		{	
			Ext.win.showLoading(true, "onStartDetailsWindowShow");
			var form = Ext.getCmp("StartDetailsForm");		
			form.getForm().load({
				url: 'php/main.php?Action=Startlijst.GetObjectDetailsJSON',
				params: {
					ID: ID
				},
				success: function(res,req)
				{
					Ext.win.showLoading(false, "onStartDetailsWindowShow");
					
					Ext.QuickTips.register({
						target: Ext.getCmp('StartDetailsVoorin').getEl(),
						text: Ext.getCmp('StartDetailsVliegerType').value
					});
					
					Ext.QuickTips.register({
						target: Ext.getCmp('StartDetailsAchterin').getEl(),
						text: Ext.getCmp('StartDetailsInzittendeType').value
					});
					
					Ext.QuickTips.register({
						target: Ext.getCmp('StartDetailsOpRekening').getEl(),
						text: Ext.getCmp('StartDetailsOpRekeningType').value
					});	

					Ext.getCmp('Stoel1').show();
					if 	(Ext.getCmp('StartDetailsZitplaatsen').value == 2)
					{
						Ext.getCmp('Stoel2').show();
					}		

					Ext.getCmp("StartDetailsForm").getForm().isValid();
					
					var appSettingsStore = Ext.data.StoreManager.lookup('AppSettings_Store');
					var appSettings = appSettingsStore.getAt(0);
					if (appSettings.data.MagSchrijven)
					{
						 Ext.getCmp('StartDetailsWijzigStart').show();
					}
					
					if (appSettings.data.isBeheerder)
					{
						Ext.data.StoreManager.lookup('Types_Lid_Store').slimLaden();

						if (Ext.getCmp('StartDetailsVliegerID').value > 0)
							Ext.getCmp('StartDetailsEditVlieger').show();
						 
						if (Ext.getCmp('StartDetailsInzittendeID').value > 0)
							Ext.getCmp('StartDetailsEditInzittende').show();
						 
						if (Ext.getCmp('StartDetailsOpRekeningID').value > 0)
							Ext.getCmp('StartDetailsEditOpRekening').show();					 
					}
				},
				failure: function(form, action) 
				{
					Ext.win.showLoading(false, "onStartDetailsWindowShow");
					Ext.Msg.alert("Load failed", action.response.responseText);
				}
			});

		},
		
		ValiderenVlieger: function(value)
		{
			var appSettingsStore = Ext.data.StoreManager.lookup('AppSettings_Store');
			var appSettings = appSettingsStore.getAt(0);	

			if (appSettings.data.isBeheerder)
			{		
				if (Ext.getCmp('StartDetailsVliegerAlert').value == "1")
					return "Lidnummer is niet ingevuld";
			}
			return true; 		
		},
		
		ValiderenInzittende: function(value)
		{
			var appSettingsStore = Ext.data.StoreManager.lookup('AppSettings_Store');
			var appSettings = appSettingsStore.getAt(0);	

			if (appSettings.data.isBeheerder)
			{		
				if (Ext.getCmp('StartDetailsInzittendeAlert').value == "1")
					return "Lidnummer is niet ingevuld";
			}

			return true; 		
		},

		ValiderenOpRekening: function(value)
		{
			var appSettingsStore = Ext.data.StoreManager.lookup('AppSettings_Store');
			var appSettings = appSettingsStore.getAt(0);	

			if (appSettings.data.isBeheerder)
			{		
				if (Ext.getCmp('StartDetailsOpRekeningAlert').value == "1")
					return "Lidnummer is niet ingevuld";
			}
			
			return true; 		
		},

		onButtonClick: function(button, e, options)	
		{
			ID = Ext.getCmp('StartDetailsID').value;
			CloseStartDetailsWindow();
			
			var appSettingsStore = Ext.data.StoreManager.lookup('AppSettings_Store');
			var appSettings = appSettingsStore.getAt(0);	

			if (appSettings.data.isBeheerder)
			{
				var view = Ext.widget('StartInvoerWindow', {'ID': ID});
				view.show();
			}
		},
		
		onStartDetailsEditVliegerClick: function(button, e, options)	
		{
			ID = Ext.getCmp('StartDetailsVliegerID').value;
			CloseStartDetailsWindow();
			
			var view = Ext.widget('LidBeheerWindow', {'ID': ID});
			view.show();			
		},		
		
		onStartDetailsEditInzittendeClick: function(button, e, options)	
		{
			ID = Ext.getCmp('StartDetailsInzittendeID').value;
			CloseStartDetailsWindow();
			
			var view = Ext.widget('LidBeheerWindow', {'ID': ID});
			view.show();				
		},	
		
		onStartDetailsEditOpRekeningClick: function(button, e, options)	
		{
			ID = Ext.getCmp('StartDetailsOpRekeningID').value;
			CloseStartDetailsWindow();
			
			var view = Ext.widget('LidBeheerWindow', {'ID': ID});
			view.show();				
		},
		
		ValiderenVlieger2: function(value)
		{
			var appSettingsStore = Ext.data.StoreManager.lookup('AppSettings_Store');
			var appSettings = appSettingsStore.getAt(0);	

			if (appSettings.data.isBeheerder)
			{		
				if (Ext.getCmp('StartDetailsVliegerAlert2').value == "1")
					return "Lidnummer is niet ingevuld";
			}
			return true; 		
		},
		
		ValiderenInzittende2: function(value)
		{
			var appSettingsStore = Ext.data.StoreManager.lookup('AppSettings_Store');
			var appSettings = appSettingsStore.getAt(0);	

			if (appSettings.data.isBeheerder)
			{		
				if (Ext.getCmp('StartDetailsInzittendeAlert2').value == "1")
					return "Lidnummer is niet ingevuld";
			}

			return true; 		
		},

		ValiderenOpRekening2: function(value)
		{
			var appSettingsStore = Ext.data.StoreManager.lookup('AppSettings_Store');
			var appSettings = appSettingsStore.getAt(0);	

			if (appSettings.data.isBeheerder)
			{		
				if (Ext.getCmp('StartDetailsOpRekeningAlert2').value == "1")
					return "Lidnummer is niet ingevuld";
			}
			
			return true; 		
		},

		onButtonClick2: function(button, e, options)	
		{
			ID = Ext.getCmp('StartDetailsID2').value;
			CloseStartDetailsWindow();
			
			var appSettingsStore = Ext.data.StoreManager.lookup('AppSettings_Store');
			var appSettings = appSettingsStore.getAt(0);	

			if (appSettings.data.isBeheerder)
			{
				var view = Ext.widget('StartInvoerWindow', {'ID': ID});
				view.show();
			}
		},
		
		onStartDetailsEditVliegerClick2: function(button, e, options)	
		{
			ID = Ext.getCmp('StartDetailsVliegerID2').value;
			CloseStartDetailsWindow();
			
			var view = Ext.widget('LidBeheerWindow', {'ID': ID});
			view.show();			
		},		
		
		onStartDetailsEditInzittendeClick2: function(button, e, options)	
		{
			ID = Ext.getCmp('StartDetailsInzittendeID2').value;
			CloseStartDetailsWindow();
			
			var view = Ext.widget('LidBeheerWindow', {'ID': ID});
			view.show();				
		},	
		
		onStartDetailsEditOpRekeningClick2: function(button, e, options)	
		{
			ID = Ext.getCmp('StartDetailsOpRekeningID2').value;
			CloseStartDetailsWindow();
			
			var view = Ext.widget('LidBeheerWindow', {'ID': ID});
			view.show();				
		}		
	}
}();


function ToonStartDetails(ID)
{
	var view = Ext.widget('StartDetailsWindow', {'ID': ID});
	view.show();
	closeStartDetailWindowsTimer = setTimeout(CloseStartDetailsWindow,2000*1000);	//  roep de functie over 20 seconde aan
}

function CloseStartDetailsWindow()
{
	clearTimeout(closeStartDetailWindowsTimer);
	Ext.getCmp('StartDetailsWindow').close();
}
