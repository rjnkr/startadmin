// Open het window met de details
function OpenFlarmStartWindow()
{
	// Alleen openen als het window nog niet getoond is
	if (Ext.getCmp("FlarmStartWindow") == undefined)
	{
		var view = Ext.widget('FlarmStartWindow');
		view.show();
	}
}

Ext.FlarmForm = function(){
    return {
	
		FlarmStart_GridviewItemClick: function(dataview, record, item, index, e, options)
		{
			var view = Ext.widget('LinkFlarmStartWindow', {'ID': record.data.ID});
			view.show();
		},
		
		onButtonClick: function(button, e, options)
		{
			console.log(sprintf("%s: onButtonClick()", TijdStempel()));
			
			var form = Ext.getCmp('LinkFlarmStartForm');
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
			   
			Ext.win.showSaving(true);
					
			form.getForm().submit
			({
				submitEmptyText: false,
				success: function ()
				{   
					Ext.win.showSaving(false);
					Ext.win.msg("Flarm code is aangepast");

					store = Ext.data.StoreManager.lookup('FlarmStart_Store');
					store.load();
					button.up('.window').close();
				},
				failure: function(res,req) 
				{
					Ext.win.showSaving(false);
					
					if (req.response.status == 200)
						Ext.MessageBox.alert ('Fout bij aanpassen Flarm code', req.result.error);
					else
						Ext.MessageBox.alert ('Server fout', req.response.responseText);

					button.up('.window').close();
				}
			});		
		}
	};
}();	