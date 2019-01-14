// Roep een url aan op de server. Als de url een fout geeft, komt er een popup met de foutmelding 
// Wanneer het goed gaat wordt de store opnieuw geladen en komt een bericht dat het gelukt is.
function CallURL(request_url, store, msgSuccess, msgfailure)
{
	var conn = new Ext.data.Connection();
	conn.request
	({
		url:request_url,
		method:'GET',
		success: function(responseObject) 
		{
			Ext.win.msg(msgSuccess);
			if (store != null)
				store.load();
		},
		failure: function() 
		{
			Ext.MessageBox.alert('', msgfailure);
		}
	});
}

// De gebruiker heeft aangegeven dat het lid vandaag aanwezig is. Dit heeft hij gedaan vanuit
// het grid met alle leden. Vervolgens wordt er een window geopend waar meer details ingevuld 
// kunnen worden
function AanmeldenLidWindow(LidID)
{
	var title = "Aanmelden voor vliegdag";

	if (LidID > 0)		// lid is bekend
	{
		var store = Ext.data.StoreManager.lookup('LedenLijst_GridStore');
		var lid = store.getById(LidID.toString());
		
		var title = lid.data.NAAM;
	}
	
	var win = Ext.widget('LidVandaagAanwezigWindow', {'title': title, 'LID_ID': LidID, 'ID': -1});
	win.show();
}
		
// De gebruiker heeft aangegeven dat dit vliegtuig vandaag aanwezig is. Dit heeft hij gedaan
// vanuit het vliegtuigen overzicht. Er is verder geen interactie mee en er wordt daarom 
// direct met de server gecommuniceerd.
function AanmeldenVliegtuig(id)
{
	var store = Ext.data.StoreManager.lookup('VliegtuigenLijst_GridStore');
	var vliegtuig = store.getById(id.toString());
	
	var url = "php/main.php?Action=Aanwezig.AanmeldenVliegtuig&ID=" + id;
	CallURL(
		url, 
		Ext.data.StoreManager.lookup('Aanwezig_Vliegtuigen_GridStore'),
		vliegtuig.data.REGISTRATIE + " is aangemeld", 
		"Fout bij aanmelden " + vliegtuig.data.REGISTRATIE);
}

// Het lid verlaat (tijdelijk) het vliegveld en gaat niet meer vliegen. Voor de
// zekerheid wordt nog om een bevesting gevraagd. Daarna wordt de server aangeroepen.
// Deze functie wordt aangeroepen vanuit het tabblad aanwezig.
function AfmeldenLid(id)
{
	var store = Ext.data.StoreManager.lookup('Aanwezig_Leden_GridStore');
	var lid = store.getById(id.toString());
	
	Ext.Msg.show
	(
		{
			msg: 'Wilt u ' + lid.data.NAAM + ' afmelden?',
			buttons: Ext.Msg.YESNO,
			buttonText:{yes: "Ja", no: "Nee"},
			icon: Ext.Msg.QUESTION,
			fn: function (btn)
			{
				if(btn=='yes')
				{     
					var url = "php/main.php?Action=Aanwezig.AfmeldenLid&ID=" + id;
					CallURL(url, store, lid.data.NAAM + " is afgemeld", "Fout bij afmelden " +  lid.data.NAAM);
				}
			}
		}
	);
}

// Het vliegtuig is niet langer beschikbaar voor vandaag. Dit kan doordat hij in terug 
// de aanhanger in gaat of dat de kist buiten geland is. Deze functie wordt aangeroepen 
// vanuit het tabblad aanwezig 
function AfmeldenVliegtuig(id)
{
	var store = Ext.data.StoreManager.lookup('Aanwezig_Vliegtuigen_GridStore');
	var vliegtuig = store.getById(id.toString());
	
	Ext.Msg.show
	(
		{
			msg: 'Wilt u ' + vliegtuig.data.REGISTRATIE + ' afmelden?',
			buttons: Ext.Msg.YESNO,
			buttonText:{yes: "Ja", no: "Nee"},
			icon: Ext.Msg.QUESTION,
			fn: function (btn)
			{
				if(btn=='yes')
				{     
					var url = "php/main.php?Action=Aanwezig.AfmeldenVliegtuig&ID=" + id;
					CallURL(url, store, vliegtuig.data.REGISTRATIE + " is afgemeld", "Fout bij afmelden " + vliegtuig.data.REGISTRATIE);
				}
			}
		}
	);
}

