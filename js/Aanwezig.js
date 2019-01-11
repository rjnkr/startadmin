// javascript functie die nodig zijn voor het aanmelden
    
Ext.AanmeldenForm = function(){		
    return {
		// Deze functie wordt aangeroepen als het invoer window wordt geopend
        onInvoerWindowShow: function(abstractcomponent, options, ID)
		{
            var vliegerComboBox = Ext.getCmp('Aanmelden.VliegerCombobox');

            if (ID >= 0)
            {
            //   vliegerComboBox.setValue(ID);
                vliegerComboBox.hide();

            }
        }
    };
}();
