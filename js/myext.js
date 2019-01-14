Ext.data.storeLoadStart = new Array();

Ext.override(
Ext.grid.Panel, 
{
	// We hebben een checkbox grid, iedere regel in het grid heeft ook een ID. 
	// Voor ieder aangevinkte regel is er dus een ID
	// Deze functie geeft alle IDs terug (met comma gescheiden) in een string
	haalWaarde: function()
	{
		var selection = this.getSelectionModel().getSelection();

		var vt = null;
		for (i=0; i<selection.length; i++) 
		{
			if (vt === null) 
				vt = selection[i].data.ID;
			else
				vt = vt + "," + selection[i].data.ID;;

		}
		return vt;	
	},
	
	// We hebben een checkbox grid, iedere regel in het grid heeft ook een ID. 
	// Voor ieder aangevinkte regel is er dus een ID
	// Deze functie zet alle checkboxes op basis van de csv string
	// De CSV string bevat alle ID (comma gescheiden)
	zetWaarde: function(csv)
	{
		// zet de checkbox waarde voor dit record 
		if ((csv != null) && (csv != ""))
		{    
			var items = csv.split(",");
			for(var i=0; i < items.length; i++) 
			{
				var rec = this.store.getById(items[i]);
				if (rec != null)
					this.getSelectionModel().select(rec,true,false);        
			}
		}	
	}
});


Ext.override(
Ext.form.ComboBox, 
{
	// Dit is overgenomen van ext, maar daar zit een vervelende bug in.
	// Wanneer forceSelection = true dan kun je het veld niet leeg maken
	// ook al heb allowBlank op true staan
    beforeBlur: function() {
        this.doQueryTask.cancel();
        //this.assertValue();			// Dit is de kwade genius	
    },
	
	doQuery : function(q, forceAll)
	{
		// True to force the query to execute even if there are currently fewer characters in the field than the minimum specified by the minChars config option. 
		// It also clears any filter previously saved in the current store (defaults to false)
		
		var starttime = new Date().getTime();
		if (q === undefined || q === null)
		{
			q = '';
		}
		var qe = {
			query: q,
			forceAll: forceAll,
			combo: this,
			cancel:false
		};
		
		if(this.fireEvent('beforequery', qe)===false || qe.cancel)
		{
			return false;
		}					

		if(forceAll === true || (q.length >= this.minChars))
		{
			// only run the logic when something has been changed
			if(this.lastQuery !== q)
			{
				if(this.queryMode != 'local')
				{
					if (this.store.proxy.extraParams !== undefined)
					{
						this.store.proxy.extraParams['_:inputFilter'] = q;			
						this.store.load();
					}						
				}
				else
				{	
					this.selectedIndex = 1;
					this.store.clearFilter();		// verwijder alle filters
					
					// een beetje eigen logica
					// primaryFilter is door onszelf toegevoegd, als het gezet moeten we eerst dit filter toepassen 
					if ((this.primaryFilter !== undefined) && (this.primaryFilter !== null) && (this.primaryFilter != ''))
					{
						if (q === '')
						{
							var f = eval(this.primaryFilter);
							this.store.filter(f);
						}
						else if (this.primaryFilterOnKeyInput !== undefined)
						{
							if (this.primaryFilterOnKeyInput == 'true')
							{
								var f = eval(this.primaryFilter);
								this.store.filter(f);
							}
						}	
					}
					if (this.primaryFilterBy !== undefined)
					{
						if ((this.primaryFilterBy !== null) && (this.primaryFilterBy != ''))
						{
							if (q === '')
							{
								eval("var myf1=" + this.primaryFilterBy);
								this.store.filterBy(myf1);
							}
							else if (this.primaryFilterOnKeyInput !== undefined)
							{
								if (this.primaryFilterOnKeyInput == 'true')
								{
									eval("var myf2=" + this.primaryFilterBy);
									this.store.filterBy(myf2);
								}
							}
						}
					}
					// einde van onze eigen logica						
					if(!forceAll)
					{
						this.store.filter([
						{
							property     : this.displayField,
							value        : q,
							anyMatch     : true, 
							caseSensitive: false 
						}
						]);
					}

					if (this.lastKey == Ext.EventObject.BACKSPACE)
					{
						this.expand();
					}
					else
					{
						// copied from typeahead
						var me = this,
							displayField = me.displayField,
							record = me.store.findRecord(displayField, me.getRawValue()),
							boundList = me.getPicker(),
							newValue, len, entered, selStart;
							
						// we hebben nu 1 uniek record, selecteer het record
						if ((this.forceSelection) && (this.store.getCount() == 1))
						{
							var record = this.store.getAt(0);
							
							if (record.data.ID != undefined)
							{
								var newValue = record.get(displayField);
								var len = newValue.length;
								var entered = me.getRawValue();
								var selStart = newValue.toLowerCase().lastIndexOf(entered.toLowerCase()) + entered.length;
								
								this.setValue(record.data.ID);
								//this.onLoad();
								this.collapse();
								
								if (selStart !== 0 && selStart !== len) 
								{
									me.selectText(selStart, newValue.length);
								}
							}
						}
						else
						{
							//this.onLoad();
							this.expand();
						}
					}
					
					if (record) 
					{
						var x = boundList.getNode(record)
						if (x != null)
							boundList.highlightItem(x);						
					}						
				}

				this.lastQuery = q;
				console.log(sprintf("%s: doQuery query=%s processing time=%d msec", TijdStempel(), q, (new Date().getTime() - starttime)));	
			}
			else
			{
				this.selectedIndex = -1;
				//this.onLoad();
				this.expand();
			}
		}
	}
});

