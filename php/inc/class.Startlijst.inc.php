<?php

	class Startlijst  extends StartAdmin
	{
		function __construct() 
		{
			parent::__construct();
			$this->dbTable = "oper_startlijst";
		}
		
		// ------------------------------------------------------------------
		// Haal een object op vanuit de database.  
		// 
		// @param vanuit POST
		// 	ID = ID van het lid record
		// 
		// @return 
		// 	Json string 
		//		ID 				= Het record ID van deze start in de database
		//		DAGNUMMER		=
		//		VLIEGTUIG_ID	=
		//		DATUM			=
		//		STARTTIJD		=
		//		LANDINGSTIJD	=
		//		STARTMETHODE_ID	=
		//		OPMERKING		=
		//		SOORTVLUCHT_ID	=
		//		OP_REKENING_ID	=
		//		VLIEGER_ID		=
		//		INZITTENDE_ID	=
		//		VLIEGERNAAM		=
		//		INZITTENDENAAM	=
		//		SLEEPKIST_ID	=
		//		VERWIJDERD		=
		//		LAASTE_AANPASSING = wordt door de database zelf geupdate, nodig voor synchronisatie
		//
		// @example
		// {
		//	success: true,
		//	data:
		//	{
		//		"ID":"1701232243153",
		//		"DAGNUMMER":"3",
		//		"VLIEGTUIG_ID":"255",
		//		"DATUM":"2017-01-23",
		//		"STARTTIJD":"08:43:00",
		//		"LANDINGSTIJD":"09:09:00",
		//		"STARTMETHODE_ID":"550",
		//		"OPMERKING":null,
		//		"SOORTVLUCHT_ID":null,
		//		"OP_REKENING_ID":"10100",
		//		"VLIEGER_ID":"10100",
		//		"INZITTENDE_ID":null,
		//		"VLIEGERNAAM":null,
		//		"INZITTENDENAAM":null,
		//		"SLEEPKIST_ID":null,
		//		"VERWIJDERD":"0",
		//		"LAATSTE_AANPASSING":"2017-01-24 21:36:30"
		//	}}	
		function GetObjectJSON()
		{
			Debug(__FILE__, __LINE__, "Startlijst.GetObjectJSON()");
			Debug(__FILE__, __LINE__, sprintf("qParams=%s", print_r($this->qParams, true)));			
			
			if (!array_key_exists('_:ID', $this->qParams))
			{
				echo '{"success":false,"errorCode":-1,"error":"Geen ID in aanvraag"}';
				return;
			}
			$brackets = array("[", "]");
			echo '{success: true'.',data:'. str_replace($brackets, "", json_encode($this->GetObject($this->qParams["_:ID"]))) .'}';
		}		
	
		// ------------------------------------------------------------------
		// Een overzicht met alle starts van een vliegdag
		// 
		// @param vanuit POST
		//		_:verwijderMode = Geeft alleen terug welke vluchten verwijderd morgen worden
		//		_:onderdruk 	= Onderdruk alle vluchten die al geland zijn
		// 		_:datum = De datum voor het overzicht. Als het veld ontbreekt, nemen we vandaag		
		// 		_:query = zoek criteria door de gebruiker ingevuld
		//		sort 	= veldnaam waarop gesorteerd moet worden
		//		dir 	= sorteer richting (DESCR - ASC)
		//		limit	= aantal records
		//		start	= eerste record
		// 
		// @return 	      
		// 	Json string (startlijst_view)
		//			ID				= Het record ID van de start in de start administratie
		//			DAGNUMMER		= Het volgnummer van deze dag
		//			REGISTRATIE		= Registratie van het vliegtuig
		//			CALLSIGN		= Callsign van het volgnummer
		//			REG_CALL		= Combinatie van registratie en callsign
		//			FLARM_CODE		= De flarm code zoals het bekend is in de tabel vliegtuigen
		//			VLIEGTUIG_ID	= Het record ID van het vliegtuig
		//			SLEEPKIST_ID	= Vliegtuig ID van het sleepvliegtuig
		//			SLEEP_HOOGTE	= De hoogte van de sleep
		//			DATUM			= De datasum van deze start
		//			SOORTVLUCHT_ID	= Verwijzing naar soort vlucht (instructie / prive start)
		//			STARTMETHODE_ID	= Verwijzing naar start methode (slepen / lieren / zelstart)
		//			STARTTIJD		= De starttijd volgens de start administratie
		//			LANDINGSTIJD	= De landingstijd volgens de start administratie
		//			DUUR			= De vliegtijd (landingstijd - startijst)
		//			OPMERKING		= Opmerking voor deze vlucht
		//			LAATSTE_AANPASSING = wordt door de database zelf geupdate, nodig voor synchronisatie
		//			VLIEGER_ID		= Verwijzing naar lid record van de vlieger
		//			VLIEGERNAAM_LID	= Volledige naam van de vlieger zoals in ledenbestand
		//			VLIEGERNAAM		= Volledige naam van de vlieger zoals hand matig ingevoerd (niet voor alle vluchten)		
		//			INZITTENDE_ID	= Verwijzing naar lid record van de inzittende
		//			INZITTENDENAAM_LID	= Volledige naam van de inzittende zoals in het ledenbestand
		//			INZITTENDENAAM	= Volledige naam van de inzittende zoals hand matig ingevoerd (niet voor alle vluchten)	
		//			OP_REKENING_ID	= Verwijzing naar lid record van de diegene die betaald
		//			OP_REKENING		= Volledige naam van diegene die betaald
		//			SOORTVLUCHT		= Soort vlucht in volledige text vanuit omschrijving types tabel
		//			STARTMETHODE	= Start methode omschrijving in volledige text vanuit omschrijving types tabel
		//
		// @example
		// 	{
		//		"total":"13",
		//		"results":
		//		[{
		//			"ID":"1607252212552",
		//			"DAGNUMMER":"1",
		//			"REGISTRATIE":"PH-1521",
		//			"CALLSIGN":"E11",
		//			"REG_CALL":"PH-1521 (E11)",
		//			"FLARM_CODE":"485026",
		//			"VLIEGTUIG_ID":"402",
		//			"SLEEPKIST_ID":null,
		//			"SLEEP_HOOGTE": null,
		//			"DATUM":"2016-07-25",
		//			"SOORTVLUCHT_ID":"809",
		//			"STARTMETHODE_ID":"501",
		//			"STARTTIJD":"11:25",
		//			"LANDINGSTIJD":"11:37",
		//			"DUUR":"00:12",
		//			"OPMERKING":null,
		//			"VLIEGERNAAM":"Diede Jongsma",
		//			"INZITTENDENAAM":"Jan Jaap van Brunsum",
		//			"LAATSTE_AANPASSING":"2016-07-25 22:13:41",
		//			"VLIEGER_ID":"10587",
		//			"VLIEGERNAAM_LID":"Diede Jongsma",
		//			"VLIEGERNAAM": null,		
		//			"INZITTENDE_ID":"10338",
		//			"INZITTENDENAAM_LID":"Jan Jaap van Brunsum"
		//			"OP_REKENING_ID":"10587",
		//			"OP_REKENING":"Diede Jongsma",
		//			"SOORTVLUCHT":"Instructie of checkvlucht",
		//			"STARTMETHODE":"Slepen (zweefkist)"
		//		},
		//		{
		//			"ID":"1607252213581",
		//			"DAGNUMMER":"2",
		//			"REGISTRATIE":"PH-1521",
		//			"CALLSIGN":"E11",
		//			"REG_CALL":"PH-1521 (E11)",
		//			"FLARM_CODE":"485026",
		//			"VLIEGTUIG_ID":"402",
		//			"SLEEPKIST_ID":null,
		//			"SLEEP_HOOGTE": null,		
		//			"DATUM":"2016-07-25",
		//			"SOORTVLUCHT_ID":"809",
		//			"STARTMETHODE_ID":"501",
		//			"STARTTIJD":"11:39",
		//			"LANDINGSTIJD":"11:51",
		//			"DUUR":"00:12",
		//			"OPMERKING":null,
		//			"LAATSTE_AANPASSING":"2016-07-25 22:14:22",
		//			"VLIEGER_ID":"10587",
		//			"VLIEGERNAAM_LID":"Diede Jongsma",
		//			"VLIEGERNAAM": null,		
		//			"INZITTENDE_ID":"10338",
		//			"INZITTENDENAAM_LID":"Jan Jaap van Brunsum",	
		//			"INZITTENDENAAM": null,		
		//			"OP_REKENING_ID":"10587",
		//			"OP_REKENING":"Diede Jongsma",
		//			"SOORTVLUCHT":"Instructie of checkvlucht",
		//			"STARTMETHODE":"Slepen (zweefkist)"
		//		}]
		//	}
		function StartlijstVandaagJSON()
		{		
			Debug(__FILE__, __LINE__, "Startlijst.StartlijstVandaagJSON()");	
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
			
			if ($l->isLocal())
			{
				$where = $where . "AND (COALESCE(SOORTVLUCHT_ID,0) != 815) ";		// 815 = start van het sleepvliegtuig zelf
			}
			
			if ($l->magSchrijven() == false)
			{
				$where = $where . sprintf(" AND ((VLIEGER_ID = '%d') OR (INZITTENDE_ID = '%d') OR (OP_REKENING_ID = '%d'))", $l->getUserFromSession(), $l->getUserFromSession(), $l->getUserFromSession());
			}

			if (array_key_exists('_:id', $this->qParams))			// vraag specifieke vlieger op
			{
				$where = $where . sprintf(" AND ((VLIEGER_ID = '%d') OR (INZITTENDE_ID = '%d'))", trim($this->qParams['_:id']), trim($this->qParams['_:id']));

			}
			
			if (array_key_exists('_:verwijderMode', $this->qParams))
			{
				if ($this->qParams['_:verwijderMode'] == 'true')
					$where = $where ." AND STARTTIJD IS NULL AND LANDINGSTIJD IS NULL";	// Alleen maar vluchten die nog niet gestart zijn
			}
			
			if (array_key_exists('_:onderdruk', $this->qParams))
			{
				if ($this->qParams['_:onderdruk'] == 'true')
					$where = $where . " AND (LANDINGSTIJD IS NULL OR VLIEGER_ID IS NULL)";
			}
			if (array_key_exists('_:query', $this->qParams))
			{
				if (strlen(trim($this->qParams['_:query'])) > 0)
				{
					$where = $where . " AND (VLIEGERNAAM LIKE ('%%" . trim($this->qParams['_:query']) . "%%') ";
					$where = $where . " OR VLIEGERNAAM_LID LIKE ('%%" . trim($this->qParams['_:query']) . "%%') ";
					$where = $where . " OR INZITTENDENAAM LIKE ('%%" . trim($this->qParams['_:query']) . "%%') ";
					$where = $where . " OR INZITTENDENAAM_LID LIKE ('%%" . trim($this->qParams['_:query']) . "%%') ";					
					$where = $where . " OR REGISTRATIE LIKE ('%%" . trim($this->qParams['_:query']) . "%%') ";
					$where = $where . " OR CALLSIGN LIKE ('%%" . trim($this->qParams['_:query']) . "%%') ";
					$where = $where . ")";
				}
			}
			if (array_key_exists('_:sleepstarts', $this->qParams))
			{
				if ($this->qParams['_:sleepstarts'] == 'true')
				{
					$where = $where . " AND STARTMETHODE_ID = 501";
				}
			}
			
			$orderby = " ORDER BY CONVERT(REPLACE(DAGNUMMER, 's',''), UNSIGNED INTEGER), ID ";
			if ((array_key_exists('sort', $this->Data)) && (array_key_exists('dir', $this->Data)))
			{
				if ($this->Data['sort'] == 'DAGNUMMER')
					$orderby = sprintf(" ORDER BY CONVERT(REPLACE(DAGNUMMER, 's',''), UNSIGNED INTEGER) %s, ID %s", $this->Data['dir'], $this->Data['dir']);
				else
					$orderby = sprintf(" ORDER BY %s %s ", $this->Data['sort'], $this->Data['dir']);
			}	
			
			$query = "
				SELECT
					%s 
				FROM
					startlijst_view
				WHERE
					" . $where . $orderby;
			

			if (array_key_exists('_:LAATSTE_AANPASSING', $this->qParams))
			{
				$query  = sprintf($query, "MAX(LAATSTE_AANPASSING) AS LAATSTE_AANPASSING");
				$la = $this->LaatsteAanpassing($query);
				Debug(__FILE__, __LINE__, sprintf("LAATSTE_AANPASSING=%s", $la));	
				echo $la;
			}
			else
			{			
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
				echo '{"total":"'.$total[0]['total'].'","results":'.json_encode(array_map('PrepareJSON', parent::DbData())).'}';
			}		
		}
		
		// ------------------------------------------------------------------
		// De lijst met welke vliegtuigen welke gekozen kunnen worden
		//
		// @param vanuit POST
		//
		// 
		// @return 	      
		// 	Json string (startlijst_view)
		//		ID				= Het record ID van het vleiegtuig in de start administratie
		//		REG_CALL		= Combinatie van registratie en callsign
		//		ZITPLAATSEN		= Aantal zitplaatsen voor dit vliegtuig
		//		TMG				= 0/1 is het een TMG?
		//		SLEEPKIST		= 0/1 is het een Sleepvliegtuig?
		//		ZELFSTART		= 0/1 kan het vliegtuig zelf starten
		//		TYPE_ID			= Wat voor een vliegtuig type is het (verwijzing naar Types tabel) Alleen nodig voor clubvliegtuigen
		//		CLUBKIST		= 0/1 is het een vliegtuig van de club
		//		VLIEGT			= Vliegt het vliegtuig momenteel
		//		OVERLAND		= Gaat het vliegtuig vandaag overland
		//		AANWEZIG		= Is het vliegtuig vandaag aanwezig
		//		LAATSTE_AANPASSING = wordt door de database zelf geupdate, nodig voor synchronisatie
		//
		// @example
		// [{
		//		"ID":"255",
		//		"REG_CALL":"PH-936 (E9)",
		//		"ZITPLAATSEN":"1",
		//		"TMG":"0",
		//		"SLEEPKIST":"0",
		//		"ZELFSTART":"0",
		//		"TYPE_ID":"402",
		//		"CLUBKIST":"1",
		//		"VLIEGT":null,
		//		"OVERLAND":"0",
		//		"AANWEZIG":"0",
		//		"LAATSTE_AANPASSING":"2017-03-27 09:59:16"
		// },
		// {
		//		"ID":"252",
		//		"REG_CALL":"PH-794 (E10)",
		//		"ZITPLAATSEN":"1",
		//		"TMG":"0",
		//		"SLEEPKIST":"0",
		//		"ZELFSTART":"0",
		//		"TYPE_ID":"402",
		//		"CLUBKIST":"1",
		//		"VLIEGT":null,
		//		"OVERLAND":"0",
		//		"AANWEZIG":"0",
		//		"LAATSTE_AANPASSING":"2017-03-28 21:06:54"
		//}]
		function VliegtuigenJSON()
		{
			Debug(__FILE__, __LINE__, "Startlijst.VliegtuigenJSON()");
			Debug(__FILE__, __LINE__, sprintf("qParams=%s", print_r($this->qParams, true)));			

			$query = "SELECT %s FROM invoer_vliegtuigen_view WHERE SLEEPKIST = '0' ORDER BY AANWEZIG DESC, CLUBKIST DESC, REG_CALL DESC";
			
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
		
		// ------------------------------------------------------------------
		// Wie zou de gezagvoerder kunnen zijn op deze kist
		function GezagvoerderJSON()
		{
			Debug(__FILE__, __LINE__, "Startlijst.GezagvoerderJSON()");
			Debug(__FILE__, __LINE__, sprintf("qParams=%s", print_r($this->qParams, true)));	
			
			if ((!array_key_exists('_:VliegerID', $this->qParams)) && (!array_key_exists('_:VliegtuigID', $this->qParams)))
			{
				echo '{"success":false,"errorCode":-1,"error":"Geen Vliegtuig/Vlieger ID in aanroep"}';
				return;
			}
			 
			 // Bij het wijzigen van een start is er wellicht al een vlieger ingevuld. Neem deze als keuze
			 $VliegerVal = null;
			if (array_key_exists('_:VliegerID', $this->qParams))
			{
				$VliegerId = $this->qParams['_:VliegerID'];
				if ($VliegerId != "")
				{
					$query = "
						SELECT 
							L.ID, L.NAAM
						FROM 
							ref_leden AS L
						WHERE 
							L.ID = " .  $VliegerId;
							
					parent::DbOpvraag($query);	
					$VliegerVal = parent::DbData();	
					Debug(__FILE__, __LINE__, sprintf("VliegerVal=%s", print_r($VliegerVal, true)));
				}
			}
			
			// Haal de info op uit de daginfo
			$retVal = null;
			$hierop = "1 AS HIEROP";
			$condition = "";
			if (array_key_exists('_:VliegtuigID', $this->qParams))
			{
				$VliegtuigId = $this->qParams['_:VliegtuigID'];
				
				$rv = MaakObject('Vliegtuigen');
				$rvObj = $rv->GetObject($VliegtuigId);

				// Bouw de where conditie 
				if (isset($rvObj))
				{
					if ($rvObj[0]['CLUBKIST'] == 1)
					{
						// in aanwezigheid heeft de vlieger een voorkeur opgegeven op welk type hij/zij wil vliegen
						// HIEROP is 1 als er een match is, 0 als vlieger wel aanwezig is maar dit vliegtuig(type) niet wil vliegen
						$hierop = sprintf("((VOORKEUR_VLIEGTUIG_ID = %d OR VOORKEUR_VLIEGTUIG_TYPE LIKE CONCAT('%%',%d,'%%')) is not null) AS HIEROP", $rvObj[0]['ID'], $rvObj[0]['TYPE_ID']);
					}
					else //prive kist
					{
						// wie heeft er vandaag op gevlogen of anders in de laatste 90 dagen
						$query = sprintf("
							SELECT 
								GROUP_CONCAT(L.VLIEGER_ID) AS VID
							FROM 
								(
									SELECT 
										VLIEGER_ID 
									FROM 
										oper_startlijst 
									WHERE 
										((STARTTIJD IS NOT NULL) OR (DATEDIFF(now(),DATUM) = 0)) AND
										DATEDIFF(now(),DATUM)  < 90 AND
										VLIEGTUIG_ID = %d  
									GROUP BY 
										VLIEGER_ID
									) AS L", $VliegtuigId);
						parent::DbOpvraag($query);					
						$a = parent::DbData();
						
						if ($a[0]['VID'] == null)
							return;
							
						$condition = sprintf(" AND (L.ID IN (%s))", $a[0]['VID']);
					}
				}
				
				// iedereen die aanwezig is, is een potentiele vlieger
				$query = sprintf ("
					SELECT 
						L.ID, 
						L.NAAM,
						LidVliegt(A.LID_ID) is not NULL AS VLIEGT,
						%s
					FROM 
						oper_aanwezig AS A INNER JOIN
						ref_leden AS L ON A.LID_ID = L.ID
					WHERE (L.VERWIJDERD != 1) ", $hierop);
					
				$where = "AND DATUM = cast(now() as date) AND VERTREK IS NULL";
				
				// Bekijk daginfo of we DDWV kun uitsluiten
				$di = MaakObject('Daginfo');				
				$diObj = $di->GetObject();
				
				$ddwv = "";
				if ($diObj[0]['ID'] != -1)		// Daginfo is niet ingevuld
				{
					if ($diObj[0]['SOORTBEDRIJF_ID'] == 701) 		// Vandaag is er geen DDWV
					{
						$ddwv = " AND L.LIDTYPE_ID != 625";			// uitsluiten van DDWV leden
					}
				}
				
				parent::DbOpvraag($query . $where . $ddwv . $condition);	
				$retVal = parent::DbData();	
				
				if (count($retVal) == 0)		
				{
					// we hebben misschien vliegers, maar niemand lijkt aanwezig. 
					// omdat prive vliegers weinig vluchten maken per dag, tonen we alle potentiele vliegers
				
					parent::DbOpvraag($query . $condition);	
					$retVal = parent::DbData();				
				}
			}
			
			if ($retVal == null)
			{
				$retVal = $VliegerVal;
			}
			else
			{
				// We hebben nu misschien twee array's. Het vlieger array moet toegevoegd worden aan het retval array.
				// maar er mogen geen dubbele records in voorkomen
				if ($VliegerId != "")
				{
					$gevonden = false;
					foreach ($retVal as $r)
					{
						if ($r['ID'] == $VliegerId)
						{
							$gevonden = true;
							break;
						}
					}
					
					if (!$gevonden)
					{
						$retVal = array_merge($retVal,$VliegerVal);
					}
				}
			}
			
			if ($retVal == null)
				$retVal = Array();
				
			Debug(__FILE__, __LINE__, sprintf("retVal=%s", print_r($retVal, true)));
			echo json_encode(array_map('PrepareJSON', $retVal));
		}	
			
		
		// ------------------------------------------------------------------
		// Overzicht (in boomstuctuur) van alle club vliegers die op clubkisten gevlogen hebben
		// Handig om voor leerlingen log boekje in te vullen
		// 
		// @param vanuit POST
		// 		_:datum = De datum voor het overzicht. Als het veld ontbreekt, nemen we vandaag		
		// 
		// @return 	      
		// 	Json string (root level is leeg)
		//		childern = onderliggende data
		//		TEXT = DAGNUMMER + REGISTRATIE + CALLSIGN
		//		STARTTIJD = starttijd volgens start administratie
		//		DUUR = Vliegtijd (landingstijd - starttijd)
		//
		// @example
		// {
		//		"children":
		//		[{
		//			"TEXT":"Harko Souton (1)",
		//			"children":
		//			[{
		//				"TEXT":"  3; PH-936 (LS4)",
		//				"STARTTIJD":"08:43",
		//				"DUUR":"00:26",
		//				"leaf":"1"
		//			}]
		//		},
		//		{
		//			"TEXT":"Johan van Kooten (1)",
		//			"children":
		//			[{
		//				"TEXT":"  2; PH-1303 (LS6)",
		//				"STARTTIJD":"09:05",
		//				"DUUR":"02:33",
		//				"leaf":"1"
		//			}]
		//		}]
		// }
		function StartlijstTreeviewJSON()
		{
			Debug(__FILE__, __LINE__, "Startlijst.StartlijstTreeviewJSON()");	
			
			$where = ' ';
			if (array_key_exists('_:datum', $this->qParams))
			{
				$where = sprintf(" (`DATUM` = '%s')", $this->qParams['_:datum']);
			}
			else
			{
				$where = " (`DATUM` = CAST(NOW()AS DATE))";
			}
			
			$l = MaakObject('Login');
			if ($l->magSchrijven() == false)
			{
				$where = $where . sprintf(" AND ((VLIEGER_ID = '%d') OR (INZITTENDE_ID = '%d') OR (OP_REKENING_ID = '%d'))", $l->getUserFromSession(), $l->getUserFromSession(), $l->getUserFromSession());
			}

			
			$query = "
				SELECT
					* 
				FROM
					startlijst_vlieger_view
				WHERE
					" . $where;
		
			parent::DbOpvraag($query);
			
			$vlieger = "";
			$vluchten = array();
			$retValue = array();
			foreach (parent::DbData() as $dbvlucht)
			{
				if ($vlieger != $dbvlucht['VLIEGERNAAM'])
				{
					if ($vlieger != "")
					{
						$a = array();
						$a['TEXT'] = sprintf("%s (%d)", $vlieger, count($vluchten));
						$a['children'] = $vluchten;
						array_push($retValue, $a);	
					}
					$vlieger = $dbvlucht['VLIEGERNAAM'];
					$vluchten = array();
				}
				$vlucht = array();
				$vlucht['TEXT'] = sprintf("%3d; %s (%s)", $dbvlucht['DAGNUMMER'], $dbvlucht['REGISTRATIE'], $dbvlucht['VLIEGTUIG_TYPE']);
				$vlucht['STARTTIJD'] 		= $dbvlucht['STARTTIJD'];
				$vlucht['DUUR'] 			= $dbvlucht['DUUR'];
				$vlucht['leaf']				= true;
				
				array_push($vluchten, $vlucht);
				Debug(__FILE__, __LINE__, sprintf("vlieger=%s vluchten=%d", $vlieger, count($vluchten)));
			}
			
			if (count($vluchten) > 0)
			{
				$a = array();
				$a['TEXT'] = sprintf("%s (%d)", $vlieger, count($vluchten));
				$a['children'] = $vluchten;
				array_push($retValue, $a);	
			}
			
			echo '{"children":' . json_encode(array_map('PrepareJSON', $retValue)) . "}";
			return;
		}
		
		
		// ------------------------------------------------------------------
		// Overzicht (in boomstuctuur) van alle club vliegtuigen 
		// Handig om log boekje in te vullen
		// 
		// @param vanuit POST
		// 		_:datum = De datum voor het overzicht. Als het veld ontbreekt, nemen we vandaag		
		// 
		// @return 	      
		// 	Json string (root level is leeg)
		//	Eerste niveau is per vliegtuig, op dit niveau bevinden zich de totalen van alle starts
		//  Tweede niveau is per soort start, hiermee worden lierstarts, sleepstarts van elkaar gescheiden
		//		childern = onderliggende data
		//		ID 			= Vliegtuig ID van ref_vliegtuigen
		//		TEXT 		= DAGNUMMER + REGISTRATIE + CALLSIGN
		//		VLUCHTEN	= Het aantal vluchten
		//		DUUR 		= Totale vliegtijd
		//		GEEN_LANDINGSTIJD = Er is wel gestart maar (nog) geen landingstijd. Gegevens kunnen dus nog wijziggen
		//
		// @example
		// {
		//		"children":
		//		[{
		//			"ID":"290",
		//			"TEXT":"PH-1303 (E3)",
		//			"VLUCHTEN":"1",
		//			"DUUR":"02:33",
		//			"GEEN_LANDINGSTIJD":0,
		//			"children":
		//			[{
		//				"TEXT":"Lierstart CCT",
		//				"VLUCHTEN":"1",
		//				"DUUR":"02:33",
		//				"leaf":"1"
		//			}]},
		//		{
		//			"TEXT":"PH-936 (E9)",
		//			"ID":"255",
		//			"VLUCHTEN":"1",
		//			"DUUR":"00:26",
		//			"children":
		//			[{
		//				"TEXT":"Lierstart GeZC",
		//				"VLUCHTEN":"1",
		//				"DUUR":"00:26",
		//				"leaf":"1"
		//			}],
		//		"GEEN_LANDINGSTIJD":0
		//		}]
		// }
		function VliegtuigenTreeviewJSON()
		{
			$where = ' ';
			if (array_key_exists('_:datum', $this->qParams))
			{
				$where = sprintf("(`DATUM` = '%s')", $this->qParams['_:datum']);
			}
			else
			{
				$where = "(`DATUM` = CAST(NOW()AS DATE))";
			}
			
			$query = "
				SELECT
					ref_vliegtuigen.ID AS ID,				
					REG_CALL,
					STARTMETHODE,
					COUNT(*) AS VLUCHTEN,
					SEC_TO_TIME(SUM(TIME_TO_SEC(STR_TO_DATE(DUUR, '%H:%i') ))) AS DUUR,
					(SELECT count(*) 
					 FROM 
						`oper_startlijst` 
					 WHERE 
						oper_startlijst.VLIEGTUIG_ID = startlijst_view.VLIEGTUIG_ID AND 
						STARTTIJD IS NOT NULL AND
					    LANDINGSTIJD IS NULL AND " . $where . ") AS OPEN_VLUCHT 
				FROM 
					`startlijst_view` INNER JOIN ref_vliegtuigen ON VLIEGTUIG_ID = ref_vliegtuigen.ID
				WHERE 
					ref_vliegtuigen.CLUBKIST =  1 AND STARTTIJD IS NOT NULL AND " . $where . "
				GROUP BY 
					REG_CALL,
					STARTMETHODE
				ORDER BY
					REG_CALL,
					STARTMETHODE_ID DESC
					"; 
		
			parent::DbOpvraag($query);
			
			$id = -1;
			$kist = "";
			$starts = 0;
			$vliegtijd = 0;
			$kinderen = array();
			$retValue = array();
			$geen_landingstijd = 0;
			
			foreach (parent::DbData() as $dbvlucht)
			{
				if ($kist != $dbvlucht['REG_CALL'])
				{
					if ($kist != "")
					{
						$a = array();
						$a['ID'] = $id;
						$a['TEXT'] = $kist;
						$a['VLUCHTEN'] = $starts;
						$a['DUUR'] = sprintf("%02d:%02d", floor($vliegtijd/60), $vliegtijd%60);
						$a['GEEN_LANDINGSTIJD'] = $geen_landingstijd; 
						$a['children'] = $kinderen;
						array_push($retValue, $a);	
					}
					$kist = $dbvlucht['REG_CALL'];
					$id = $dbvlucht['ID'];
					$kinderen = array();
					$geen_landingstijd = 0;
					$starts = 0;
					$vliegtijd = 0;
				}
				$vlucht = array();
				$vlucht['TEXT'] 			= $dbvlucht['STARTMETHODE'];
				$vlucht['VLUCHTEN'] 		= $dbvlucht['VLUCHTEN'];				
				$vlucht['DUUR'] 			= substr($dbvlucht['DUUR'], 0, 5);
				$vlucht['leaf']				= true;
				
				$starts = $starts + $dbvlucht['VLUCHTEN'];
				$vliegtijd = $vliegtijd + substr($dbvlucht['DUUR'], 0, 2) * 60 + substr($dbvlucht['DUUR'], 3, 2);
				
				if ($dbvlucht['OPEN_VLUCHT'] != "0")
					$geen_landingstijd = 1;
				
				array_push($kinderen, $vlucht);
			}
			
			if (count($kinderen) > 0)
			{
				$a = array();
				$a['TEXT'] = $kist;
				$a['ID'] = $id;
				$a['VLUCHTEN'] = $starts;
				$a['DUUR'] = sprintf("%02d:%02d", floor($vliegtijd/60), $vliegtijd%60);
				$a['children'] = $kinderen;
				$a['GEEN_LANDINGSTIJD'] = $geen_landingstijd; 
				array_push($retValue, $a);	
			}
			
			echo '{"children":' . json_encode(array_map('PrepareJSON', $retValue)) . "}";
			return;
		}	

		function LogboekJSON()
		{		
			Debug(__FILE__, __LINE__, "Startlijst.LogboekJSON()");	
			Debug(__FILE__, __LINE__, sprintf("Data=%s", print_r($this->Data, true)));			
			Debug(__FILE__, __LINE__, sprintf("qParams=%s", print_r($this->qParams, true)));
			
			$l = MaakObject('Login');
			$where = sprintf("((VLIEGER_ID = '%d') OR (INZITTENDE_ID = '%d'))", $l->getUserFromSession(), $l->getUserFromSession());
			
			if (array_key_exists('_:datum', $this->qParams))
			{
				$where = $where . sprintf("AND (`DATUM` > '%s')", $this->qParams['_:datum']);
			}
			
			$orderby = " ORDER BY startlijst_view.DATUM DESC, STARTTIJD DESC";
	
			$query = "
				SELECT
					%s
				FROM
					startlijst_view
				WHERE
					" . $where . $orderby;
			
			if (array_key_exists('_:LAATSTE_AANPASSING', $this->qParams))
			{
				$query  = sprintf($query, "MAX(LAATSTE_AANPASSING) AS LAATSTE_AANPASSING");
				$la = $this->LaatsteAanpassing($query);
				Debug(__FILE__, __LINE__, sprintf("LAATSTE_AANPASSING=%s", $la));	
				echo $la;
			}
			else
			{		
				parent::DbOpvraag(sprintf($query, "COUNT(*) AS total"));
				$total = parent::DbData();		// total amount of records in the database
				
				$limit = "";
				if (array_key_exists('limit', $this->Data))
				{
					$limit = sprintf(" LIMIT %d , %d ", $this->Data['start'], $this->Data['limit']);
				}			
				$rquery = sprintf($query, "
					ID,
					DATUM,
					REG_CALL,
					STARTTIJD,
					LANDINGSTIJD,
					DUUR,
					coalesce(`VLIEGERNAAM_LID`,`VLIEGERNAAM`) AS `VLIEGERNAAM`,
					coalesce(`INZITTENDENAAM_LID`,`INZITTENDENAAM`) AS `INZITTENDENAAM`,
					STARTMETHODE, OPMERKING") . $limit;

				parent::DbOpvraag($rquery);			
				echo '{"total":"'.$total[0]['total'].'","results":'.json_encode(array_map('PrepareJSON', parent::DbData())).'}';
			}		
		}	

		// example
		//	{
		//		"startsDrieMnd": "2",
		//		"startsVorigJaar": "36",
		//		"startsDitJaar": "2",
		//		"urenDrieMnd": "1:42",
		//		"urenDitJaar": "1:42",
		//		"urenVorigJaar": "27:31",
		//		"statusBarometer": "onbekend",
		//		"startsBarometer": "38",
		//		"urenBarometer": "29:13"
		//	}
		
		function VliegerRecencyJSON()
		{
			Debug(__FILE__, __LINE__, "Startlijst.VliegerRecencyJSON()");
			Debug(__FILE__, __LINE__, sprintf("qParams=%s", print_r($this->qParams, true)));	
			
			$retVal['startsDrieMnd'] = 0;
			$retVal['startsVorigJaar'] = 0; 
			$retVal['startsDitJaar'] = 0;

			$retVal['urenDrieMnd'] = 0;
			$retVal['urenDitJaar'] = 0; 
			$retVal['urenVorigJaar'] = 0; 
			$retVal['statusBarometer'] = 'onbekend'; 	// andere mogelijkheden: rood/geel/groen
			$retVal['startsBarometer'] = 0; 	
			$retVal['urenBarometer'] = 0; 	

			if (!array_key_exists('_:id', $this->qParams))
			{
				echo '{"success":false,"errorCode":-1,"error":"Lid ID in aanroep"}';
				return;
			}

			$where = sprintf("DATUM > '%d-01-01' AND STARTTIJD IS NOT NULL AND LANDINGSTIJD IS NOT NULL AND ", Date("Y")-1);
			$where .= sprintf("(VLIEGER_ID = %s OR INZITTENDE_ID = %s)", $this->qParams['_:id'], $this->qParams['_:id']);

			$query = "
				SELECT
					*
				FROM
					startlijst_view
				WHERE
					" . $where . " ORDER BY DATUM DESC";

			parent::DbOpvraag($query);	

			foreach (parent::DbData() as $vlucht)
			{
				$diff = abs(strtotime(date('Y-m-d')) - strtotime($vlucht['DATUM'])) / (60*60*24);  	// dif in dagen

				if ($diff < (13*7)) // laaste drie maanden = 13 weken
				{
					$retVal['startsDrieMnd']++;				
					$retVal['urenDrieMnd'] += intval(substr($vlucht['DUUR'],0,2)) * 60 + intval(substr($vlucht['DUUR'],3,2));
				}

				if ($diff < (52*7)) // laaste jaar = 52 weken
				{
					$retVal['startsBarometer']++;				
					$retVal['urenBarometer'] += intval(substr($vlucht['DUUR'],0,2)) * 60 + intval(substr($vlucht['DUUR'],3,2));
				}

				if (substr($vlucht['DATUM'],0,4) == Date("Y"))	// Dit jaar
				{
					$retVal['startsDitJaar']++;
					$retVal['urenDitJaar'] += intval(substr($vlucht['DUUR'],0,2)) * 60 + intval(substr($vlucht['DUUR'],3,2));; 
				}
				else	// Vorig jaar
				{
					$retVal['startsVorigJaar']++;
					$retVal['urenVorigJaar'] +=intval(substr($vlucht['DUUR'],0,2)) * 60 + intval(substr($vlucht['DUUR'],3,2)); 
				}
			}


			// uitrekenen barameter status
			// getallen komen uit plaatje https://members.gliding.co.uk/wp-content/uploads/sites/3/2015/04/1430312045_currency-barometer.gif
			// Zijn verhoudingen / pixels
			// Grens rood / geel = 8,75
			// Grens geel/groen = 2x 8,75 
			// 5 uren = 4.1
			// 5 starts = 3.2

			$y1 = ($retVal['urenBarometer'] / 60) * 4.1 / 5;
			$y2 = $retVal['startsBarometer'] * 3.2 / 5;

			$gem = ($y1 + $y2) / 2;		// snijpunt van witte lijn in het plaatje

			if ($gem < 8.75)
				$retVal['statusBarometer'] = 'rood';	
			else if ($gem < 2*8.75)
				$retVal['statusBarometer'] = 'geel';
			else
				$retVal['statusBarometer'] = 'groen';


			// tijden staan in minuten, moet naar hh:mm
			$retVal['urenDrieMnd'] = intval($retVal['urenDrieMnd'] / 60) . ":" . sprintf("%02d",$retVal['urenDrieMnd'] %60);
			$retVal['urenDitJaar'] = intval($retVal['urenDitJaar'] / 60) . ":" . sprintf("%02d",$retVal['urenDitJaar'] %60);
			$retVal['urenVorigJaar'] = intval($retVal['urenVorigJaar'] / 60) . ":" . sprintf("%02d",$retVal['urenVorigJaar'] %60);
			$retVal['urenBarometer'] = intval($retVal['urenBarometer'] / 60) . ":" . sprintf("%02d",$retVal['urenBarometer'] %60);

			echo json_encode(array_map('PrepareJSON', $retVal));
		}
		
		// -------------------------------------------------------------------------------------------------------------------------
		// PHP interne functies
		
		function GetObject($id)
		{
			Debug(__FILE__, __LINE__, sprintf("Startlijst.GetObject(%s)", $id));	
			
			$query = sprintf("
				SELECT
					*
				FROM
					oper_startlijst
				WHERE
					ID = '%s'", $id);
					
			parent::DbOpvraag($query);
			Debug(__FILE__, __LINE__, sprintf("Data=%s", print_r(parent::DbData(), true)));
			return (parent::DbData());
		}
		
		// ------------------------------------------------------------------
		// hoeveel starts heeft dit lid vandaag gemaakt?
		// 
		// @return : 	integer waarde
		function AantalStartsLidVandaag($id)
		{
			if ($id == null)
				return null;
			
			Debug(__FILE__, __LINE__, sprintf("Startlijst.AantalStartsLidVandaag(%s)", $id));				
			
			parent::DbOpvraag("
				SELECT
					COUNT(*) AS AANTAL_STARTS 
				FROM
					oper_startlijst
				WHERE
					(`DATUM` = CAST(NOW()AS DATE)) AND VLIEGER_ID=" . $id);		
					
			Debug(__FILE__, __LINE__, sprintf("Data=%s", print_r(parent::DbData(), true)));
			return (parent::DbData());
		}
		
		// ------------------------------------------------------------------
		// hoeveel starts heeft dit vliegtuig vandaag gemaakt?
		// 
		// @return : 	integer waarde
		function AantalStartsVliegtuigVandaag($id)
		{
			Debug(__FILE__, __LINE__, sprintf("Startlijst.AantalStartsVliegtuigVandaag(%s)", $id));	
			
			parent::DbOpvraag("
				SELECT
					COUNT(*) AS AANTAL_STARTS 
				FROM
					oper_startlijst
				WHERE
					(`DATUM` = CAST(NOW()AS DATE)) AND VLIEGTUIG_ID=" . $id);		
				
			Debug(__FILE__, __LINE__, sprintf("Data=%s", print_r(parent::DbData(), true)));				
			return (parent::DbData());
		}
		
		// ------------------------------------------------------------------
		// hoeveel starts heeft dit vliegtuig dit jaar gemaakt?
		// 
		// @return : 	integer waarde
		function AantalStartsVliegtuigDitJaar($id)
		{
			Debug(__FILE__, __LINE__, sprintf("Startlijst.AantalStartsVliegtuigDitJaar(%s)", $id));	
			
			parent::DbOpvraag("
				SELECT
					COUNT(*) AS AANTAL_STARTS 
				FROM
					oper_startlijst
				WHERE
					(YEAR(`DATUM`) = YEAR(NOW())) AND VLIEGTUIG_ID=" . $id);		
				
			Debug(__FILE__, __LINE__, sprintf("Data=%s", print_r(parent::DbData(), true)));				
			return (parent::DbData());
		}
		
	
		// ------------------------------------------------------------------
		// alles opslaan m.u.v. de start- landingstijd
		function SaveObject()
		{
			Debug(__FILE__, __LINE__, "Startlijst.SaveObject()");
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
			
			$v = MaakObject('Aanwezig');
			
			$d['VLIEGTUIG_ID']  	= $this->Data['VLIEGTUIG_ID'];
			$v->AanmeldenVliegtuigVandaag($this->Data['VLIEGTUIG_ID']);
			Debug(__FILE__, __LINE__, sprintf("AanmeldenVliegtuigVandaag VLIEGTUIG=%d", $this->Data['VLIEGTUIG_ID']));
			
			$rv = MaakObject('Vliegtuigen');
			$rvObj = $rv->GetObject($this->Data['VLIEGTUIG_ID']);
			Debug(__FILE__, __LINE__, sprintf("rvObj=%s", print_r($rvObj, true)));
			
			$d['STARTMETHODE_ID'] 	= $this->Data['STARTMETHODE_ID']; 
			
			$d['OPMERKING'] 		= null;
			$d['OP_REKENING_ID'] 	= null;
			$d['VLIEGER_ID'] 		= null;
			$d['INZITTENDE_ID']  	= null;
			$d['SLEEPKIST_ID'] 		= null; 
			$d['SLEEP_HOOGTE']		= null; 			
			$d['SOORTVLUCHT_ID'] 	= null; 
			$d['VLIEGERNAAM'] 		= null; 
			$d['INZITTENDENAAM'] 	= null; 
			
			if (array_key_exists('SOORTVLUCHT_ID', $this->Data))
			{
				$d['SOORTVLUCHT_ID'] = $this->Data['SOORTVLUCHT_ID'];
			}
			
			$vliegerLidType = null;		// gaan we later gebruiken om lidtype op te slaan
			
			// als het een proef start is, wordt het vlieger id niet opgeslagen, maar wel de naam van de vlieger
			if ($d['SOORTVLUCHT_ID'] == "806") // 806 = 'Proefstart privekist eenzitter' 
			{
				if (array_key_exists('VLIEGERNAAM', $this->Data))
				{
					$d['VLIEGERNAAM'] = $this->Data['VLIEGERNAAM'];
				}			
			}
			else			
			{				
				if (array_key_exists('VLIEGER_ID', $this->Data))
				{
					$d['VLIEGER_ID'] = $this->Data['VLIEGER_ID'];
					
					Debug(__FILE__, __LINE__, sprintf("AanmeldenLidVandaag VLIEGER=%d", $this->Data['VLIEGER_ID']));
					
					if ($rvObj[0]['CLUBKIST'] == 1)
						$v->AanmeldenLidVliegtuigType($this->Data['VLIEGER_ID'], $rvObj[0]['TYPE_ID']);
					else
						$v->AanmeldenLidVandaag($this->Data['VLIEGER_ID']);
					
					$rl = MaakObject('Leden');
					$rlvObj = $rl->GetObject($this->Data['VLIEGER_ID']);
					
					$vliegerLidType = $rlvObj[0]['LIDTYPE_ID'];
					
					// er zijn nog meer gevallen wanneer we de vliegernaam willen opslaan
					switch ($rlvObj[0]['LIDTYPE_ID'])
					{
						case '600':			// diversen
						case '607': 		// zusterclub
						case '609':			// nieuw lid		
						{
							if (array_key_exists('VLIEGERNAAM', $this->Data))
							{
								$d['VLIEGERNAAM'] = $this->Data['VLIEGERNAAM'];
							}
							break;
						}
					}					
				}
			}
	
			if ($rvObj[0]['ZITPLAATSEN'] != 1)
			{
				if (($d['SOORTVLUCHT_ID'] != "810")) 		// 810	'Solostart met tweezitter'
				{
					if (($d['SOORTVLUCHT_ID'] == "801") 	||	// 801	Passagierstart
						($d['SOORTVLUCHT_ID'] == "802")) 		// 802	Relatiestart
					{
						if (array_key_exists('INZITTENDENAAM', $this->Data))
						{
							$d['INZITTENDENAAM'] = $this->Data['INZITTENDENAAM'];
						}
					}
					else
					{
						if (array_key_exists('INZITTENDE_ID', $this->Data))
						{
							$d['INZITTENDE_ID'] = $this->Data['INZITTENDE_ID'];
							$v->AanmeldenLidVandaag($this->Data['INZITTENDE_ID']);
							Debug(__FILE__, __LINE__, sprintf("AanmeldenLidVandaag INZITTENDE=%d", $this->Data['INZITTENDE_ID']));
						}
					}
				}				
			}
				
			if (array_key_exists('OP_REKENING_ID', $this->Data))
			{
				$d['OP_REKENING_ID'] = $this->Data['OP_REKENING_ID'];
				
				if ($this->Data['OP_REKENING_ID'] != $this->Data['VLIEGER_ID'])
				{
					$v->AanmeldenLidVandaag($this->Data['OP_REKENING_ID']);
					Debug(__FILE__, __LINE__, sprintf("AanmeldenLidVandaag OP_REKENING=%d", $this->Data['OP_REKENING_ID']));
				}
			}
			else
			{
				if (array_key_exists('VLIEGER_ID', $this->Data))
				{
					$d['OP_REKENING_ID'] = $this->Data['VLIEGER_ID'];
				}
			}

			// Een DDWV vlieger betaald altijd de rekening zelf
			if ($d['SOORTVLUCHT_ID'] == "814") // 814 = DDWV: Midweekvliegen
			{
				if (array_key_exists('VLIEGER_ID', $this->Data))
				{
					$d['OP_REKENING_ID'] = $this->Data['VLIEGER_ID'];
				}
			}
			
			if ($this->Data['STARTMETHODE_ID'] == "501") // sleep start
			{
				if (array_key_exists('SLEEPKIST_ID', $this->Data))
				{
					$d['SLEEPKIST_ID'] = $this->Data['SLEEPKIST_ID'];
					$v->AanmeldenVliegtuigVandaag($this->Data['SLEEPKIST_ID']);
					Debug(__FILE__, __LINE__, sprintf("AanmeldenVliegtuigVandaag SLEEPKIST=%d", $this->Data['SLEEPKIST_ID']));				
				}
				
				if ((array_key_exists('SLEEP_HOOGTE', $this->Data)) && ($d['SLEEPKIST_ID'] !== NULL))
				{
					$d['SLEEP_HOOGTE'] = $this->Data['SLEEP_HOOGTE'];			
				}		
			}			
			
			if (array_key_exists('OPMERKING', $this->Data))
			{
				$d['OPMERKING'] = $this->Data['OPMERKING'];
			}
			
			if (($this->Data['ID'] < 0) || ($this->Data['ID'] == null))		// Nieuwe start 
			{
				if (array_key_exists('DATUM', $this->Data))
				{
					if (strlen(trim($this->Data['DATUM'])) > 0)
						$d['DATUM'] = $this->Data['DATUM'];
					else
						$d['DATUM'] = date('Y-m-d');	
				}
				else
				{
					$d['DATUM'] = date('Y-m-d');
				}
						
				$d['DAGNUMMER'] = $this->NieuwDagNummer($d['DATUM']);
				$d['ID'] = NieuwID($d['DATUM']);
								
				parent::DbToevoegen('oper_startlijst', $d);
			}
			else	// Aanpassen bestaande start
			{
				$orgVlucht = $this->GetObject($this->Data['ID']);
				parent::DbAanpassen('oper_startlijst', $this->Data['ID'], $d);
			}

			echo '{"success":true,"errorCode":-1,"error":""}';
		}
		
		// ------------------------------------------------------------------
		// Creeer een start vanuit de code voor lid/vliegtuig (bijvoorbeeld als iemand overland gaat)
		function CreeerStart($LidID, $VliegtuigID, $StartMethode)
		{
			$record['VLIEGTUIG_ID'] = $VliegtuigID;
			$record['VLIEGER_ID'] = $LidID;
			$record['OP_REKENING_ID'] = $LidID;
			$record['DATUM'] = date('Y-m-d');
			$record['DAGNUMMER'] = $this->NieuwDagNummer($record['DATUM']);			
			$record['OPMERKING'] = "Let op, start automatisch aangemaakt. Controleer handmatig";
			
			$record['STARTMETHODE_ID'] 	= null;
			$record['INZITTENDE_ID'] 	= null;
			$record['INZITTENDENAAM'] 	= null;
			$record['VLIEGERNAAM'] 		= null;
			$record['SLEEPKIST_ID'] 	= null;
		
			$record['STARTMETHODE_ID'] = $StartMethode;
				
			$record['SOORTVLUCHT_ID'] =  $this->sVlucht($record);
			parent::DbToevoegen('oper_startlijst', $record);
		}
		
		// ------------------------------------------------------------------
		// Bepaal het volgnummer van de dag
		function NieuwDagNummer($datum)
		{
			parent::DbOpvraag("
					SELECT 
						DAGNUMMER + 1 AS NIEUW_DAGNUMMER
					FROM 
						oper_startlijst
					WHERE 
						((DATUM = '" . $datum . "')) 
					ORDER BY 
						CONVERT(DAGNUMMER,UNSIGNED INTEGER) DESC
					LIMIT 1;");
			$dagnr = parent::DbData();
			if (count($dagnr) > 0)
				return $dagnr[0]['NIEUW_DAGNUMMER'];
			else
				return 1;		
		}
		
		// ------------------------------------------------------------------
		// Verwijder de start. D.w.z. het veld VERWIJDERD wordt op 1 gezet
		function VerwijderObject()
		{
			Debug(__FILE__, __LINE__, "Startlijst.VerwijderObject()");
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
			
			$v = MaakObject('Aanwezig');
			
			$d['VERWIJDERD'] = 1;	
			$d['OPMERKING'] 		= null;

			if (array_key_exists('OPMERKING', $this->Data))
			{
				$d['OPMERKING'] = $this->Data['OPMERKING'];
			}
				
			parent::DbAanpassen('oper_startlijst', $this->Data['ID'], $d);

			echo '{"success":true,"errorCode":-1,"error":""}';
		}		
	
		// ------------------------------------------------------------------
		// alleen de starttijd opslaan
		function SaveStartTijd()
		{
			Debug(__FILE__, __LINE__, "Startlijst.SaveStartTijd()");
			Debug(__FILE__, __LINE__, sprintf("Data=%s", print_r($this->Data, true)));				

			if (!array_key_exists('ID', $this->Data))
			{
				echo '{"success":false,"errorCode":-1,"error":"Geen ID in dataset"}';
				return;
			}
			$id = $this->Data['ID'];

			$l = MaakObject('Login');
			if ($l->magSchrijven() == false)
			{	
				$UserID = $l->getUserFromSession();
				$start = GetObject($id);

				if ($start[0]['VLIEGER_ID'] != $UserID)			// mag geen starttijd voor iemand anders invullen
				{
					Debug(__FILE__, __LINE__, "Geen schrijfrechten");
					$l->toegangGeweigerd();
				}
			}
			
			$d['STARTTIJD'] = null;
			
			if (array_key_exists('STARTTIJD', $this->Data))
			{
				$d['STARTTIJD'] = $this->Data['STARTTIJD'];
				
				$di = MaakObject('Daginfo');
				
				$diObj = $di->GetObject();
				
				if ($diObj[0]['ID'] != -1)		// Daginfo is ingevuld
				{
					$d['BAAN_ID'] = $diObj[0]['BAAN_ID'];
				}		
			}
					
			$vlucht = $this->GetObject($this->Data['ID']);
			parent::DbAanpassen('oper_startlijst', $id, $d);
			
			echo '{"success":true,"errorCode":-1,"error":""}';
		}	
		
		// ------------------------------------------------------------------
		// alleen de landingstijd opslaan
		function SaveLandingsTijd()
		{
			Debug(__FILE__, __LINE__, "Startlijst.SaveLandingsTijd()");
			Debug(__FILE__, __LINE__, sprintf("Data=%s", print_r($this->Data, true)));				

			if (!array_key_exists('ID', $this->Data))
			{
				echo '{"success":false,"errorCode":-1,"error":"Geen ID in dataset"}';
				return;
			}
			$id = $this->Data['ID'];

			$l = MaakObject('Login');
			if ($l->magSchrijven() == false)
			{	
				$UserID = $l->getUserFromSession();
				$start = $this->GetObject($id);

				if ($start[0]['VLIEGER_ID'] != $UserID)			// mag geen landingstijd voor iemand anders invullen
				{
					Debug(__FILE__, __LINE__, "Geen schrijfrechten");
					$l->toegangGeweigerd();
				}
			}
							
			$d['LANDINGSTIJD'] = null;
			
			if (array_key_exists('LANDINGSTIJD', $this->Data))
				$d['LANDINGSTIJD'] = $this->Data['LANDINGSTIJD'];
					
			parent::DbAanpassen('oper_startlijst', $id, $d);
			
			echo '{"success":true,"errorCode":-1,"error":""}';
		}	
		
	
		// 801	Passagierstart (kosten 40�)
		// 802	Relatiestart
		// 803	Zusterclub: 
		// 804	Oprotkabel
		// 805	Normale GeZC start
		// 806	Proefstart privekist eenzitter
		// 807	Privestart
		// 809	Instructie of checkvlucht
		// 810	Solostart met tweezitter
		// 811	Invliegen, Dienststart
		// 812	Donateursstart
		// 813	5- of 10-rittenkaarthouder
		// 814	DDWV: Midweekvliegen
		// 815	Sleepkist, Dienststart
		
		function SoortVlucht()
		{
			echo  $this->sVlucht($this->Data);
		}
		
		function sVlucht($record)
		{		
			Debug(__FILE__, __LINE__, "Startlijst.SoortVluchtJSON()");	
			Debug(__FILE__, __LINE__, sprintf("Data=%s", print_r($record, true)));				
		
			$rvObj = null;
			$rlvObj = null;
			$rliObj = null;
						
			if (!array_key_exists('VLIEGER_ID', $record))
				$record['VLIEGER_ID'] = -1;
					
			if (array_key_exists('VLIEGTUIG_ID', $record))
			{
				$rv = MaakObject('Vliegtuigen');
				$rvObj = $rv->GetObject($record['VLIEGTUIG_ID']);
				Debug(__FILE__, __LINE__, sprintf("rvObj=%s", print_r($rvObj, true)));
			}
				
			if (array_key_exists('VLIEGER_ID', $record))
			{
				$rl = MaakObject('Leden');
				$rlvObj = $rl->GetObject($record['VLIEGER_ID']);
				Debug(__FILE__, __LINE__, sprintf("rlvObj=%s", print_r($rlvObj, true)));
			}
	
			if (array_key_exists('INZITTENDE_ID', $record))
			{
				$rl = MaakObject('Leden');
				$rliObj = $rl->GetObject($record['INZITTENDE_ID']);
				Debug(__FILE__, __LINE__, sprintf("rliObj=%s", print_r($rliObj, true)));
			}
				
			$di = MaakObject('Daginfo');				
			$diObj = $di->GetObject();
			Debug(__FILE__, __LINE__, sprintf("diObj=%s", print_r($diObj, true)));
			
			if ($rlvObj != null)
			{
				if ($rlvObj[0]['LIDTYPE_ID'] == "600") // 600 = Diverse (Bijvoorbeeld bedrijven- of jongerendag)
				{
					Debug(__FILE__, __LINE__, "SoortVluchtJSON:801	Passagierstart");
					return "801"; // 801	Passagierstart
				}
			}
	
			if ($rlvObj != null)
			{
				Debug(__FILE__, __LINE__, sprintf("LIDTYPE_ID=%d", $rlvObj[0]['LIDTYPE_ID']));
				switch ($rlvObj[0]['LIDTYPE_ID'])
				{
					case "600" : // 600 = Diverse (Bijvoorbeeld bedrijven- of jongerendag)
					{
						Debug(__FILE__, __LINE__, "SoortVluchtJSON:801	Passagierstart");
						return "801"; // 801	Passagierstart
						
						break;
					}
					case "606" : // 606 = Donateur
					{
						if ($diObj[0]['SOORTBEDRIJF_ID'] != 701)		// 701 = clubbedrijf
						{			
							// we gaan zaken voor DDWV uitzoeken
							$a = $this->AantalStartsLidVandaag($record['VLIEGER_ID']);
							
							if (count($a) > 0)
							{
								if ((int)($a[0]['AANTAL_STARTS']) < 3)
								{
									Debug(__FILE__, __LINE__, "SoortVluchtJSON:814 DDWV: Midweekvliegen");
									return "814";	// 814	DDWV: Midweekvliegen
								}
							}
							else
							{
								Debug(__FILE__, __LINE__, "SoortVluchtJSON:814 DDWV: Midweekvliegen");
								return "814";	// 814	DDWV: Midweekvliegen				
							}
						}					
						Debug(__FILE__, __LINE__, "SoortVluchtJSON:812	Donateursstart");
						return "812"; // 812	Donateursstart
						break;
					}
					case "607" : // 607 = Zusterclub
					{
						Debug(__FILE__, __LINE__, "SoortVluchtJSON:803	Start zusterclub");
						return "803"; // 803	Start zusterclub
						break;
					}					
					case "608" : // 608 = 5 rittenkaart
					{
						Debug(__FILE__, __LINE__, "SoortVluchtJSON:813	5- of 10-rittenkaarthouder");
						return "813"; // 813	5- of 10-rittenkaarthouder
						break;
					}
					case "609" : // 609 = nieuw lid
					{
						if ($rvObj[0]['ZITPLAATSEN'] != 1)
						{
							Debug(__FILE__, __LINE__, "SoortVluchtJSON:809	Instructie of checkvlucht");
							return "809"; // 809 Instructie of checkvlucht
						}
						else
						{
							Debug(__FILE__, __LINE__, "SoortVluchtJSON:805	Normale start");
							return "805"; // 805 Normale start

						}
						break;
					}		
					case "611" : // 611 = cursist
					{
						Debug(__FILE__, __LINE__, "SoortVluchtJSON:809	Instructie of checkvlucht");
						return "809"; // 809 Instructie of checkvlucht
						break;
					}					
					case "625": // 625 = Lid is DDWVer
					{
						$a = $this->AantalStartsLidVandaag($record['VLIEGER_ID']);
					
						Debug(__FILE__, __LINE__, sprintf("AANTAL_STARTS=%d", (int)($a[0]['AANTAL_STARTS'])));
						if ((int)($a[0]['AANTAL_STARTS']) < 3)
						{
							Debug(__FILE__, __LINE__, "SoortVluchtJSON:814	DDWV: Midweekvliegen");
							return "814"; // 814	DDWV: Midweekvliegen
						}
						break;
					}
				}	
			}
			
			if (array_key_exists('SOORTBEDRIJF_ID', $diObj[0]))
			{
				if ($diObj[0]['SOORTBEDRIJF_ID'] == 703)		// Vandaag is DDWV
				{				
					$a = $this->AantalStartsLidVandaag($record['VLIEGER_ID']);
					
					if (count($a) > 0)
					{
						if ((int)($a[0]['AANTAL_STARTS']) < 3)
						{
							return "814";	// 814	DDWV: Midweekvliegen
							Debug(__FILE__, __LINE__, "SoortVluchtJSON:814 DDWV: Midweekvliegen");
							return;
						}
					}
					else
					{
						return "814";	// 814	DDWV: Midweekvliegen
						Debug(__FILE__, __LINE__, "SoortVluchtJSON:814 DDWV: Midweekvliegen");
						return;					
					}
				}
			}
			
			Debug(__FILE__, __LINE__, sprintf("CLUBKIST=%d", $rvObj[0]['CLUBKIST']));
			if ($rvObj[0]['CLUBKIST'] == 0)
			{	
				return "807"; // 807	Privestart
				Debug(__FILE__, __LINE__, "SoortVluchtJSON:807	Privestart");
				return;			
			}
			
			if ($rlvObj != null)
			{
				Debug(__FILE__, __LINE__, sprintf("GPL_VERLOOPT=%d", $rlvObj[0]['GPL_VERLOOPT']));
				if ($rlvObj[0]['GPL_VERLOOPT'] != null)
				{
					if ($rvObj[0]['ZITPLAATSEN'] == 1)
					{
						if (($rvObj[0]['TYPE_ID'] == 402) || ($rvObj[0]['TYPE_ID'] == 407))	// 402 = LS4, 407 = ASK23
						{
							$v = $this->AantalStartsVliegtuigVandaag($record['VLIEGTUIG_ID']);
							Debug(__FILE__, __LINE__, sprintf("SoortVluchtJSON:Vluchten vandaag = %d", $v[0]['AANTAL_STARTS']));
							
							if ($v[0]['AANTAL_STARTS'] == 0)
							{
								return "811"; // 811	Invliegen, Dienststart
								Debug(__FILE__, __LINE__, "SoortVluchtJSON:811	Invliegen, Dienststart");
								return;							
							}
						}
					}
					
					$j = $this->AantalStartsVliegtuigDitJaar($record['VLIEGTUIG_ID']);		
					Debug(__FILE__, __LINE__, sprintf("SoortVluchtJSON:Vluchten dit jaar = %d", $j[0]['AANTAL_STARTS']));				
					if ($j[0]['AANTAL_STARTS'] == 0)
					{
						return "811"; // 811	Invliegen, Dienststart
						Debug(__FILE__, __LINE__, "SoortVluchtJSON:811	Invliegen, Dienststart");
						return;			
					}
				}
			}
			
			if ($rliObj == null)
			{
				if ($rlvObj != null)
				{
					Debug(__FILE__, __LINE__, sprintf("GPL_VERLOOPT=%d", $rlvObj[0]['GPL_VERLOOPT']));
					if ($rlvObj[0]['GPL_VERLOOPT'] == null)
					{
						if ($rvObj[0]['ZITPLAATSEN'] > 1)		// tweezitter met inzittende niet ingevuld
						{
							return "810"; // 810	Solostart met tweezitter
							Debug(__FILE__, __LINE__, "SoortVluchtJSON:810	Solostart met tweezitter");
							return;					
						}
					}
				}
			}
			else
			{
				if ($rlvObj != null)
				{
					Debug(__FILE__, __LINE__, sprintf("GPL_VERLOOPT=%d", $rlvObj[0]['GPL_VERLOOPT']));
					Debug(__FILE__, __LINE__, sprintf("INSTRUCTEUR=%s", $rliObj[0]['INSTRUCTEUR']));
					if ($rliObj[0]['INSTRUCTEUR'] == 1)	// instructuer
					{
						return "809"; // 809	Instructie of checkvlucht
						Debug(__FILE__, __LINE__, "SoortVluchtJSON:809	Instructie of checkvlucht");
						return;						
					}
				}
			}
				
			return "805";	// 805	Normale GeZC start
			Debug(__FILE__, __LINE__, "SoortVluchtJSON:805	Normale GeZC start");
		}
		
		// Lijst welke vluchten uit de startlijst in aanmerking komen voor een flarm start
		// Dit wordt gebruikt om flarm voor vliegtuigen eenvoudig te koppelen
		function StartLijstVoorFlarmJSON()
		{
			Debug(__FILE__, __LINE__, "Startlijst.StartLijstVoorFlarmJSON()");	
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
			
			$s = false;
			if (array_key_exists('_:starttijd', $this->qParams))	
			{
				if (is_null($this->qParams['_:starttijd']) == false)
					$s = true;
					
			}
			$f = false;
			if (array_key_exists('_:landingstijd', $this->qParams))	
			{
				if (is_null($this->qParams['_:landingstijd']) == false) 
					$f = true;
					
			}
			
			if ($s && $f)
			{
				$where = $where . sprintf(" AND ((ABS(TIME_TO_SEC(TIMEDIFF(STARTTIJD, '%s'))/60) < 10)", $this->qParams['_:starttijd']);
				$where = $where . sprintf(" OR (ABS(TIME_TO_SEC(TIMEDIFF(LANDINGSTIJD, '%s'))/60) < 10))", $this->qParams['_:landingstijd']);
			}
			else if ($s)
			{
				$where = $where . sprintf(" AND (ABS(TIME_TO_SEC(TIMEDIFF(STARTTIJD, '%s'))/60) < 10)", $this->qParams['_:starttijd']);
			}
			else if ($f)
			{
				$where = $where . sprintf(" AND (ABS(TIME_TO_SEC(TIMEDIFF(LANDINGSTIJD, '%s'))/60) < 10)", $this->qParams['_:landingstijd']);
			}
			
			$orderby = " ORDER BY DAGNUMMER, ID ";
			
			$query = "
				SELECT
					%s 
				FROM
					startlijst_view
				WHERE
					" . $where . $orderby;
			
			parent::DbOpvraag(sprintf($query, "COUNT(*) AS total"));
			$total = parent::DbData();		// total amount of records in the database
					
			$rquery = sprintf($query, "VLIEGTUIG_ID, DAGNUMMER, RegCall(VLIEGTUIG_ID) AS REG_CALL, STARTTIJD, LANDINGSTIJD");
			parent::DbOpvraag($rquery);			
			
			Debug(__FILE__, __LINE__, sprintf("Data=%s", print_r(parent::DbData(), true)));	
			echo '{"total":"'.$total[0]['total'].'","results":'.json_encode(array_map('PrepareJSON', parent::DbData())).'}';		
		}
		
		function ZoekVorigeDatum()
		{
			$condition = "1=1 ";
			if (array_key_exists('DATUM', $this->Data)) 
			{
				$condition .= sprintf(" AND (s.DATUM < '%s')", $this->Data["DATUM"]) ;
			}
			
			$l = MaakObject('Login');
		    
			if ($l->isBeheerderDDWV())
			{
				$condition .= " AND (((SOORTBEDRIJF_ID = 702) OR (SOORTBEDRIJF_ID = 703) OR (DDWV = 1)) ";
				$condition .= sprintf(" OR ((VLIEGER_ID = '%d') OR (INZITTENDE_ID = '%d') OR (OP_REKENING_ID = '%d')))", $l->getUserFromSession(), $l->getUserFromSession(), $l->getUserFromSession());						
			}
			else if (!$l->isBeheerder())
			{
				$condition .= sprintf(" AND ((VLIEGER_ID = '%d') OR (INZITTENDE_ID = '%d') OR (OP_REKENING_ID = '%d'))", $l->getUserFromSession(), $l->getUserFromSession(), $l->getUserFromSession());
			}
			
			parent::DbOpvraag("
					SELECT 
						s.DATUM
					FROM 
						oper_startlijst as s left join
						oper_daginfo as d on s.datum = d.datum left join
						oper_rooster as r on s.datum = r.datum
					WHERE " . $condition . " 
					ORDER BY 
						s.DATUM DESC
					LIMIT 1;");
			$prevDate = parent::DbData();
			if (count($prevDate) > 0)
				echo $prevDate[0]['DATUM'];
			else
				echo date('Y-m-d');		
		}

		function ZoekVolgendeDatum()
		{
			$condition = "1=1 ";
			if (array_key_exists('DATUM', $this->Data)) 
			{
				$condition .= sprintf(" AND (s.DATUM > '%s')", $this->Data["DATUM"]) ;
			}
			
			$l = MaakObject('Login');
			
			if ($l->isBeheerderDDWV())
			{
				$condition .= " AND (((SOORTBEDRIJF_ID = 702) OR (SOORTBEDRIJF_ID = 703) OR (DDWV = 1)) ";
				$condition .= sprintf(" OR ((VLIEGER_ID = '%d') OR (INZITTENDE_ID = '%d') OR (OP_REKENING_ID = '%d')))", $l->getUserFromSession(), $l->getUserFromSession(), $l->getUserFromSession());				
			}
			else if (!$l->isBeheerder())
			{
				$condition .= sprintf(" AND ((VLIEGER_ID = '%d') OR (INZITTENDE_ID = '%d') OR (OP_REKENING_ID = '%d'))", $l->getUserFromSession(), $l->getUserFromSession(), $l->getUserFromSession());
			}
			
			parent::DbOpvraag("
					SELECT 
						s.DATUM
					FROM 
						oper_startlijst as s left join
						oper_daginfo as d on s.datum = d.datum left join
						oper_rooster as r on s.datum = r.datum
					WHERE " . $condition . " 
					ORDER BY 
						s.DATUM
					LIMIT 1;");
			$prevDate = parent::DbData();
			if (count($prevDate) > 0)
				echo $prevDate[0]['DATUM'];
			else
				echo date('Y-m-d');		
		}
		
		function GetObjectDetailsJSON()
		{
			$id = $this->Data["ID"];
			Debug(__FILE__, __LINE__, sprintf("Startlijst.GetObjectDetailsJSON(%s)", $id));	
			
			$brackets = array("[", "]");	
			$retVal = $this->GetObjectDetails($id);			
			
			$brackets = array("[", "]");	
			echo '{success: true'.',data:'. str_replace($brackets, "", json_encode(array_map('PrepareJSON', $retVal))).'}';
		}
		
		function GetObjectDetails($id)
		{
			Debug(__FILE__, __LINE__, sprintf("Startlijst.GetObjectDetails(%s)", $id));	
			
			parent::DbOpvraag("
					SELECT
						TypesStartMethode.OMSCHRIJVING 	AS STARTMETHODE_OMS,
						TypesSoortVlucht.OMSCHRIJVING 	AS SOORTVLUCHT_OMS,
						LedenOpRekening.NAAM 			AS LEDEN_OPREKENING_NAAM,
						TypesOpRekening.OMSCHRIJVING 	AS LEDEN_OPREKENING_OMS,
						(case when (`oper_startlijst`.`VLIEGERNAAM` is not null) 
							then 
								concat(ifnull(`LedenVlieger`.`NAAM`,''),' (',ifnull(`oper_startlijst`.`VLIEGERNAAM`,''),')') 
							else 
								`LedenVlieger`.`NAAM` end) AS `VLIEGERNAAM`,
						LedenVlieger.NAAM 				AS LEDEN_VLIEGER_NAAM,
						TypesVlieger.OMSCHRIJVING 		AS LEDEN_VLIEGER_OMS,
						TypesInzittende.OMSCHRIJVING 	AS LEDEN_INZITTENDE_OMS,
						
						coalesce(`oper_startlijst`.`INZITTENDENAAM`,`LedenInzittende`.`NAAM`) AS `INZITTENDENAAM`,
						Vliegtuig.ZITPLAATSEN,
						Vliegtuig.TMG,
						Vliegtuig.SLEEPKIST,
						Vliegtuig.ZELFSTART,
						
						IF (LedenOpRekening.LIDNR IS NULL AND LedenOpRekening.LIDTYPE_ID IN (601, 602, 603, 606, 608,609), 1, 0) AS OpRekeningAlert,
						IF (LedenVlieger.LIDNR IS NULL AND LedenVlieger.LIDTYPE_ID IN (601, 602, 603, 606, 608,609), 1, 0) AS VliegerAlert,
						IF (LedenInzittende.LIDNR IS NULL AND LedenInzittende.LIDTYPE_ID IN (601, 602, 603, 606, 608,609), 1, 0) AS InzittendeAlert,
						
						LedenOpRekening.ID AS OpRekeningID,
						LedenVlieger.ID AS VliegerID,
						LedenInzittende.ID AS InzittendeID,
						oper_startlijst.ID AS ID,
						concat(ifnull(`Vliegtuig`.`REGISTRATIE`,''),' (',ifnull(`Vliegtuig`.`CALLSIGN`,''),')') AS REG_CALL
					FROM
						oper_startlijst
						LEFT JOIN ref_leden AS LedenOpRekening  ON (oper_startlijst.OP_REKENING_ID = LedenOpRekening.ID)
						LEFT JOIN ref_leden AS LedenVlieger  	 ON (oper_startlijst.VLIEGER_ID = LedenVlieger.ID)
						LEFT JOIN ref_leden AS LedenInzittende  ON (oper_startlijst.INZITTENDE_ID = LedenInzittende.ID)
						LEFT JOIN types AS TypesStartMethode    ON (oper_startlijst.STARTMETHODE_ID = TypesStartMethode.ID)
						LEFT JOIN types AS TypesSoortVlucht     ON (oper_startlijst.SOORTVLUCHT_ID = TypesSoortVlucht.ID)
						LEFT JOIN types AS TypesOpRekening      ON (LedenOpRekening.LIDTYPE_ID = TypesOpRekening.ID)
						LEFT JOIN types AS TypesVlieger         ON (LedenVlieger.LIDTYPE_ID = TypesVlieger.ID)
						LEFT JOIN types AS TypesInzittende      ON (LedenInzittende.LIDTYPE_ID = TypesInzittende.ID)
						LEFT JOIN ref_vliegtuigen AS Vliegtuig  ON (oper_startlijst.VLIEGTUIG_ID = Vliegtuig.ID)
					WHERE oper_startlijst.ID=" . $id);		
				
			return parent::DbData();			
		}
		
		function StartZonderPiloot()
		{			
			Debug(__FILE__, __LINE__, "Startlijst.StartZonderPiloot()");			
			Debug(__FILE__, __LINE__, sprintf("qParams=%s", print_r($this->qParams, true)));
		
			$where = ' ';
			
			$l = MaakObject('Login');

			if ($l->magSchrijven() == false)
			{
				echo "0";
			}
			else
			{
				if (array_key_exists('_:datum', $this->qParams))
				{
					$where = sprintf("(`DATUM` = '%s')", $this->qParams['_:datum']);
				}
				else
				{
					$where = "(`DATUM` = CAST(NOW()AS DATE))";
				}
			
				$where = $where . "AND (COALESCE(SOORTVLUCHT_ID,0) != 815) AND VLIEGER_ID IS NULL and STARTTIJD IS NOT NULL";
				
				$query = "
					SELECT
						COUNT(*) AS total
					FROM
						startlijst_view
					WHERE
						" . $where;
			
				parent::DbOpvraag($query);
				$total = parent::DbData();		// total amount of records in the database
		
				echo $total[0]['total'];
			}		
		}
	
		function VliegtuigLogboekJSON()
		{	
			$privacyCheck = true;
			
			$l = MaakObject('Login');

			if ($l->isBeheerder() == true)
				$privacyCheck = false;

			if ($l->isBeheerderDDWV() == true)
				$privacyCheck = false;
			
			if ($l->isLocal() == true)
				$privacyCheck = false;
			
			if ($privacyCheck == true)
			{
				// Club vliegtuigen, mag iedereen zien
				$rv = MaakObject('Vliegtuigen');
				$rvObj = $rv->GetObject($this->qParams['_:logboekVliegtuigID']);
				
				if ($rvObj[0]['CLUBKIST'] == 1)
					$privacyCheck = false;
			}
			
			if ($privacyCheck == true)
			{
				// controleer op deze gebruiker in de laatste 6 maanden gevlogen heeft op deze kist
				$query = sprintf("
						SELECT 
							count(*) as aantal
						FROM 
							oper_startlijst 
						WHERE
							STARTTIJD IS NOT NULL	AND						
							VLIEGTUIG_ID = %s 		AND 
							VLIEGER_ID = %s 		AND 
							STR_TO_DATE(DATUM, '%%Y-%%m-%%d'), NOW()- INTERVAL 6 MONTH", $this->qParams['_:logboekVliegtuigID'], $l->getUserFromSession());
			
				parent::DbOpvraag($query);
				$vluchten = parent::DbData();
				
				if (intval($vluchten[0]["aantal"]) == 0)
				{
					// Nee, dus geen toegang tot logboek
					echo "[]";
					return;
				}
			}				
			
			$where = sprintf ("AND VLIEGTUIG_ID=%d",$this->qParams['_:logboekVliegtuigID']);
		
			if (array_key_exists('_:logboekDatumVanaf', $this->qParams))
			{
				if (strlen($this->qParams['_:logboekDatumVanaf']) > 0)
					$where .= sprintf(" AND `DATUM` >= '%s'", $this->qParams['_:logboekDatumVanaf']);
			}
			if (array_key_exists('_:logboekDatumTot', $this->qParams))
			{
				if (strlen($this->qParams['_:logboekDatumTot']) > 0)
					$where .= sprintf(" AND `DATUM` <= '%s'", $this->qParams['_:logboekDatumTot']);
			}		

			$limit = "";
			if ((!array_key_exists('_:logboekDatumVanaf', $this->qParams)) && (!array_key_exists('_:logboekDatumTot', $this->qParams)))
				$limit = " LIMIT 0 , 5";			
			
			$query = "
				SELECT
					DATUM, 
					COUNT(*) AS VLUCHTEN,
					(SELECT 
						COUNT(*) 
					 FROM 
						startlijst_view 
					 WHERE
						STARTTIJD is not null AND LANDINGSTIJD is not null AND
						VLIEGTUIG_ID = slv.VLIEGTUIG_ID AND 
						DATUM = slv.DATUM AND 
						STARTMETHODE_ID >= 550) AS LIERSTARTS,
					(SELECT 
						COUNT(*) 
					 FROM 
						startlijst_view
					 WHERE 
						STARTTIJD is not null AND LANDINGSTIJD is not null AND
						VLIEGTUIG_ID = slv.VLIEGTUIG_ID AND 
						DATUM = slv.DATUM AND 
						STARTMETHODE_ID =  501) AS SLEEPSTARTS,
					SEC_TO_TIME(SUM(TIME_TO_SEC(STR_TO_DATE(DUUR, '%H:%i') ))) AS VLIEGTIJD,
					REG_CALL
				FROM 
					startlijst_view slv
				WHERE 
					STARTTIJD is not null AND LANDINGSTIJD is not null " . $where . "
				GROUP BY 
					DATUM
				ORDER BY DATUM DESC";

			parent::DbOpvraag($query . $limit);			
		
			Debug(__FILE__, __LINE__, sprintf("Data=%s", print_r(parent::DbData(), true)));	
			echo json_encode(array_map('PrepareJSON', parent::DbData()));
		}
				
		
		function ExportStartlijst()
		{
			$export = $this->ExportData();
			
			if ($export['total'] == 0)
				return;		// er is niets te exporteren

			header('Cache-Control: maxage=120'); 
			header('Expires: '.date(DATE_COOKIE,time()+120)); // Cache for 2 mins 
			header('Pragma: public'); 
			header("Content-type: application/force-download");  
			header("Content-Transfer-Encoding: Binary");  
			header('Content-Type: application/octet-stream');  
			header('Content-Disposition: attachment; filename=' . date('Ymd') . ".csv"); 
	
			$fieldnr = 1;
			foreach ($export['data'][0] as $key => $value)
			{
				if ($fieldnr > 1)
					echo ",";
					
				echo '"' . $key . '"';
				$fieldnr++;
			}
			echo "\r\n";
			
			foreach ($export['data'] as $record)
			{
				$fieldnr = 1;
				foreach ($record as $field)
				{
					if ($fieldnr > 1)
						echo ",";
				
					echo '"' . str_replace(";","", $field) . '"';
					$fieldnr++;
				}
				
				echo "\r\n";
			}									
			exit;			
		}
		
		function ExportJSON()
		{
			$l = MaakObject('Login');
			
			if (($l->isBeheerder() == false) && ($l->isBeheerderDDWV() == false))
			{
				Debug(__FILE__, __LINE__, "Geen export rechten");
				$l->toegangGeweigerd();		
			}				
			
			$export = $this->ExportData();
			echo '{"total":"'.$export['total'].'","results":'.json_encode(array_map('PrepareJSON', $export['data'])).'}';
		}
		
		function ExportData()
		{	
			$where = "1=1";
		
			if (array_key_exists('_:exportDatumVanaf', $this->Data))
			{
				if (strlen($this->Data['_:exportDatumVanaf']) > 0)
					$where .= sprintf(" AND `DATUM` >= '%s'", $this->Data['_:exportDatumVanaf']);
			}
			if (array_key_exists('_:exportDatumTot', $this->Data))
			{
				if (strlen($this->Data['_:exportDatumTot']) > 0)
					$where .= sprintf(" AND `DATUM` <= '%s'", $this->Data['_:exportDatumTot']);
			}		

			if ($where == "1=1")
				$where = "(`DATUM` = CAST(NOW()AS DATE))";
			
			if (array_key_exists('_:query', $this->Data))
			{
				if (strlen(trim($this->Data['_:query'])) > 0)
				{
					$where = $where . " AND (VLIEGERNAAM LIKE ('%%" . trim($this->Data['_:query']) . "%%') ";
					$where = $where . " OR VLIEGERNAAM_LID LIKE ('%%" . trim($this->Data['_:query']) . "%%') ";
					$where = $where . " OR LedenVlieger.LIDNR LIKE ('%%" . trim($this->Data['_:query']) . "%%') ";
					$where = $where . " OR INZITTENDENAAM_LID LIKE ('%%" . trim($this->Data['_:query']) . "%%') ";
					$where = $where . " OR INZITTENDENAAM LIKE ('%%" . trim($this->Data['_:query']) . "%%') ";
					$where = $where . " OR LedenInzittende.LIDNR LIKE ('%%" . trim($this->Data['_:query']) . "%%') ";
					$where = $where . " OR LedenOpRekening.LIDNR LIKE ('%%" . trim($this->Data['_:query']) . "%%') ";
					$where = $where . " OR sv.REGISTRATIE LIKE ('%%" . trim($this->Data['_:query']) . "%%') ";
					$where = $where . " OR sv.CALLSIGN LIKE ('%%" . trim($this->Data['_:query']) . "%%') ";
					$where = $where . ")";
				}
			}
			$where .= " AND STARTTIJD IS NOT NULL";
			
			$orderby = " ORDER BY CONVERT(REPLACE(DAGNUMMER, 's',''), UNSIGNED INTEGER), sv.ID ";
			if ((array_key_exists('sort', $this->Data)) && (array_key_exists('dir', $this->Data)))
			{
				if ($this->Data['sort'] == 'DAGNUMMER')
					$orderby = sprintf(" ORDER BY CONVERT(REPLACE(DAGNUMMER, 's',''), UNSIGNED INTEGER) %s, sv.ID %s", $this->Data['dir'], $this->Data['dir']);
				else
					$orderby = sprintf(" ORDER BY %s %s ", $this->Data['sort'], $this->Data['dir']);
			}	
			
			if (array_key_exists('_:exportClubkist', $this->Data))
			{
				if ($this->Data['_:exportClubkist'] == 'true')
					$where = $where . " AND CLUBKIST=1";
			}
			
			$query = "
				SELECT
					%s 
				FROM
					startlijst_view as sv
					LEFT JOIN ref_leden AS LedenVlieger  	ON (sv.VLIEGER_ID = LedenVlieger.ID)
					LEFT JOIN ref_leden AS LedenInzittende  ON (sv.INZITTENDE_ID = LedenInzittende.ID)
					LEFT JOIN ref_leden AS LedenOpRekening  ON (sv.OP_REKENING_ID = LedenOpRekening.ID)		
					LEFT JOIN ref_vliegtuigen AS Vliegtuig  ON (sv.VLIEGTUIG_ID = Vliegtuig.ID)						
					LEFT JOIN types AS TypesVlieger         ON (LedenVlieger.LIDTYPE_ID = TypesVlieger.ID)
					LEFT JOIN types AS TypesInzittende      ON (LedenInzittende.LIDTYPE_ID = TypesInzittende.ID)	
				WHERE
					" . $where . $orderby;
			
			$fields = "sv.*,  
					sv.BAAN AS BAAN,
					LedenVlieger.LIDNR AS VLIEGERLIDNR,
					TypesVlieger.OMSCHRIJVING AS VLIEGERLIDTYPE,
					LedenInzittende.LIDNR AS INZTTENDELIDNR,
					TypesInzittende.OMSCHRIJVING AS INZITTENDELIDTYPE,
					LedenOpRekening.NAAM AS BETAALDDOOR,
					LedenOpRekening.LIDNR AS BETAALDLIDNR";
			
			parent::DbOpvraag(sprintf($query, "COUNT(*) AS total"));
			$total = parent::DbData();		// total amount of records in the database

			$limit = "";
			if (array_key_exists('limit', $this->Data))
			{
				$limit = sprintf(" LIMIT %d , %d ", $this->Data['start'], $this->Data['limit']);
			}			
			$rquery = sprintf($query, $fields) . $limit;
			parent::DbOpvraag($rquery);			

			Debug(__FILE__, __LINE__, sprintf("Data=%s", print_r(parent::DbData(), true)));	
			
			$retValue['total'] = $total[0]['total'];
			$retValue['data'] = parent::DbData();
			return $retValue;
		}
	}
?>