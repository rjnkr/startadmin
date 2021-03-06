/*
 * File: app/store/Aanmelden_Lid_Store.js
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

Ext.define('GeZC_StartAdministratie.store.Aanmelden_Lid_Store', {
    extend: 'Ext.data.Store',

    requires: [
        'GeZC_StartAdministratie.model.LedenAanwezig_Model',
        'Ext.data.proxy.Ajax',
        'Ext.data.reader.Json'
    ],

    constructor: function(cfg) {
        var me = this;
        cfg = cfg || {};
        me.callParent([Ext.apply({
            autoSync: true,
            model: 'GeZC_StartAdministratie.model.LedenAanwezig_Model',
            storeId: 'MyJsonStore19',
            remoteSort: true,
            proxy: {
                type: 'ajax',
                simpleSortMode: true,
                url: 'php/main.php?Action=Aanwezig.LedenAanwezigJSON',
                reader: {
                    type: 'json',
                    idProperty: 'ID',
                    root: 'results'
                },
                listeners: {
                    exception: {
                        fn: me.onAjaxproxyException,
                        scope: me
                    }
                }
            },
            listeners: {
                beforeload: {
                    fn: me.onJsonstoreBeforeLoad,
                    scope: me
                },
                load: {
                    fn: me.onJsonstoreLoad,
                    scope: me
                }
            }
        }, cfg)]);
    },

    onAjaxproxyException: function(proxy, response, operation, eOpts) {
        HandleStoreLoadException(proxy, response, operation, eOpts);	// toon de gebruiker dat er een fout is opgetreden
    },

    onJsonstoreBeforeLoad: function(store, operation, eOpts) {
        Ext.data.storeLoadStart[store.storeId] = new Date().getTime();	// zet een begintijd om de performance te meten
    },

    onJsonstoreLoad: function(store, records, successful, operation, eOpts) {
        Ext.win.showLoading(false, store.storeId);	// verwijder window met melding van "ophalen data"
        // toon hoe veel tijd nodig is geweest voor het laden
        console.log(sprintf("%s: storeLoad storeId=%s processing time=%d msec", TijdStempel(), store.storeId, (new Date().getTime() - Ext.data.storeLoadStart[store.storeId])));

    }

});