	
function BijhoudenVliegtijd()
{
	var StartlijstStore = Ext.data.StoreManager.lookup('Startlijst_GridStore');

	// Bereken de vluchtduur voor alle vluchten in de store en sla het resultaat op in de store. Het wordt dan automatisch getoond op het scherm
	// Dit wordt gedaan zonder de database te raadplegen
	StartlijstStore.each(function(record,idx)
	{
		if ((record.data.STARTTIJD != null) && (record.data.LANDINGSTIJD == null))
		{
			var d = new Date();
			var starttijd = record.data.STARTTIJD.substring(0,2) * 60 + 1 * record.data.STARTTIJD.substring(3,5);
			var nu = d.getHours() * 60 + d.getMinutes();
			var diff = Math.abs(nu - starttijd);		
			var hours = '00' + Math.floor(diff / 60);
			var minutes = '00' + (diff - (hours * 60));
		
			var i = String(hours).length;
			var h = String(hours).substring(i, i-2);
			
			var i = String(minutes).length;
			var m = String(minutes).substring(i, i-2);
			
			if (nu - starttijd < 0)
				h = "-" + h;
				
			var t = h + ":" + m;
			record.beginEdit();
			record.data.DUUR = t;
			record.endEdit();
			record.commit(false);			
		}
	});
	
	// doet hetzelfde in de aanwezig store, zodat je op de aanwezigheid pagine kunt zien hoe lang iemand vliegt
	var AanwezigLedenStore = Ext.data.StoreManager.lookup('Aanwezig_Leden_GridStore');
	AanwezigLedenStore.each(function(record,idx)
	{
		if (record.data.LAATSTE_STARTTIJD != null)
		{
			var d = new Date();
			var starttijd = record.data.LAATSTE_STARTTIJD.substring(0,2) * 60 + 1 * record.data.LAATSTE_STARTTIJD.substring(3,5);
			var nu = d.getHours() * 60 + d.getMinutes();
			var diff = Math.abs(nu - starttijd);				
			var hours = '00' + Math.floor(diff / 60);
			var minutes = '00' + (diff - (hours * 60));
		
			var i = String(hours).length;
			var h = String(hours).substring(i, i-2);
			
			var i = String(minutes).length;
			var m = String(minutes).substring(i, i-2);
			
			if (nu - starttijd < 0)
				h = "-" + h;
				
			var t = h + ":" + m;
			record.beginEdit();
			record.data.ACTUELE_VLIEGTIJD = t;
			record.endEdit();
			record.commit(false);			
		}
	});

	// iedere 3 seconden rekenen we opnieuw uit
	setTimeout(BijhoudenVliegtijd,30 * 1000);	// iedere 30 seconde herhalen
}
