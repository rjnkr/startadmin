/*
 * File: app/view/StartInvoerWindow.js
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

Ext.define('GeZC_StartAdministratie.view.StartInvoerWindow', {
    extend: 'Ext.window.Window',
    alias: 'widget.StartInvoerWindow',

    requires: [
        'Ext.Img',
        'Ext.form.Label',
        'Ext.form.Panel',
        'Ext.form.field.ComboBox',
        'Ext.button.Button',
        'Ext.form.field.Number',
        'Ext.grid.Panel',
        'Ext.grid.column.Column',
        'Ext.grid.View',
        'Ext.selection.CheckboxModel',
        'Ext.form.field.Checkbox',
        'Ext.form.field.Hidden'
    ],

    ID: -1,
    id: 'StartInvoerWindow',
    resizable: false,
    title: 'Start gegevens',
    modal: true,

    initComponent: function() {
        var me = this;

        Ext.applyIf(me, {
            items: [
                {
                    xtype: 'panel',
                    baseCls: 'title',
                    height: 48,
                    maxHeight: 100,
                    layout: 'table',
                    title: '',
                    items: [
                        {
                            xtype: 'image',
                            src: 'images/start_add.png'
                        },
                        {
                            xtype: 'label',
                            cls: 'titel',
                            frame: true,
                            id: 'StartInvoer_Titel',
                            padding: '20px',
                            text: 'Nieuwe vlucht'
                        }
                    ]
                },
                {
                    xtype: 'form',
                    autoRender: true,
                    id: 'StartInvoer_InvoerForm',
                    width: 455,
                    bodyPadding: 10,
                    frameHeader: false,
                    title: '',
                    trackResetOnLoad: true,
                    url: 'php/main.php?Action=Startlijst.SaveObject',
                    items: [
                        {
                            xtype: 'container',
                            height: 25,
                            id: 'StartInvoer_VliegtuigContainer',
                            layout: 'absolute',
                            items: [
                                me.processStartInvoer_Vliegtuig({
                                    xtype: 'combobox',
                                    validator: function(value) {
                                        return Ext.StartlijstInvoerForm.ValiderenVliegtuig(value);
                                    },
                                    primaryFilterOnKeyInput: 'false',
                                    x: -15,
                                    y: 0,
                                    id: 'StartInvoer_Vliegtuig',
                                    width: 240,
                                    fieldLabel: 'Vliegtuig',
                                    labelAlign: 'right',
                                    msgTarget: 'side',
                                    name: 'VLIEGTUIG_ID',
                                    tabIndex: 10,
                                    allowBlank: false,
                                    emptyText: 'vul registratie in',
                                    displayField: 'REG_CALL',
                                    forceSelection: true,
                                    minChars: 1,
                                    queryDelay: 100,
                                    queryMode: 'local',
                                    store: 'Startlijst_Vliegtuigen_Store',
                                    valueField: 'ID',
                                    listeners: {
                                        focus: {
                                            fn: me.onFocusInvoerVliegtuig,
                                            scope: me
                                        },
                                        change: {
                                            fn: me.onStartInvoerVliegtuigChange,
                                            scope: me
                                        },
                                        specialkey: {
                                            fn: me.onStartInvoer_VliegtuigSpecialkey,
                                            scope: me
                                        },
                                        keydown: {
                                            fn: me.onStartInvoer_VliegtuigKeydown,
                                            scope: me
                                        }
                                    }
                                }),
                                {
                                    xtype: 'button',
                                    x: 230,
                                    y: 0,
                                    id: 'StartInvoer_ToevoegenNieuwVliegtuig',
                                    icon: 'images/add.gif',
                                    text: '',
                                    listeners: {
                                        click: {
                                            fn: me.onStartInvoer_ToevoegenNieuwVliegtuigClick,
                                            scope: me
                                        }
                                    }
                                },
                                me.processStartInvoer_Sleepkist({
                                    xtype: 'combobox',
                                    validator: function(value) {
                                        return Ext.StartlijstInvoerForm.ValiderenSleepvliegtuig(value);
                                    },
                                    x: 260,
                                    y: 0,
                                    id: 'StartInvoer_Sleepkist',
                                    width: 165,
                                    fieldLabel: 'Sleper',
                                    labelAlign: 'right',
                                    labelWidth: 40,
                                    msgTarget: 'side',
                                    name: 'SLEEPKIST_ID',
                                    tabIndex: 15,
                                    emptyText: 'vul registratie in',
                                    displayField: 'REG_CALL',
                                    forceSelection: true,
                                    queryDelay: 100,
                                    queryMode: 'local',
                                    store: 'Startlijst_SleepKisten_Store',
                                    valueField: 'ID',
                                    listeners: {
                                        blur: {
                                            fn: me.onBlurInvoerSleepkist,
                                            scope: me
                                        },
                                        focus: {
                                            fn: me.onFocusInvoerSleepkist,
                                            scope: me
                                        },
                                        specialkey: {
                                            fn: me.onStartInvoer_SleepkistSpecialkey,
                                            scope: me
                                        }
                                    }
                                })
                            ]
                        },
                        {
                            xtype: 'numberfield',
                            anchor: '100%',
                            id: 'StartInvoer_Sleephoogte',
                            maxWidth: 425,
                            fieldLabel: 'Hoogte',
                            labelAlign: 'right',
                            labelWidth: 300,
                            name: 'SLEEP_HOOGTE',
                            decimalPrecision: 0,
                            maxValue: 1200,
                            minValue: 400,
                            step: 100
                        },
                        {
                            xtype: 'panel',
                            border: 0,
                            id: 'StartInvoer_StartMethodePanel',
                            width: 400,
                            resizeHandles: 'n',
                            layout: 'hbox',
                            title: '',
                            items: [
                                {
                                    xtype: 'gridpanel',
                                    flex: 1,
                                    formBind: false,
                                    cls: 'AITV-grid',
                                    id: 'StartInvoer_StartMethode',
                                    maxWidth: 370,
                                    bodyBorder: false,
                                    bodyStyle: 'border: 0px;',
                                    animCollapse: false,
                                    collapseFirst: false,
                                    frameHeader: false,
                                    enableColumnHide: false,
                                    enableColumnMove: false,
                                    enableColumnResize: false,
                                    forceFit: false,
                                    hideHeaders: true,
                                    scroll: 'vertical',
                                    sortableColumns: false,
                                    store: 'Types_StartMethode_Store',
                                    columns: [
                                        {
                                            xtype: 'gridcolumn',
                                            id: 'StartInvoer_StartMethodeOmschrijving',
                                            dataIndex: 'OMSCHRIJVING',
                                            hideable: false,
                                            text: '',
                                            flex: 1
                                        }
                                    ],
                                    viewConfig: {
                                        frame: false,
                                        margin: '0px 0px 0px 85px',
                                        stripeRows: false
                                    },
                                    selModel: Ext.create('Ext.selection.CheckboxModel', {
                                        mode: 'SINGLE',
                                        checkOnly: true
                                    }),
                                    listeners: {
                                        selectionchange: {
                                            fn: me.onAanwezigInvoerTypeVliegtuigSelectionChange1,
                                            scope: me
                                        }
                                    }
                                },
                                {
                                    xtype: 'textfield',
                                    validator: function(value) {
                                        return Ext.StartlijstInvoerForm.ValiderenStartMethode(value);
                                    },
                                    border: 0,
                                    id: 'StartInvoer_StartMethodeID',
                                    width: 30,
                                    hideLabel: true,
                                    invalidCls: 'q',
                                    msgTarget: 'side',
                                    name: 'STARTMETHODE_ID',
                                    readOnly: true,
                                    tabIndex: 100
                                }
                            ]
                        },
                        {
                            xtype: 'container',
                            height: 25,
                            id: 'StartInvoer_GezagvoerderContainer',
                            layout: 'absolute',
                            items: [
                                me.processStartInvoer_Gezagvoerder({
                                    xtype: 'combobox',
                                    validator: function(value) {
                                        return Ext.StartlijstInvoerForm.ValiderenGezagvoerder(value);
                                    },
                                    primaryFilterOnKeyInput: 'true',
                                    x: 5,
                                    id: 'StartInvoer_Gezagvoerder',
                                    width: 390,
                                    fieldLabel: 'Voorin',
                                    labelAlign: 'right',
                                    labelWidth: 80,
                                    msgTarget: 'side',
                                    name: 'VLIEGER_ID',
                                    tabIndex: 20,
                                    emptyText: 'Kies naam uit de lijst',
                                    enableKeyEvents: true,
                                    displayField: 'NAAM',
                                    forceSelection: true,
                                    queryDelay: 100,
                                    queryMode: 'local',
                                    store: 'Startlijst_Vlieger_Store',
                                    typeAhead: true,
                                    valueField: 'ID',
                                    listeners: {
                                        keypress: {
                                            fn: me.onKeyPressInvoerGezagvoerder,
                                            scope: me
                                        },
                                        focus: {
                                            fn: me.onFocusInvoerGezagvoerder,
                                            scope: me
                                        },
                                        change: {
                                            fn: me.onStartInvoer_GezagvoerderChange,
                                            scope: me
                                        },
                                        render: {
                                            fn: me.onStartInvoer_GezagvoerderRender,
                                            scope: me
                                        },
                                        specialkey: {
                                            fn: me.onStartInvoer_GezagvoerderSpecialkey,
                                            scope: me
                                        }
                                    }
                                }),
                                {
                                    xtype: 'image',
                                    x: 360,
                                    y: 3,
                                    height: 16,
                                    id: 'Euro',
                                    width: 16,
                                    src: 'images/euro-16.gif'
                                },
                                {
                                    xtype: 'image',
                                    x: 345,
                                    y: 3,
                                    height: 16,
                                    id: 'PapierenControle',
                                    width: 16,
                                    src: 'images/alert.gif'
                                },
                                {
                                    xtype: 'checkboxfield',
                                    x: 410,
                                    id: 'StartInvoer_AlleenAanwezig',
                                    submitValue: false,
                                    validateOnChange: false,
                                    listeners: {
                                        change: {
                                            fn: me.onStartInvoer_AlleenAanwezigChange,
                                            scope: me
                                        },
                                        render: {
                                            fn: me.onStartInvoer_AlleenAanwezigRender,
                                            scope: me
                                        }
                                    }
                                }
                            ]
                        },
                        me.processStartInvoer_GezagvoerderNaam({
                            xtype: 'textfield',
                            validator: function(value) {
                                return Ext.StartlijstInvoerForm.ValiderenGezagvoerderNaam(value);
                            },
                            id: 'StartInvoer_GezagvoerderNaam',
                            width: 400,
                            fieldLabel: 'Naam',
                            labelAlign: 'right',
                            labelWidth: 85,
                            msgTarget: 'side',
                            name: 'VLIEGERNAAM',
                            tabIndex: 21,
                            blankText: 'De naam van de gezagvoerder is verplicht',
                            emptyText: 'Voer naam via toetsenbord',
                            maxLength: 45,
                            maxLengthText: 'Dit veld mag maximaaal {0} tekens bevatten',
                            listeners: {
                                specialkey: {
                                    fn: me.onStartInvoer_GezagvoerderNaamSpecialkey,
                                    scope: me
                                }
                            }
                        }),
                        {
                            xtype: 'container',
                            height: 25,
                            id: 'StartInvoer_InzittendeContainer',
                            layout: 'absolute',
                            items: [
                                me.processStartInvoer_Inzittende({
                                    xtype: 'combobox',
                                    validator: function(value) {
                                        return Ext.StartlijstInvoerForm.ValiderenInzittende(value);
                                    },
                                    primaryFilterOnKeyInput: 'true',
                                    id: 'StartInvoer_Inzittende',
                                    width: 395,
                                    fieldLabel: 'Achterin',
                                    labelAlign: 'right',
                                    labelWidth: 85,
                                    msgTarget: 'side',
                                    name: 'INZITTENDE_ID',
                                    tabIndex: 30,
                                    emptyText: 'Kies naam uit de lijst',
                                    enableKeyEvents: true,
                                    displayField: 'NAAM',
                                    forceSelection: true,
                                    queryDelay: 100,
                                    queryMode: 'local',
                                    store: 'Startlijst_Inzittende_Store',
                                    valueField: 'ID',
                                    listeners: {
                                        focus: {
                                            fn: me.onFocusInvoerInzittende,
                                            scope: me
                                        },
                                        change: {
                                            fn: me.onStartInvoer_InzittendeChange,
                                            scope: me
                                        },
                                        specialkey: {
                                            fn: me.onStartInvoer_InzittendeSpecialkey,
                                            scope: me
                                        }
                                    }
                                }),
                                {
                                    xtype: 'button',
                                    x: 405,
                                    id: 'StartInvoer_WisselVliegerInzittende',
                                    icon: 'images/change.gif',
                                    text: '',
                                    listeners: {
                                        click: {
                                            fn: me.onStartInvoer_WisselVliegerInzittenderClick,
                                            scope: me
                                        }
                                    }
                                }
                            ]
                        },
                        me.processStartInvoer_InzittendeNaam({
                            xtype: 'textfield',
                            id: 'StartInvoer_InzittendeNaam',
                            margin: '5px 5px  5px 0',
                            width: 395,
                            fieldLabel: 'Achterin',
                            labelAlign: 'right',
                            labelWidth: 80,
                            msgTarget: 'side',
                            name: 'INZITTENDENAAM',
                            tabIndex: 31,
                            emptyText: 'Voer naam in via toetsenbord',
                            maxLength: 45,
                            maxLengthText: 'Dit veld mag maximaaal {0} tekens bevatten',
                            listeners: {
                                specialkey: {
                                    fn: me.onStartInvoer_InzittendeNaamSpecialkey,
                                    scope: me
                                }
                            }
                        }),
                        {
                            xtype: 'panel',
                            border: 0,
                            id: 'StartInvoer_SoortVluchtPanel',
                            width: 400,
                            resizeHandles: 'n',
                            layout: 'hbox',
                            title: '',
                            items: [
                                {
                                    xtype: 'gridpanel',
                                    flex: 1,
                                    formBind: false,
                                    cls: 'AITV-grid',
                                    id: 'StartInvoer_SoortVlucht',
                                    maxWidth: 370,
                                    bodyBorder: false,
                                    bodyStyle: 'border: 0px;',
                                    animCollapse: false,
                                    collapseFirst: false,
                                    frameHeader: false,
                                    enableColumnHide: false,
                                    enableColumnMove: false,
                                    enableColumnResize: false,
                                    forceFit: false,
                                    hideHeaders: true,
                                    scroll: 'vertical',
                                    sortableColumns: false,
                                    store: 'Types_SoortVlucht_Store',
                                    columns: [
                                        {
                                            xtype: 'gridcolumn',
                                            dataIndex: 'OMSCHRIJVING',
                                            hideable: false,
                                            text: '',
                                            flex: 1
                                        }
                                    ],
                                    viewConfig: {
                                        frame: false,
                                        margin: '0px 85px',
                                        maxHeight: 180,
                                        stripeRows: false
                                    },
                                    selModel: Ext.create('Ext.selection.CheckboxModel', {
                                        allowDeselect: true,
                                        mode: 'SINGLE',
                                        checkOnly: true
                                    }),
                                    listeners: {
                                        selectionchange: {
                                            fn: me.onStartInvoer_SoortVluchtSelectionChange,
                                            scope: me
                                        },
                                        itemclick: {
                                            fn: me.onStartInvoer_SoortVluchtItemClick,
                                            scope: me
                                        }
                                    }
                                },
                                {
                                    xtype: 'textfield',
                                    validator: function(value) {
                                        return Ext.StartlijstInvoerForm.ValiderenSoortVlucht(value);
                                    },
                                    id: 'StartInvoer_SoortVluchtID',
                                    width: 30,
                                    fieldLabel: 'Label',
                                    hideLabel: true,
                                    invalidCls: 'q',
                                    msgTarget: 'side',
                                    name: 'SOORTVLUCHT_ID',
                                    readOnly: true,
                                    tabIndex: 110
                                }
                            ]
                        },
                        {
                            xtype: 'combobox',
                            validator: function(value) {
                                return Ext.StartlijstInvoerForm.ValiderenOpRekening(value);
                            },
                            primaryFilterOnKeyInput: 'false',
                            id: 'StartInvoer_OpRekening',
                            width: 395,
                            fieldLabel: 'Op rekening',
                            labelAlign: 'right',
                            labelWidth: 85,
                            msgTarget: 'side',
                            name: 'OP_REKENING_ID',
                            tabIndex: 40,
                            emptyText: 'Kies naam uit de lijst',
                            vtypeText: 'Invullen wie de rekening betaald',
                            displayField: 'NAAM',
                            forceSelection: true,
                            queryDelay: 100,
                            queryMode: 'local',
                            store: 'Startlijst_OpRekening_Store',
                            typeAhead: true,
                            valueField: 'ID',
                            listeners: {
                                focus: {
                                    fn: me.onStartInvoerOpRekeningFocus,
                                    scope: me
                                },
                                change: {
                                    fn: me.onStartInvoer_OpRekeningChange,
                                    scope: me
                                }
                            }
                        },
                        {
                            xtype: 'panel',
                            border: 0,
                            height: 70,
                            layout: 'absolute',
                            title: '',
                            items: [
                                me.processStartInvoer_Opmerking({
                                    xtype: 'textfield',
                                    id: 'StartInvoer_Opmerking',
                                    width: 395,
                                    fieldLabel: 'Opmerking',
                                    labelAlign: 'right',
                                    labelWidth: 85,
                                    msgTarget: 'side',
                                    name: 'OPMERKING',
                                    tabIndex: 50,
                                    emptyText: '...',
                                    listeners: {
                                        specialkey: {
                                            fn: me.onStartInvoer_OpmerkingSpecialkey,
                                            scope: me
                                        }
                                    }
                                }),
                                {
                                    xtype: 'button',
                                    y: 30,
                                    formBind: false,
                                    height: 40,
                                    id: 'StartInvoer_Opslaan',
                                    margin: '0px 320px',
                                    padding: '',
                                    width: 80,
                                    tabIndex: 60,
                                    text: 'Opslaan',
                                    listeners: {
                                        click: {
                                            fn: me.onButtonClick,
                                            scope: me
                                        }
                                    }
                                }
                            ]
                        },
                        {
                            xtype: 'hiddenfield',
                            id: 'StartInvoer_ID',
                            fieldLabel: 'Label',
                            name: 'ID'
                        },
                        {
                            xtype: 'hiddenfield',
                            anchor: '100%',
                            id: 'StartInvoer_Datum',
                            fieldLabel: 'Label',
                            name: 'DATUM'
                        }
                    ]
                }
            ],
            listeners: {
                show: {
                    fn: me.onStartInvoerWindowShow,
                    scope: me
                },
                beforeclose: {
                    fn: me.onStartInvoerWindowBeforeClose,
                    scope: me
                }
            }
        });

        me.callParent(arguments);
    },

    processStartInvoer_Vliegtuig: function(config) {
        config.plugins = ['clearbutton'];
        return config;
    },

    processStartInvoer_Sleepkist: function(config) {
        config.plugins = ['clearbutton'];
        return config;
    },

    processStartInvoer_Gezagvoerder: function(config) {
        config.plugins = ['clearbutton'];
        return config;
    },

    processStartInvoer_GezagvoerderNaam: function(config) {
        config.plugins = ['clearbutton'];
        return config;
    },

    processStartInvoer_Inzittende: function(config) {
        config.plugins = ['clearbutton'];
        return config;
    },

    processStartInvoer_InzittendeNaam: function(config) {
        config.plugins = ['clearbutton'];
        return config;
    },

    processStartInvoer_Opmerking: function(config) {
        config.plugins = ['clearbutton'];
        return config;
    },

    onFocusInvoerVliegtuig: function(field, eOpts) {
        Ext.StartlijstInvoerForm.onFocusInvoerVliegtuig(field, eOpts);
    },

    onStartInvoerVliegtuigChange: function(field, newValue, oldValue, eOpts) {
        Ext.StartlijstInvoerForm.onStartInvoerVliegtuigChange(field, newValue, oldValue, eOpts);
    },

    onStartInvoer_VliegtuigSpecialkey: function(field, e, eOpts) {
        if(e.getKey() == Ext.EventObject.ENTER)
        {
            Ext.StartlijstInvoerForm.onEnter();
        }
    },

    onStartInvoer_VliegtuigKeydown: function(textfield, e, eOpts) {
        Ext.StartlijstInvoerForm.onStartInvoerVliegtuigKeydown(textfield, e, eOpts);
    },

    onStartInvoer_ToevoegenNieuwVliegtuigClick: function(button, e, eOpts) {
        var view = Ext.widget('VliegtuigBeheerWindow', {'ID': -1});
        view.show();
    },

    onBlurInvoerSleepkist: function(field, eOpts) {
        Ext.StartlijstInvoerForm.onBlurInvoerSleepkist(field, eOpts);
    },

    onFocusInvoerSleepkist: function(field, eOpts) {
        Ext.StartlijstInvoerForm.onFocusInvoerSleepkist(field, eOpts);
    },

    onStartInvoer_SleepkistSpecialkey: function(field, e, eOpts) {
        if(e.getKey() == Ext.EventObject.ENTER)
        {
            Ext.StartlijstInvoerForm.onEnter();
        }
    },

    onAanwezigInvoerTypeVliegtuigSelectionChange1: function(model, selected, eOpts) {
        // De startmethode is aangepast, voer onderstaande scripts uit
        Ext.StartlijstInvoerForm.onStartInvoer_StartMethodeSelectionChange();
    },

    onKeyPressInvoerGezagvoerder: function(textfield, e, eOpts) {
        Ext.StartlijstInvoerForm.onKeyPressInvoerGezagvoerder(textfield, e, eOpts);
    },

    onFocusInvoerGezagvoerder: function(field, eOpts) {
        Ext.StartlijstInvoerForm.onFocusInvoerGezagvoerder(field, eOpts);
    },

    onStartInvoer_GezagvoerderChange: function(field, newValue, oldValue, eOpts) {
        Ext.StartlijstInvoerForm.onChangeInvoerGezagvoerder(field, eOpts);
    },

    onStartInvoer_GezagvoerderRender: function(component, eOpts) {
        Ext.QuickTips.register({
            target: component.getEl(),
            dismissDelay: 10000, // Hide after 10 seconds hover
            text: 'Vul hier de gezagvoerder in uit het ledenbestand. <hr>Alternatief : Kies de naam van een zusterclub als een kist van de ander club start. Gebruik "-Nieuw lid" voor vliegers die niet bekend zijn. Vul dan wel het OPMERKING veld.'
        });
    },

    onStartInvoer_GezagvoerderSpecialkey: function(field, e, eOpts) {
        if(e.getKey() == Ext.EventObject.ENTER)
        {
            Ext.StartlijstInvoerForm.onEnter();
        }
    },

    onStartInvoer_AlleenAanwezigChange: function(field, newValue, oldValue, eOpts) {
        Ext.StartlijstInvoerForm.onStartInvoer_AlleenAanwezigChange(field, newValue, oldValue, eOpts);
    },

    onStartInvoer_AlleenAanwezigRender: function(component, eOpts) {
        Ext.QuickTips.register({
            target: component.getEl(),
            dismissDelay: 10000, // Hide after 10 seconds hover
            text: 'Indien aangevinkt, dan alleen aanwezige leden. Alle leden, wanneer vinkje uit staat.'
        });
    },

    onStartInvoer_GezagvoerderNaamSpecialkey: function(field, e, eOpts) {
        if(e.getKey() == Ext.EventObject.ENTER)
        {
            Ext.StartlijstInvoerForm.onEnter();
        }
    },

    onFocusInvoerInzittende: function(field, eOpts) {
        Ext.StartlijstInvoerForm.onFocusInvoerInzittende(field, eOpts);
    },

    onStartInvoer_InzittendeChange: function(field, newValue, oldValue, eOpts) {
        Ext.StartlijstInvoerForm.onStartInvoer_InzittendeChange(field, newValue, oldValue, eOpts);
    },

    onStartInvoer_InzittendeSpecialkey: function(field, e, eOpts) {
        if(e.getKey() == Ext.EventObject.ENTER)
        {
            Ext.StartlijstInvoerForm.onEnter();
        }
    },

    onStartInvoer_WisselVliegerInzittenderClick: function(button, e, eOpts) {
        Ext.StartlijstInvoerForm.WisselVliegerInzittende();
    },

    onStartInvoer_InzittendeNaamSpecialkey: function(field, e, eOpts) {
        if(e.getKey() == Ext.EventObject.ENTER)
        {
            Ext.StartlijstInvoerForm.onEnter();
        }
    },

    onStartInvoer_SoortVluchtSelectionChange: function(model, selected, eOpts) {
        // De soort vlucht is aangepast, voer onderstaande scripts uit
        Ext.StartlijstInvoerForm.onStartInvoer_SoortVluchtSelectionChange(model, selected, eOpts);
    },

    onStartInvoer_SoortVluchtItemClick: function(dataview, record, item, index, e, eOpts) {
        Ext.StartlijstInvoerForm.onStartInvoer_SoortVluchtItemClick(dataview, record, item, index, e, eOpts);
    },

    onStartInvoerOpRekeningFocus: function(field, eOpts) {
        // Het veld op wie zijn rekening de vlucht komt krijgt nu de focus, voer het onderstaande script uit
        Ext.StartlijstInvoerForm.onStartInvoerOpRekeningFocus(field, eOpts);
    },

    onStartInvoer_OpRekeningChange: function(field, newValue, oldValue, eOpts) {
        // Het veld op wie zijn rekening de vlucht komt is gewijzigd, voer het onderstaande script uit
        Ext.StartlijstInvoerForm.onStartInvoer_OpRekeningChange(field, newValue, oldValue, eOpts);
    },

    onStartInvoer_OpmerkingSpecialkey: function(field, e, eOpts) {
        if(e.getKey() == Ext.EventObject.ENTER)
        {
            Ext.StartlijstInvoerForm.onEnter();
        }
    },

    onButtonClick: function(button, e, eOpts) {
        Ext.StartlijstInvoerForm.onButtonClick(button, e, eOpts);
    },

    onStartInvoerWindowShow: function(component, eOpts) {
        // Voer dit script uit bij het openen van het invoer window
        Ext.StartlijstInvoerForm.onStartInvoerWindowShow(component, eOpts, this.ID, this.GRID, this.GRIDPAGE);
    },

    onStartInvoerWindowBeforeClose: function(panel, eOpts) {
        Ext.StartlijstInvoerForm.beforeClose(panel, eOpts);
    }

});