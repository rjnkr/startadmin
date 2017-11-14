Ext.LidBeheer = function(){
    return {	

		onLidBeheerWindowShow: function(abstractcomponent, options, ID)
		{
			console.log(sprintf("%s: onLidBeheerWindowShow()", TijdStempel()));
			
			// haal lid record op, of maak een nieuw record
			var record;
			if (ID == -1)
			{
				record = Ext.create('GeZC_StartAdministratie.model.LedenLijst_Model', 
				{
					ID: -1,
					HEEFT_BETAALD: 1
				});
				Ext.getCmp('LidBeheer_Titel').setText('Nieuw lid');
				Ext.getCmp('LidBeheerForm').loadRecord(record);
			}
			else
			{
				Ext.getCmp('LidBeheer_Titel').setText('Aanpassen lid');  				

				Ext.win.showLoading(true, "onLidBeheerWindowShow");		
				Ext.getCmp("LidBeheerForm").getForm().load({
					url: 'php/main.php?Action=Leden.GetObjectJSON',
					params: {
						'ID': ID
					},
					success: function(res,req)
					{
						Ext.win.showLoading(false, "onLidBeheerWindowShow");
						Ext.getCmp("LidBeheerForm").getForm().clearDirty();
					},
					failure: function(form, action) 
					{
						Ext.win.showLoading(false, "onLidBeheerWindowShow");
						Ext.Msg.alert("Load failed", action.result.errorMessage);
					}
				});
			}

			console.log(sprintf("%s: onLidBeheerWindowShow, ID=%s", TijdStempel(), ID));
			
			var appSettingsStore = Ext.data.StoreManager.lookup('AppSettings_Store');
			var appSettings = appSettingsStore.getAt(0);			

			if (appSettings.data.isBeheerder)
			{
				Ext.getCmp('LidBeheer_LidNr').show();
				Ext.getCmp('LidBeheer_HeeftBetaald').show();
				var ltype = Ext.getCmp('LidBeheer_Lidtype');

				ltype.show(); 
				ltype.store.clearFilter();

				ltype.primaryFilterBy = 
				"function myfilter(record,id) " 						+
				"{" 													+
					"    if (record.data.ID == '610') return false;" 	+
					"    if (record.data.ID == '612') return false;" 	+
					"    return true;" 									+
				"}"; 			

				eval("var sif64=" + ltype.primaryFilterBy);
				ltype.store.filterBy(sif64);    
			}

		},
	
		//************************************************************************************************************************
		// Controleren of het gewone of het mobiele telefoonnummber is ingevoerd
		//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		ValiderenTelefoonNummer: function(value)
		{
			console.log(sprintf("%s: ValiderenTelefoonNummer()", TijdStempel()));
			
			var Telefoon = Ext.getCmp('LidBeheer_Telefoon').getValue();
			var Mobiel = Ext.getCmp('LidBeheer_Mobiel').getValue();
			
			if (((Telefoon == null) || (Telefoon == "")) && ((Mobiel == null) || (Mobiel == "")))
			{
				return "Telefoon nummer of mobiel nummer moet ingevuld zijn.";
			}
			return true;			
		},
		
		ValiderenLidType: function(value)
		{
			console.log(sprintf("%s: ValiderenLidType()", TijdStempel()));
			
			var appSettingsStore = Ext.data.StoreManager.lookup('AppSettings_Store');
			var appSettings = appSettingsStore.getAt(0);	
			
			if (appSettings.data.isBeheerder)
			{
				var Lidtype = Ext.getCmp('LidBeheer_Lidtype').getValue();
				
				if ((Lidtype == null) || (Lidtype == ""))
				{
					return "Lidtype moet ingevuld zijn.";
				}
			}
			return true;			
		},
		
		onLidBeheer_LidtypeChange: function(field, newValue, oldValue, options)
		{
			var appSettingsStore = Ext.data.StoreManager.lookup('AppSettings_Store');
			var appSettings = appSettingsStore.getAt(0);
			
			if ((appSettings.data.isBeheerder) && (newValue == 607)) // 607 == zusterclub
			{
				Ext.getCmp('LidBeheer_Code').show();
			}
			else
			{
				Ext.getCmp('LidBeheer_Code').hide();
			}
		}
		
    };
}();

