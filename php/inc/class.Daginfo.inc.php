<?php

	class Daginfo extends StartAdmin
	{
		function __construct() 
		{
			parent::__construct();
			$this->dbTable = "oper_daginfo";
		}
		
		function GetObjectJSON()
		{
			Debug(__FILE__, __LINE__, "Daginfo.GetObjectJSON()");	
			
			if (array_key_exists('_:LAATSTE_AANPASSING', $this->qParams))
				echo json_encode($this->GetObject(true));
			else
				echo json_encode(array_map('PrepareJSON', $this->GetObject(false)));
		}
		
		function GetObject($laatsteAanpassing = false, $datum = null)
		{
			$currentTime = time();
			$middag = mktime(14,00,00);
			$ochtend = mktime(08,00,00);
			
			$retVal[0] = null;
			
			Debug(__FILE__, __LINE__, "Daginfo.GetObject()");	
			
			$roosterObj = MaakObject('Rooster');
			$rooster = $roosterObj->GetObject($datum);
			
			if ($datum != null)
			{
				$where = sprintf("(`DATUM` = '%s')", $datum);
				$sd = strtotime($datum);
			}
			else
			{
				if (array_key_exists('_:datum', $this->qParams))
				{
					$where = sprintf("(`DATUM` = '%s')", $this->qParams['_:datum']);
					$datum = $this->qParams['_:datum'];
					$sd = strtotime($datum);
				}
				else
				{
					$where = "(`DATUM` = CAST(NOW()AS DATE))";
					$sd = time();
				}
			}
			$query = sprintf("
				SELECT
					*
				FROM
					oper_daginfo
				WHERE %s", $where);
					
			parent::DbOpvraag($query);
			
			if (count(parent::DbData()) > 0)
			{
				$retVal = parent::DbData();
				$retVal[0]['ROOSTER'] = false;					
			}
			else
			{
				$retVal[0]['ID'] = -1;
				$retVal[0]['VELD_ID'] = "901"; // 901 = Terlet				
				$retVal[0]['ROOSTER'] = true;
				$retVal[0]['LAATSTE_AANPASSING'] = date('Y-m-d H:i:s', mktime(0,0,0));

				if (count($rooster) > 0)	 // we kunnen alleen van het rooster overnemen als er een rooster is
				{
					if (($rooster[0]['DDWV'] == '0') && ($rooster[0]['CLUB_BEDRIJF'] == '1'))
						$retVal[0]['SOORTBEDRIJF_ID'] = 701;		// alleen clubbedrijf
					if (($rooster[0]['DDWV'] == '1') && ($rooster[0]['CLUB_BEDRIJF'] == '1'))
						$retVal[0]['SOORTBEDRIJF_ID'] = 702;		// clubbedrijf + DDWV
					if (($rooster[0]['DDWV'] == '1') && ($rooster[0]['CLUB_BEDRIJF'] == '0'))
						$retVal[0]['SOORTBEDRIJF_ID'] = 703;		// alleen DDWV
				}
				else
				{
					switch(date('N', $sd))
					{
						case 1:	//ma
						case 2:	//di
						case 3:	//wo
						case 4:	//do
						case 5: //vr
						{
							$retVal[0]['SOORTBEDRIJF_ID'] = 703;
							break;
						}
/****						
						case 5: //vr
						{
							$retVal[0]['SOORTBEDRIJF_ID'] = 702;
							break;
						}
*****/
						
						case 6:	//za
						case 7: //zo
						{
							$retVal[0]['SOORTBEDRIJF_ID'] = 701;
							break;
						}
					}
				}
				
				$gps = MaakObject('GPS');
				$GPS = $gps->GPSVandaag();
				
				if (count($GPS) > 0)
				{	
					$retVal[0]['BAAN_ID'] = $GPS[0]['BAAN_ID'];
				}
			}
			//Debug(__FILE__, __LINE__, sprintf("retVal=%s", print_r($retVal, true)));

			if ($laatsteAanpassing)
			{	
				return $retVal[0]['LAATSTE_AANPASSING'];
			}
			else
			{
				$retVal[0]['DATUM'] = date("Y-m-d", $sd);
				return $retVal;
			}			
		}

		function SaveObject()
		{
			Debug(__FILE__, __LINE__, "Daginfo.SaveObject()");	
			Debug(__FILE__, __LINE__, sprintf("Data=%s", print_r($this->Data, true)));		
			
			if (!array_key_exists('ID', $this->Data))
			{
				echo '{"success":false,"errorCode":-1,"error":"Geen ID in dataset"}';
				return;
			}
			
			$v = MaakObject('Aanwezig');
			
			$d['BAAN_ID'] = $this->Data['BAAN_ID'];
			$d['WINDRICHTING_ID'] = null;
			$d['WINDKRACHT_ID'] = null;
			
			$d['OCHTEND_DDI']  			= null;
			$d['OCHTEND_INSTRUCTEUR'] 	= null;
			$d['OCHTEND_LIERIST'] 		= null;
			$d['OCHTEND_HULPLIERIST'] 	= null; 
			$d['OCHTEND_STARTLEIDER'] 	= null;
			$d['MIDDAG_DDI'] 			= null;
			$d['MIDDAG_INSTRUCTEUR'] 	= null;
			$d['MIDDAG_LIERIST']  		= null;
			$d['MIDDAG_HULPLIERIST'] 	= null; 
			$d['MIDDAG_STARTLEIDER'] 	= null;
			$d['VELD_ID'] 				= $this->Data['VELD_ID'];
			$d['BEDRIJF_ID'] 			= $this->Data['BEDRIJF_ID'];			
			$d['STARTMETHODE_ID'] 		= null;

			if (array_key_exists('DATUM', $this->Data))
			{
				$d['DATUM'] = $this->Data['DATUM'];
			}
			
			if (array_key_exists('WINDKRACHT_ID', $this->Data))
			{
				$d['WINDKRACHT_ID'] = $this->Data['WINDKRACHT_ID'];
			}
			
			if (array_key_exists('WINDRICHTING_ID', $this->Data))
			{
				$d['WINDRICHTING_ID'] = $this->Data['WINDRICHTING_ID'];
			}
			
			if (array_key_exists('OCHTEND_DDI', $this->Data))
			{
				$d['OCHTEND_DDI'] = $this->Data['OCHTEND_DDI'];
				$v->AanmeldenLidVandaag($this->Data['OCHTEND_DDI']);
			}
				
			if (array_key_exists('OCHTEND_INSTRUCTEUR', $this->Data))
			{
				$d['OCHTEND_INSTRUCTEUR'] = $this->Data['OCHTEND_INSTRUCTEUR'];
				$v->AanmeldenLidVandaag($this->Data['OCHTEND_INSTRUCTEUR']);
			}
			
			if (array_key_exists('OCHTEND_LIERIST', $this->Data))
			{
				$d['OCHTEND_LIERIST'] = $this->Data['OCHTEND_LIERIST'];
				$v->AanmeldenLidVandaag($this->Data['OCHTEND_LIERIST']);
			}
			
			if (array_key_exists('OCHTEND_HULPLIERIST', $this->Data))
			{
				$d['OCHTEND_HULPLIERIST'] = $this->Data['OCHTEND_HULPLIERIST'];
				$v->AanmeldenLidVandaag($this->Data['OCHTEND_HULPLIERIST']);
			}
			
			if (array_key_exists('OCHTEND_STARTLEIDER', $this->Data))
			{
				$d['OCHTEND_STARTLEIDER'] = $this->Data['OCHTEND_STARTLEIDER'];
				$v->AanmeldenLidVandaag($this->Data['OCHTEND_STARTLEIDER']);
			}
			
			if (array_key_exists('MIDDAG_DDI', $this->Data))
			{
				$d['MIDDAG_DDI'] = $this->Data['MIDDAG_DDI'];
				$v->AanmeldenLidVandaag($this->Data['MIDDAG_DDI']);
			}
			
			if (array_key_exists('MIDDAG_INSTRUCTEUR', $this->Data))
			{
				$d['MIDDAG_INSTRUCTEUR'] = $this->Data['MIDDAG_INSTRUCTEUR'];
				$v->AanmeldenLidVandaag($this->Data['MIDDAG_INSTRUCTEUR']);
			}
			
			if (array_key_exists('MIDDAG_LIERIST', $this->Data))
			{
				$d['MIDDAG_LIERIST'] = $this->Data['MIDDAG_LIERIST'];
				$v->AanmeldenLidVandaag($this->Data['MIDDAG_LIERIST']);
			}
			
			if (array_key_exists('MIDDAG_HULPLIERIST', $this->Data))
			{
				$d['MIDDAG_HULPLIERIST'] = $this->Data['MIDDAG_HULPLIERIST'];
				$v->AanmeldenLidVandaag($this->Data['MIDDAG_HULPLIERIST']);
			}
			
			if (array_key_exists('MIDDAG_STARTLEIDER', $this->Data))
			{
				$d['MIDDAG_STARTLEIDER'] = $this->Data['MIDDAG_STARTLEIDER'];
				$v->AanmeldenLidVandaag($this->Data['MIDDAG_STARTLEIDER']);
			}
				
			if (array_key_exists('STARTMETHODE_ID', $this->Data))
			{
				$d['STARTMETHODE_ID'] = $this->Data['STARTMETHODE_ID'];
			}
							
			$d['OPMERKINGEN'] = $this->Data['OPMERKINGEN'];
			
			if (array_key_exists('SOORTBEDRIJF_ID', $this->Data))
				$d['SOORTBEDRIJF_ID'] = $this->Data['SOORTBEDRIJF_ID'];			
			
			$id = intval($this->Data['ID']);
			if ($id < 0)
				parent::DbToevoegen('oper_daginfo', $d);
			else
				parent::DbAanpassen('oper_daginfo', $id, $d);

			echo '{"success":true,"errorCode":-1,"error":""}';
		}
	}
?>