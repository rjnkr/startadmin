<?php

$db_info = array(
                'dbType' => 'mysql',
                'dbHost' => 'localhost',
                'dbName' => 'sadb',
                'dbUser' => 'root',
                'dbPassword' => 'Boefjes781'
);

$smtp_settings = array (
	 'smtpuser' => 'geldersezweefvliegclub@gmail.com', 
	 'smtppass' => 'EGV5neD^oTc_hmk',
	 'smtphost' => 'smtp.gmail.com',
	 'smtpsecure' => 'tls',
	 'smtpport' => '587'
//	 'from' => 'geldersezweefvliegclub@gmail.com;
);

$app_settings = array(
		'Aanwezigheid' => true,			// slim bekijken wie deze dag al aanwezig zijn
		'Betaald' => true,				// controle of lid contrubutie betaald heeft
		'ControleerPapieren' => false,	// controle of GPL / Medical verlopen is
		'DbLogging' => true,			// Log database queries naar logfile
		'DbError' => true,				// Log errors naar logfile
		'Debug' => true,				// Debug informatie naar logfile
		'LogDir' => '\\\\vmware-host\\Shared Folders\\Documents\\startadmin.git\\log\\',				// Locatie waar log bestanden geschreven worden
		'statusUrl' => 'http://localhost:8081/',	// Status van het synchronisatie process
		'ControleTolerantie' => 120,		// Hoeveel verschil accepteren we tussen startadmin en flarm
		'DemoMode' => true				// demo/test mode. Voor iedereen is het wachtwoord nu WW	
);

// Wachtwoord om te synchroniseren tussen starttoren en internet
$sync_account = array(
	'username' => 'sync',
	'password' => 'password'
);

// Wachtwoord om te voor starttoren (indien niet automatisch ingelogd)
$sa_account = array(
	'username' => 'sa',
	'password' => 'startadmin'
);

$beheerders = array("0", "10395");
// 0 = sa
// 10178 = Lucas Berends

$beheerdersDDWV = array("10116");
// 10232 = Ruben Nijenhuis 

$vliegveld = array(
	[5.903783927897619,52.0599547511319],
	[5.933198914580147,52.04318326051965],
	[5.93906737743545,52.05725511402299],
	[5.938731667046202,52.05853296847813],
	[5.9393224257232,52.05935127806008],
	[5.937412207424919,52.06036029496933],
	[5.938117377846634,52.06109633052992],
	[5.937356453439671,52.06153053459762],
	[5.936079102943714,52.06136231778728],
	[5.935214663725688,52.06200487535811],
	[5.92692460134514,52.06366044237527],
	[5.928961050666615,52.06673737837878],
	[5.925048643349616,52.06888510642756],
	[5.903783927897619,52.0599547511319]
);

//$NoPasswordIP = array("0.0.0.1/1", "128.0.0.1/1");		// Iedereen kan inloggen zonder wachtwoord (array van subnetten)
//$NoPasswordIP = "172.16.55.0/24";						// Iedereen op het netwerk kan inloggen zonder wachtwoord
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
