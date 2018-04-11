<?php
	class Login extends StartAdmin
	{
		function heeftToegang()
		{
			global $NoPasswordIP;
				
			session_start(); 
			session_write_close();

			if(isset($_SESSION['login']))
			{
				return;
			}
			
			if (is_array($NoPasswordIP))
				$ClientsWithoutPassword = $NoPasswordIP;
			else
				$ClientsWithoutPassword = array ($NoPasswordIP);
				
			
			foreach ($ClientsWithoutPassword as $client)
			{
				Debug(__FILE__, __LINE__, sprintf("heeftToegang: Allow=%s  RemoteIP=%s", $client, $_SERVER['REMOTE_ADDR']));
				
				$network = explode('/', $client);
				
				if (count($network) == 1)
				{
					if ($_SERVER['REMOTE_ADDR'] == $client)
					{
						$_SESSION['login'] = 'strip';
						Debug(__FILE__, __LINE__, "strip");						
						return;
					}		
				}
				elseif (count($network) == 2)
				{
					if (CheckCIDR($_SERVER['REMOTE_ADDR'], $client))
					{
						$_SESSION['login'] = 'strip';	
						Debug(__FILE__, __LINE__, "2/strip");	
						return;						
					}						
				}
				else
				{
					Debug(__FILE__, __LINE__, "Config error, NoPasswordIP");
					error_log("Config error, NoPasswordIP");
				}
			}

			// Check username and password (basic authentication)
			if (isset($_SERVER['PHP_AUTH_USER']) && isset($_SERVER['PHP_AUTH_PW']))
			{ 
				$this->verkrijgToegang ($_SERVER['PHP_AUTH_USER'], $_SERVER['PHP_AUTH_PW']);
				return;
			}
			$this->toegangGeweigerd();		
		}
		
	
		function magSchrijven()
		{		
			Debug(__FILE__, __LINE__, sprintf("magSchrijven() SESSION['login'] = %s", $_SESSION['login']));
		
			if ($this->isSync())
			{
				Debug(__FILE__, __LINE__, sprintf("Sync, return true"));
				return true;
			}
			
			// Op de strip hebben ze altijd schrijf rechten			
			if ($_SESSION['login'] == 'strip')
			{
				Debug(__FILE__, __LINE__, sprintf("strip, return true"));
				return true;
			}
			
			// Beheeders hebben altijd schrijf rechten
			if ($this->isBeheerder())
			{
				Debug(__FILE__, __LINE__, sprintf("%d is beheerder, return true", $_SESSION['login']));
				return true;
			}
		
			// we beperken hoe lang historie beschikbaar is
			if (array_key_exists('_:datum', $this->qParams))
				$datum = $this->qParams['_:datum'];
			else
				$datum = date('Y-m-d');
		
			$di = MaakObject('Daginfo');				
			$diObj = $di->GetObject(false, $datum);
			
			$rooster = MaakObject('Rooster');				
			$roosterObj = $rooster->GetObject($datum);

			if (isset($diObj[0]['SOORTBEDRIJF_ID']))
			{
				if (($diObj[0]['SOORTBEDRIJF_ID'] == 702) || ($diObj[0]['SOORTBEDRIJF_ID'] == 703))		// 702 DDWV + club, 703=DDWV
				{
					Debug(__FILE__, __LINE__, sprintf("%s, Is wel DDWV dag", $datum ));
				
					// DDWV beheerder heeft alleen schrijf rechten op een DDWV dag
					if ($this->isBeheerderDDWV())
					{
						Debug(__FILE__, __LINE__, sprintf("Is DDWV beheerder, return true"));
						return true;
					}
					
					// Op een DDV dag mag de startleider schrijven in de database
					if (isset($roosterObj[0]['OCHTEND_STARTLEIDER']))
					{
						if ($_SESSION['login'] == $roosterObj[0]['OCHTEND_STARTLEIDER']) 
						{
							Debug(__FILE__, __LINE__, sprintf("%d is ochtend startleider, return true", $_SESSION['login'] ));
							return true;
						}
					}
					if (isset($roosterObj[0]['MIDDAG_STARTLEIDER']))
					{
						if ($_SESSION['login'] == $roosterObj[0]['MIDDAG_STARTLEIDER'])
						{
							Debug(__FILE__, __LINE__, sprintf("%d is middag startleider, return true", $_SESSION['login'] ));
							return true;
						}
					}					
				}
				else
				{
					Debug(__FILE__, __LINE__, sprintf("%s, Is geen DDWV dag", $datum));
				}
			}
			if (isset($roosterObj[0]['OCHTEND_DDI']))
			{
				if ($_SESSION['login'] == $roosterObj[0]['OCHTEND_DDI']) 
				{
					Debug(__FILE__, __LINE__, sprintf("%d is ochtend DDI, return true", $_SESSION['login'] ));
					return true;
				}
			}
			if (isset($roosterObj[0]['MIDDAG_DDI']))
			{
				if ($_SESSION['login'] == $roosterObj[0]['MIDDAG_DDI'])
				{
					Debug(__FILE__, __LINE__, sprintf("%d is middag DDI, return true", $_SESSION['login'] ));
					return true;
				}
			}	
			if (isset($roosterObj[0]['OCHTEND_INSTRUCTEUR']))
			{
				if ($_SESSION['login'] == $roosterObj[0]['OCHTEND_INSTRUCTEUR']) 
				{
					Debug(__FILE__, __LINE__, sprintf("%d is ochtend instructeur, return true", $_SESSION['login'] ));
					return true;
				}
			}
			if (isset($roosterObj[0]['MIDDAG_INSTRUCTEUR']))
			{
				if ($_SESSION['login'] == $roosterObj[0]['MIDDAG_INSTRUCTEUR'])
				{
					Debug(__FILE__, __LINE__, sprintf("%d is middag instructeur, return true", $_SESSION['login'] ));
					return true;
				}
			}
			Debug(__FILE__, __LINE__, sprintf("%d is gewone gebruiker, return false", $_SESSION['login'] ));			
			return false;
		}
		
		function isBeheerder()
		{		
			global $beheerders;
			
			Debug(__FILE__, __LINE__, sprintf("isBeheerder() SESSION['login'] = %s", $_SESSION['login']));
					
			if (in_array($_SESSION['login'], $beheerders))
				return true;
			
			return false;
		}	
		
		function isBeheerderDDWV()
		{		
			global $beheerdersDDWV;
			
			Debug(__FILE__, __LINE__, sprintf("isBeheerderDDWV() SESSION['login'] = %s", $_SESSION['login']));
					
			if (in_array($_SESSION['login'], $beheerdersDDWV))
				return true;
			
			return false;
		}	
		

		function isLocal()
		{				
			return ($_SESSION['login'] == "strip");
		}	

		function isSync()
		{				
			return ($_SESSION['login'] == -1);
		}			
		
		function toegangGeweigerd()
		{
			header('HTTP/1.0 401 Unauthorized');
			exit;
		}
		
		function verkrijgToegang($username=null, $password=null)
		{		
			global $app_settings;
			global $sync_account;
			
			Debug(__FILE__, __LINE__, sprintf("verkrijgToegang(%s, %s)", $username, "????"));
			
			if (($username == null) || ($password == null))
			{
				if ((array_key_exists('USERNAME', $this->Data)) && (array_key_exists('PASSWORD', $this->Data)))
				{
					$username = $this->Data['USERNAME'];
					$password = $this->Data['PASSWORD'];
					
					Debug(__FILE__, __LINE__, sprintf("username = %s", $username));
				}
				else
				{
					$this->toegangGeweigerd();
				}
			}
						
			if ($username == $sync_account['username'])
			{	
				$serverkey = sha1($sync_account['password']);
								
				if ($serverkey == $password)
				{
					session_start(); 
					$_SESSION['login'] = -1;		// -1 geeft aan dat het een sync account is		
					return;						
				}
			}
			else
			{
				$l = MaakObject('Leden');
				$lObj = $l->GetObjectByLoginNaam($username);
				
				if (count($lObj) > 0)
				{			
					if (($app_settings['DemoMode'] == true) && ($password == "ww"))
					{
						session_start(); 
						$_SESSION['login'] = $lObj[0]['ID'];						
						return;											
					}

					$key = sha1(strtolower ($username) . $password);
					if ($lObj[0]['WACHTWOORD'] == $key)	
					{
						session_start(); 
						$_SESSION['login'] = $lObj[0]['ID'];						
						return;						
					}
				}
			}
			
			$this->toegangGeweigerd();				
		}	
	}
?>
