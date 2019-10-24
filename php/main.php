<?php

date_default_timezone_set('Europe/Amsterdam');

include('config.php');
include('inc/functions.inc.php');
include('inc/startadmin.inc.php');

//error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);


if(!empty($_GET)) 
{
	if (array_key_exists('Action', $_GET))	// we gaan een actie uitvoeren
	{
		$Action = $_GET["Action"];	// dit is altijd een argument in de url

		if (IsSet($Action))
		{
			// De action heeft twee delen, de class en de method.
			// Deze twee zijn gescheiden door een .
			list($class, $method) = explode(".", $Action);
			
			if ((ctype_alnum($class)) && (ctype_alnum($method)))   // in class en method mogen alleen maar A-Z voorkomen ivm php code inject un url
			{
				if ($class != "Login")			// even controleren of de gebruiker wel toegang heeft	
				{	
					$l = MaakObject('Login');
					$l->heeftToegang();			// het stopt hier als de gebruiker niet ingelogd is	
				}
				$obj = MaakObject($class);	// Maak de class aan
				eval("\$obj->$method();");	// voer de method uit
			}
			else
			{
				header('HTTP/1.1 500 Wrong functional call');
				exit;
			}
		}		
	}
	else if (array_key_exists('Config', $_GET))	// Vertel de client wat de configuratie is
	{		
		// er is geen verbinding naar de database
		$l = MaakObject('Login');
		$l->heeftToegang();

		$app_settings['MagSchrijven'] = $l->magSchrijven();
		$app_settings['isBeheerder'] = $l->isBeheerder();
		$app_settings['isBeheerderDDWV'] = $l->isBeheerderDDWV();
		$app_settings['isLocal'] = $l->isLocal();
		$app_settings['Vliegveld'] = $vliegveld;

		echo json_encode($app_settings);	
	}
	else if (array_key_exists('CommStatus', $_GET))	// De communicatie status wordt opgevraagd
	{
		// er is geen verbinding naar de database
		$l = MaakObject('Login');
		$l->heeftToegang();

		$method = $_GET["CommStatus"];		// dit is altijd een argument in de url
		
		if (ctype_alnum($method))   // in method mogen alleen maar A-Z voorkomen ivm php code inject un url
		{
			$obj = MaakObject('CommStatus');
			eval("\$obj->$method();");
		}
		else
		{
			header('HTTP/1.1 500 Wrong functional call');
			exit;
		}
	}
}
?>