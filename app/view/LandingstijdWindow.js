/*
 * File: app/view/LandingstijdWindow.js
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

Ext.define('GeZC_StartAdministratie.view.LandingstijdWindow', {
    extend: 'Ext.window.Window',
    alias: 'widget.LandingstijdWindow',

    requires: [
        'Ext.form.Panel',
        'Ext.form.field.Hidden',
        'Ext.form.field.ComboBox',
        'Ext.button.Button'
    ],

    height: 100,
    id: 'LandingstijdWindow',
    width: 300,
    resizable: false,
    title: 'Landingstijd invoeren',
    modal: true,

    initComponent: function() {
        var me = this;

        Ext.applyIf(me, {
            items: [
                {
                    xtype: 'form',
                    height: 66,
                    id: 'StartInvoer_LandingstijdForm',
                    width: 288,
                    layout: 'absolute',
                    bodyPadding: 10,
                    title: '',
                    trackResetOnLoad: true,
                    url: 'php/main.php?Action=Startlijst.SaveLandingsTijd',
                    items: [
                        {
                            xtype: 'hiddenfield',
                            x: 35,
                            y: 210,
                            id: 'StartInvoerLandingstijd_ID',
                            width: 50,
                            fieldLabel: '',
                            hideEmptyLabel: false,
                            labelWidth: 0,
                            name: 'ID'
                        },
                        {
                            xtype: 'hiddenfield',
                            id: 'StartInvoer_StartTijd',
                            fieldLabel: 'Label',
                            name: 'STARTTIJD'
                        },
                        me.processStartInvoer_LandingsTijd({
                            xtype: 'combobox',
                            validator: function(value) {
                                // voer dit script uit om te zien of alles goed is ingevuld
                                return Ext.StartlijstTijdenForm.ValidateLandingsTijd(value);
                            },
                            id: 'StartInvoer_LandingsTijd',
                            width: 140,
                            fieldLabel: 'Landing',
                            labelAlign: 'right',
                            labelWidth: 50,
                            msgTarget: 'side',
                            name: 'LANDINGSTIJD',
                            invalidText: 'Er is een ongeldige tijd ingevoerd',
                            emptyText: 'uu:mm',
                            enableKeyEvents: true,
                            enforceMaxLength: true,
                            maxLength: 5,
                            maxLengthText: 'Tijd formaat bestaat uit UU:MM',
                            size: 8,
                            displayField: 'tijd',
                            forceSelection: true,
                            queryDelay: 100,
                            queryMode: 'local',
                            valueField: 'tijd',
                            listeners: {
                                keypress: {
                                    fn: me.onStartInvoer_LandingsTijdKeypress,
                                    scope: me
                                },
                                change: {
                                    fn: me.onStartInvoer_LandingsTijdChange,
                                    scope: me
                                },
                                specialkey: {
                                    fn: me.onStartInvoer_LandingsTijdSpecialkey,
                                    scope: me
                                },
                                select: {
                                    fn: me.onStartInvoer_LandingsTijdSelect,
                                    scope: me
                                }
                            }
                        }),
                        {
                            xtype: 'button',
                            x: 190,
                            y: 10,
                            formBind: true,
                            height: 40,
                            id: 'StartInvoerLandingstijd_Opslaan',
                            width: 80,
                            text: 'Opslaan',
                            listeners: {
                                click: {
                                    fn: me.onButtonLandingstijdOpslaan,
                                    scope: me
                                }
                            }
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

    processStartInvoer_LandingsTijd: function(config) {
        // Toon in het invoerveld een kruisje om het veld met 1 muisklik leeg te maken
        config.plugins = ['clearbutton'];
        return config;
    },

    onStartInvoer_LandingsTijdKeypress: function(textfield, e, eOpts) {

        // iemand heeft een toets op het toetsenbord ingedrukt
        // alleen cijfers, backspace en delete zijn toegestaan
        if (e.getKey() != Ext.EventObject.BACKSPACE && e.getKey() != Ext.EventObject.DELETE)
        {
            if (e.getKey() > 57 || e.getKey() < 48)
            {
                e.stopEvent();
                return false;
            }
        }

        // als er goede toets is ingedrukt, voer het volgende script uit.
        Ext.StartlijstTijdenForm.onStartInvoer_Keypress(textfield, e, eOpts);
    },

    onStartInvoer_LandingsTijdChange: function(field, newValue, oldValue, eOpts) {
        Ext.StartlijstTijdenForm.onChangeTijd(field);
    },

    onStartInvoer_LandingsTijdSpecialkey: function(field, e, eOpts) {
        // als de gebruiker de ENTER toets indrukt, dan slaan we de tijd op
        if(e.getKey() == Ext.EventObject.ENTER)
        {
            Ext.StartlijstTijdenForm.SaveLandingsTijd(field);
        }
        else
        {
            // het was dus niet de ENTER toets, maar een andere speciale toets
            Ext.StartlijstTijdenForm.onStartInvoer_Keypress(field, e, eOpts);
        }
    },

    onStartInvoer_LandingsTijdSelect: function(combo, records, eOpts) {
        // we zetten nu een variable zodat we het veld niet meer automatisch voorzien van de actuele tijd
        combo.manualInput = true;
    },

    onButtonLandingstijdOpslaan: function(button, e, eOpts) {
        // voer dit script uit om de tijd op te slaan in de database
        Ext.StartlijstTijdenForm.SaveLandingsTijd(button, e, eOpts);
    },

    onWindowShow: function(component, eOpts) {
        // functie die uitgevoerd wordt bij het openen van het window
        Ext.StartlijstTijdenForm.onLandingstijdWindowShow(component, eOpts, this.ID);
    }

});