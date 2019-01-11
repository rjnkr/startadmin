<?php
	class Aanwezig extends StartAdmin
	{
		// Constructor
		function __construct() 
		{
			parent::__construct();
			$this->dbTable = "oper_aanwezig";
		}
		
		// ------------------------------------------------------------------
		// Haal een lijst op vanuit de vliegtuigen die vandaag aanwezig zijn/waren
		//
		// @param vanuit GET of POST
		//		_:LAATSTE_AANPASSING= toon wanneer laatste aanpassing geweest is (geen JSON string), slimladen 
		// 		_:aanwezig 			= 'true', alleen die vliegtuigen die nog aanwezig zijn
		//		_:query 			= filter op waarde (registratie - callsign)
		//		_:clubkist 			= 'true', toon alleen clubkisten
		//		sort 				= veldnaam waarop gesorteerd moet worden
		//		dir 				= sorteer richting (DESCR - ASC)
		//		limit				= aantal records
		//		start				= eerste record
		//
		// @return 
		//		Json string
		// 
		// @example	
		// 	{
		// 		"total": "2",
		// 		"results": [{
		// 			"ID": "1703281000458",
		// 			"VLIEGTUIG_ID": "458",
		// 			"REGISTRATIE": "D-1045",
		// 			"CALLSIGN": "A-3",
		// 			"ZITPLAATSEN": "1",
		// 			"CLUBKIST": "false",
		// 			"VLIEGTUIGTYPE": null,
		// 			"AANKOMST": "20:52",
		// 			"VERTREK": null,
		// 			"LAATSTE_AANPASSING": "2017-03-28 20:52:20"
		// 		}, {
		// 			"ID": "1703281000252",
		// 			"VLIEGTUIG_ID": "252",
		// 			"REGISTRATIE": "PH-794",
		// 			"CALLSIGN": "E10",
		// 			"ZITPLAATSEN": "1",
		// 			"CLUBKIST": "true",
		// 			"VLIEGTUIGTYPE": "LS 4",
		// 			"AANKOMST": "21:06",
		// 			"VERTREK": null,
		// 			"LAATSTE_AANPASSING": "2017-03-28 21:06:54"
		// 		}]
		// 	} 
 		// 
		function VliegtuigenAanwezigJSON()
		{
			Debug(__FILE__, __LINE__, "Aanwezig.VliegtuigenAanwezigJSON()");	
			Debug(__FILE__, __LINE__, sprintf("Data=%s", print_r($this->Data, true)));	
			Debug(__FILE__, __LINE__, sprintf("qParams=%s", print_r($this->qParams, true)));
			
			$where = ' WHERE 1=1';
			if (array_key_exists('_:aanwezig', $this->qParams))
			{
				if ($this->qParams['_:aanwezig'] == 'true')
					$where = $where . " AND VERTREK IS NULL ";
			}	
			
			if (array_key_exists('_:query', $this->qParams))
			{
				if (strlen(trim($this->qParams['_:query'])) > 0)
				{
					$where = $where . " AND (REGISTRATIE LIKE ('%%" . trim($this->qParams['_:query']) . "%%') ";
					$where = $where . " OR CALLSIGN LIKE ('%%" . trim($this->qParams['_:query']) . "%%') ";
					$where = $where . ")";
				}
			}	
			if (array_key_exists('_:clubkist', $this->qParams))
			{
				if ($this->qParams['_:clubkist'] == 'true')
					$where = $where . " AND CLUBKIST='" . $this->qParams['_:clubkist'] . "'";
			}
						
			$orderby = " ORDER BY CALLSIGN";
			if ((array_key_exists('sort', $this->Data)) && (array_key_exists('dir', $this->Data)))
			{
				$orderby = sprintf(" ORDER BY %s %s ", $this->Data['sort'], $this->Data['dir']);
			}	
			
			$query = "
				SELECT 
					%s
				FROM
					vliegtuigenaanwezig_view" . $where . $orderby;

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
				Debug(__FILE__, __LINE__, sprintf("Data=%s", print_r(parent::DbData(), true)));
				echo '{"total":"'.$total[0]['total'].'","results":'.json_encode(array_map('PrepareJSON', parent::DbData())).'}';
			}
		}

		
		// ------------------------------------------------------------------
		// Haal een lijst op vanuit de leden die vandaag aanwezig zijn/waren
		//
		// @param vanuit GET of POST
		//		_:LAATSTE_AANPASSING= toon wanneer laatste aanpassing geweest is (geen JSON string), slimladen 
		// 		_:aanwezig 			= 'true', alleen die vliegtuigen die nog aanwezig zijn
		//		_:query 			= filter op naam
		//		_:leden				= Toon alleen echte leden (ere leden / jeugd / lid)
		//		_:instructeurs		= 'true', toon alleen instructeurs
		//		_:lieristen			= 'true', toon alleen lieristen
		// 		_:startleiders		= 'true', toon alleen startleiders
		//		_:lid_id			= alleen de data voor een specifiek lid (database id)
		//		sort 				= veldnaam waarop gesorteerd moet worden
		//		dir 				= sorteer richting (DESCR - ASC)
		//		limit				= aantal records
		//		start				= eerste record
		//
		// @return 
		//		Json string
		// 			ID				= ID uit oper_aanwezig tabel
		// 			LID_ID			= Database ID van het Lid
		// 			NAAM			= Naam van het lid
		// 			LIDTYPE_ID		= Wat voor type lid is het
		// 			VOORKEUR_VLIEGTUIG_TYPE	= Op welk vliegtuig types wil het lid vliegen. Comma Separated waardes uit types tabel
		// 			VOORKEUR_VLIEGTUIG_ID	= Op welk specifiek vliegtuig wil dit vliegen (overland). Verwijzing naar ref_vliegtuigen
		// 			VOORKEUR_TYPE			= Voorkeur types uitgeschreven vanuit types tabel
		// 			VOORKEUR_REGCALL		= Regsitratie van specifiek voorkeursvliegtuig
		// 			ACTUELE_VLIEGTIJD		= Hoe lang is de huidige vlucht
		// 			AANKOMST				= Hoe laat is dit lid vandaag aangekomen
		// 			VERTREK					= Afmeld tijd voor vandaag
		// 			INSTRUCTEUR				= Heeft het lid instructie bevoegdheid
		// 			AANWEZIG				= Is het lid momenteel nog aanwezig
		//			VOLGENDE_CALLSIGN		= Het callsign van de eerste komende vlucht = m.a.w. eerst komende vliucht zonder STARTTIJD
		// 			OPMERKING				= Opmerking uit aanwezig
		// 			LAATSTE_AANPASSING		= Laatste aanpassing uit oper_aanwezig 
		// 
		// @example	
		// 	{
		// 		"total": "2",
		// 		"results": [{
		// 			"ID": "1703282010118",
		// 			"LID_ID": "10118",
		// 			"NAAM": "Piet Pieters",
		// 			"LIDTYPE_ID": "606",
		// 			"VOORKEUR_VLIEGTUIG_TYPE": "406,405",
		// 			"VOORKEUR_VLIEGTUIG_ID": null,
		// 			"VOORKEUR_TYPE": "Duo,ASK21",
		// 			"VOORKEUR_REGCALL": null,
		// 			"ACTUELE_VLIEGTIJD": null,
		// 			"AANKOMST": "19:58",
		// 			"VERTREK": null,
		// 			"INSTRUCTEUR": "0",
		// 			"AANWEZIG": "true",
		// 			"OPMERKING": null,
		// 			"LAATSTE_AANPASSING": "2017-03-28 20:58:54"
		// 		}, {
		// 			"ID": "1703282010855",
		// 			"LID_ID": "10855",
		// 			"NAAM": "Aldo Janssen",
		// 			"LIDTYPE_ID": "602",
		// 			"VOORKEUR_VLIEGTUIG_TYPE": "406,402",
		// 			"VOORKEUR_VLIEGTUIG_ID": null,
		// 			"VOORKEUR_TYPE": "LS4,ASK21",
		// 			"VOORKEUR_REGCALL": null,
		// 			"ACTUELE_VLIEGTIJD": "02:25",
		// 			"AANKOMST": "11:19",
		// 			"VERTREK": null,
		// 			"INSTRUCTEUR": "0",
		// 			"AANWEZIG": "true",
		// 			"OPMERKING": null,
		// 			"LAATSTE_AANPASSING": "2017-03-28 21:22:59"
		// 		}]
		// 	}
  		// 
		function LedenAanwezigJSON()
		{
			Debug(__FILE__, __LINE__, "Aanwezig.LedenAanwezigJSON()");	
			Debug(__FILE__, __LINE__, sprintf("Data=%s", print_r($this->Data, true)));	
			Debug(__FILE__, __LINE__, sprintf("qParams=%s", print_r($this->qParams, true)));
			
			$where = ' WHERE 1=1';
			if (array_key_exists('_:aanwezig', $this->qParams))
			{
				if ($this->qParams['_:aanwezig'] == 'true')
					$where = " WHERE VERTREK IS NULL ";
			}	
						
			if (array_key_exists('_:query', $this->qParams))
			{
				if (strlen(trim($this->qParams['_:query'])) > 0)
					$where = $where . " AND NAAM LIKE ('%%" . trim($this->qParams['_:query']) . "%%') ";
			}
			if (array_key_exists('_:leden', $this->qParams))
			{
				if ($this->qParams['_:leden'] == 'true')
				{
					// 601 = Erelid, 602 = lid, 603 = jeugdlid, 606 = donateur
					$where = $where ." AND LIDTYPE_ID IN (601, 602, 603, 606)";
				}
			}
			
			if (array_key_exists('_:instructeurs', $this->Data))
			{
				if ($this->Data['_:instructeurs'] == 'true')
					$where = $where . " AND INSTRUCTEUR='1'";
			}
			if (array_key_exists('_:lieristen', $this->Data))
			{
				if ($this->Data['_:lieristen'] == 'true')
					$where = $where ." AND LIERIST='1'";
			}
			if (array_key_exists('_:startleiders', $this->Data))
			{
				if ($this->Data['_:startleiders'] == 'true')
					$where = $where . " AND STARTLEIDER='1'";
			}

			if (array_key_exists('_:lid_id', $this->Data))
			{
				$where = $where . sprintf (" AND LID_ID=%s", $this->qParams['_:lid_id']);
			}
						
			$orderby = " ORDER BY NAAM";
			if ((array_key_exists('sort', $this->Data)) && (array_key_exists('dir', $this->Data)))
			{
				$orderby = sprintf(" ORDER BY %s %s ", $this->Data['sort'], $this->Data['dir']);
			}
			
			$query = "
				SELECT 
					%s
				FROM
					ledenaanwezig_view" . $where;
					
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
				$rquery = sprintf($query, "*");
				parent::DbOpvraag($rquery  . $orderby . $limit);
				Debug(__FILE__, __LINE__, sprintf("Data=%s", print_r(parent::DbData(), true)));
				echo '{"total":"'.$total[0]['total'].'","results":'.json_encode(array_map('PrepareJSON', parent::DbData())).'}';
			}
		}
		
		// deze functie wordt aangeroepen vanuit GeZCsync om de aanmeldingen van DDWV door te zetten naar de sa.
		function AanmeldenViaDDWV()
		{
			Debug(__FILE__, __LINE__, sprintf("Aanwezig.AanmeldenViaDDWV()"));
			Debug(__FILE__, __LINE__, sprintf("Data=%s", print_r($this->Data, true)));	
		
			if (!array_key_exists('GEZC_ID', $this->Data))
			{
				echo '{"success":false,"errorCode":-1,"error":"Geen GEZC_ID in dataset"}';
				return;
			}
			
			$l = MaakObject('Leden');
			$lid = $l->GetObjectByLidNr($this->Data["GEZC_ID"]);
			
			if (count($lid) == 0)
			{
				echo '{"success":false,"errorCode":-1,"error":"lid onbekend"}';
				return;
			}

			$r['VOORKEUR_VLIEGTUIG_ID'] = null;
			$r['VOORKEUR_VLIEGTUIG_TYPE'] = null;
			$r['DDWV_VOORAANMELDING'] =  "1";
			$r['LID_ID'] = $lid[0]["ID"];				
			$r['DATUM'] = date('Y-m-d');
			$r['AANKOMST'] = null;
			$r['VERTREK'] = null;
			$r['ID'] = NieuwID(null, $r['LID_ID']);					
			
			if (array_key_exists('OPMERKING', $this->Data))
				$r['OPMERKING'] =  $this->Data["OPMERKING"];
								
			if (!$this->IsAangemeldVandaag($lid[0]["ID"], null))	// is nog niet aangemeld
			{	
				parent::DbToevoegen('oper_aanwezig', $r);
			}
		}	

		// deze functie wordt aangeroepen vanuit de webinterface.
		function AanmeldenLidJSON()
		{
			global $db;
		
			Debug(__FILE__, __LINE__, sprintf("Aanwezig.AanmeldenLidJSON()"));
			Debug(__FILE__, __LINE__, sprintf("Data=%s", print_r($this->Data, true)));	
		
			if (!array_key_exists('LID_ID', $this->Data))
			{
				echo '{"success":false,"errorCode":-1,"error":"Geen LID_ID in dataset"}';
				return;
			}
			$r['VOORKEUR_VLIEGTUIG_ID'] = null;
			$r['VOORKEUR_VLIEGTUIG_TYPE'] = null;
			
			if (array_key_exists('VOORKEUR_VLIEGTUIG_ID', $this->Data))
			{
				$r['VOORKEUR_VLIEGTUIG_ID'] =  $this->Data["VOORKEUR_VLIEGTUIG_ID"];
				$this->AanmeldenVliegtuigVandaag($this->Data['VOORKEUR_VLIEGTUIG_ID']);
			}
			
			if (array_key_exists('OPMERKING', $this->Data))
				$r['OPMERKING'] =  $this->Data["OPMERKING"];
				
			if (array_key_exists('VOORKEUR_VLIEGTUIG_TYPE', $this->Data))
				$r['VOORKEUR_VLIEGTUIG_TYPE'] =  $this->Data["VOORKEUR_VLIEGTUIG_TYPE"];
							

			if (!$this->IsAangemeldVandaag($this->Data["LID_ID"], null))	// is nog niet aangemeld
			{	
				$r['LID_ID'] = $this->Data["LID_ID"];				
				$r['DATUM'] = date('Y-m-d');
			//	$r['AANKOMST'] = strftime('%H:%M');	
				$r['ID'] = NieuwID();						
				
				$db->DbToevoegen('oper_aanwezig', $r);
				
				// Automatisch aanmaken start voor overland vliegers
				if ($r['VOORKEUR_VLIEGTUIG_ID'] != null)
				{
					$sl = MaakObject('Startlijst');
					$sl->CreeerStart($r['LID_ID'],$r['VOORKEUR_VLIEGTUIG_ID']);
				}
			}
			else	// blijkbaar is lid al aangemeld, maar nog wel update doen voor voorkeur type/kist
			{
				$query = "
					SELECT ID AS ID 
					FROM 
						oper_aanwezig
					WHERE
						DATUM = DATE(NOW()) 	AND
						LID_ID=" . $this->Data["LID_ID"];
				
				$db->DbOpvraag($query);
				$id = $db->Data();

				if (count($id) > 0)
				{
					$id = $id[0]['ID'];
					$aanmelding = $this->GetObject($id);

					// alleen updaten als er iets gewijzigd is
					if (($aanmelding[0]['VOORKEUR_VLIEGTUIG_TYPE'] != $r['VOORKEUR_VLIEGTUIG_TYPE']) ||	
						($aanmelding[0]['VOORKEUR_VLIEGTUIG_ID'] != $r['VOORKEUR_VLIEGTUIG_ID']))
					{
						$db->DbAanpassen('oper_aanwezig', $id, $r);
					}	
				}
			}
		}		
		
		function DefaultGezagvoerder()
		{
			Debug(__FILE__, __LINE__, sprintf("Aanwezig.DefaultGezagvoerder()"));
			
			if (!array_key_exists('VLIEGTUIG_ID', $this->Data))
			{
				echo "VLIEGTUIG_ID is missing";
				return;
			}
			
		
			$VliegtuigID = $this->Data['VLIEGTUIG_ID'];
			
			$query = "
				SELECT LID_ID AS LID_ID 
				FROM 
					oper_aanwezig
				WHERE
					DATUM = DATE(NOW()) 	AND
					VERTREK IS NULL 		AND 
					VOORKEUR_VLIEGTUIG_ID=" . $VliegtuigID;
			
			parent::DbOpvraag($query);
			$id = parent::DbData();

			if (count($id) == 1)
			{
				Debug(__FILE__, __LINE__, sprintf("Aanwezig.DefaultGezagvoerder = %s", $id[0]['LID_ID']));
				echo $id[0]['LID_ID'];
				return;
			}
			
			echo "";
		}		
		
		
		
		// -------------------------------------------------------------------------------------------------------------------------
		// PHP interne functies
		
		function GetObject($id)
		{
			Debug(__FILE__, __LINE__, sprintf("Aanwezig.GetObject(%s)", $id));	
			
			$query = sprintf("
				SELECT
					*
				FROM
					oper_aanwezig
				WHERE
					ID = '%s'", $id);
					
			parent::DbOpvraag($query);
			Debug(__FILE__, __LINE__, sprintf("Data=%s", print_r(parent::DbData(), true)));
			return(parent::DbData());
		}		
	
		// Is het lid/vliegtuig al aangemeld (bijv via ddwv), maar nog geen aankomst datum
		function IsVoorAangemeldVandaag($LidID = null, $VliegtuigID = null)
		{
			Debug(__FILE__, __LINE__, sprintf("Aanwezig.IsVoorAangemeldVandaag(%s,%s)", $LidID, $VliegtuigID));				

			if (($LidID == null) && ($VliegtuigID == null))		
				return -1;
			
			$query = "
				SELECT ID AS ID 
				FROM 
					oper_aanwezig
				WHERE
					DATUM = DATE(NOW()) 	AND
					AANKOMST IS NULL 		AND
					VERTREK IS NULL 		AND ";
			
			if ($LidID != null)
				$query =  $query . "LID_ID=" . $LidID;
			else
				$query =  $query . "VLIEGTUIG_ID=" . $VliegtuigID;
			
			parent::DbOpvraag($query);
			$id = parent::DbData();

			if (count($id) > 0)
			{
				Debug(__FILE__, __LINE__, sprintf("Aanwezig.IsVoorAangemeldAanwezig = %s", $id[0]['ID']));
				return $id[0]['ID'];
			}
			Debug(__FILE__, __LINE__, "Aanwezig.IsVoorAangemeldAanwezig = -1");	
			return -1;
		}
		
		// Is he lid/vliegtuig Aanwezig al eerder aangemeld?, we willen geen dubbele records
		function IsAangemeldVandaag($LidID = null, $VliegtuigID = null)
		{		
			Debug(__FILE__, __LINE__, sprintf("Aanwezig.IsAangemeldVandaag(%s,%s)", $LidID, $VliegtuigID));
					
			if (($LidID == null) && ($VliegtuigID == null))		
				return -1;
			
			$query = "
				SELECT COUNT(*) AS total 
				FROM 
					oper_aanwezig
				WHERE
					DATUM = DATE(NOW()) 	AND
					VERTREK IS NULL 		AND ";
			
			if ($LidID != null)
				$query =  $query . "LID_ID=" . $LidID;
			else
				$query =  $query . "VLIEGTUIG_ID=" . $VliegtuigID;
			
			parent::DbOpvraag($query);
			$total = parent::DbData();

			if ($total[0]['total'] >= 1)
			{
				Debug(__FILE__, __LINE__, "Aanwezig.IsAangemeldVandaag = true");	
				return true;
			}
			Debug(__FILE__, __LINE__, "Aanwezig.IsAangemeldVandaag = false");		
			return false;
		}

		// Is het lid/vliegtuig terug van weggeweest? Zo ja, geef ID terug van aanwezig record
		// Zo nee, return -1
		function IsAangemeldGeweestVandaag($LidID = null, $VliegtuigID = null)
		{	
			Debug(__FILE__, __LINE__, sprintf("Aanwezig.IsAangemeldGeweestVandaag(%s,%s)", $LidID, $VliegtuigID));
			
			if (($LidID == null) && ($VliegtuigID == null))		
				return -1;
			
			$query = "
				SELECT ID AS ID 
				FROM 
					oper_aanwezig
				WHERE
					DATUM = DATE(NOW()) 	AND
					VERTREK IS NOT NULL 	AND ";
			
			if ($LidID != null)
				$query =  $query . "LID_ID=" . $LidID;
			else
				$query =  $query . "VLIEGTUIG_ID=" . $VliegtuigID;
			
			parent::DbOpvraag($query);
			$id = parent::DbData();

			if (count($id) > 0)
			{
				Debug(__FILE__, __LINE__, sprintf("Aanwezig.IsAangemeldGeweestAanwezig = %s", $id[0]['ID']));
				return $id[0]['ID'];
			}
			Debug(__FILE__, __LINE__, "Aanwezig.IsAangemeldGeweestAanwezig = -1");	
			return -1;
		}
		
		// toevoegen vliegtuig type voor dit lid
		function AanmeldenLidVliegtuigType($LidID, $VLIEGTUIG_TYPE)
		{
			Debug(__FILE__, __LINE__, sprintf("Aanwezig.AanmeldenLidVliegtuigType(%s,%s)", $LidID, $VLIEGTUIG_TYPE));
			
			$query = "
				SELECT ID AS ID 
				FROM 
					oper_aanwezig
				WHERE
					DATUM = DATE(NOW()) 	AND
					LID_ID=" . $LidID;
			
			parent::DbOpvraag($query);
			$id = parent::DbData();

			if (count($id) == 0)
			{
				$done = $this->AanmeldenLidVandaag($LidID);
				if ($done == true)
					$this->AanmeldenLidVliegtuigType($LidID, $VLIEGTUIG_TYPE);
			}
			else
			{
				if (isset($id[0]['ID']))
				{
					$id = $id[0]['ID'];
					$aanmelding = $this->GetObject($id);

					Debug(__FILE__, __LINE__, sprintf("aanmelding=%s", print_r($aanmelding, true)));
					if (!isset($aanmelding[0]['VOORKEUR_VLIEGTUIG_TYPE']))
					{
						$aanmelding[0]['VOORKEUR_VLIEGTUIG_TYPE'] = "";
					}
					
					if (strpos($aanmelding[0]['VOORKEUR_VLIEGTUIG_TYPE'], $VLIEGTUIG_TYPE) === false)
					{
						if (strlen($aanmelding[0]['VOORKEUR_VLIEGTUIG_TYPE']) > 0)
							$u['VOORKEUR_VLIEGTUIG_TYPE'] = $aanmelding[0]['VOORKEUR_VLIEGTUIG_TYPE'] . "," . $VLIEGTUIG_TYPE;
						else
							$u['VOORKEUR_VLIEGTUIG_TYPE'] = $VLIEGTUIG_TYPE;
							
						parent::DbAanpassen('oper_aanwezig', $id, $u);
					}
				}
			}
		}
	
		
		// deze functie wordt aangeroepen vanuit php.
		function AanmeldenVliegtuigVandaag($ID)
		{
			Debug(__FILE__, __LINE__, sprintf("Aanwezig.AanmeldenVliegtuigVandaag()"));		
		
			if ($ID == null)
			{
				Debug(__FILE__, __LINE__, "ID == null");
				return;
			}
				
			if (!is_numeric($ID))
			{
				Debug(__FILE__, __LINE__, "ID not numeric");
				return;
			}
				
			$id = $this->IsAangemeldGeweestVandaag(null, $ID);
			if ($id > 0)
			{
				$u['VERTREK'] = null;
				parent::DbAanpassen('oper_aanwezig', $id, $u);
			}
			else
			{	
				$id = $this->IsVoorAangemeldVandaag(null, $ID);
				if ($id > 0)
				{
					$u['AANKOMST'] = strftime('%H:%M');
					parent::DbAanpassen('oper_aanwezig', $id, $u);
				}	
				else
				{				
					if (!$this->IsAangemeldVandaag(null, $ID))
					{
						$i['VLIEGTUIG_ID'] = $ID;
						$i['DATUM'] = date('Y-m-d');
						$i['AANKOMST'] = strftime('%H:%M');
						$i['ID'] = NieuwID(null, null, $i['VLIEGTUIG_ID']);
				
						parent::DbToevoegen('oper_aanwezig', $i);
					}
				}
			}
		}
			
		
		// deze functie wordt aangeroepen vanuit php bijvoorbeeld omdat er een start is ingevoerd
		function AanmeldenLidVandaag($ID)
		{
			Debug(__FILE__, __LINE__, sprintf("Aanwezig.AanmeldenLidVandaag()"));
			
			if ($ID == null)
			{
				Debug(__FILE__, __LINE__, "ID == null");
				return false;
			}

			if (!is_numeric($ID))
			{
				Debug(__FILE__, __LINE__, "ID not numeric");
				return;
			}
			
			$l = MaakObject('Leden');
			$lid = $l->GetObject($ID);
			switch ($lid[0]['LIDTYPE_ID'])
			{
				case '609':  	// nieuw lid nog niet in start administratie
				case '612':		// penningmeester
				{
					Debug(__FILE__, __LINE__, sprintf ("Lidtype = %s", $lid[0]['LIDTYPE_ID']));
					return false;		// niet aanmelden, is geen natuurlijk persoon
				}
			}
				
			$id = $this->IsAangemeldGeweestVandaag($ID, null);
			if ($id > 0)
			{
				$u['VERTREK'] = null;
				parent::DbAanpassen('oper_aanwezig', $id, $u);
			}
			else
			{	
				$id = $this->IsVoorAangemeldVandaag($ID ,null);
				if ($id > 0)
				{
					$u['AANKOMST'] = strftime('%H:%M');
					parent::DbAanpassen('oper_aanwezig', $id, $u);
				}
				else
				{				
					if (!$this->IsAangemeldVandaag($ID, null))
					{	
						$i['LID_ID'] = $ID;
						$i['DATUM'] = date('Y-m-d');
						$i['AANKOMST'] = strftime('%H:%M');	
						$i['ID'] = NieuwID(null, $i['LID_ID']);										
						
						parent::DbToevoegen('oper_aanwezig', $i);
					}
				}
			}
			
			return true;
		}
	}
?>