/*
 * File: app/store/Rooster_Store.js
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

Ext.define('GeZC_StartAdministratie.store.Rooster_Store', {
    extend: 'Ext.data.Store',

    requires: [
        'GeZC_StartAdministratie.model.Rooster_Model',
        'Ext.data.proxy.Ajax',
        'Ext.data.reader.Json'
    ],

    constructor: function(cfg) {
        var me = this;
        cfg = cfg || {};
        me.callParent([Ext.apply({
            autoSync: true,
            model: 'GeZC_StartAdministratie.model.Rooster_Model',
            storeId: 'MyJsonStore24',
            proxy: {
                type: 'ajax',
                url: 'php/main.php?Action=Rooster.GetObjectJSON',
                reader: {
                    type: 'json',
                    idProperty: 'ID'
                },
                listeners: {
                    exception: {
                        fn: me.onAjaxproxyException,
                        scope: me
                    }
                }
            },
            listeners: {
                load: {
                    fn: me.onJsonstoreLoad,
                    scope: me
                },
                beforeload: {
                    fn: me.onJsonstoreBeforeLoad,
                    scope: me
                }
            }
        }, cfg)]);
    },

    onAjaxproxyException: function(proxy, response, operation, eOpts) {
        HandleStoreLoadException(proxy, response, operation, eOpts);	// toon de gebruiker dat er een fout is opgetreden
    },

    onJsonstoreLoad: function(store, records, successful, operation, eOpts) {

        Ext.win.showLoading(false, store.storeId);	// verwijder window met melding van "ophalen data"

        // toon hoe veel tijd nodig is geweest voor het laden
        console.log(sprintf("%s: storeLoad storeId=%s processing time=%d msec", TijdStempel(), store.storeId, (new Date().getTime() - Ext.data.storeLoadStart[store.storeId])));

        this.laatsteAanpassingOpslaan();

    },

    onJsonstoreBeforeLoad: function(store, operation, eOpts) {
        Ext.win.showLoading(true, store.storeId);						// toon window met melding van "ophalen data"
        Ext.data.storeLoadStart[store.storeId] = new Date().getTime();	// zet een begintijd om de performance te meten
    }

});