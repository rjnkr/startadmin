// Als eerste wordt bij het laden van de pagina alle plaatje opgehaald en
// opgeslagen in het geheugen van de browser.
if (document.images) 
{ 
	digit1 = new Image; 
	digit1.src = "images/digit1.png"; 
	digit2 = new Image; 
	digit2.src = "images/digit2.png";
	digit3 = new Image; 
	digit3.src = "images/digit3.png";
	digit4 = new Image; 
	digit4.src = "images/digit4.png";
	digit5 = new Image; 
	digit5.src = "images/digit5.png";
	digit6 = new Image; 
	digit6.src = "images/digit6.png";
	digit7 = new Image; 
	digit7.src = "images/digit7.png";
	digit8 = new Image; 
	digit8.src = "images/digit8.png";
	digit9 = new Image; 
	digit9.src = "images/digit9.png";
	digit0 = new Image; 
	digit0.src = "images/digit0.png";
	digitcolon = new Image;
	digitcolon.src = "images/digitcolon.png";
}

// Het tonen van de klok in de header van de webpagina. Deze functie wordt
// Iedere 5 seconden aangeroepen. We tonen geen secondes, met 5 seconden
// wordt de minuut snel genoeg op het scherm aangepast	
function UpdateClock()
{
    var time= new Date();
	
	// de tijd in uren en minuten
    hours = time.getHours();
    mins = time.getMinutes();
	
	// De plek in het html document waar de klok wordt weeregegeven
    if (document.images) 
	{
		// de minuten
		digit = mins % 10;
		document.images.minsones.src=eval("digit1.src");
		document.images.minsones.src=eval("digit"+digit+".src");
		digit = (mins - (mins % 10))/10;
		document.images.minstens.src=eval("digit"+digit+".src");
		
		// de uren
		digit = hours % 10;
		document.images.hoursones.src=eval("digit"+digit+".src");
		digit = (hours - (hours % 10))/10;
		document.images.hourstens.src=eval("digit"+digit+".src");
		
		// roep deze functie over 5 seconden opnieuw aan
		setTimeout(UpdateClock,5 * 1000);		// 5 seconden
	}
}