Ext.override(
Ext.data.Store, 
{	
	slimLaden : function(query, showLoading)
	{
		if (this.LaatsteAanpassing === undefined)
		{
			if (showLoading != false)
				Ext.win.showLoading(true, this.storeId);
				
			this.load(query);
		}
		else
		{	
			var d = "";			
			var datumVeld = Ext.getCmp('StartlijstDatum').getValue();

			if (datumVeld !== null)
			{
				d = sprintf("&_:datum=%s-%s-%s", datumVeld.getFullYear(), datumVeld.getMonth()+1, datumVeld.getDate());
			}

			var conn = new Ext.data.Connection();
			conn.request
			({
				url: this.proxy.url + "&_:LAATSTE_AANPASSING=true" + d,
				scope: this,
				success: function(response) 
				{
					if (this.LaatsteAanpassing != response.responseText)
					{
						if (showLoading != false)
							Ext.win.showLoading(true, this.storeId);
							
						this.load(query);
					}
				},
				failure: function() 
				{
					if (showLoading != false)
						Ext.win.showLoading(true, this.storeId);
						
					this.load(query);
				}
			});	
		}
	},
	
	laatsteAanpassingOpslaan : function(query)
	{
		var conn = new Ext.data.Connection();
		conn.request
		({
			url: this.proxy.url + "&_:LAATSTE_AANPASSING=true",
			scope: this,
			success: function(response) 
			{
				this.LaatsteAanpassing = response.responseText;
			},
			failure: function() 
			{
			}
		});		
	}
});

function HandleStoreLoadException(server, response, operation, options)
{
	if (response.status == 401)
	{
		Ext.win.showLoading(false, options.storeId);
        var HoofdScherm = Ext.getCmp('HoofdScherm')
		
		if (HoofdScherm != undefined)
			HoofdScherm.hide();

		if (Ext.getCmp('LoginGebruiker') == undefined)		
		{
			// inlog window bestaat nog niet
			Ext.create('GeZC_StartAdministratie.view.LoginWindow').show();			
		}
	}
	else
	{
		Ext.MessageBox.alert (operation.request.proxy.url, response.responseText);
	}
}

Ext.override(Ext.form.BasicForm, 
{
    clearDirty: function() 
	{
		this.setValues(this.getValues());
    }
});

Ext.override(Ext.form.Field, {
    form : null, // cache so we don't perform many lookups
    getForm: function() {
        if( this.form===null) {
            var scope = this, maxDepth=10, n=0;
            for( ; n<maxDepth && Ext.isDefined(scope.ownerCt); n++) {
                scope=scope.ownerCt; // drill higher
                //console.log( n+":"+scope.ownerCt.id); // debug output
                if( Ext.isDefined(scope.getForm) ) {
                    this.form = scope.getForm();
                    break;
                }
            }
        }
        return this.form;
    }
});


function DisableFormEvents(form)
{
	var f = form.getForm();

	f.getFields().each(function(item, index, length)
	{
	  item.suspendCheckChange++;
	});
}

function EnableFormEvents(form)
{
	var f = form.getForm();

	f.getFields().each(function(item, index, length)
	{
	  item.suspendCheckChange--;

	}); 
}

function isNumeric(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
  }


