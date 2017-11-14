/*
 * File: app/view/AvatarWindow.js
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

Ext.define('GeZC_StartAdministratie.view.AvatarWindow', {
    extend: 'Ext.window.Window',
    alias: 'widget.AvatarWindow',

    requires: [
        'Ext.Img'
    ],

    id: 'AvatarWindow',
    frameHeader: false,
    modal: true,

    initComponent: function() {
        var me = this;

        Ext.applyIf(me, {
            items: [
                {
                    xtype: 'image',
                    id: 'AvatarImg',
                    style: 'boxShadow: 0 0 5px 5px #888',
                    listeners: {
                        beforerender: {
                            fn: me.onAvatarImgBeforeRender,
                            scope: me
                        },
                        afterrender: {
                            fn: me.onAvatarImgAfterRender,
                            scope: me
                        }
                    }
                }
            ]
        });

        me.callParent(arguments);
    },

    onAvatarImgBeforeRender: function(component, eOpts) {
        component.src = this.src;
    },

    onAvatarImgAfterRender: function(component, eOpts) {
        // als we op het window klikken, sluit het window

        component.el.on('click', function()
        {
            component.up('.window').close();
        });
    }

});