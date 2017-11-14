<?php
	class Flarm extends StartAdmin
	{
		function __construct() 
		{
			parent::__construct();
			$this->dbTable = "oper_flarm";
		}

		// Opslaan van een start die door flarm geregisteerd is
		function OpslaanStart()
		{
			Debug(__FILE__, __LINE__, "Flarm.OpslaanStart()");
			Debug(__FILE__, __LINE__, sprintf("Data=%s", print_r($this->Data, true)));			
			
			if (array_key_exists('VliegtuigID', $this->Data))
				$d['VLIEGTUIG_ID'] = $this->Data['VliegtuigID'];
				
			if (array_key_exists('RegCall', $this->Data))	
				$d['REG_CALL'] = $this->Data['RegCall'];
				
			if (array_key_exists('StartTijd', $this->Data))	
				$d['STARTTIJD'] = $this->Data['StartTijd'];	
				
			$d['FLARM_CODE'] = $this->Data['FlarmID'];	
			$d['DATUM'] = $this->Data['Datum'];	

			if (array_key_exists('Baan', $this->Data))
			{
				$gps = MaakObject('GPS');
				$d['BAAN_ID'] = $gps->BepaalBaan($this->Data['Baan']);
			}
					
			parent::DbToevoegen('oper_flarm', $d);
		}
		
		// Opslaan van een landing die door flarm geregisteerd is
		function OpslaanLanding()
		{
			Debug(__FILE__, __LINE__, "Flarm.OpslaanLanding()");
			Debug(__FILE__, __LINE__, sprintf("Data=%s", print_r($this->Data, true)));			
						
			if (array_key_exists('VliegtuigID', $this->Data))
				$d['VLIEGTUIG_ID'] = $this->Data['VliegtuigID'];
				
			if (array_key_exists('RegCall', $this->Data))	
				$d['REG_CALL'] = $this->Data['RegCall'];
				
			if (array_key_exists('LandingsTijd', $this->Data))	
				$d['LANDINGSTIJD'] = $this->Data['LandingsTijd'];	
				
			$d['FLARM_CODE'] = $this->Data['FlarmID'];	
			$d['DATUM'] = $this->Data['Datum'];				
			
			$id = $this->OphalenFlarmStart($d['FLARM_CODE'], $d['DATUM']);
			if ($id < 0)
				parent::DbToevoegen('oper_flarm', $d);
			else
				parent::DbAanpassen('oper_flarm', $id, $d);			
		}		
		
		// Kijk of er een open vlucht staat in de flarm lijst
		// Zo ja, return het ID van het record
		function OphalenFlarmStart($FlarmID, $Datum)
		{
			Debug(__FILE__, __LINE__, "Flarm.OphalenFlarmStart()");	
			
			$query = sprintf("
				SELECT 
					ID,
					LANDINGSTIJD 
				FROM oper_flarm 
				WHERE ((`DATUM` = '%s') AND (FLARM_CODE = '%s')) 
				ORDER BY ID DESC 
				LIMIT 0,1", $Datum, $FlarmID);
					
			parent::DbOpvraag($query);
			
			if (count(parent::DbData()) > 0)
			{
				$records = parent::DbData();
				
				if ($records[0]['LANDINGSTIJD'] == null)
					return $records[0]['ID'];
					
				return -1;
			}
			return -1;
		}
		
		// Haal de lijst met flarm starts op en return de data in JSON formaat
		function StartlijstJSON()
		{		
			Debug(__FILE__, __LINE__, "Flarm.FlarmStartlijstJSON()");	
			Debug(__FILE__, __LINE__, sprintf("Data=%s", print_r($this->Data, true)));			
			Debug(__FILE__, __LINE__, sprintf("qParams=%s", print_r($this->qParams, true)));
		
			$where = ' ';
			
			$l = MaakObject('Login');
			if (array_key_exists('_:datum', $this->qParams))
			{
				$where = sprintf("(`DATUM` = '%s')", $this->qParams['_:datum']);
			}
			else
			{
				$where = "(`DATUM` = CAST(NOW()AS DATE))";
			}
			
			// als de gebruiker niet mag schrijven, dan mag hij ook de lijst niet zien, privacy redenen
			if ($l->magSchrijven() == false)
			{
				$where = $where . sprintf(" AND (1=0)");
			}
			else
			{
				if (array_key_exists('_:query', $this->qParams))
				{
					if (strlen(trim($this->qParams['_:query'])) > 0)
					{
						$where = $where . " AND (REG_CALL LIKE ('%%" . trim($this->qParams['_:query']) . "%%') ";
						$where = $where . " OR FLARM_CODE LIKE ('%%" . trim($this->qParams['_:query']) . "%%') ";
						$where = $where . ")";
					}
				}
			}
			
			$orderby = " ORDER BY ID";
			if ((array_key_exists('sort', $this->Data)) && (array_key_exists('dir', $this->Data)))
			{
				$orderby = sprintf(" ORDER BY %s %s, ID ", $this->Data['sort'], $this->Data['dir']);
			}
				
			
			$query = "
				SELECT
					%s 
				FROM
					flarm_view
				WHERE
					" . $where . $orderby;
			
			parent::DbOpvraag(sprintf($query, "COUNT(*) AS total"));
			$total = parent::DbData();		// total amount of records in the database
			
			$limit = "";
			if (array_key_exists('limit', $this->Data))
			{
				$limit = sprintf(" LIMIT %d , %d ", $this->Data['start'], $this->Data['limit']);
			}			
			$rquery = sprintf($query, "*") . $limit;
			parent::DbOpvraag($rquery);			
			
			Debug(__FILE__, __LINE__, sprintf("Data=%s", print_r(parent::DbData(), true)));	
			echo '({"total":"'.$total[0]['total'].'","results":'.json_encode(array_map('PrepareJSON', parent::DbData())).'})';
					
		}

		// Pas het Flarm ID aan in het vliegtuig record
		function UpdateFlarmCode()
		{
			Debug(__FILE__, __LINE__, "Flarm.UpdateFlarmCode()");	
			Debug(__FILE__, __LINE__, sprintf("Data=%s", print_r($this->Data, true)));		
			
			$v = MaakObject('Vliegtuigen');
			
			// verwijderen oude informatie
			if (is_numeric($this->Data['VLIEGTUIG_ID']) == true)
			{
				$aircraft = $v->GetObject($this->Data['VLIEGTUIG_ID']);
				$vliegtuig = $aircraft[0];
				unset($vliegtuig['LAATSTE_AANPASSING']);
				$vliegtuig['FLARM_CODE'] = null;
				$v->SaveObject($vliegtuig);
				
				if (array_key_exists('DATUM', $this->Data))
				{
					$where = sprintf("(`DATUM` >= '%s')", $this->Data['DATUM']);
				}
				else
				{
					$where = "(`DATUM` = CAST(NOW()AS DATE))";
				}	
				$query = sprintf("UPDATE oper_flarm set VLIEGTUIG_ID=null, REG_CALL=null WHERE FLARM_CODE = '%s' AND %s", $this->Data['FLARM_CODE'], $where);	
				parent::DbUitvoeren($query);
						
			}
			
			// toekennen nieuwe informatie
			if (is_numeric($this->Data['NIEUW_VLIEGTUIG_ID']) == true)
			{
				$aircraft = $v->GetObject($this->Data['NIEUW_VLIEGTUIG_ID']);
				$vliegtuig = $aircraft[0];
				unset($vliegtuig['LAATSTE_AANPASSING']);
				$vliegtuig['FLARM_CODE'] = $this->Data['FLARM_CODE'];
				$v->SaveObject($vliegtuig);
				
				if (array_key_exists('DATUM', $this->Data))
				{
					$where = sprintf("(`DATUM` >= '%s')", $this->Data['DATUM']);
				}
				else
				{
					$where = "(`DATUM` = CAST(NOW()AS DATE))";
				}	
				$query = sprintf("UPDATE oper_flarm set VLIEGTUIG_ID='%d', REG_CALL=RegCall(%d) WHERE FLARM_CODE = '%s' AND %s", 
					$this->Data['NIEUW_VLIEGTUIG_ID'], 
					$this->Data['NIEUW_VLIEGTUIG_ID'], 
					$this->Data['FLARM_CODE'], $where);
									
				parent::DbUitvoeren($query);					
			}
		}

		// Haal de posities van flarm op uit de sync applicatie. De sync applicatie heeft de actuele posities in het geheugen
		// en kan via een URL ondervraagd worden, eigenlijk wordt het verzoek 1 op 1 doorgestuurd, net zoals het antwoord
		function FlarmPosities()
		{
			global $app_settings;
			
			if (isset($app_settings['statusUrl']))
			{
				if (array_key_exists('Push', $this->Data))
					$push = $this->Data["Push"];
				else
					$push = "false";
					
				$url = sprintf("%s/FlarmPosities?Onderdruk=%s&Push=%s", $app_settings['statusUrl'], $this->Data['Onderdruk'], $push);
					
				$retval = file_get_contents($url);
				echo $retval;
			}
			else
			{
				echo "??";
			}			
		}		
	}
?>