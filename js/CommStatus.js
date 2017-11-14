// als eerste laden we alle symbolen vanad de webserver in het geheugen van de browser
if (document.images) 
{ 
	statusUp = new Image;
	statusUp.src = "images/up.gif";
	statusUnknown = new Image;
	statusUnknown.src = "images/unknown.gif";
	statusDown = new Image;
	statusDown.src = "images/down.gif";
	statusError = new Image;
	statusError.src = "images/error.gif";
	statusTodo = new Image;
	statusTodo.src = "images/todo.gif";
	statusBusy = new Image;
	statusBusy.src = "images/busy.gif";
	statusInternal = new Image;
	statusInternal.src = "images/internal.gif";
}
	
// Toon de status in de webpagina	
function UpdateSyncStatus(status)
{	
    if (document.images) 
	{
		switch (status)
		{
			case "0": 	// er is helemaal geen communicatie
			{
				document.images.commStatus.src=eval("statusDown.src");
				document.getElementById("statusText").innerHTML = "Uit";
				document.getElementById("statusArea").style.display = "block";
				break;
			}		
			case "10":	// de communicatie werkt, maar er zijn fouten
			{
				document.images.commStatus.src=eval("statusError.src");
				document.getElementById("statusText").innerHTML = "Communicatie fout";
				document.getElementById("statusArea").style.display = "block";
				break;
			}
			case "20":	// de sync applicatie weet niet wat de status is
			{
				document.images.commStatus.src=eval("statusUnknown.src");
				document.getElementById("statusText").innerHTML = "Communicatie status onbekend";
				document.getElementById("statusArea").style.display = "block";
				break;
			}
			case "30":	// er wordt nu gecommuniceerd
			{
				document.images.commStatus.src=eval("statusBusy.src");
				document.getElementById("statusText").innerHTML = "Communiceren";
				document.getElementById("statusArea").style.display = "block";
				break;
			}
			case "40":	// er staan gegevens klaar om verzonden te worden
			{
				document.images.commStatus.src=eval("statusTodo.src");
				document.getElementById("statusText").innerHTML = "In wachtrij";
				document.getElementById("statusArea").style.display = "block";
				break;
			}				
			case "50":	// alles is goed en er is niets te verzenden
			{
				document.images.commStatus.src=eval("statusUp.src");
				document.getElementById("statusText").innerHTML = "Online";
				document.getElementById("statusArea").style.display = "block";
				break;
			}
			case "??":	// We zitten of de server en daar draait de sync applicatie niet
			{
				// verberg het icoon in de webpagina
				document.getElementById("statusArea").style.display = "none";
				break;
			}
			default :	// er is geen verbinding met de sync applicatie, staat hij uit?
			{
				document.images.commStatus.src=eval("statusInternal.src");
				document.getElementById("statusText").innerHTML = "Communicatie status onduidelijk";
				document.getElementById("statusArea").style.display = "block";
			}
		}
	}
}

// Toon de status in de webpagina	
function UpdateFlarmStatus(status)
{	
    if (document.images) 
	{
		switch (status)
		{	
			case "0":
			{
				document.images.flarmStatus.src=eval("statusError.src");
				document.getElementById("flarmText").innerHTML = "Flarm niet beschikbaar";
				break;
			}
			
			case "1":	// alles is goed en er is niets te verzenden
			{
				document.images.flarmStatus.src=eval("statusUp.src");
				document.getElementById("flarmText").innerHTML = "Flarm online";
				break;
			}
			
			default:	// de sync applicatie is niet bereikbaar
			{
				document.images.flarmStatus.src=eval("statusInternal.src");
				document.getElementById("flarmText").innerHTML = "Flarm status onduidelijk";
				break;
			}
		}
	}
}

// Haal bij de sync applicatie op wat de flarm status is. Uit beveilings oogpunt kunnen we dat niet
// direct by de sync applicatie doen. We roepen dus het php script aan op de server, die vervolgens
// de flarm status ophaalt bij de sync applicatie
function OphalenFlarmStatus()
{
	if (appSettings.isLocal)
	{
		var conn = new Ext.data.Connection();
		
		conn.request
		({
			url:"php/main.php?CommStatus=FlarmStatus",
			method:'GET',
			success: function(responseObject) 
			{
				UpdateFlarmStatus(responseObject.responseText);
				
				// Als we ?? terug krijgen, zitten we op de sever. Daar draait de sync applicatie niet
				// we hoeven dus deze functie niet opnieuw aan te roepen
				if (responseObject.responseText != "??")
				{
					setTimeout(OphalenFlarmStatus,60 * 1000);
				}
			},
			failure: function() 
			{
				UpdateFlarmStatus();
				setTimeout(OphalenFlarmStatus,60 * 1000);
			}
		});
	}
	else
	{
		document.getElementById("flarmArea").style.display = "block";
	}
}

