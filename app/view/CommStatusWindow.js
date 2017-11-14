/*
 * File: app/view/CommStatusWindow.js
 *
 * This file was generated by Sencha Architect version 3.5.1.
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

Ext.define('GeZC_StartAdministratie.view.CommStatusWindow', {
    extend: 'Ext.window.Window',
    alias: 'widget.CommStatusWindow',

    requires: [
        'Ext.form.Panel',
        'Ext.grid.Panel',
        'Ext.grid.column.Column',
        'Ext.grid.View',
        'Ext.button.Button'
    ],

    height: 332,
    hidden: false,
    id: 'CommStatusWindow',
    width: 547,
    maintainFlex: true,
    resizable: false,
    title: 'Communicatie status',
    modal: true,

    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    initComponent: function() {
        var me = this;

        Ext.applyIf(me, {
            items: [
                {
                    xtype: 'form',
                    border: '0px',
                    height: 300,
                    id: 'CommStatusForm',
                    width: 400,
                    bodyPadding: 10,
                    title: '',
                    standardSubmit: false,
                    url: '/php/main.php?CommStatus=ForceSync',
                    layout: {
                        type: 'vbox',
                        align: 'stretch'
                    },
                    items: [
                        {
                            xtype: 'gridpanel',
                            id: 'CommStatusNextSync_Grid',
                            minHeight: 20,
                            frameHeader: false,
                            preventHeader: true,
                            title: '',
                            enableColumnHide: false,
                            enableColumnMove: false,
                            enableColumnResize: false,
                            forceFit: true,
                            hideHeaders: true,
                            sortableColumns: false,
                            store: 'CommStatusNextSync_Store',
                            columns: [
                                {
                                    xtype: 'gridcolumn',
                                    dataIndex: 'tekst',
                                    text: '',
                                    flex: 2
                                },
                                {
                                    xtype: 'gridcolumn',
                                    dataIndex: 'localNextSync',
                                    text: '',
                                    flex: 1
                                },
                                {
                                    xtype: 'gridcolumn',
                                    dataIndex: 'remoteNextSync',
                                    text: '',
                                    flex: 1
                                }
                            ],
                            viewConfig: {
                                disableSelection: true,
                                stripeRows: false
                            }
                        },
                        {
                            xtype: 'gridpanel',
                            flex: 1,
                            id: 'CommStatusWindowGrid',
                            frameHeader: false,
                            title: '',
                            enableColumnHide: false,
                            enableColumnMove: false,
                            forceFit: true,
                            sortableColumns: false,
                            store: 'CommStatusDetails_Store',
                            columns: [
                                {
                                    xtype: 'gridcolumn',
                                    maintainFlex: true,
                                    dataIndex: 'table',
                                    text: 'Tabel',
                                    flex: 1
                                },
                                {
                                    xtype: 'gridcolumn',
                                    maintainFlex: true,
                                    dataIndex: 'localStatus',
                                    text: 'Lokaal',
                                    flex: 2
                                },
                                {
                                    xtype: 'gridcolumn',
                                    maintainFlex: true,
                                    dataIndex: 'remoteStatus',
                                    text: 'Server',
                                    flex: 2
                                }
                            ],
                            viewConfig: {
                                disableSelection: true,
                                emptyText: 'Geen verbinding met de software'
                            }
                        },
                        {
                            xtype: 'panel',
                            border: 0,
                            height: 48,
                            layout: 'absolute',
                            title: '',
                            items: [
                                {
                                    xtype: 'button',
                                    x: 430,
                                    y: 5,
                                    height: 40,
                                    id: 'SyncButton',
                                    width: 80,
                                    text: 'Synchoniseren',
                                    listeners: {
                                        click: {
                                            fn: me.onButtonClick,
                                            scope: me
                                        }
                                    }
                                },
                                {
                                    xtype: 'form',
                                    x: 0,
                                    y: 0,
                                    border: 0,
                                    height: 50,
                                    id: 'SendEmailForm',
                                    padding: 0,
                                    width: 130,
                                    layout: 'absolute',
                                    bodyBorder: false,
                                    bodyPadding: 10,
                                    url: '/php/main.php?CommStatus=SendEmail',
                                    items: [
                                        {
                                            xtype: 'button',
                                            x: 0,
                                            y: 5,
                                            height: 40,
                                            id: 'EmailButton',
                                            width: 100,
                                            text: 'Email beheerder',
                                            listeners: {
                                                click: {
                                                    fn: me.onEmailButtonClick,
                                                    scope: me
                                                }
                                            }
                                        }
                                    ]
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
        SyncButtonClick();
    },

    onEmailButtonClick: function(button, e, eOpts) {
        EmailButtonClick();
    },

    onWindowShow: function(component, eOpts) {
        OphalenCommStatusDetails();
    }

});