// Een lid kan vanuit het tabblad leden een lid verwijderen. Dit kan alleen voor tijdelijke leden
// De andere leden moet via de ledenlijst verwijderd worden. Natuurlijk wordt er eerst gevraagd
// of het echt de bedoeling is. Als het lid verwijderd is, wordt de eerste pagina opnieuw geladen
function VerwijderenLid(id)
{
	var store = Ext.data.StoreManager.lookup('LedenLijst_GridStore');
	var lid = store.getById(id.toString());
	
	Ext.Msg.show
	(
		{
			msg: 'Wilt u ' + lid.data.NAAM + ' verwijderen uit de start administratie?',
			buttons: Ext.Msg.YESNO,
			buttonText:{yes: "Ja", no: "Nee"},
			icon: Ext.Msg.QUESTION,
			fn: function (btn)
			{
				if(btn=='yes')
				{     
					var store = Ext.data.StoreManager.lookup('LedenLijst_GridStore');
					var url = "php/main.php?Action=Leden.VerwijderObject&ID=" + id;
					
					CallURL(url, null, lid.data.NAAM + " is verwijderd", "Fout bij verwijderen " +  lid.data.NAAM);
					Ext.getCmp('ButtonVerwijderenLid').toggle();
					
					store.proxy.extraParams = 
					{
					    '_:aanwezig': Ext.getCmp('Leden.FilterAanwezig').pressed,
						'_:query': Ext.getCmp('Leden.ZoekenInLedenLijst').getValue(),
						'_:instructeurs': Ext.getCmp('Leden.InstructeurFilter').getValue(),
						'_:lieristen': Ext.getCmp('Leden.LieristFilter').getValue(),
						'_:startleiders': Ext.getCmp('Leden.StartleiderFilter').getValue(),
						'_:verwijderMode': Ext.getCmp('ButtonVerwijderenLid').pressed
					}
					store.loadPage(1, 
						{
						   callback: function(records, operation, success)
							{
								Ext.getCmp('refLedenView').refresh();
							}
						}
					);
				}
			}
		}
	);
}

// Een vliegtuig kan vanuit het tabblad leden verwijderd worden. Nadat dit bevestigd is
// door de gebruiker wordt de server aangeroepen. Na het verwijderen wordt de eerste pagina
// van het vliegtuigen grid opnieuw geladen
function VerwijderenVliegtuig(id)
{
	var store = Ext.data.StoreManager.lookup('VliegtuigenLijst_GridStore');
	var vliegtuig = store.getById(id.toString());
	
	Ext.Msg.show
	(
		{
			msg: 'Wilt u ' + vliegtuig.data.REGISTRATIE + ' verwijderen uit de start administratie?',
			buttons: Ext.Msg.YESNO,
			buttonText:{yes: "Ja", no: "Nee"},
			icon: Ext.Msg.QUESTION,
			fn: function (btn)
			{
				if(btn=='yes')
				{     
					var url = "php/main.php?Action=Vliegtuigen.VerwijderObject&ID=" + id;
					CallURL(url, store, vliegtuig.data.REGISTRATIE + " is verwijderd", "Fout bij verwijderen " +  vliegtuig.data.REGISTRATIE );
					Ext.getCmp('ButtonVerwijderenVliegtuig').toggle();
					
					store.proxy.extraParams = 
					{
						'_:query': Ext.getCmp('Vliegtuigen_ZoekenInVliegtuigenlijst').getValue(),
						'_:clubkist': Ext.getCmp('Vliegtuigen_ClubkistFilter').getValue()
					}
					store.loadPage(1, 
						{
						   callback: function(records, operation, success)
							{
								Ext.getCmp('refVliegtuigenView').refresh();
							}
						}
					);					
				}
			}
		}
	);
}
