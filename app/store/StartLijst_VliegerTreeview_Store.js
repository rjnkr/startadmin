/*
 * File: app/store/StartLijst_VliegerTreeview_Store.js
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

Ext.define('GeZC_StartAdministratie.store.StartLijst_VliegerTreeview_Store', {
    extend: 'Ext.data.TreeStore',

    requires: [
        'GeZC_StartAdministratie.model.Startlijst_VliegersTreeview_Model',
        'Ext.data.proxy.Ajax',
        'Ext.data.reader.Json'
    ],

    constructor: function(cfg) {
        var me = this;
        cfg = cfg || {};
        me.callParent([Ext.apply({
            model: 'GeZC_StartAdministratie.model.Startlijst_VliegersTreeview_Model',
            storeId: 'StartLijst_VliegerTreeview_Store',
            folderSort: true,
            proxy: {
                type: 'ajax',
                url: 'php/main.php?Action=Startlijst.StartlijstTreeviewJSON',
                reader: {
                    type: 'json'
                }
            },
            listeners: {
                beforeload: {
                    fn: me.onTreeStoreBeforeLoad,
                    scope: me
                },
                load: {
                    fn: me.onTreeStoreLoad,
                    scope: me
                }
            }
        }, cfg)]);
    },

    onTreeStoreBeforeLoad: function(store, operation, eOpts) {

        try
        {
            var datumVeld = Ext.getCmp('StartlijstDatum').getValue();
            Ext.data.storeLoadStart[store.storeId] = new Date().getTime();	// zet een begintijd om de performance te meten

            if (datumVeld !== null)
            {
                var d = sprintf("%s-%s-%s", datumVeld.getFullYear(), datumVeld.getMonth()+1, datumVeld.getDate());
                store.getProxy().setExtraParam('_:datum', d);
            }
        }
        catch(err)
        {
        }

    },

    onTreeStoreLoad: function(treestore, node, records, successful, eOpts) {
        // toon hoe veel tijd nodig is geweest voor het laden
        console.log(sprintf("%s: storeLoad storeId=%s processing time=%d msec", TijdStempel(), treestore.storeId, (new Date().getTime() - Ext.data.storeLoadStart[treestore.storeId])));

    }

});