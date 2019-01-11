<?php

	class Vliegtuigen extends StartAdmin
	{
		function __construct() 
		{
			parent::__construct();
			$this->dbTable = "ref_vliegtuigen";
		}
		
		function GetObject($ID)
		{
			Debug(__FILE__, __LINE__, sprintf("Vliegtuigen.GetObject(%s)", $ID));	

			$query = sprintf("
				SELECT
					*
				FROM
					ref_vliegtuigen
				WHERE
					ID = '%d'", $ID);
					
			parent::DbOpvraag($query);
			return parent::DbData();
		}
	
		
		function GetObjectsCompleteJSON()
		{
			Debug(__FILE__, __LINE__, "Vliegtuigen.GetObjectsCompleteJSON()");	
			Debug(__FILE__, __LINE__, sprintf("Data=%s", print_r($this->Data, true)));	
			Debug(__FILE__, __LINE__, sprintf("qParams=%s", print_r($this->qParams, true)));	
			
			$where = ' WHERE 1=1';
			
			if (array_key_exists('_:verwijderMode', $this->qParams))
			{
				$l = MaakObject('Login');
				if ($l->isBeheerder() == false)
				{
					if ($this->qParams['_:verwijderMode'] == 'true')
						$where = $where ." AND CLUBKIST='false'";
				}					
			}	
			
			if (array_key_exists('_:query', $this->qParams))
			{
				if (strlen(trim($this->qParams['_:query'])) > 0)
				{
					$where = $where . " AND ((REGISTRATIE LIKE ('%%" . trim($this->qParams['_:query']) . "%%')) ";
					$where = $where . "  OR (CALLSIGN LIKE ('%%" . trim($this->qParams['_:query']) . "%%'))) ";
				}
			}
			if (array_key_exists('_:clubkist', $this->qParams))
			{
				if ($this->qParams['_:clubkist'] == 'true')
					$where = $where . " AND CLUBKIST='" . $this->qParams['_:clubkist'] . "'";
			}
			if (array_key_exists('_:flarm', $this->qParams))
			{
				$where = $where . " AND FLARM_CODE IS NOT NULL";
			}			

			$orderby = " ORDER BY CLUBKIST DESC, REGISTRATIE";
			if ((array_key_exists('sort', $this->Data)) && (array_key_exists('dir', $this->Data)))
			{
				$orderby = sprintf(" ORDER BY %s %s ", $this->Data['sort'], $this->Data['dir']);
			}	
			
			$query = "
				SELECT 
					%s
				FROM
					`vliegtuigenlijst_view`" . $where . $orderby;
			
			if (array_key_exists('_:LAATSTE_AANPASSING', $this->qParams))
			{
				$query  = sprintf($query, "MAX(LAATSTE_AANPASSING) AS LAATSTE_AANPASSING");
				$la = $this->LaatsteAanpassing($query);
				Debug(__FILE__, __LINE__, sprintf("LAATSTE_AANPASSING=%s", $la));	
				echo $la;
			}
			else
			{			
				$rquery = sprintf($query, "COUNT(*) AS total");
				parent::DbOpvraag($rquery);
				$total = parent::DbData();		// total amount of records in the database
				
				$limit = "";
				if (array_key_exists('limit', $this->Data))
				{
					$limit = sprintf(" LIMIT %d , %d ", $this->Data['start'], $this->Data['limit']);
				}			
				$rquery = sprintf($query, "*") . $limit;
				parent::DbOpvraag($rquery);
				
				if (array_key_exists('_:flarm', $this->qParams))
					echo json_encode(array_map('PrepareJSON', parent::DbData()));
				else			
					echo '{"total":"'.$total[0]['total'].'","results":'.json_encode(array_map('PrepareJSON', parent::DbData())).'}';
			}
		}	
		
	    // De lijst met sleepkisten welke gekozen kunnen worden
		function SleepKistenJSON()
		{
			Debug(__FILE__, __LINE__, "Vliegtuigen.SleepKistenJSON()");
			Debug(__FILE__, __LINE__, sprintf("qParams=%s", print_r($this->qParams, true)));			

			$query = "SELECT %s FROM invoer_vliegtuigen_view WHERE SLEEPKIST=1 ORDER BY AANWEZIG DESC, CLUBKIST DESC, REG_CALL DESC";
			
			if (array_key_exists('_:LAATSTE_AANPASSING', $this->qParams))
			{
				$query  = sprintf($query, "MAX(LAATSTE_AANPASSING) AS LAATSTE_AANPASSING");
				$la = $this->LaatsteAanpassing($query);
				Debug(__FILE__, __LINE__, sprintf("LAATSTE_AANPASSING=%s", $la));	
				echo $la;
			}
			else
			{
				parent::DbOpvraag(sprintf($query, "*"));
				
				Debug(__FILE__, __LINE__, sprintf("Data=%s", print_r(parent::DbData(), true)));
				echo json_encode(array_map('PrepareJSON', parent::DbData()));
			}
		}
		
		// Lijst met alle clubkisten
		function GetClubkistenJSON()
		{
			Debug(__FILE__, __LINE__, "Vliegtuigen.GetObjectsCompleteJSON()");	
			Debug(__FILE__, __LINE__, sprintf("Data=%s", print_r($this->Data, true)));	
			Debug(__FILE__, __LINE__, sprintf("qParams=%s", print_r($this->qParams, true)));	
			
			$where = " WHERE VERWIJDERD=0 AND CLUBKIST='1'";			
			$orderby = " ORDER BY VOLGORDE";
			
			$query = "
				SELECT 
					%s
				FROM
					`ref_vliegtuigen`" . $where . $orderby;
			
			if (array_key_exists('_:LAATSTE_AANPASSING', $this->qParams))
			{
				$query  = sprintf($query, "MAX(LAATSTE_AANPASSING) AS LAATSTE_AANPASSING");
				$la = $this->LaatsteAanpassing($query);
				Debug(__FILE__, __LINE__, sprintf("LAATSTE_AANPASSING=%s", $la));	
				echo $la;
			}
			else
			{	
				parent::DbOpvraag("select `v`.`TYPE_ID` AS `TYPE_ID`,`t`.`OMSCHRIJVING` AS `VLIEGTUIGTYPE` from (`ref_vliegtuigen` `v` left join `types` `t` on((`v`.`TYPE_ID` = `t`.`ID`))) where (`v`.`VERWIJDERD` = 0) AND (`v`.`CLUBKIST` = 1) AND `v`.`TYPE_ID` IS NOT NULL GROUP BY `VLIEGTUIGTYPE` ORDER BY `t`.`SORTEER_VOLGORDE`");
				$types = parent::DbData();
				
				$rquery = sprintf($query, "COUNT(*) AS total");
				parent::DbOpvraag($rquery);
				$total = parent::DbData();		// total amount of records in the database
							
				$rquery = sprintf($query, "`ID`,`REGISTRATIE`,`CALLSIGN`,`RegCall`(`ID`) AS `REGCALL`, `LAATSTE_AANPASSING`");
				parent::DbOpvraag($rquery);
				
				if (array_key_exists('_:flarm', $this->qParams))
					echo json_encode(array_map('PrepareJSON', parent::DbData()));
				else			
					echo '{"total":"'.$total[0]['total'].'", "types":'.json_encode(array_map('PrepareJSON', $types)).',"results":'.json_encode(array_map('PrepareJSON', parent::DbData())).'}';
			}
		}	

		function VerwijderObject()
		{
			Debug(__FILE__, __LINE__, "Vliegtuigen.VerwijderObject()");
			Debug(__FILE__, __LINE__, sprintf("Data=%s", print_r($this->Data, true)));				
			
			$l = MaakObject('Login');
			if ($l->magSchrijven() == false)
			{	
				Debug(__FILE__, __LINE__, "Geen schrijfrechten");
				$l->toegangGeweigerd();
			}
			
			if (!array_key_exists('ID', $this->Data))
			{
				echo '{"success":false,"errorCode":-1,"error":"Geen ID in dataset"}';
				return;
			}

			$d['VERWIJDERD'] = 1;		
			$id = intval($this->Data['ID']);

			parent::DbAanpassen('ref_vliegtuigen', $id, $d);

			echo '{"success":true,"errorCode":-1,"error":""}';
		}		
		
		function SaveObject($VliegtuigData = null)
		{
			Debug(__FILE__, __LINE__, "Vliegtuigen.SaveObject()");
			Debug(__FILE__, __LINE__, sprintf("Data=%s", print_r($this->Data, true)));				
			Debug(__FILE__, __LINE__, sprintf("VliegtuigData=%s", print_r($VliegtuigData, true)));	
			
			$l = MaakObject('Login');
			if ($l->magSchrijven() == false)
			{	
				Debug(__FILE__, __LINE__, "Geen schrijfrechten");
				$l->toegangGeweigerd();
			}
			
			if ($VliegtuigData == null)
				$VliegtuigData = $this->Data;
			
			if (!array_key_exists('ID', $VliegtuigData))
			{
				echo '{"success":false,"errorCode":-1,"error":"Geen ID in dataset"}';
				return;
			}
			
			$query = sprintf("
				SELECT
					*
				FROM
					ref_vliegtuigen
				WHERE
					REGISTRATIE = '%s' AND VERWIJDERD =0 AND ID != %d", $VliegtuigData['REGISTRATIE'], $VliegtuigData['ID']);
					
			parent::DbOpvraag($query);
			if (count(parent::DbData()) > 0)
			{
				echo '{"success":false,"errorCode":-2,"error":"Vliegtuig registratie bestaat al."}';
				return;
			}

			$d['REGISTRATIE'] 	= $VliegtuigData['REGISTRATIE']; 
			$d['ZITPLAATSEN'] 	= $VliegtuigData['ZITPLAATSEN']; 
			$d['ZELFSTART'] 	= 0;	
			$d['CLUBKIST'] 		= 0;	
			$d['TMG'] 			= 0; 	
			$d['SLEEPKIST'] 	= 0;				
			$d['CALLSIGN'] 		= null;
			$d['FLARM_CODE'] 	= null;
			$d['TYPE_ID'] 		= null;

			if (array_key_exists('ZELFSTART', $VliegtuigData))
				$d['ZELFSTART'] = $VliegtuigData['ZELFSTART']; 

			if (array_key_exists('SLEEPKIST', $VliegtuigData))
				$d['SLEEPKIST'] = $VliegtuigData['SLEEPKIST']; 

			if (array_key_exists('CLUBKIST', $VliegtuigData))
				$d['CLUBKIST'] = $VliegtuigData['CLUBKIST']; 

			if (array_key_exists('TMG', $VliegtuigData))
				$d['TMG'] = $VliegtuigData['TMG'];

			if (array_key_exists('FLARM_CODE', $VliegtuigData))
				$d['FLARM_CODE'] = $VliegtuigData['FLARM_CODE'];

			if (array_key_exists('CALLSIGN', $VliegtuigData))
				$d['CALLSIGN'] = $VliegtuigData['CALLSIGN'];
	
			if (array_key_exists('TYPE_ID', $VliegtuigData))
				$d['TYPE_ID'] = $VliegtuigData['TYPE_ID'];
					
			$id = intval($VliegtuigData['ID']);
			if ($id < 0)
			{							
				$id = parent::DbToevoegen('ref_vliegtuigen', $d);
				Debug(__FILE__, __LINE__, sprintf("vliegtuig toegevoegd id=%d", $id));
			}
			else
			{
				parent::DbAanpassen('ref_vliegtuigen', $id, $d);
			}

			echo sprintf('{"success":true,"errorCode":-1,"error":"","ID":%d}',$id);
		}
	}
?>