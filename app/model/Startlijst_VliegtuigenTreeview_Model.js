/*
 * File: app/model/Startlijst_VliegtuigenTreeview_Model.js
 *
 * This file was generated by Sencha Architect version 4.2.2.
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

Ext.define('GeZC_StartAdministratie.model.Startlijst_VliegtuigenTreeview_Model', {
    extend: 'Ext.data.Model',

    requires: [
        'Ext.data.Field'
    ],

    fields: [
        {
            name: 'ID'
        },
        {
            name: 'STARTMETHODE'
        },
        {
            name: 'DUUR'
        },
        {
            defaultValue: 'x-tree-noicon',
            name: 'iconCls'
        },
        {
            name: 'REG_CALL'
        },
        {
            name: 'VLUCHTEN'
        },
        {
            name: 'TEXT'
        },
        {
            name: 'GEEN_LANDINGSTIJD'
        }
    ]
});