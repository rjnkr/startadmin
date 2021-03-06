/*
 * File: app/view/LedenTab.js
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

Ext.define('GeZC_StartAdministratie.view.LedenTab', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.ledentab',

    requires: [
        'Ext.grid.Panel',
        'Ext.grid.View',
        'Ext.grid.column.Column',
        'Ext.toolbar.Paging',
        'Ext.button.Button',
        'Ext.form.field.Text',
        'Ext.toolbar.Spacer',
        'Ext.form.field.Checkbox'
    ],

    id: 'LedenTab',
    title: 'Leden',

    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    initComponent: function() {
        var me = this;

        Ext.applyIf(me, {
            items: [
                {
                    xtype: 'gridpanel',
                    flex: 1,
                    id: 'LedenlijstGrid',
                    frameHeader: false,
                    title: '',
                    enableColumnHide: false,
                    enableColumnMove: false,
                    store: 'LedenLijst_GridStore',
                    viewConfig: {
                        id: 'refLedenView',
                        emptyText: '<div class="noData" ></div>',
                        listeners: {
                            itemdblclick: {
                                fn: me.Leden_GridviewItemDblClick,
                                scope: me
                            }
                        }
                    },
                    columns: [
                        {
                            xtype: 'gridcolumn',
                            renderer: function(value, metaData, record, rowIndex, colIndex, store, view) {

                                var verwijderMode = Ext.getCmp('ButtonVerwijderenLid').pressed;


                                if (verwijderMode === true)
                                {
                                    if (record.data.LIDTYPE_ID == 609) // 609 = 'nieuw lid, nog niet verwerkt in ledenadministratie'
                                    {
                                        var ret= "<a href=javascript:VerwijderenLid(" + value + ");>";
                                        ret = ret + "<IMG SRC='images/delete.png' border=0></a>";
                                        metaData.tdAttr = 'data-qtip="Verwijderen " + record.data.NAAM + " uit de start administratie"';
                                        return ret;
                                    }
                                }
                                else
                                {
                                    if (appSettings.Aanwezigheid)
                                    {
                                        var ret= "<a href=javascript:AanmeldenLidWindow(" + record.data.ID + ");>";
                                        ret = ret + "<IMG SRC='images/persoon aanmelden.png' border=0></a>";

                                        metaData.tdAttr = 'data-qtip="' + record.data.NAAM + ' aanmelden voor vandaag."';

                                        return ret;
                                    }
                                }
                            },
                            maxWidth: 75,
                            minWidth: 75,
                            width: 75,
                            align: 'center',
                            dataIndex: 'name',
                            text: '',
                            flex: 1
                        },
                        {
                            xtype: 'gridcolumn',
                            renderer: function(value, metaData, record, rowIndex, colIndex, store, view) {
                                var ret = value;

                                if ((record.data.AVATAR !== "") && (record.data.AVATAR !== null))
                                {
                                    ret= "<a href=javascript:ToonAvatar('" +record.data.AVATAR + "');>";
                                    ret = ret + value + "</a>";
                                }
                                return ret;

                            },
                            dataIndex: 'NAAM',
                            text: 'Naam',
                            flex: 3
                        },
                        {
                            xtype: 'gridcolumn',
                            dataIndex: 'ACHTERNAAM',
                            text: 'Achternaam',
                            flex: 2
                        },
                        {
                            xtype: 'gridcolumn',
                            dataIndex: 'MOBIEL',
                            text: 'Telefoon 1',
                            flex: 2
                        },
                        {
                            xtype: 'gridcolumn',
                            dataIndex: 'TELEFOON',
                            text: 'Telefoon 2',
                            flex: 2
                        },
                        {
                            xtype: 'gridcolumn',
                            dataIndex: 'NOODNUMMER',
                            text: 'Noodnummer',
                            flex: 2
                        },
                        {
                            xtype: 'gridcolumn',
                            renderer: function(value, metaData, record, rowIndex, colIndex, store, view) {

                                var retVal = "";
                                if (record.data.LIDTYPE_ID != '625')
                                {
                                    if (value === null)
                                    retVal = '<IMG SRC="images/min.png" border=0>';
                                    else
                                    retVal = '<IMG SRC="images/ok.png" border=0>';
                                }

                                return retVal;
                            },
                            sortable: false,
                            align: 'center',
                            dataIndex: 'GPL_VERLOOPT',
                            text: 'GPL',
                            flex: 1
                        },
                        {
                            xtype: 'gridcolumn',
                            renderer: function(value, metaData, record, rowIndex, colIndex, store, view) {
                                var retVal = "";


                                if (value == "1")
                                retVal = '<IMG SRC="images/ok.png" border=0>';

                                return retVal;
                            },
                            align: 'center',
                            dataIndex: 'INSTRUCTEUR',
                            text: 'Instructeur',
                            flex: 1
                        },
                        {
                            xtype: 'gridcolumn',
                            renderer: function(value, metaData, record, rowIndex, colIndex, store, view) {
                                var retVal = "";


                                if (value == "1")
                                retVal = '<IMG SRC="images/ok.png" border=0>';

                                return retVal;
                            },
                            align: 'center',
                            dataIndex: 'LIERIST',
                            text: 'Lierist',
                            flex: 1
                        },
                        {
                            xtype: 'gridcolumn',
                            renderer: function(value, metaData, record, rowIndex, colIndex, store, view) {
                                var retVal = "";


                                if (value == "1")
                                retVal = '<IMG SRC="images/ok.png" border=0>';

                                return retVal;
                            },
                            align: 'center',
                            dataIndex: 'STARTLEIDER',
                            text: 'Startleider',
                            flex: 1
                        },
                        {
                            xtype: 'gridcolumn',
                            dataIndex: 'LIDTYPE',
                            text: 'Lidtype',
                            flex: 2
                        }
                    ],
                    dockedItems: [
                        {
                            xtype: 'pagingtoolbar',
                            dock: 'bottom',
                            id: 'Leden_Bladwijzer',
                            width: 360,
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
                            store: 'LedenLijst_GridStore'
                        },
                        {
                            xtype: 'toolbar',
                            dock: 'bottom',
                            items: [
                                {
                                    xtype: 'button',
                                    id: 'Leden.FilterAanwezig',
                                    enableToggle: true,
                                    icon: 'images/filter.png',
                                    text: 'Filter',
                                    listeners: {
                                        toggle: {
                                            fn: me.Leden_FilterAanwezigToggle,
                                            scope: me
                                        },
                                        render: {
                                            fn: me.onLedenFilterAanwezigRender,
                                            scope: me
                                        }
                                    }
                                },
                                {
                                    xtype: 'button',
                                    id: 'ButtonNieuwLid',
                                    icon: 'images/add.gif',
                                    text: 'Nieuw lid',
                                    listeners: {
                                        click: {
                                            fn: me.onButtonClick1,
                                            scope: me
                                        }
                                    }
                                },
                                me.processLedenZoekenInLedenLijst({
                                    xtype: 'textfield',
                                    flex: 2,
                                    id: 'Leden.ZoekenInLedenLijst',
                                    maxWidth: 300,
                                    minWidth: 300,
                                    width: 300,
                                    fieldLabel: 'Zoeken',
                                    labelAlign: 'right',
                                    listeners: {
                                        change: {
                                            fn: me.Leden_ZoekenChange,
                                            delay: 500,
                                            single: false,
                                            buffer: 500,
                                            scope: me
                                        }
                                    }
                                }),
                                {
                                    xtype: 'tbspacer',
                                    width: 30
                                },
                                {
                                    xtype: 'checkboxfield',
                                    id: 'Leden.InstructeurFilter',
                                    width: 100,
                                    fieldLabel: '',
                                    boxLabel: 'Instructeurs',
                                    listeners: {
                                        change: {
                                            fn: me.Leden_InstructeurFilterChange,
                                            delay: 500,
                                            buffer: 500,
                                            scope: me
                                        }
                                    }
                                },
                                {
                                    xtype: 'checkboxfield',
                                    id: 'Leden.LieristFilter',
                                    width: 100,
                                    fieldLabel: '',
                                    boxLabel: 'Lieristen',
                                    listeners: {
                                        change: {
                                            fn: me.Leden_LieristFilterChange,
                                            delay: 500,
                                            buffer: 500,
                                            scope: me
                                        }
                                    }
                                },
                                {
                                    xtype: 'checkboxfield',
                                    id: 'Leden.StartleiderFilter',
                                    width: 100,
                                    fieldLabel: '',
                                    labelWidth: 0,
                                    boxLabel: 'Startleiders',
                                    listeners: {
                                        change: {
                                            fn: me.Leden_StartleiderFilterChange,
                                            delay: 500,
                                            buffer: 500,
                                            scope: me
                                        }
                                    }
                                },
                                {
                                    xtype: 'checkboxfield',
                                    id: 'Leden.LedenFilter',
                                    width: 100,
                                    fieldLabel: '',
                                    labelWidth: 0,
                                    boxLabel: 'Leden',
                                    listeners: {
                                        change: {
                                            fn: me.Leden_LedenFilterChange,
                                            delay: 500,
                                            buffer: 500,
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
                                    id: 'ButtonVerwijderenLid',
                                    enableToggle: true,
                                    icon: 'images/delete.png',
                                    text: 'Verwijderen',
                                    listeners: {
                                        render: {
                                            fn: me.onButtonVerwijderenLidRender,
                                            scope: me
                                        },
                                        toggle: {
                                            fn: me.onButtonVerwijderenLidToggle,
                                            scope: me
                                        }
                                    }
                                }
                            ]
                        }
                    ]
                }
            ],
            listeners: {
                activate: {
                    fn: me.onPanelActivateLeden,
                    scope: me
                }
            }
        });

        me.callParent(arguments);
    },

    processLedenZoekenInLedenLijst: function(config) {
        config.plugins = ['clearbutton'];
        return config;
    },

    Leden_GridviewItemDblClick: function(dataview, record, item, index, e, eOpts) {
        Ext.Hoofdscherm.Leden_GridviewItemDblClick(dataview, record, item, index, e, eOpts);
    },

    Leden_FilterAanwezigToggle: function(button, pressed, eOpts) {
        Ext.Hoofdscherm.Leden_FilterAanwezigToggle(button, pressed, eOpts);



    },

    onLedenFilterAanwezigRender: function(component, eOpts) {
        Ext.QuickTips.register({
            target: component.getEl(),
            text: 'Laat alleen de leden zien die vandaag aanwezig zijn geweest'
        });
    },

    onButtonClick1: function(button, e, eOpts) {
        var view = Ext.widget('LidBeheerWindow', {'ID': -1});
        view.show();
    },

    Leden_ZoekenChange: function(field, newValue, oldValue, eOpts) {
        Ext.Hoofdscherm.Leden_ZoekenChange(field, newValue, oldValue, eOpts);

    },

    Leden_InstructeurFilterChange: function(field, newValue, oldValue, eOpts) {
        Ext.Hoofdscherm.Leden_InstructeurFilterChange(field, newValue, oldValue, eOpts);

    },

    Leden_LieristFilterChange: function(field, newValue, oldValue, eOpts) {
        Ext.Hoofdscherm.Leden_LieristFilterChange(field, newValue, oldValue, eOpts);

    },

    Leden_StartleiderFilterChange: function(field, newValue, oldValue, eOpts) {
        Ext.Hoofdscherm.Leden_StartleiderFilterChange(field, newValue, oldValue, eOpts);
    },

    Leden_LedenFilterChange: function(field, newValue, oldValue, eOpts) {
        Ext.Hoofdscherm.Leden_LedenFilterChange (field, newValue, oldValue, eOpts);
    },

    onButtonVerwijderenLidRender: function(component, eOpts) {
        Ext.QuickTips.register({
            target: component.getEl(),
            text: 'Verwijderen van een lid.'
        });
    },

    onButtonVerwijderenLidToggle: function(button, pressed, eOpts) {
        Ext.Hoofdscherm.Leden_ButtonVerwijderenLid(button, pressed, eOpts);
    },

    onPanelActivateLeden: function(component, eOpts) {
        Ext.getCmp('Leden.LedenFilter').setValue(true);
        InitStores();		// voor het geval dat de gebruiker eerder dit tab activeert dan dat de sores geladen zijn

        if (!Ext.Hoofdscherm.CalcLedenGrid())
        {
            Ext.data.StoreManager.lookup('LedenLijst_GridStore').slimLaden();
            Ext.data.StoreManager.lookup('Types_Lid_Store').slimLaden();
        }
    }

});