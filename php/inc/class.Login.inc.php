<?php
require ("inc/PasswordHash.php");

	class Login extends StartAdmin
	{
		private $_userID = null;			// Wie is er ingelogd
		
		public function __construct()
		{
			parent::__construct();
			
			if (session_status() == PHP_SESSION_NONE)
			{
				session_start(); 
				if(isset($_SESSION['login']))
				{
					$this->_userID = $_SESSION['login'];
				}			
				session_write_close();
			}			
		}
		
		function getUserFromSession()
		{
			return $this->_userID;
		}
		
		function setSessionUser($id)
		{
			if (session_status() == PHP_SESSION_NONE)
				session_start();

			$_SESSION['login']= $id;
			$this->_userID = $id;
			//session_write_close();
		}

		function getUserInfoJSON()
		{
			$this->heeftToegang();				// Dit moet erin anders is er geen sessie
			
			$l = MaakObject('Leden');
			$a = MaakObject('Aanwezig');
			
			$retValue['magSchrijven'] = $this->magSchrijven();
			$retValue['isLocal'] = $this->isLocal();
			$retValue['isSync'] = $this->isSync();
			$retValue['isBeheerderDDWV'] = $this->isBeheerderDDWV();
			$retValue['isBeheerder'] = $this->isBeheerder();
			$retValue['isStartleider'] = $this->isStartleider();
			$retValue['isInstructeur'] = $this->isInstructeur();
			$retValue['isAangemeld'] = false;
			$retValue['isClubVlieger'] = false;
			$retValue['isDDWV'] = false;
			
			$UserID = $this->getUserFromSession();
			$Userinfo = array();
			
			if (is_numeric($UserID))
			{		
				$retValue['isClubVlieger'] = $l->isClubVlieger($UserID);
				$retValue['isDDWV'] = $l->isDDWV($UserID);
				$retValue['isAangemeld'] = $a->IsAangemeldVandaag($UserID);
				
				$Userinfo = $l->getObject($UserID);				
			}		
			Debug(__FILE__, __LINE__, sprintf("urJSON=%s", print_r($retValue, true)));
			Debug(__FILE__, __LINE__, sprintf("uiJSON=%s", print_r($Userinfo, true)));
			
			$urJSON = json_encode(array_map('PrepareJSON', $retValue));
			$uiJSON = json_encode(array_map('PrepareJSON', $Userinfo));
			
			echo '{"UserRights":'.$urJSON.',"UserInfo":'. $uiJSON .'}';

		}

		function heeftToegang()
		{
			global $NoPasswordIP;
		
			$UserID = $this->getUserFromSession();
			
			if(isset($UserID))
			{
				Debug(__FILE__, __LINE__, sprintf("heeftToegang: $UserID=%s ", $UserID));
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
						$this->setSessionUser('strip');
						Debug(__FILE__, __LINE__, "strip");						
						return;
					}		
				}
				elseif (count($network) == 2)
				{
					if (CheckCIDR($_SERVER['REMOTE_ADDR'], $client))
					{
						$this->setSessionUser('strip');	
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
			Debug(__FILE__, __LINE__, sprintf("magSchrijven() UserID = %s", $this->getUserFromSession()));
		
			if ($this->isSync())
			{
				Debug(__FILE__, __LINE__, sprintf("Sync, return true"));
				return true;
			}
			
			// Op de strip hebben ze altijd schrijf rechten			
			if ($this->isLocal())
			{
				Debug(__FILE__, __LINE__, sprintf("strip, return true"));
				return true;
			}
			
			// Beheeders hebben altijd schrijf rechten
			if ($this->isBeheerder())
			{
				Debug(__FILE__, __LINE__, sprintf("%d is beheerder, return true", $this->getUserFromSession()));
				return true;
			}
		
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
					if ($this->isStartleider($datum))
						return true;				
				}
				else
				{
					Debug(__FILE__, __LINE__, sprintf("%s, Is geen DDWV dag", $datum));
				}
			}
			if ($this->isInstructeur($datum))
				return true;
			
			Debug(__FILE__, __LINE__, sprintf("%d is gewone gebruiker, return false", $this->getUserFromSession()));			
			return false;
		}
		
		function isInstructeur($datum = null)
		{
			if ($datum == null) $datum = date('Y-m-d');
			
			$di = MaakObject('Daginfo');				
			$diObj = $di->GetObject(false, $datum);

			if (isset($diObj[0]['OCHTEND_DDI']))
			{
				if ($this->getUserFromSession() == $diObj[0]['OCHTEND_DDI']) 
				{
					Debug(__FILE__, __LINE__, sprintf("%d is ochtend DDI, return true", $this->getUserFromSession() ));
					return true;
				}
			}
			if (isset($diObj[0]['MIDDAG_DDI']))
			{
				if ($this->getUserFromSession() == $diObj[0]['MIDDAG_DDI'])
				{
					Debug(__FILE__, __LINE__, sprintf("%d is middag DDI, return true", $this->getUserFromSession() ));
					return true;
				}
			}	
			if (isset($diObj[0]['OCHTEND_INSTRUCTEUR']))
			{
				if ($this->getUserFromSession() == $diObj[0]['OCHTEND_INSTRUCTEUR']) 
				{
					Debug(__FILE__, __LINE__, sprintf("%d is ochtend instructeur, return true", $this->getUserFromSession() ));
					return true;
				}
			}
			if (isset($diObj[0]['MIDDAG_INSTRUCTEUR']))
			{
				if ($this->getUserFromSession() == $diObj[0]['MIDDAG_INSTRUCTEUR'])
				{
					Debug(__FILE__, __LINE__, sprintf("%d is middag instructeur, return true", $this->getUserFromSession() ));
					return true;
				}
			}			
			
			$rooster = MaakObject('Rooster');				
			$roosterObj = $rooster->GetObject($datum);		

			if (isset($roosterObj[0]['OCHTEND_DDI']))
			{
				if ($this->getUserFromSession() == $roosterObj[0]['OCHTEND_DDI']) 
				{
					Debug(__FILE__, __LINE__, sprintf("%d is ochtend DDI, return true", $this->getUserFromSession() ));
					return true;
				}
			}
			if (isset($roosterObj[0]['MIDDAG_DDI']))
			{
				if ($this->getUserFromSession() == $roosterObj[0]['MIDDAG_DDI'])
				{
					Debug(__FILE__, __LINE__, sprintf("%d is middag DDI, return true", $this->getUserFromSession() ));
					return true;
				}
			}	
			if (isset($roosterObj[0]['OCHTEND_INSTRUCTEUR']))
			{
				if ($this->getUserFromSession() == $roosterObj[0]['OCHTEND_INSTRUCTEUR']) 
				{
					Debug(__FILE__, __LINE__, sprintf("%d is ochtend instructeur, return true", $this->getUserFromSession() ));
					return true;
				}
			}
			if (isset($roosterObj[0]['MIDDAG_INSTRUCTEUR']))
			{
				if ($this->getUserFromSession() == $roosterObj[0]['MIDDAG_INSTRUCTEUR'])
				{
					Debug(__FILE__, __LINE__, sprintf("%d is middag instructeur, return true", $this->getUserFromSession() ));
					return true;
				}
			}
			return false;
		}
		
		function isStartleider($datum = null)
		{
			if ($datum == null) $datum = date('Y-m-d');
						
			$di = MaakObject('Daginfo');				
			$diObj = $di->GetObject(false, $datum);

			if (isset($diObj[0]['OCHTEND_STARTLEIDER']))
			{
				if ($this->getUserFromSession() == $diObj[0]['OCHTEND_STARTLEIDER']) 
				{
					Debug(__FILE__, __LINE__, sprintf("%d is ochtend startleider, return true", $this->getUserFromSession() ));
					return true;
				}
			}
			if (isset($diObj[0]['MIDDAG_STARTLEIDER']))
			{
				if ($this->getUserFromSession() == $diObj[0]['MIDDAG_STARTLEIDER'])
				{
					Debug(__FILE__, __LINE__, sprintf("%d is middag startleider, return true", $this->getUserFromSession() ));
					return true;
				}
			}			
			
			$rooster = MaakObject('Rooster');				
			$roosterObj = $rooster->GetObject($datum);		

			if (isset($roosterObj[0]['OCHTEND_STARTLEIDER']))
			{
				if ($this->getUserFromSession() == $roosterObj[0]['OCHTEND_STARTLEIDER']) 
				{
					Debug(__FILE__, __LINE__, sprintf("%d is ochtend startleider, return true", $this->getUserFromSession() ));
					return true;
				}
			}
			if (isset($roosterObj[0]['MIDDAG_STARTLEIDER']))
			{
				if ($this->getUserFromSession() == $roosterObj[0]['MIDDAG_STARTLEIDER'])
				{
					Debug(__FILE__, __LINE__, sprintf("%d is middag startleider, return true", $this->getUserFromSession() ));
					return true;
				}
			}
			return false;
		}
		
		function isBeheerder()
		{		
			global $beheerders;
			
			Debug(__FILE__, __LINE__, sprintf("isBeheerder() UserID = %s", $this->getUserFromSession()));
					
			if (in_array($this->getUserFromSession(), $beheerders))
				return true;
			
			return false;
		}	
		
		function isBeheerderDDWV()
		{		
			global $beheerdersDDWV;
			
			Debug(__FILE__, __LINE__, sprintf("isBeheerderDDWV() UserID = %s", $this->getUserFromSession()));
					
			if (in_array($this->getUserFromSession(), $beheerdersDDWV))
				return true;
			
			return false;
		}	
		

		function isLocal()
		{				
			return ($this->getUserFromSession() == "strip");
		}	

		function isSync()
		{				
			return ($this->getUserFromSession() == -1);
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
			global $sa_account;
			
			Debug(__FILE__, __LINE__, sprintf("verkrijgToegang(%s, %s)", $username, "???"));
			
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
					Debug(__FILE__, __LINE__, sprintf("Toegang geweigerd, geen username bekend", $username));
					$this->toegangGeweigerd();
				}
			}

			Debug(__FILE__, __LINE__, sprintf("verkrijgToegang(%s, %s)", $username, $password));
						
			if ($username == $sync_account['username'])
			{	
				$serverkey = sha1($sync_account['password']);
								
				if ($serverkey == $password)
				{
					Debug(__FILE__, __LINE__, sprintf("Sync account = true", $username));
					$this->setSessionUser("-1");	// -1 geeft aan dat het een sync account is	
					return;
				}
				Debug(__FILE__, __LINE__, sprintf("Sync account = false", $username));
			}
			else if ($username == $sa_account['username'])
			{									
				if ($sa_account['password'] == $password)
				{
					Debug(__FILE__, __LINE__, sprintf("sa account = true", $username));
					$this->setSessionUser('strip');	
					return;
				}
				Debug(__FILE__, __LINE__, sprintf("sa account = false", $username));
			}
			else
			{
				$l = MaakObject('Leden');
				$lObj = $l->GetObjectByLoginNaam($username);
				
				if (count($lObj) > 0)
				{			
					if (($app_settings['DemoMode'] == true) && ($password == "ww"))
					{	
						Debug(__FILE__, __LINE__, sprintf("Toegang toegestaan (%s) DEMO-MODE", $username));
						$this->setSessionUser($lObj[0]['ID']);
						return;												
					}

					if ($lObj[0]['LIDTYPE_ID'] == "625")			// 625 = DDWV
					{
						$phpass = new PasswordHash(10, true);
						$ok= $phpass->CheckPassword($password, $lObj[0]['WACHTWOORD']);
						
						if($ok == true)
						{
							Debug(__FILE__, __LINE__, sprintf("Toegang toegestaan DDWV (%s)", $username));	
							$this->setSessionUser($lObj[0]['ID']);	
							return;							
						}
					}
					else
					{
						$key = sha1(strtolower ($username) . $password);
						if ($lObj[0]['WACHTWOORD'] == $key)	
						{		
							Debug(__FILE__, __LINE__, sprintf("Toegang toegestaan (%s)", $username));	
							$this->setSessionUser($lObj[0]['ID']);	
							return;
						}
					}
				}
			}
			Debug(__FILE__, __LINE__, sprintf("Toegang geweigerd (%s)", $username));
			$this->toegangGeweigerd();				
		}	
	}
?>
