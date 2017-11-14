
// Deze functie zorgt ervoor dat de store periodiek opgenieuw geladen worden. Dit gebeurd door de functie slimLaden. slimLaden is
// een eigen gemaakte functie die alleen data ophaald als dat echt nodig is.
// De bijbehorende grids en forms worden automatisch aangepast.
	
function AutomatischLaden()
{
	Ext.data.StoreManager.lookup('Startlijst_GridStore').slimLaden(null, false);

	Ext.data.StoreManager.lookup('Daginfo_Store').slimLaden(null, false);
	Ext.data.StoreManager.lookup('Aanwezig_Leden_GridStore').slimLaden(null, false);
	Ext.data.StoreManager.lookup('Aanwezig_Vliegtuigen_GridStore').slimLaden(null, false);
	
	setTimeout(AutomatischLaden,60 * 1000);
}


// Deze stores moet geladen worden bij het opstarten van de applicatie
function InitStores()
{
	Ext.data.StoreManager.lookup('Startlijst_Vlieger_Store').slimLaden(null, false);
	Ext.data.StoreManager.lookup('Aanmelden_Vliegtuig_Store').slimLaden(null, false);
	Ext.data.StoreManager.lookup('Daginfo_Store').slimLaden(null, false);
	Ext.data.StoreManager.lookup('Types_Banen_Store').slimLaden(null, false);
	Ext.data.StoreManager.lookup('Types_Club_Store').slimLaden(null, false);
	Ext.data.StoreManager.lookup('Types_Lid_Store').slimLaden(null, false);
	Ext.data.StoreManager.lookup('Types_SoortBedrijf_Store').slimLaden(null, false);
	Ext.data.StoreManager.lookup('Types_StartMethode_Store').slimLaden(null, false);
	Ext.data.StoreManager.lookup('Types_SoortVlucht_Store').slimLaden(null, false);
	Ext.data.StoreManager.lookup('Types_Vliegvelden_Store').slimLaden(null, false);
	Ext.data.StoreManager.lookup('Types_VliegtuigType_Store').slimLaden(null, false);
	Ext.data.StoreManager.lookup('Types_WindKracht_Store').slimLaden(null, false);
	Ext.data.StoreManager.lookup('Types_WindRichting_Store').slimLaden(null, false);	
}