// Haal bij de sync applicatie op wat de status is. Uit beveilings oogpunt kunnen we dat niet
// direct by de sync applicatie doen. We roepen dus het php script aan op de server, die vervolgens
// de status ophaalt bij de sync applicatie
function OphalenSyncStatus()
{
	if (appSettings.isLocal)
	{
		var conn = new Ext.data.Connection();

		conn.request
		({
			url:"php/main.php?CommStatus=SyncStatus",
			method:'GET',
			success: function(responseObject) 
			{
				UpdateSyncStatus(responseObject.responseText);
				var grid = Ext.getCmp('CommStatusWindowGrid');
				
				// Als we ?? terug krijgen, zitten we op de sever. Daar draait de sync applicatie niet
				// we hoeven dus deze functie niet opnieuw aan te roepen
				if (responseObject.responseText != "??")
				{
					// Als het detail scherm open staat, roepen we deze functie iedere sconden aan
					// Hierdoor reageert het icoon net zo snel als het detail scherm
					if (grid !== undefined) 
						setTimeout(OphalenSyncStatus,1 * 1000);		//  roep de functie iedere seconde aan
					else
						setTimeout(OphalenSyncStatus,60 * 1000);	//  roep de functie iedere minuut aan (window staat er niet)
				}
			},
			failure: function() 
			{
				UpdateSyncStatus();
				setTimeout(OphalenSyncStatus,60 * 1000);
			}
		});
	}
}

// De details van het communiceren (alle tabellen) wordt met deze functie geladen in een store
// Doordat de store geupdated wordt, wordt ook het grid ververst
function OphalenCommStatusDetails()
{
	var grid = Ext.getCmp('CommStatusWindowGrid');
						
	// als het window niet meer bestaat doen we niets			
	if (grid === undefined) 
	{
		console.log(sprintf("%s: CommStatusWindowGrid === undefined", TijdStempel()));
		return false;
	}
	Ext.data.StoreManager.lookup('CommStatusDetails_Store').load
	({
		callback : function(r, options, success) 
		{
			if (success)
				setTimeout(OphalenCommStatusDetails,1 * 1000);	//  roep de functie iedere seconde aan
			else
				setTimeout(OphalenCommStatusDetails,60 * 1000);	//  roep de functie iedere 60 seconde aan
		}
	});
	
	// In deze store staat wanneer er weer met de local server en met de remote server gecommuniceerd wordt.
	Ext.data.StoreManager.lookup('CommStatusNextSync_Store').load();
}

// Een knop waarmee je geforceerd de synchronisatie kan starten. Bijvoorbeeld aan het einde van de dag of 
// wanneer er een probleem is.
// Om te voorkomen dat er te vaak op de knop gedrukt wordt, zal de knop verborgen worden voor 30 seconden
function SyncButtonClick()
{
	var form = Ext.getCmp('CommStatusForm');
	var SyncButton = Ext.getCmp('SyncButton');

	SyncButton.hide();
	setTimeout(EnableSyncButton,30 * 1000);	
	
	form.getForm().submit();
}

// Een knop waarmee je geforceerd de een email kunt uitsturen. Bijvoorbeeld wanneer er problemen zijn
// Om te voorkomen dat er te vaak op de knop gedrukt wordt, zal de knop verborgen worden voor 30 seconden
function EmailButtonClick()
{
	var form = Ext.getCmp('SendEmailForm');
	
	form.getForm().submit();

	Ext.win.msg("Email verstuurd");	
}


// Het opnieuw vertonen van de synchronizeren knop
function EnableSyncButton()
{
	var SyncButton = Ext.getCmp('SyncButton');
	SyncButton.show();
}

// Open het window met de details
function OpenCommStatusWindow()
{
	var view = Ext.widget('CommStatusWindow');
	view.show();
}


