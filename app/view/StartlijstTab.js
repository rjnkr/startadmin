/*
 * File: app/view/StartlijstTab.js
 *
 * This file was generated by Sencha Architect version 4.2.4.
 * http://www.sencha.com/products/architect/
 *
 * This file requires use of the Ext JS 4.0.x library, under independent license.
 * License of Sencha Architect does not include license for Ext JS 4.0.x. For more
 * details see http://www.sencha.com/license or contact license@sencha.com.
 *
 * This file will be auto-generated each and everytime you save your project.
 *
 * Do NOT hand edit this file.
 */

Ext.define('GeZC_StartAdministratie.view.StartlijstTab', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.StartlijstTab',

    requires: [
        'GeZC_StartAdministratie.view.DetailsPanel',
        'Ext.grid.Panel',
        'Ext.grid.View',
        'Ext.grid.column.Column',
        'Ext.toolbar.Paging',
        'Ext.button.Button',
        'Ext.form.field.Text',
        'Ext.resizer.Splitter',
        'Ext.form.field.Checkbox',
        'Ext.toolbar.Spacer',
        'Ext.tab.Panel'
    ],

    title: 'Startlijst',

    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    initComponent: function() {
        var me = this;

        Ext.applyIf(me, {
            items: [
                {
                    xtype: 'container',
                    flex: 1,
                    layout: {
                        type: 'hbox',
                        align: 'stretch'
                    },
                    items: [
                        {
                            xtype: 'gridpanel',
                            flex: 4,
                            id: 'StartlijstGrid',
                            title: '',
                            enableColumnHide: false,
                            enableColumnMove: false,
                            forceFit: false,
                            store: 'Startlijst_GridStore',
                            viewConfig: {
                                id: 'StartlijstVandaagView',
                                minHeight: 20,
                                emptyText: '<div class="noData" ></div>',
                                listeners: {
                                    itemdblclick: {
                                        fn: me.onStartlijstVandaagViewItemDblClick,
                                        scope: me
                                    }
                                }
                            },
                            columns: [
                                {
                                    xtype: 'gridcolumn',
                                    renderer: function(value, metaData, record, rowIndex, colIndex, store, view) {
                                        var ret= value;

                                        var verwijderMode = Ext.getCmp('ButtonVerwijderenVlucht').pressed;


                                        if (verwijderMode === true)
                                        {
                                            ret =
                                            "<a href=javascript:Ext.widget('StartVerwijderWindow',{'ID':"  + record.data.ID + "}).show()> " +
                                            "<IMG SRC='images/delete.png' border=0></a>";
                                            metaData.tdAttr = 'data-qtip="Verwijderen van deze vlucht"';
                                        }
                                        else
                                        {
                                            ret= "<a href=javascript:ToonStartDetails('" +record.data.ID + "');>";
                                            ret = ret + value + "</a>";
                                        }

                                        return ret;
                                    },
                                    autoRender: true,
                                    width: 40,
                                    defaultWidth: 40,
                                    dataIndex: 'DAGNUMMER',
                                    text: '#'
                                },
                                {
                                    xtype: 'gridcolumn',
                                    width: 70,
                                    dataIndex: 'REGISTRATIE',
                                    text: 'Registratie'
                                },
                                {
                                    xtype: 'gridcolumn',
                                    width: 70,
                                    dataIndex: 'CALLSIGN',
                                    text: 'Callsign'
                                },
                                {
                                    xtype: 'gridcolumn',
                                    renderer: function(value, metaData, record, rowIndex, colIndex, store, view) {

                                        var retVal = value;
                                        if (value === null)
                                        {
                                            retVal = '<IMG SRC="images/alert.gif" border=0>';
                                            metaData.tdAttr = 'data-qtip="De gezagvoerder is niet ingevoerd."';
                                        }
                                        else
                                        {
                                            if (record.data.VLIEGERNAAM !== null)
                                            {
                                                retVal = value + "(" + record.data.VLIEGERNAAM + ")";
                                            }
                                        }


                                        return retVal;
                                    },
                                    width: 200,
                                    dataIndex: 'VLIEGERNAAM_LID',
                                    text: 'Voorin'
                                },
                                {
                                    xtype: 'gridcolumn',
                                    renderer: function(value, metaData, record, rowIndex, colIndex, store, view) {
                                        var retVal = value;
                                        if ((value === null) && (record.data.SOORTVLUCHT_ID == 809)) // 809 = instructie start
                                        {
                                            retVal = '<IMG SRC="images/alert.gif" border=0>';
                                            metaData.tdAttr = 'data-qtip="De instructeur is niet ingevoerd."';
                                        }

                                        if (record.data.INZITTENDENAAM !== null)
                                        {
                                            if (record.data.INZITTENDENAAM.length > 0)
                                            retVal = record.data.INZITTENDENAAM;
                                        }


                                        return retVal;
                                    },
                                    width: 200,
                                    dataIndex: 'INZITTENDENAAM_LID',
                                    text: 'Achterin'
                                },
                                {
                                    xtype: 'gridcolumn',
                                    renderer: function(value, metaData, record, rowIndex, colIndex, store, view) {
                                        var ret;
                                        var i = String(record.data.DAGNUMMER).length;
                                        var LastCharID = String(record.data.DAGNUMMER).substring(i, i-1);

                                        if (LastCharID == 's')
                                        {
                                            ret = value;
                                        }
                                        else
                                        {
                                            ret = "<a href=javascript:Ext.StartlijstTijdenForm.OpenStartWindow(" + record.data.ID + ");>";
                                            if (value === null)
                                            {
                                                ret = ret + "<IMG SRC='images/dep.png' border=0></a>";
                                                ret = ret + "&nbsp;" + record.data.STARTMETHODE.substring(0,1);
                                                metaData.tdAttr = 'data-qtip="Invoeren starttijd voor deze vlucht (' + record.data.STARTMETHODE + ')"';
                                            }
                                            else
                                            {
                                                ret = ret + value + "</a>";
                                                metaData.tdAttr = 'data-qtip="Aanpassen starttijd voor deze vlucht"';
                                            }
                                        }
                                        return  ret;
                                    },
                                    width: 50,
                                    align: 'center',
                                    dataIndex: 'STARTTIJD',
                                    text: 'Start'
                                },
                                {
                                    xtype: 'gridcolumn',
                                    renderer: function(value, metaData, record, rowIndex, colIndex, store, view) {

                                        var ret= "<a href=javascript:Ext.StartlijstTijdenForm.OpenLandingWindow(" + record.data.ID + ");>";

                                        if (record.data.STARTTIJD === null)
                                        return value;

                                        if ((value === null) && (record.data.STARTTIJD !== null))
                                        {
                                            ret = ret + "<IMG SRC='images/arr.png' border=0></a>";
                                            metaData.tdAttr = 'data-qtip="Invoeren landingstijd voor deze vlucht"';
                                        }
                                        else
                                        {
                                            ret = ret + value + "</a>";
                                            metaData.tdAttr = 'data-qtip="Aanpassen landingstijd voor deze vlucht"';
                                        }
                                        return ret;
                                    },
                                    width: 50,
                                    align: 'center',
                                    dataIndex: 'LANDINGSTIJD',
                                    text: 'Landing'
                                },
                                {
                                    xtype: 'gridcolumn',
                                    width: 50,
                                    dataIndex: 'DUUR',
                                    text: 'Duur'
                                },
                                {
                                    xtype: 'gridcolumn',
                                    dataIndex: 'OPMERKING',
                                    text: 'Opmerking',
                                    flex: 4
                                },
                                {
                                    xtype: 'gridcolumn',
                                    dataIndex: 'SLEEP_HOOGTE',
                                    text: 'Hoogte'
                                }
                            ],
                            dockedItems: [
                                {
                                    xtype: 'pagingtoolbar',
                                    dock: 'bottom',
                                    height: 32,
                                    id: 'Startlijst_Bladwijzer',
                                    afterPageText: 'van {0}',
                                    beforePageText: 'Pagina',
                                    displayInfo: true,
                                    displayMsg: 'Weergave {0} - {1} tot {2}',
                                    emptyMsg: 'Geen data aanwezig',
                                    firstText: 'Eerste pagina',
                                    lastText: 'Laatste pagina',
                                    nextText: 'Volgende pagina',
                                    prevText: 'Vorige pagina',
                                    refreshText: 'Verversen',
                                    store: 'Startlijst_GridStore'
                                },
                                {
                                    xtype: 'toolbar',
                                    dock: 'bottom',
                                    id: 'VandaagToolbar',
                                    items: [
                                        {
                                            xtype: 'button',
                                            id: 'FilterOnderdrukAfgeslotenVluchten',
                                            enableToggle: true,
                                            icon: 'images/filter.png',
                                            text: 'Filter',
                                            listeners: {
                                                render: {
                                                    fn: me.onButtonRender,
                                                    scope: me
                                                },
                                                toggle: {
                                                    fn: me.Startlijst_AfgeslotenVluchtenButtonToggle,
                                                    scope: me
                                                }
                                            }
                                        },
                                        {
                                            xtype: 'button',
                                            id: 'ButtonNieuweVlucht',
                                            icon: 'images/add.gif',
                                            text: 'Nieuwe vlucht',
                                            listeners: {
                                                click: {
                                                    fn: me.onButtonNieuweVluchtClick,
                                                    scope: me
                                                },
                                                render: {
                                                    fn: me.onButtonNieuweVluchtRender,
                                                    scope: me
                                                }
                                            }
                                        },
                                        me.processZoekenStartlijst({
                                            xtype: 'textfield',
                                            flex: 1,
                                            id: 'ZoekenStartlijst',
                                            maxWidth: 300,
                                            fieldLabel: 'Zoeken',
                                            labelAlign: 'right',
                                            listeners: {
                                                render: {
                                                    fn: me.onZoekenStartlijstRender,
                                                    scope: me
                                                },
                                                change: {
                                                    fn: me.Startlijst_ZoekenChange,
                                                    scope: me
                                                }
                                            }
                                        }),
                                        {
                                            xtype: 'splitter',
                                            width: 30
                                        },
                                        {
                                            xtype: 'checkboxfield',
                                            id: 'StartlijstSleepFilter',
                                            boxLabel: 'Sleepstarts',
                                            listeners: {
                                                change: {
                                                    fn: me.onStartlijstSleepFilterChange,
                                                    scope: me
                                                }
                                            }
                                        },
                                        {
                                            xtype: 'tbspacer',
                                            flex: 1
                                        },
                                        {
                                            xtype: 'button',
                                            id: 'ButtonVerwijderenVlucht',
                                            enableToggle: true,
                                            icon: 'images/delete.png',
                                            text: 'Verwijderen',
                                            listeners: {
                                                render: {
                                                    fn: me.onButtonVerwijderenVluchtRender,
                                                    scope: me
                                                },
                                                toggle: {
                                                    fn: me.StartlijstVerwijderenVluchtToggle,
                                                    scope: me
                                                }
                                            }
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            xtype: 'splitter',
                            defaultSplitMax: 600,
                            defaultSplitMin: 60
                        },
                        {
                            xtype: 'DetailsPanel',
                            flex: 1
                        }
                    ]
                }
            ],
            listeners: {
                activate: {
                    fn: me.onPanelActivate,
                    scope: me
                }
            }
        });

        me.callParent(arguments);
    },

    processZoekenStartlijst: function(config) {
        config.plugins = ['clearbutton'];
        return config;
    },

    onStartlijstVandaagViewItemDblClick: function(dataview, record, item, index, e, eOpts) {
        Ext.Hoofdscherm.Startlijst_GridviewItemDblClick(dataview, record, item, index, e, eOpts);
    },

    onButtonRender: function(component, eOpts) {
        Ext.QuickTips.register({
            target: component.getEl(),
            text: 'Onderdruk alle afgesloten vluchten uit het overzicht.'
        });
    },

    Startlijst_AfgeslotenVluchtenButtonToggle: function(button, pressed, eOpts) {
        Ext.Hoofdscherm.Startlijst_AfgeslotenVluchtenButtonToggle(button, pressed, eOpts)

    },

    onButtonNieuweVluchtClick: function(button, e, eOpts) {
        var view = Ext.widget('StartInvoerWindow',
                              {
                                  'GRID': 'Startlijst_GridStore',
                                  'GRIDPAGE': -1
                              });
        view.show();
    },

    onButtonNieuweVluchtRender: function(component, eOpts) {
        Ext.QuickTips.register({
            target: component.getEl(),
            text: 'Toevoegen van een nieuwe vlucht'
        });
    },

    onZoekenStartlijstRender: function(component, eOpts) {
        Ext.QuickTips.register({
            target: component.getEl(),
            text: 'Zoek in de startlijst. Bijvoorbeeld op naam, registratie of callsign'
        });
    },

    Startlijst_ZoekenChange: function(field, newValue, oldValue, eOpts) {
        Ext.Hoofdscherm.Startlijst_ZoekenChange(field, newValue, oldValue, eOpts);
    },

    onStartlijstSleepFilterChange: function(field, newValue, oldValue, eOpts) {
        Ext.Hoofdscherm.StartlijstSleepFilterChange(field, newValue, oldValue, eOpts);
    },

    onButtonVerwijderenVluchtRender: function(component, eOpts) {
        Ext.QuickTips.register({
            target: component.getEl(),
            text: 'Verwijderen van vluchten.'
        });
    },

    StartlijstVerwijderenVluchtToggle: function(button, pressed, eOpts) {
        Ext.Hoofdscherm.StartlijstVerwijderenVluchtToggle(button, pressed, eOpts);

    },

    onPanelActivate: function(component, eOpts) {

        var StartlijstDatum = Ext.getCmp('StartlijstDatum');
        if (StartlijstDatum.value === undefined)
        {
            StartlijstDatum.suspendEvents(false);
            StartlijstDatum.setValue(new Date());
            StartlijstDatum.resumeEvents();
        }

        if (!Ext.Hoofdscherm.CalcStarlijstGrid())
        {
            Ext.data.StoreManager.lookup('Startlijst_GridStore').slimLaden();
            Ext.data.StoreManager.lookup('Startlijst_Vliegtuigen_Store').slimLaden(null, false);
        }


        var grid = Ext.getCmp('StartlijstGrid');
        if (grid.columns !== null)
        {
            if ((appSettings.isBeheerder) || (appSettings.isBeheerderDDWV))
                grid.columns[9].show();
            else
                grid.columns[9].hide();
        }
    }

});