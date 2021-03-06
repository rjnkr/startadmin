/*
 * File: app/view/ControleStartLiijstFlarmTab.js
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

Ext.define('GeZC_StartAdministratie.view.ControleStartLiijstFlarmTab', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.ControleStartLiijstFlarmTab',

    requires: [
        'Ext.grid.View',
        'Ext.grid.column.Column',
        'Ext.toolbar.Paging',
        'Ext.button.Button',
        'Ext.form.field.Text'
    ],

    id: 'ControleStartLijstFlarm',
    title: '',
    enableColumnHide: false,
    enableColumnMove: false,
    forceFit: false,
    store: 'ControleStartlijstFlarm_Store',

    initComponent: function() {
        var me = this;

        Ext.applyIf(me, {
            viewConfig: {
                id: 'ControleStartLijstFlarmGrid',
                minHeight: 20,
                emptyText: '<div class="noData" ></div>',
                listeners: {
                    itemdblclick: {
                        fn: me.onControleStartLijstFlarmGridItemDblClick,
                        scope: me
                    }
                }
            },
            columns: [
                {
                    xtype: 'gridcolumn',
                    renderer: function(value, metaData, record, rowIndex, colIndex, store, view) {

                        var ret;

                        if (value !== null)
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
                    width: 110,
                    dataIndex: 'REG_CALL',
                    text: 'Registratie'
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
                    width: 200,
                    dataIndex: 'LAATSTE_AANPASSING',
                    text: 'Soort Vlucht'
                },
                {
                    xtype: 'gridcolumn',
                    renderer: function(value, metaData, record, rowIndex, colIndex, store, view) {
                        if (value !== null)
                        return value.substring(0,1);
                    },
                    width: 30,
                    defaultWidth: 30,
                    dataIndex: 'STARTMETHODE',
                    text: ''
                },
                {
                    xtype: 'gridcolumn',
                    renderer: function(value, metaData, record, rowIndex, colIndex, store, view) {
                        if (value === null)
                        {
                            return;
                        }

                        metaData.tdAttr = 'data-qtip="Overnemen starttijd voor deze vlucht"';

                        var retValue = "<a href=javascript:Ext.Controle.OpenStartCopyWindow(" + record.data.ID + ");>";

                        if (record.data.dSTARTTIJD < 120)
                        {
                            retValue = retValue + value;
                        }
                        else
                        {
                            retValue = retValue + "<b><font color='red'>" + value + "</font><b>";
                        }

                        return retValue + "</a>";
                    },
                    width: 50,
                    align: 'center',
                    dataIndex: 'STARTTIJD',
                    text: 'Start'
                },
                {
                    xtype: 'gridcolumn',
                    renderer: function(value, metaData, record, rowIndex, colIndex, store, view) {
                        if (value === null)
                        {
                            return;
                        }

                        metaData.tdAttr = 'data-qtip="Overnemen landingstijd voor deze vlucht"';

                        var retValue = "<a href=javascript:Ext.Controle.OpenLandingCopyWindow(" + record.data.ID + ");>";

                        if (record.data.dLANDINGSTIJD < 120)
                        {
                            retValue = retValue + value;
                        }
                        else
                        {
                            retValue = retValue + "<b><font color='red'>" + value + "</font><b>";
                        }

                        return retValue + "</a>";
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
                    renderer: function(value, metaData, record, rowIndex, colIndex, store, view) {

                        var retVal = "";

                        if ((record.data.dSTARTTIJD > appSettings.ControleTolerantie) || (record.data.dLANDINGSTIJD > appSettings.ControleTolerantie))
                        {
                            retVal = '<IMG SRC="images/alert.gif" border=0>';
                            metaData.tdAttr = 'data-qtip="Er is een afwijking van starttijd en/of landingstijd"';
                        }
                        else if ((record.data.dSTARTTIJD !== null)&& (record.data.dLANDINGSTIJD !== null) && (record.data.dSTARTTIJD < appSettings.ControleTolerantie) && (record.data.dLANDINGSTIJD < appSettings.ControleTolerantie))
                        {
                            retVal = '<IMG SRC="images/ok.png" border=0>';
                        }

                        return retVal;
                    },
                    dataIndex: 'WAARSCHUWING'
                },
                {
                    xtype: 'gridcolumn',
                    renderer: function(value, metaData, record, rowIndex, colIndex, store, view) {
                        var retValue = value;

                        if (record.data.dSTARTTIJD > 120)
                        {
                            retValue = "<b>" + value + "<b>";
                        }
                        return retValue;
                    },
                    width: 100,
                    dataIndex: 'FLARM_STARTTIJD',
                    text: 'Flarm Starttijd'
                },
                {
                    xtype: 'gridcolumn',
                    renderer: function(value, metaData, record, rowIndex, colIndex, store, view) {
                        var retValue = value;

                        if (record.data.dLANDINGSTIJD > 120)
                        {
                            retValue = "<b>" + value + "<b>";
                        }
                        return retValue;
                    },
                    width: 100,
                    dataIndex: 'FLARM_LANDINGSTIJD',
                    text: 'Flarm Landingstijd'
                },
                {
                    xtype: 'gridcolumn',
                    id: 'FlarmStartCode',
                    dataIndex: 'FLARM_CODE',
                    text: '<IMG SRC=\'images/flarm.gif\' border=0>'
                },
                {
                    xtype: 'gridcolumn',
                    width: 110,
                    dataIndex: 'FLARM_REG_CALL',
                    text: 'Registratie'
                },
                {
                    xtype: 'gridcolumn',
                    dataIndex: 'FLARM_BAAN',
                    text: 'Baan'
                }
            ],
            dockedItems: [
                {
                    xtype: 'pagingtoolbar',
                    dock: 'bottom',
                    height: 32,
                    id: 'StartlijstFlarm_Bladwijzer',
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
                    store: 'ControleStartlijstFlarm_Store'
                },
                {
                    xtype: 'toolbar',
                    dock: 'bottom',
                    id: 'VandaagToolbar1',
                    items: [
                        {
                            xtype: 'button',
                            id: 'Controle_Filter',
                            enableToggle: true,
                            icon: 'images/filter.png',
                            text: 'Filter',
                            listeners: {
                                render: {
                                    fn: me.onControle_FilterRender,
                                    scope: me
                                },
                                toggle: {
                                    fn: me.onControle_FilterToggle,
                                    scope: me
                                }
                            }
                        },
                        me.processZoekenControleStartlijst({
                            xtype: 'textfield',
                            flex: 1,
                            id: 'ZoekenControleLijst',
                            maxWidth: 300,
                            fieldLabel: 'Zoeken',
                            labelAlign: 'right',
                            labelWidth: 50,
                            listeners: {
                                render: {
                                    fn: me.onZoekenControleStartlijstRender,
                                    scope: me
                                },
                                change: {
                                    fn: me.Startlijst_ZoekenControleChange,
                                    scope: me
                                }
                            }
                        })
                    ]
                }
            ]
        });

        me.callParent(arguments);
    },

    processZoekenControleStartlijst: function(config) {
        config.plugins = ['clearbutton'];
        return config;
    },

    onControleStartLijstFlarmGridItemDblClick: function(dataview, record, item, index, e, eOpts) {
        Ext.Hoofdscherm.StartlijstFlarm_GridviewItemDblClick(dataview, record, item, index, e, eOpts);
    },

    onControle_FilterRender: function(component, eOpts) {
        Ext.QuickTips.register({
            target: component.getEl(),
            text: 'Verberg de goede vluchten.'
        });
    },

    onControle_FilterToggle: function(button, pressed, eOpts) {
        Ext.Hoofdscherm.ToonControleGrid(1);
    },

    onZoekenControleStartlijstRender: function(component, eOpts) {
        Ext.QuickTips.register({
            target: component.getEl(),
            text: 'Zoek in de lijst. Bijvoorbeeld op naam, registratie of callsign'
        });
    },

    Startlijst_ZoekenControleChange: function(field, newValue, oldValue, eOpts) {
        Ext.Hoofdscherm.ToonControleGrid(1);
    }

});