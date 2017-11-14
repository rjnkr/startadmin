// Het beheren (toevoegen, verwijderen, wijzigen) van de lijst met vliegtuigen
Ext.VliegtuigBeheer = function(){
    return {	

		onVliegtuigBeheerWindowShow: function(abstractcomponent, options, ID)
		{
			console.log(sprintf("%s: onVliegtuigBeheerWindowShow()", TijdStempel()));
			var form = Ext.getCmp('VliegtuigBeheerForm');

			// haal vliegtuig record op, of maak een nieuw record
			var record;
			if (ID == -1)
			{
				record = Ext.create('GeZC_StartAdministratie.model.VliegtuigenLijst_Model', 
				{
					ID: -1
				});
				Ext.getCmp('VliegtuigBeheer_Titel').setText('Nieuw vliegtuig');
			}
			else
			{
				var store = Ext.data.StoreManager.lookup('VliegtuigenLijst_GridStore');
				record = store.getById(ID);
				Ext.getCmp('VliegtuigBeheer_Titel').setText('Aanpassen vliegtuig');
			}

			console.log(sprintf("%s: onVliegtuigBeheerWindowShow, ID=%s", TijdStempel(), record.data.ID));

			// laad het record in het formulier
			form.loadRecord(record);

			var VliegtuigType = Ext.getCmp('VliegtuigBeheer_VliegtuigType');
			var Clubkist = Ext.getCmp('VliegtuigBeheer_Clubkist');
			var TMG = Ext.getCmp('VliegtuigBeheer_TMG');
			var Zelfstarter = Ext.getCmp('VliegtuigBeheer_Zelfstarter');
			var Sleepkist = Ext.getCmp('VliegtuigBeheer_Sleepkist');

			if (record.data.CLUBKIST == 'true')
			{
				Clubkist.setValue(true);
				VliegtuigType.show();
			}
			else
			{
				Clubkist.setValue(false);
				VliegtuigType.hide();
			}

			if (record.data.TMG == 'true')
				TMG.setValue(true);
			else
				TMG.setValue(false);

			if (record.data.ZELFSTART == 'true')
				Zelfstarter.setValue(true);
			else
				Zelfstarter.setValue(false);

			if (record.data.SLEEPKIST == 'true')
				Sleepkist.setValue(true);
			else
				Sleepkist.setValue(false);
				
			if (!appSettings.isBeheerder)
				Clubkist.hide();
			
			Ext.VliegtuigBeheer.DynamischFormulier();
			
			Ext.getCmp("VliegtuigBeheerForm").getForm().clearDirty();
		},
	
		//************************************************************************************************************************
		// Controleren of het vliegtuig type ingevuld is voor clubkisten
		//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		ValiderenVliegtuigType: function(value)
		{
			console.log(sprintf("%s: ValiderenVliegtuigType()", TijdStempel()));
			
			var Clubkist = Ext.getCmp('VliegtuigBeheer_Clubkist').getValue();
			var VliegtuigType = Ext.getCmp('VliegtuigBeheer_VliegtuigType').getValue();
			
			if ((Clubkist == 1) && ((VliegtuigType == null) || (VliegtuigType == "")))
			{
				return "Vliegtuig type moet ingevuld zijn.";
			}
		
			return true;			
		},
		
		// Op basis van de invoer wordt extra velden getoond of verborgen
		DynamischFormulier : function()
		{
			// input form
			var form = Ext.getCmp('VliegtuigBeheerForm');
			
			var TMG = Ext.getCmp('VliegtuigBeheer_TMG');
			var Zelfstarter = Ext.getCmp('VliegtuigBeheer_Zelfstarter');
			var Sleepkist = Ext.getCmp('VliegtuigBeheer_Sleepkist');
			
			var VliegtuigType = Ext.getCmp('VliegtuigBeheer_VliegtuigType');
			var Clubkist = Ext.getCmp('VliegtuigBeheer_Clubkist').getValue();

			if (Clubkist == 1)
				VliegtuigType.show();
			else
				VliegtuigType.hide();
			
			if (Zelfstarter.getValue() == 1)
			{
				Zelfstarter.enable();
				Sleepkist.disable();
				TMG.disable();
			}
			else if (TMG.getValue() == 1)
			{
				Zelfstarter.disable();
				Sleepkist.disable();
				TMG.enable();
			}
			else if (Sleepkist.getValue() == 1)
			{
				Zelfstarter.disable();
				Sleepkist.enable();
				TMG.disable();
			}
			else
			{
				Zelfstarter.enable();
				Sleepkist.enable();
				TMG.enable();
			}
			
			form.getForm().isValid();		// valideer alle velden
		}

    };
}();

