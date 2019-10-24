/*
 * File: app/store/Daginfo_Store.js
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

Ext.define('GeZC_StartAdministratie.store.Daginfo_Store', {
    extend: 'Ext.data.Store',

    requires: [
        'GeZC_StartAdministratie.model.Daginfo_Model',
        'Ext.data.proxy.Ajax',
        'Ext.data.reader.Json'
    ],

    constructor: function(cfg) {
        var me = this;
        cfg = cfg || {};
        me.callParent([Ext.apply({
            autoSync: true,
            model: 'GeZC_StartAdministratie.model.Daginfo_Model',
            storeId: 'MyJsonStore8',
            proxy: {
                type: 'ajax',
                url: 'php/main.php?Action=Daginfo.GetObjectJSON',
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
        Ext.Daginfo.isDaginfoIngevuld();

        Ext.win.showLoading(false, store.storeId);		// verwijder window met melding van "ophalen data"

        // toon hoe veel tijd nodig is geweest voor het laden
        console.log(sprintf("%s: storeLoad storeId=%s processing time=%d msec", TijdStempel(), store.storeId, (new Date().getTime() - Ext.data.storeLoadStart[store.storeId])));

        this.laatsteAanpassingOpslaan();

        // haal de dag informatie op en sla het record op in de variable daginfo
        var di = Ext.data.StoreManager.lookup('Daginfo_Store');
        dagInfo = di.getAt(0);
    },

    onJsonstoreBeforeLoad: function(store, operation, eOpts) {
        var datumVeld = Ext.getCmp('StartlijstDatum').getValue();
        Ext.data.storeLoadStart[store.storeId] = new Date().getTime();	// zet een begintijd om de performance te meten

        if (datumVeld !== null)
        {
            var d = sprintf("%s-%s-%s", datumVeld.getFullYear(), datumVeld.getMonth()+1, datumVeld.getDate());
            store.getProxy().setExtraParam('_:datum', d);
        }
    }

});