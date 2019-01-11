<?php

// Common definitions
define('phpCrLf', "\r\n");
define('phpTab', "\t");

	// Instanteer een class, maar laad het php bestand eerst
	if (!function_exists('MaakObject'))
	{
			function MaakObject($className)
			{
				$includedChk = sprintf('%s_PHP_INCLUDED', strtoupper($className));
				if (!IsSet($GLOBALS[$includedChk]))
				{
						include_once('inc/class.' . $className . '.inc.php');
						$GLOBALS[$includedChk] = 1;
				}
				$obj = new $className;
				return $obj;
			}
	}

	// De debug functie, schrijft niets als de globale setting UIT staat
	if (!function_exists('Debug'))
	{
		function Debug($file, $line, $text)
		{
			global $app_settings;
						
			if ($app_settings['Debug'])
			{
				$arrStr = explode("/", $file); 
				$arrStr = array_reverse($arrStr );
				$arrStr = explode("\\", $arrStr[0]);
				$arrStr = array_reverse($arrStr );
				
				if ($app_settings['LogDir'] == "syslog")
				{
					error_log(sprintf("%s: %s (%d), %s\n", date("Y-m-d H:i:s"), $arrStr[0], $line, $text));
				}
				else
				{	
					error_log(sprintf("%s: %s (%d), %s\n", date("Y-m-d H:i:s"), $arrStr[0], $line, $text), 3, $app_settings['LogDir'] . "debug.txt");
				}
			}
		}
	}

	// Genereer een nieuw ID, werk ook als er meerdere gebruikers gelijk actief zijn
	if (!function_exists('NieuwID'))
	{
		function NieuwID($datum = null, $lid = null, $vliegtuig = null)
		{
			if ($datum == null)
				$d = time();
			else
				$d = strtotime($datum);
			
			if (($lid == null) && ($vliegtuig == null))
			{
				$mt = microtime(true);
				usleep(100000);		// avoid double ID generation
				return date('ymd', $d) * 10000000 + date('His', $mt) * 10 + intval(fmod($mt,1) * 10);
			}
			else
			{
				$subid = 0;
				
				if ($vliegtuig != null) 
					$subid += 1000000 + $vliegtuig;
							  
				if ($lid != null) 
					$subid += 2000000 + $lid;
				
				return date('ymd', $d) * 10000000 + $subid; 
			}
		}
	}

	if (!function_exists('PrepareJSON'))
	{
		function PrepareJSON($t)
		{ 
			utf8_encode_array($t);
			return $t;
		}
	}

	if (!function_exists('utf8_encode_array'))
	{
		function utf8_encode_array (&$array) 
		{
			if(is_array($array)) 
			{
			  array_walk ($array, 'utf8_encode_array');
			}
			else if ($array != null)
			{
			  $array = utf8_encode($array);
			}
		}
	}
	
	if (!function_exists('CheckCIDR'))
	{
		function CheckCIDR ($IP, $CIDR) 
		{
			list ($subnet, $bits) = explode('/', $range);
			$ip = ip2long($ip);
			$subnet = ip2long($subnet);
			$mask = -1 << (32 - $bits);
			$subnet &= $mask; # nb: in case the supplied subnet wasn't correctly aligned
			return ($ip & $mask) == $subnet;
		}
	}
?>
