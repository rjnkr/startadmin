/*
 * File: app/store/Types_Banen_Store.js
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

Ext.define('GeZC_StartAdministratie.store.Types_Banen_Store', {
    extend: 'Ext.data.Store',

    requires: [
        'GeZC_StartAdministratie.model.Types_Model',
        'Ext.data.proxy.Ajax',
        'Ext.data.reader.Json'
    ],

    constructor: function(cfg) {
        var me = this;
        cfg = cfg || {};
        me.callParent([Ext.apply({
            autoSync: true,
            model: 'GeZC_StartAdministratie.model.Types_Model',
            storeId: 'MyJsonStore5',
            proxy: {
                type: 'ajax',
                url: 'php/main.php?Action=Types.GetObjectsJSON&_:TYPEGROUP_ID=1',
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
            }
        }, cfg)]);
    },

    onAjaxproxyException: function(proxy, response, operation, eOpts) {
        HandleStoreLoadException(proxy, response, operation, eOpts);	// toon de gebruiker dat er een fout is opgetreden
    }

});