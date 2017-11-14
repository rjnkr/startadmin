<?php
	// Dit is een proxy class. Vanuit de webinterface worden deze functies aangeroepen. Na ontvangst van de aanroep zal de windows service
	// ondervraagt worden. Het resultaat wordt 1:1 doorgezet.
	// Voordeel van deze aanpak is dat alle communicate van web applicatie vanuit dezelde server wordt gevoed. Browser zijn namelijk beveiligd
	// om met een andere server zomaar te communceren
	
	class CommStatus 
	{
		// vraag de communicatie status op van het synchronisatie proces wat als window service draait
		function SyncStatus()
		{
			global $app_settings;
			
			if (isset($app_settings['statusUrl']))
			{
				$url = $app_settings['statusUrl'] . "/SyncStatus";
					
				$retval = file_get_contents($url);	// hier wordt de url aangeroepen
				echo $retval;
			}
			else
			{
				echo "??";	// we weten niet waar we de status moeten opvragen
			}
		}
		
		// vraag de status van Flarm op
		function FlarmStatus()
		{
			global $app_settings;
			
			if (isset($app_settings['statusUrl']))
			{
				$url = $app_settings['statusUrl'] . "/FlarmStatus";
					
				$retval = file_get_contents($url);	// hier wordt de url aangeroepen
				echo $retval;
			}
			else
			{
				echo "??";	// we weten niet waar we de status moeten opvragen
			}
		}
		
		// We krijgen nu alle details te zien van alle individuele tabellen die gesynchroniseerd worden
		function StatusDetails()
		{
			global $app_settings;
			
			if (isset($app_settings['statusUrl']))
			{
				$url = $app_settings['statusUrl'] . "/StatusDetails";
					
				$retval = file_get_contents($url);	// hier wordt de url aangeroepen
				echo $retval;
			}
			else
			{
				echo "??";	// we weten niet waar we de status moeten opvragen
			}			
		}	

		// Wanneer komt de volgende sync
		function StatusNextSync()
		{
			global $app_settings;
			
			if (isset($app_settings['statusUrl']))
			{
				$url = $app_settings['statusUrl'] . "/StatusNextSync";
						
				$retval = file_get_contents($url);	// hier wordt de url aangeroepen
				echo $retval;
			}
			else
			{
				echo "??";	// we weten niet waar we de status moeten opvragen
			}			
		}
		
		// Forceer een synchronizatie tussen de starttoren en de internet server
		function ForceSync()
		{
			global $app_settings;
			
			if (isset($app_settings['statusUrl']))
			{
				$url = $app_settings['statusUrl'] . "/ForceSync";
							
				$retval = file_get_contents($url);	// hier wordt de url aangeroepen
				echo $retval;
			}
			else
			{
				echo "??";	// we weten niet waar we de status moeten opvragen
			}			
		}
		
		// Verstuur een email aan de beheerder met de details van de sync proces
		function SendEmail()
		{
			global $app_settings;
			
			if (isset($app_settings['statusUrl']))
			{
				$url = $app_settings['statusUrl'] . "/SendEmail";
							
				$retval = file_get_contents($url);	// hier wordt de url aangeroepen om de mail te versturen
				echo $retval;
			}
			else
			{
				echo "??";	// we weten niet waar we de status moeten opvragen
			}			
		}
	}
?>