<?php

$db_info = array(
                'dbType' => 'mysql',
                'dbHost' => 'localhost',
                'dbName' => 'db_name',
                'dbUser' => 'db_username',
                'dbPassword' => 'db_password'
);


$app_settings = array(
		'Aanwezigheid' => true,			// slim bekijken wie deze dag al aanwezig zijn
		'Betaald' => true,				// controle of lid contrubutie betaald heeft
		'ControleerPapieren' => false,	// controle of GPL / Medical verlopen is
		'DbLogging' => true,			// Log database queries naar logfile
		'DbError' => true,				// Log errors naar logfile
		'Debug' => true,				// Debug informatie naar logfile
		'LogDir' => 'C:/Tmp/sa_log/',		// Locatie waar log bestanden geschreven worden
		'statusUrl' => 'http://localhost:8081/',	// Status van het synchronisatie process
		'ControleTolerantie' => 120,		// Hoeveel verschil accepteren we tussen startadmin en flarm
		'DemoMode' => true				// demo/test mode. Voor iedereen is het wachtwoord nu WW	
);

// Wachtwoord om te synchroniseren tussen starttoren en internet
$sync_account = array(
	'username' => 'sync',
	'password' => 'password'
);


$beheerders = array("0", "10178");
// 0 = sa
// 10178 = Lucas Berends

$beheerdersDDWV = array("10232");
// 10232 = Ruben Nijenhuis 


$NoPasswordIP = array("0.0.0.1/1", "128.0.0.1/1");		// Iedereen kan inloggen zonder wachtwoord (array van subnetten)
$NoPasswordIP = "172.16.55.0/24";						// Iedereen op het netwerk kan inloggen zonder wachtwoord
$NoPasswordIP = "127.0.0.1";							// IP adres van de starttoren, geen password nodig

if (!IsSet($GLOBALS['DBCONFIG_PHP_INCLUDED']))
{
	include('inc/database.inc.php');
	$GLOBALS['DBCONFIG_PHP_INCLUDED'] = 1;	
	
	global $db;
	$db = new DB();
	$db->Connect();
}

?>
