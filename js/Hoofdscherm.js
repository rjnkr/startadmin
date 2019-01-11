Ext.Hoofdscherm = function(){
    return {

		//======= Algemene functies ===================================================================//	
		StartZonderPilootWaarschuwing: function()
		{
			var datumVeld = Ext.getCmp('StartlijstDatum').getValue();
			if (datumVeld == null)
			{
				var conn = new Ext.data.Connection();
				conn.request
				({
					url:"php/main.php?Action=Startlijst.StartZonderPiloot",
					method:'POST',
					success: function(response) 
					{			
						if (response.responseText != "0")
						{
							Ext.MessageBox.show({
							   title: 'Herinnering',
							   msg: 'Gezagvoerder ontbreekt in een of meerdere starts. GRAAG INVULLEN',
							   buttons: Ext.MessageBox.OK,
							   icon:  Ext.MessageBox.ERROR
						   });
						   
						   // Er is iets fout, blijf iedere 2 minuten zeuren
						   setTimeout(Ext.Hoofdscherm.StartZonderPilootWaarschuwing,2 * 60 * 1000);	
						   return;
						}
					}
				});							
			}
			setTimeout(Ext.Hoofdscherm.StartZonderPilootWaarschuwing,5 * 60 * 1000);		
		},
		
		calcPageSize: function (grid) 
		{  
			var rowHeight, contentHeight; 
					
			// body is undefined als het grid nog nooit geopened is
			if (grid.body == undefined)
				return -1;
			
			rowHeight = 30;
			contentHeight = grid.body.getHeight() - rowHeight;
			
			if (grid.getView().getNodes().length > 0)
			{
				try
				{
					var headerHeight = grid.headerCt.getHeight();
					var row = grid.getView().getNode(0);
					rowHeight =  Ext.get(row).getHeight(0);
					contentHeight = Math.max(rowHeight + headerHeight, grid.body.getHeight()) - headerHeight;
					
					contentHeight = grid.body.getHeight();
				}
				catch(err)
				{
					rowHeight = 30;
					contentHeight = grid.body.getHeight() - rowHeight;
				}
			}
			var rows = Math.floor((contentHeight/rowHeight)+0.2);
			console.log(sprintf("%s: applyPageSize() %s %d %d %d", TijdStempel(),grid.id, rowHeight, contentHeight, rows));
			
			if (grid.store.pageSize != rows)
			{
				return rows;
			}
			return -1;
		},		
		
		onStarlijstDatumKeydown: function(textfield, e, options)
		{
			var keyCode = e.getCharCode();

			switch(keyCode)
			{
				case 37: Ext.Hoofdscherm.VorigeDag(); break; // left
				case 38: Ext.Hoofdscherm.VorigeDag(); break; // up
				case 39: Ext.Hoofdscherm.VolgendeDag(); break; // right
				case 40: Ext.Hoofdscherm.VolgendeDag(); break; // down
			}

			e.stopEvent();		
		},
		
		VolgendeDag: function()
		{
			var datumVeld = Ext.getCmp('StartlijstDatum').getValue();
			if (datumVeld == null)
				datumVeld = new Date();
			var d = sprintf("%s-%s-%s", datumVeld.getFullYear(), datumVeld.getMonth()+1, datumVeld.getDate());

			var conn = new Ext.data.Connection();
			conn.request
			({
				url:"php/main.php?Action=Startlijst.ZoekVolgendeDatum",
				method:'POST',
				params: 
				{
					'DATUM': d
				},
				success: function(response) 
				{			
					Ext.getCmp('StartlijstDatum').setValue(response.responseText);
				}
			});	
		},
		
		VorigeDag: function()
		{
			var datumVeld = Ext.getCmp('StartlijstDatum').getValue();
			if (datumVeld == null)
				datumVeld = new Date();
			var d = sprintf("%s-%s-%s", datumVeld.getFullYear(), datumVeld.getMonth()+1, datumVeld.getDate());

			var conn = new Ext.data.Connection();
			conn.request
			({
				url:"php/main.php?Action=Startlijst.ZoekVorigeDatum",
				method:'POST',
				params: 
				{
					'DATUM': d
				},
				success: function(response) 
				{			
					Ext.getCmp('StartlijstDatum').setValue(response.responseText);
				}
			});			
		},
		
		//======= Startlijst ==========================================================================//
		Startlijst_GridviewItemDblClick: function(dataview, record, item, index, e, options)
		{
			var appSettingsStore = Ext.data.StoreManager.lookup('AppSettings_Store');
			var appSettings = appSettingsStore.getAt(0);	

			if (appSettings.data.MagSchrijven)
			{
				var view = Ext.widget('StartInvoerWindow', 
				{
					'ID': record.data.ID,
					'GRID': 'Startlijst_GridStore',
					'GRIDPAGE': -1
				});
				view.show();
			}
		},
		
		Startlijst_GridviewItemClick: function(dataview, record, item, index, e, options)
		{
			var view = Ext.widget('StartDetailsWindow', {'ID': record.data.ID});
			view.show();
		},
		
		ToonStartlijstGrid: function(pagina, verwijderMode)
		{
			var store = Ext.data.StoreManager.lookup('Startlijst_GridStore');
			
			if (verwijderMode)
			{
				store.proxy.extraParams = 
				{
					'_:verwijderMode': verwijderMode
				};
			}
			else
			{
				VerwijderButton = Ext.getCmp('ButtonVerwijderenVlucht');
				if (VerwijderButton.pressed)
					VerwijderButton.toggle();
				
				store.proxy.extraParams = 
				{
					'_:onderdruk': Ext.getCmp('FilterOnderdrukAfgeslotenVluchten').pressed,
					'_:sleepstarts': Ext.getCmp('StartlijstSleepFilter').getValue(),					
					'_:query': Ext.getCmp('ZoekenStartlijst').getValue()
				};
			}
			
			if (pagina > 0)
			{
				store.loadPage(pagina);
			}			
		},
		
		Startlijst_AfgeslotenVluchtenButtonToggle: function(button, pressed, options)
		{				
			Ext.Hoofdscherm.ToonStartlijstGrid(1, false);

			if (pressed)
				Ext.win.msg('Alle afgesloten vluchten worden onderdrukt.');
			else
				Ext.win.msg('Alle vluchten voor vandaag worden getoond');
		},
		
		Startlijst_ZoekenChange: function(field, newValue, oldValue, options)
		{
			Ext.Hoofdscherm.ToonStartlijstGrid(1, false);	
		},
		
		StartlijstSleepFilterChange: function(field, newValue, oldValue, options)
		{
			Ext.Hoofdscherm.ToonStartlijstGrid(1, false);	
		},
		
		StartlijstVerwijderenVluchtToggle: function(button, pressed, options)
		{
			Ext.Hoofdscherm.ToonStartlijstGrid(1, pressed);
		},
			
		CalcStarlijstGrid: function()
		{
			var startlijstGrid = Ext.getCmp('StartlijstGrid');
			
			var Rijen = Ext.Hoofdscherm.calcPageSize(startlijstGrid);
			
			if (Rijen < 0)
				return false;
					
			startlijstGrid.store.pageSize = Rijen;
			Ext.Hoofdscherm.ToonLedenGrid(1, false);
		},
			
		ClubKistenTreeViewSelect: function(rowmodel, record, index, eOpts)
		{		
			var store = Ext.data.StoreManager.lookup('VliegtuigLogboek_Store');
			store.proxy.extraParams = 
			{
				'_:logboekVliegtuigID': record.data.ID
			}
			store.load();
		},		
				
		//======= Leden ==========================================================================//
		Leden_GridviewItemDblClick: function(dataview, record, item, index, e, options)
		{
			var appSettingsStore = Ext.data.StoreManager.lookup('AppSettings_Store');
			var appSettings = appSettingsStore.getAt(0);	

			if (appSettings.data.MagSchrijven)
			{
				if (appSettings.data.isBeheerder)
				{
					var view = Ext.widget('LidBeheerWindow', {'ID': record.data.ID});
					view.show();				
				}
				else
				{
					if (record.data.LIDTYPE_ID == 609)  // 609 = 'nieuw lid, nog niet verwerkt in ledenadministratie'
					{
						var view = Ext.widget('LidBeheerWindow', {'ID': record.data.ID});
						view.show();
					}
					else
					{
						Ext.MessageBox.alert ('Wijzigen niet toegestaan', 'De informatie moet via de leden administratie aangepast worden');Ext.MessageBox.alert ('Wijzigen niet toegestaan', 'De informatie moet via de leden administratie aangepast worden');
					}
				}
			}		
		},
		
		ToonLedenGrid: function(pagina, verwijderMode)
		{
			var store = Ext.data.StoreManager.lookup('LedenLijst_GridStore');
			if (verwijderMode)
			{
				store.proxy.extraParams = 
				{
					'_:verwijderMode': verwijderMode
				};
			}
			else
			{
				VerwijderButton = Ext.getCmp('ButtonVerwijderenLid');
				if (VerwijderButton.pressed)
					VerwijderButton.toggle();
					
				store.proxy.extraParams = 
				{
					'_:aanwezig': Ext.getCmp('Leden.FilterAanwezig').pressed,
					'_:query': Ext.getCmp('Leden.ZoekenInLedenLijst').getValue(),
					'_:instructeurs': Ext.getCmp('Leden.InstructeurFilter').getValue(),
					'_:lieristen': Ext.getCmp('Leden.LieristFilter').getValue(),
					'_:startleiders': Ext.getCmp('Leden.StartleiderFilter').getValue(),
					'_:leden': Ext.getCmp('Leden.LedenFilter').getValue()
				}
			}
			if (pagina > 0)
			{
				store.loadPage(pagina);
			}			
		},
		
		Leden_FilterAanwezigToggle: function(button, pressed, options)
		{
			Ext.Hoofdscherm.ToonLedenGrid(1, false);

			if (pressed)
				Ext.win.msg('Alle vliegers die vandaag geweest zijn worden getoond');
			else
				Ext.win.msg('Alle leden worden getoond');
		},
		
		Leden_ZoekenChange: function (field, newValue, oldValue, options)
		{
			Ext.Hoofdscherm.ToonLedenGrid(1, false);
		},
		
		Leden_InstructeurFilterChange: function (field, newValue, oldValue, options)
		{
			Ext.Hoofdscherm.ToonLedenGrid(1, false);
		},
		
		Leden_LieristFilterChange: function (field, newValue, oldValue, options)
		{
			Ext.Hoofdscherm.ToonLedenGrid(1, false);		
		},
		
		Leden_StartleiderFilterChange: function (field, newValue, oldValue, options)
		{
			Ext.Hoofdscherm.ToonLedenGrid(1, false);
		},
		
		Leden_LedenFilterChange: function (field, newValue, oldValue, options)
		{
			Ext.Hoofdscherm.ToonLedenGrid(1, false);	
		},
		
		Leden_ButtonVerwijderenLid: function (button, pressed, options)
		{
			Ext.Hoofdscherm.ToonLedenGrid(1, pressed);		
		},
		
		CalcLedenGrid: function()
		{
			var ledenGrid = Ext.getCmp('LedenlijstGrid');
			
			var Rijen = Ext.Hoofdscherm.calcPageSize(ledenGrid);
			
			if (Rijen < 0)
				return false;
					
			ledenGrid.store.pageSize = Rijen;
			Ext.Hoofdscherm.ToonLedenGrid(1, false);
		},
		
		//======= Vliegtuigen ==========================================================================//
		Vliegtuigen_GridviewItemDblClick: function(dataview, record, item, index, e, options)
		{
			var appSettingsStore = Ext.data.StoreManager.lookup('AppSettings_Store');
			var appSettings = appSettingsStore.getAt(0);	

			if (record.data.CLUBKIST == 'true')
			{
				if (appSettings.data.isBeheerder)
				{
					var view = Ext.widget('VliegtuigBeheerWindow', {'ID': record.data.ID});
					view.show();
				}
			}
			else
			{
				if (appSettings.data.MagSchrijven)
				{
					var view = Ext.widget('VliegtuigBeheerWindow', {'ID': record.data.ID});
					view.show();
				}
			}		
		},
		
		ToonVliegtuigenGrid: function(pagina, verwijderMode)
		{
			var store = Ext.data.StoreManager.lookup('VliegtuigenLijst_GridStore');
			if (verwijderMode)
			{
				store.proxy.extraParams = 
				{
					'_:verwijderMode': verwijderMode
				};
			}
			else
			{
				VerwijderButton = Ext.getCmp('ButtonVerwijderenVliegtuig');
				if (VerwijderButton.pressed)
					VerwijderButton.toggle();
					
				store.proxy.extraParams = 
				{
					'_:query': Ext.getCmp('Vliegtuigen_ZoekenInVliegtuigenlijst').getValue(),
					'_:clubkist': Ext.getCmp('Vliegtuigen_ClubkistFilter').getValue()
				}
			}
			if (pagina > 0)
			{
				store.loadPage(pagina);
			}			
		},
		
		Vliegtuigen_ZoekenChange: function (field, newValue, oldValue, options)
		{
			Ext.Hoofdscherm.ToonVliegtuigenGrid(1, false);	
		},
		
		Vliegtuigen_ClubkistFilterChange: function (field, newValue, oldValue, options)
		{
			Ext.Hoofdscherm.ToonVliegtuigenGrid(1, false);	
		},
		
		Vliegtuigen_ButtonVerwijderenVliegtuig: function (button, pressed, options)
		{
			Ext.Hoofdscherm.ToonVliegtuigenGrid(1, pressed);	
		},
		
		CalcVliegtuigenGrid: function()
		{
			var vliegtuigenlijstGrid = Ext.getCmp('VliegtuigenlijstGrid');
			
			var Rijen = Ext.Hoofdscherm.calcPageSize(vliegtuigenlijstGrid);
			
			if (Rijen < 0)
				return false;
					
			vliegtuigenlijstGrid.store.pageSize = Rijen;
			Ext.Hoofdscherm.ToonLedenGrid(1, false);		
		},		
		
		Vliegtuigen_OpenLogboekWindow: function(id)
		{
			var store = Ext.data.StoreManager.lookup('VliegtuigenLijst_GridStore');
			var record = store.getById(id.toString());
			
			var regCall = record.data.REGISTRATIE + '(' + record.data.CALLSIGN + ')';
			
			var view = Ext.widget('LogboekWindow', {'title': regCall, 'ID': id});
			view.show();			
		},

		//======= Aanwezig ==========================================================================//
		
		ToonAanwezigGrid: function(pagina, verwijderMode)
		{
			var store = Ext.data.StoreManager.lookup('Aanwezig_Leden_GridStore');
			if (verwijderMode)
			{
				store.proxy.extraParams = 
				{
					'_:verwijderMode': verwijderMode
				};
			}
			else
			{
				VerwijderButton = Ext.getCmp('ButtonVerwijderenLid');
				if (VerwijderButton.pressed)
					VerwijderButton.toggle();
					
				store.proxy.extraParams = 
				{
					'_:query': Ext.getCmp('ZoekenAanwezig').getValue(),
					'_:instructeurs': Ext.getCmp('Aanwezig.InstructeurFilter').getValue(),
					'_:lieristen': Ext.getCmp('Aanwezig.LieristFilter').getValue(),
					'_:startleiders': Ext.getCmp('Aanwezig.StartleiderFilter').getValue()
				}
			}
			if (pagina > 0)
			{
				store.loadPage(pagina);
			}			
		},
		
		Aanwezig_ZoekenChange: function (field, newValue, oldValue, options)
		{
			Ext.Hoofdscherm.ToonAanwezigGrid(1, false);
		},
		
		Aanwezig_InstructeurFilterChange: function (field, newValue, oldValue, options)
		{
			Ext.Hoofdscherm.ToonAanwezigGrid(1, false);
		},
		
		Aanwezig_LieristFilterChange: function (field, newValue, oldValue, options)
		{
			Ext.Hoofdscherm.ToonAanwezigGrid(1, false);		
		},
		
		Aanwezig_StartleiderFilterChange: function (field, newValue, oldValue, options)
		{
			Ext.Hoofdscherm.ToonAanwezigGrid(1, false);
		},	

		//======= Controle tab ==========================================================================//
		CalcControleGrid: function()
		{
			var ControleStartlijstGrid = Ext.getCmp('ControleStartLijstFlarmGrid');
			
			var Rijen = Ext.Hoofdscherm.calcPageSize(ControleStartlijstGrid);
			
			if (Rijen > 0)
			{
				ControleStartlijstGrid.store.pageSize = Rijen;
				Ext.Hoofdscherm.ToonControleGrid();
			}
			
			
			var ControleExportGrid = Ext.getCmp('StartlijstExportGrid');
			
			Rijen = Ext.Hoofdscherm.calcPageSize(ControleExportGrid);
			
			if (Rijen > 0)
			{	
				ControleExportGrid.store.pageSize = Rijen;
				Ext.Hoofdscherm.ToonExportGrid();
			}
			
		},
		//======= Export =========================================================================//	
		ToonExportGrid: function()
		{
			var store = Ext.data.StoreManager.lookup('Export_GridStore');
			
			var vanaf = Ext.getCmp('Export.DatumVanaf').getValue();
			var tot = Ext.getCmp('Export.DatumTot').getValue();
			
			var v = (vanaf === null) ? null : sprintf("%s-%s-%s", vanaf.getFullYear(), vanaf.getMonth()+1, vanaf.getDate());
			var t = (tot === null) ? null : sprintf("%s-%s-%s", tot.getFullYear(), tot.getMonth()+1, tot.getDate());
			
			store.proxy.extraParams = 
			{
				'_:query': Ext.getCmp('Export.Zoeken').getValue(),
				'_:exportDatumVanaf': v,
				'_:exportDatumTot': t,
				'_:exportClubkist': Ext.getCmp('Export_ClubkistFilter').getValue()
			}
			store.loadPage(1);
		},
		
		StartlijstExport_GridviewItemDblClick: function(dataview, record, item, index, e, options)
		{
			var appSettingsStore = Ext.data.StoreManager.lookup('AppSettings_Store');
			var appSettings = appSettingsStore.getAt(0);	

			var Bladwijzer = Ext.getCmp('Export_Bladwijzer').getPageData();
			if (appSettings.data.MagSchrijven)
			{
				var view = Ext.widget('StartInvoerWindow', 
				{
					'ID': record.data.ID,
					'GRID': 'Export_GridStore',
					'GRIDPAGE': Bladwijzer.currentPage
				});
				view.show();
			}
		},
		
		
		onExporteerButtonClick: function(button, pressed, options)
		{
			var iframe = Ext.get('downloadFrame');   
			if(!iframe)
			{
				var body = Ext.getBody();
				// create a hidden frame
				iframe = body.createChild({
					tag: 'iframe',
					cls: 'x-hidden',
					id: 'downloadFrame',
					name: 'downloadFrame'
				});
			}
			var form = Ext.create('Ext.form.Panel', 
			{
				standardSubmit: true,
				url: 'php/main.php?Action=Startlijst.ExportStartlijst',
				method: 'POST'
			});    
			
			var vanaf = Ext.getCmp('Export.DatumVanaf').getValue();
			var tot = Ext.getCmp('Export.DatumTot').getValue();

			var v = (vanaf === null) ? null : sprintf("%s-%s-%s", vanaf.getFullYear(), vanaf.getMonth()+1, vanaf.getDate());
			var t = (tot === null) ? null : sprintf("%s-%s-%s", tot.getFullYear(), tot.getMonth()+1, tot.getDate());
			
			form.submit(
			{
				//target: '_blank', // Avoids leaving the page.
				target: 'downloadFrame',
				params: 
				{
					'_:query': Ext.getCmp('Export.Zoeken').getValue(),
					'_:exportDatumVanaf': v,
					'_:exportDatumTot': t,
					'_:exportClubkist': Ext.getCmp('Export_ClubkistFilter').getValue()
				}
			});			
		},			
		
		StartlijstFlarm_GridviewItemDblClick: function(dataview, record, item, index, e, options)
		{
			var appSettingsStore = Ext.data.StoreManager.lookup('AppSettings_Store');
			var appSettings = appSettingsStore.getAt(0);	

			var Bladwijzer = Ext.getCmp('StartlijstFlarm_Bladwijzer').getPageData();
			if (appSettings.data.MagSchrijven)
			{
				var view = Ext.widget('StartInvoerWindow', 
				{
					'ID': record.data.ID,
					'GRID': 'ControleStartlijstFlarm_Store',
					'GRIDPAGE': Bladwijzer.currentPage
				});
				view.show();
			}
		},
		
		StartlijstTijdelijk_GridviewItemDblClick: function(dataview, record, item, index, e, options)
		{
			var appSettingsStore = Ext.data.StoreManager.lookup('AppSettings_Store');
			var appSettings = appSettingsStore.getAt(0);	

			var Bladwijzer = Ext.getCmp('StartlijstTijdelijk_Bladwijzer').getPageData();
			if (appSettings.data.MagSchrijven)
			{
				var view = Ext.widget('StartInvoerWindow', 
				{
					'ID': record.data.ID,
					'GRID': 'ControleStartlijstTijdelijk_Store',
					'GRIDPAGE': Bladwijzer.currentPage
				});
				view.show();
			}
		},
		
				
		ToonControleGrid: function(pagina)
		{
			var store = Ext.data.StoreManager.lookup('ControleStartlijstFlarm_Store');
				
			store.proxy.extraParams = 
			{
				'_:query': Ext.getCmp('ZoekenControleLijst').getValue(),
				'_:onderdruk': Ext.getCmp('Controle_Filter').pressed,
			}
			
			if (pagina > 0)
			{
				store.loadPage(pagina);
			}	
		},
		
		ToonControleTijdelijkGrid: function(pagina)
		{
			Ext.data.StoreManager.lookup('ControleStartlijstTijdelijk_Store').loadPage(1);
		}
	};
}();

