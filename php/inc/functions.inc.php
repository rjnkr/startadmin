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
				
				error_log(sprintf("%s: %s (%d), %s\n", date("Y-m-d H:i:s"), $arrStr[0], $line, $text), 3, $app_settings['LogDir'] . "debug.txt");
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


	/// <summary>
	/// Ratcliff/Obershelp algortim
	/// </summary>
	/// <param name="A"></param>
	/// <param name="B"></param>
	/// <returns></returns>
	if (!function_exists('Match'))
	{	
		function Match($A, $B)
		{
			if (($A == null) || ($B == null))
				return 0;

			$LCS = null;
			$m = 0;

			if (strlen($A) > strlen($B))
			{
				$LCS = LongestCommonSubsequence($A, $B);
				$m = $LCS / strlen($A);
			}
			else
			{
				$LCS = LongestCommonSubsequence($B, $A);
				$m = $LCS / strlen($B);
			}

			return $m;
		}
	}

	/// <summary>
	/// Internal function to support Match Method
	/// </summary>
	/// <param name="s1"></param>
	/// <param name="s2"></param>
	/// <returns></returns>
	if (!function_exists('LongestCommonSubsequence'))
	{	
		function LongestCommonSubsequence($s1, $s2)
		{
			//if either string is empty, the length must be 0
			if (($s1 == null) || ($s2 == null))
				return 0;
			
			if (($s1 == "") || ($s2 == ""))
				return 0;

			$num = array();
			

			//Actual algorithm
			for ($i = 0; $i < strlen($s1); $i++)
			{
				for ($j = 0; $j < strlen($s2) ; $j++)
				{
					$letter1 = substr($s1, $i, 1);
					$letter2 = substr($s2, $j, 1);

					if ($letter1 == $letter2)
					{
						if (($i == 0) || ($j == 0))
							$num[$i][$j] = 1;
						else
							$num[$i][$j] = 1 + $num[$i-1][$j-1];
					}
					else
					{
						if (($i == 0) && ($j == 0))
							$num[$i][$j] = 0;
						else if (($i == 0) && !($j == 0)) //First ith element
							$num[$i][$j] = max(0, $num[$i][$j - 1]);
						else if (!($i == 0) && ($j == 0)) //First jth element
							$num[$i][$j] = max($num[$i-1][$j], 0);
						else if (!($i == 0) && !($j == 0))
							$num[$i][$j] = max($num[$i-1][$j],$num[$i][$j-1]);
					}
				}//end j
			}//end i

			return $num[strlen($s1)-1][strlen($s2)-1];
		} //end LongestCommonSubsequence
	}
?>