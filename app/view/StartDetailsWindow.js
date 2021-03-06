/*
 * File: app/view/StartDetailsWindow.js
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

Ext.define('GeZC_StartAdministratie.view.StartDetailsWindow', {
    extend: 'Ext.window.Window',
    alias: 'widget.StartDetailsWindow',

    requires: [
        'Ext.form.Panel',
        'Ext.form.Label',
        'Ext.form.field.Text',
        'Ext.button.Button',
        'Ext.Img',
        'Ext.form.field.Hidden'
    ],

    border: 0,
    cls: 'startdetails',
    height: 222,
    id: 'StartDetailsWindow',
    margin: 0,
    style: 'font-weight:bold;',
    width: 395,
    bodyBorder: false,
    frameHeader: false,
    titleCollapse: true,
    modal: true,
    plain: true,

    initComponent: function() {
        var me = this;

        Ext.applyIf(me, {
            items: [
                {
                    xtype: 'form',
                    baseCls: 'startdetails',
                    border: 0,
                    cls: '',
                    frame: true,
                    height: 250,
                    id: 'StartDetailsForm',
                    bodyBorder: false,
                    bodyPadding: 0,
                    frameHeader: false,
                    titleCollapse: true,
                    layout: {
                        type: 'hbox',
                        align: 'stretch'
                    },
                    items: [
                        {
                            xtype: 'panel',
                            id: 'StartDetailsPanel0',
                            width: 125,
                            layout: 'absolute',
                            bodyStyle: 'background:transparent;',
                            frameHeader: false,
                            items: [
                                {
                                    xtype: 'label',
                                    x: 10,
                                    y: 14,
                                    formBind: false,
                                    frame: false,
                                    style: 'text-align:right;\r\nfont-weight:normal;',
                                    width: 100,
                                    text: 'Vliegtuig:'
                                },
                                {
                                    xtype: 'label',
                                    x: 10,
                                    y: 44,
                                    formBind: false,
                                    frame: false,
                                    style: 'text-align:right;\r\nfont-weight:normal;',
                                    width: 100,
                                    text: 'Startmethode:'
                                },
                                {
                                    xtype: 'label',
                                    x: 10,
                                    y: 74,
                                    formBind: false,
                                    frame: false,
                                    style: 'text-align:right;\r\nfont-weight:normal;',
                                    width: 100,
                                    text: 'Voorin:'
                                },
                                {
                                    xtype: 'label',
                                    x: 10,
                                    y: 104,
                                    formBind: false,
                                    frame: false,
                                    style: 'text-align:right;\r\nfont-weight:normal;',
                                    width: 100,
                                    text: 'Achterin:'
                                },
                                {
                                    xtype: 'label',
                                    x: 10,
                                    y: 134,
                                    formBind: false,
                                    frame: false,
                                    style: 'text-align:right;\r\nfont-weight:normal;',
                                    width: 100,
                                    text: 'Soort vlucht:'
                                },
                                {
                                    xtype: 'label',
                                    x: 10,
                                    y: 164,
                                    formBind: false,
                                    frame: false,
                                    style: 'text-align:right;\r\nfont-weight:normal;',
                                    width: 100,
                                    text: 'Op rekening:'
                                }
                            ]
                        },
                        {
                            xtype: 'panel',
                            height: 250,
                            id: 'StartDetailsPanel1',
                            width: 260,
                            layout: 'absolute',
                            bodyStyle: 'background:transparent;',
                            frameHeader: false,
                            items: [
                                {
                                    xtype: 'textfield',
                                    x: 10,
                                    y: 10,
                                    id: 'StartDetailsVliegtuig',
                                    width: 200,
                                    hideEmptyLabel: false,
                                    labelAlign: 'right',
                                    labelStyle: 'bold',
                                    labelWidth: 0,
                                    name: 'REG_CALL',
                                    fieldStyle: 'font-weight:bold;font-size: 12px;',
                                    readOnly: true
                                },
                                {
                                    xtype: 'textfield',
                                    x: 10,
                                    y: 40,
                                    id: 'StartDetailsStartMethode',
                                    width: 230,
                                    hideEmptyLabel: false,
                                    labelAlign: 'right',
                                    labelWidth: 0,
                                    name: 'STARTMETHODE_OMS',
                                    fieldStyle: 'font-weight:bold;font-size: 12px;',
                                    readOnly: true
                                },
                                {
                                    xtype: 'textfield',
                                    validator: function(value) {
                                        return Ext.StartlijstDetailWindow.ValiderenVlieger(value);
                                    },
                                    x: 10,
                                    y: 70,
                                    id: 'StartDetailsVoorin',
                                    width: 200,
                                    hideEmptyLabel: false,
                                    labelAlign: 'right',
                                    labelWidth: 0,
                                    msgTarget: 'side',
                                    name: 'VLIEGERNAAM',
                                    fieldStyle: 'font-weight:bold;font-size: 12px;',
                                    readOnly: true
                                },
                                {
                                    xtype: 'textfield',
                                    validator: function(value) {
                                        return Ext.StartlijstDetailWindow.ValiderenInzittende(value);
                                    },
                                    x: 10,
                                    y: 100,
                                    id: 'StartDetailsAchterin',
                                    width: 200,
                                    hideEmptyLabel: false,
                                    labelAlign: 'right',
                                    labelWidth: 0,
                                    msgTarget: 'side',
                                    name: 'INZITTENDENAAM',
                                    fieldStyle: 'font-weight:bold;font-size: 12px;',
                                    readOnly: true
                                },
                                {
                                    xtype: 'textfield',
                                    x: 10,
                                    y: 130,
                                    id: 'StartDetailsSoortVlucht',
                                    width: 230,
                                    hideEmptyLabel: false,
                                    labelAlign: 'right',
                                    labelWidth: 0,
                                    name: 'SOORTVLUCHT_OMS',
                                    fieldStyle: 'font-weight:bold;font-size: 12px;',
                                    readOnly: true
                                },
                                {
                                    xtype: 'textfield',
                                    validator: function(value) {
                                        return Ext.StartlijstDetailWindow.ValiderenOpRekening(value);
                                    },
                                    x: 10,
                                    y: 160,
                                    id: 'StartDetailsOpRekening',
                                    width: 200,
                                    hideEmptyLabel: false,
                                    labelAlign: 'right',
                                    labelWidth: 0,
                                    msgTarget: 'side',
                                    name: 'LEDEN_OPREKENING_NAAM',
                                    fieldStyle: 'font-weight:bold;font-size: 12px;',
                                    readOnly: true
                                },
                                {
                                    xtype: 'button',
                                    x: 205,
                                    y: 220,
                                    hidden: true,
                                    id: 'StartDetailsWijzigStart',
                                    text: 'Wijzig',
                                    listeners: {
                                        click: {
                                            fn: me.onButtonClick,
                                            scope: me
                                        }
                                    }
                                },
                                {
                                    xtype: 'button',
                                    x: 225,
                                    y: 70,
                                    hidden: true,
                                    id: 'StartDetailsEditVlieger',
                                    icon: 'images/icon_edit.gif',
                                    text: '',
                                    listeners: {
                                        click: {
                                            fn: me.onStartDetailsEditVliegerClick,
                                            scope: me
                                        }
                                    }
                                },
                                {
                                    xtype: 'button',
                                    x: 225,
                                    y: 100,
                                    hidden: true,
                                    id: 'StartDetailsEditInzittende',
                                    icon: 'images/icon_edit.gif',
                                    text: '',
                                    listeners: {
                                        click: {
                                            fn: me.onStartDetailsEditInzittendeClick,
                                            scope: me
                                        }
                                    }
                                },
                                {
                                    xtype: 'button',
                                    x: 225,
                                    y: 160,
                                    hidden: true,
                                    id: 'StartDetailsEditOpRekening',
                                    icon: 'images/icon_edit.gif',
                                    text: '',
                                    listeners: {
                                        click: {
                                            fn: me.onStartDetailsEditOpRekeningClick,
                                            scope: me
                                        }
                                    }
                                },
                                {
                                    xtype: 'image',
                                    x: 145,
                                    y: 12,
                                    height: 16,
                                    id: 'Stoel1',
                                    width: 16,
                                    src: 'images/seat.png'
                                },
                                {
                                    xtype: 'image',
                                    x: 160,
                                    y: 12,
                                    height: 16,
                                    hidden: true,
                                    id: 'Stoel2',
                                    width: 16,
                                    src: 'images/seat.png'
                                },
                                {
                                    xtype: 'hiddenfield',
                                    id: 'StartDetailsZitplaatsen',
                                    fieldLabel: 'Label',
                                    name: 'ZITPLAATSEN'
                                },
                                {
                                    xtype: 'hiddenfield',
                                    id: 'StartDetailsZelfstart',
                                    fieldLabel: 'Label',
                                    name: 'ZELFSTART'
                                },
                                {
                                    xtype: 'hiddenfield',
                                    id: 'StartDetailsOpRekeningType',
                                    fieldLabel: 'Label',
                                    name: 'LEDEN_OPREKENING_OMS'
                                },
                                {
                                    xtype: 'hiddenfield',
                                    id: 'StartDetailsVliegerType',
                                    fieldLabel: 'Label',
                                    name: 'LEDEN_VLIEGER_OMS'
                                },
                                {
                                    xtype: 'hiddenfield',
                                    id: 'StartDetailsInzittendeType',
                                    fieldLabel: 'Label',
                                    name: 'LEDEN_INZITTENDE_OMS'
                                },
                                {
                                    xtype: 'hiddenfield',
                                    id: 'StartDetailsVliegerAlert',
                                    fieldLabel: 'Label',
                                    name: 'VliegerAlert'
                                },
                                {
                                    xtype: 'hiddenfield',
                                    id: 'StartDetailsOpRekeningAlert',
                                    fieldLabel: 'Label',
                                    name: 'OpRekeningAlert'
                                },
                                {
                                    xtype: 'hiddenfield',
                                    id: 'StartDetailsID',
                                    fieldLabel: 'Label',
                                    name: 'ID'
                                },
                                {
                                    xtype: 'hiddenfield',
                                    id: 'StartDetailsInzittendeID',
                                    fieldLabel: 'Label',
                                    name: 'InzittendeID'
                                },
                                {
                                    xtype: 'hiddenfield',
                                    id: 'StartDetailsOpRekeningID',
                                    fieldLabel: 'Label',
                                    name: 'OpRekeningID'
                                },
                                {
                                    xtype: 'hiddenfield',
                                    id: 'StartDetailsInzittendeAlert',
                                    fieldLabel: 'Label',
                                    name: 'InzittendeAlert'
                                },
                                {
                                    xtype: 'hiddenfield',
                                    id: 'StartDetailsVliegerID',
                                    fieldLabel: 'Label',
                                    name: 'VliegerID'
                                }
                            ]
                        }
                    ]
                }
            ],
            listeners: {
                show: {
                    fn: me.onWindowShow,
                    scope: me
                }
            }
        });

        me.callParent(arguments);
    },

    onButtonClick: function(button, e, eOpts) {
        Ext.StartlijstDetailWindow.onButtonClick(button, e, eOpts);
    },

    onStartDetailsEditVliegerClick: function(button, e, eOpts) {
        Ext.StartlijstDetailWindow.onStartDetailsEditVliegerClick(button, e, eOpts);
    },

    onStartDetailsEditInzittendeClick: function(button, e, eOpts) {
        Ext.StartlijstDetailWindow.onStartDetailsEditInzittendeClick(button, e, eOpts);
    },

    onStartDetailsEditOpRekeningClick: function(button, e, eOpts) {
        Ext.StartlijstDetailWindow.onStartDetailsEditOpRekeningClick(button, e, eOpts);
    },

    onWindowShow: function(component, eOpts) {
        Ext.StartlijstDetailWindow.onStartDetailsWindowShow(component, eOpts, this.ID);
    }

});