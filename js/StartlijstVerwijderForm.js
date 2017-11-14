Ext.StartlijstVerwijderForm = function(){
    return {	
		// Deze functie wordt aangeroepen als het start invoer window wordt geopend
		onStartVerwijderWindowShow: function(abstractcomponent, options, ID)
		{
			console.log(sprintf("%s: onStartVerwijderWindowShow()", TijdStempel()));
			var form = Ext.getCmp('StartVerwijder_VerwijderForm');

			// haal startlijst record op, of maak een nieuw record
			var record;

			var store = Ext.data.StoreManager.lookup('Startlijst_GridStore');
			record = store.getById(ID.toString());
			
			console.log(sprintf("%s: onStartVerwijderWindowShow, ID=%s", TijdStempel(), record.data.ID));
			
			// laad het record in het formulier
			form.loadRecord(record);
			Ext.getCmp('StartVerwijder_VerwijderForm').getForm().isValid();
		},

		// We gaan de data opslaan in de database
		onButtonClick: function(button, e, options)
		{
			Ext.win.showSaving(true);
			console.log(sprintf("%s: onButtonClick()", TijdStempel()));
			var form = Ext.getCmp('StartVerwijder_VerwijderForm');
			
			form.getForm().submit
			({
				success: function ()
				{   
					Ext.win.showSaving(false);
					Ext.win.msg("Start is verwijderd");

					button.up('.window').close();
					Ext.getCmp('ButtonVerwijderenVlucht').toggle();				
				},
				failure: function(res,req) 
				{
					Ext.win.showSaving(false);
					if (req.response.status == 200)
						Ext.MessageBox.alert ('Fout bij verwijderen', req.result.error);
					else
						Ext.MessageBox.alert ('Server fout', req.response.responseText);

					button.up('.window').close();
					Ext.getCmp('ButtonVerwijderenVlucht').toggle();
				}
			});		
		},	

        init : function()
		{
        }
    };
}();