Ext.Daginfo= function(){
    return {	
		// Deze functie verbergt, toont velden op basis van de ingevoerde waarde
        DynamischFormulier : function()
		{	
			console.log(sprintf("%s: DynamischFormulier()", TijdStempel()));
			
			// Invoer Controls
			var ComboboxInfoBanen = Ext.getCmp('ComboboxInfoBanen');
			var ComboboxInfoVliegveld = Ext.getCmp('ComboboxInfoVliegveld');
			var WindPanel = Ext.getCmp('WindPanel');
			
			var VliegveldID = ComboboxInfoVliegveld.getValue();
			
			if (VliegveldID != 901)			// 901 = TERLET
			{
				console.log(sprintf("%s: DynamischFormulier, We vliegen niet op Terlet", TijdStempel()));
				
				ComboboxInfoBanen.hide();
				WindPanel.hide();
			}	
			else
			{
				ComboboxInfoBanen.show();
				WindPanel.show();
			}
			var MiddagSectie = Ext.getCmp('Daginfo_MiddagContainer');
			var soortBedrijf = Ext.getCmp('ComboboxInfoSoortBedrijf').getValue();
			
			var time= new Date();
			// Voor DDWV bedrijf hoeft middag niet ingevuld te worden.
			if ((time.getHours() < 14) || (soortBedrijf == '703'))	// 703 == DDWV
			{
				MiddagSectie.hide();
				
				// door items niet te displayen is veld altijd valid 
				Ext.getCmp('TextboxInfoMiddagDDI').hide();
				Ext.getCmp('TextboxInfoMiddagInstructeur').hide();
				Ext.getCmp('TextboxInfoMiddagLierist').hide();
				Ext.getCmp('TextboxInfoMiddagHulpLierist').hide();
				Ext.getCmp('TextboxInfoMiddagStartleider').hide();
			}
			else
			{
				MiddagSectie.show();
				
				Ext.getCmp('TextboxInfoMiddagDDI').show();
				Ext.getCmp('TextboxInfoMiddagInstructeur').show();
				Ext.getCmp('TextboxInfoMiddagLierist').show();
				Ext.getCmp('TextboxInfoMiddagHulpLierist').show();
				Ext.getCmp('TextboxInfoMiddagStartleider').show();
			}
			
			var dagform = Ext.getCmp('DaginfoForm');
			dagform.getForm().isValid();
			
			if (dagform.daginfo == null)
				return;
        },
		
		onButtonClick: function(button, e, options)
		{
			var form = Ext.getCmp('DaginfoForm');
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
				success: function ()
				{   
					Ext.win.showSaving(false);
					Ext.win.msg("Dag informatie opgeslagen");

					var Dstore = Ext.data.StoreManager.lookup('Daginfo_Store');
					Dstore.load();

					var Lstore = Ext.data.StoreManager.lookup('Aanwezig_Leden_GridStore');
					Lstore.slimLaden();
					
					Ext.getCmp('DaginfoForm').getForm().clearDirty();

				},
				failure: function(req,res) 
				{
					Ext.win.showSaving(false);
					if (res.response.status == 200)
					Ext.MessageBox.alert ('Fout bij opslaan', res.result.error);
					else
					Ext.MessageBox.alert ('Server fout', res.response.responseText);

				}
			});		
		},
		
		ValiderenVliegveld: function(value)
		{
			return Ext.Daginfo.ValideerItem(Ext.getCmp('ComboboxInfoVliegveld'));
		},
		
		ValiderenClub: function(value)
		{
			return Ext.Daginfo.ValideerItem(Ext.getCmp('ComboboxInfoClub'));
		},

		ValiderenSoortBedrijf: function(value)
		{
			return Ext.Daginfo.ValideerItem(Ext.getCmp('ComboboxInfoSoortBedrijf'));
		},		

		ValiderenStartMethode: function(value)
		{
			return Ext.Daginfo.ValideerItem(Ext.getCmp('ComboboxInfoStartMethode'));
		},
		
		ValiderenBaan: function(value)
		{			
			var veld = Ext.getCmp('ComboboxInfoBanen');
			if (!veld.isVisible())
			{
				console.log(sprintf("%s: %s not visisble", TijdStempel(), veld.id));
				return true;
			}

			if ((value == "") || (value == null))
			{			
				console.log(sprintf("%s: %s = De baan moet ingevoerd worden.", TijdStempel(), veld.id));				
				return "De baan moet ingevoerd worden.";
			}				
				
			return Ext.Daginfo.ValideerItem(Ext.getCmp('ComboboxInfoBanen'));			
		},		

		ValiderenWindrichting: function(value)
		{
			if (Ext.getCmp('WindPanel').isVisible())
			{
				if ((value == "") || (value == null))
				{	
					console.log(sprintf("%s: De windrichting moet ingevoerd worden.", TijdStempel()));
					return "De windrichting moet ingevoerd worden.";
				}	
				return Ext.Daginfo.ValideerItem(Ext.getCmp('ComboboxInfoWindRichting'));			
			}	
			console.log(sprintf("%s: Windrichting - WindPanel not visisble", TijdStempel()));
			return true;			
		},	
		
		ValiderenWindkracht: function(value)
		{
			if (Ext.getCmp('WindPanel').isVisible())
			{
				if ((value == "") || (value == null))
				{	
					console.log(sprintf("%s: De windkracht moet ingevoerd worden.", TijdStempel()));					
					return "De windkracht moet ingevoerd worden.";
				}
				return Ext.Daginfo.ValideerItem(Ext.getCmp('ComboboxInfoWindKracht'));							
			}	
			console.log(sprintf("%s: Windkracht - WindPanel not visisble", TijdStempel()));
			return true;			
		},
		
		ValideerItem: function(veld)
		{
			return Ext.Daginfo.Valideer(veld, "Er moet een item uit de lijst gekozen worden.");
		},
		
		Valideer: function(veld, tekst)
		{
			if (!veld.isVisible())
			{
				console.log(sprintf("%s: %s not visisble", TijdStempel(), veld.id));
				return true;
			}
			
			var v = veld.getValue() + "";
			var rv = veld.getRawValue() + "";
			if ((v.length + rv.length) > 0)
			{
				if (v == rv)
				{
					console.log(sprintf("%s: %s = %s", TijdStempel(), veld.id, tekst));
					return tekst;
				}
			}	
			console.log(sprintf("%s: %s = OK", TijdStempel(), veld.id));
			return true;
		},
		
		isDaginfoIngevuld: function()
		{
			var DaginfoStore = Ext.data.StoreManager.lookup('Daginfo_Store');
			var daginfo = DaginfoStore.getAt(0);
			
			var dagform = Ext.getCmp('DaginfoForm');
			
			if (dagform.getForm().isDirty())
			{
				var hoofdscherm = Ext.getCmp('HoofdScherm');
				var activeTab = hoofdscherm.activeTab;
				
				if (activeTab.id != "Daginfo")
				{
					Ext.MessageBox.show({
					   title: 'Waarschuwing',
					   msg: 'De dag informatie is nog niet opgeslagen',
					   buttons: Ext.MessageBox.OK,
					   icon:  Ext.MessageBox.WARNING
				   });

					return true;				   
				}
			}
			else
			{
				dagform.loadRecord(daginfo);
				dagform.daginfo = daginfo;
			}
			var valid = dagform.getForm().isValid();
			
			Ext.Daginfo.DynamischFormulier();
					
			if ((daginfo.data.ROOSTER == true) || (valid == false))
			{
				Ext.getCmp('Daginfo').setIcon('images/alert.png'); 
				return false;
			}			
			
			Ext.getCmp('Daginfo').setIcon('images/ok.png'); 	
            
            if (daginfo != null)
            {
            	var bs = Ext.data.StoreManager.lookup('Types_Banen_Store');
            	var baan = bs.getById(daginfo.data.BAAN_ID);
            
                if (baan != null)
                {
					Ext.getCmp('Daginfo').tab.setTooltip(sprintf("Baan %s", baan.data.OMSCHRIJVING));
                }
            }	
			return true;
		},
		
		DagInfoWaarschuwing: function ()
		{	
			var DaginfoCompleet = Ext.Daginfo.isDaginfoIngevuld();
		
			var hoofdscherm = Ext.getCmp('HoofdScherm');
			var activeTab = hoofdscherm.activeTab;
			
			
			if ((isVandaag()) && (activeTab.id != "Daginfo") && (DaginfoCompleet === false))
			{
				Ext.MessageBox.show({
				   title: 'Herinnering',
				   msg: 'De dag informatie is nog niet ingevuld',
				   buttons: Ext.MessageBox.OK,
				   icon:  Ext.MessageBox.WARNING
			   });
			}
			
			setTimeout(Ext.Daginfo.DagInfoWaarschuwing,15 * 60 * 1000);
		},
		
        init : function()
		{
        }
    };
}();
