<?php
	class Controle extends StartAdmin
	{
		function __construct() 
		{
			parent::__construct();
		}
		
		// -------------------------------------------------------------------------------------------------------------------------
		// JSON opvraag functies
		
		// ------------------------------------------------------------------
		// Laat de startijst zien en zoek erbij welke Flarm start in het systeem zit
		// Kan dus gebeuren dat er geen Flarm data is omdat de kist niet uitgerust is met Flarm
		// Kan ook gebeuren dat er wel een Flarm start is, maar geen start record. Dan is het vergeten 
		// of de kist is bij de buren gestart/geland 
		// 
		// @param vanuit POST
		// 		_:query 	= zoek criteria door de gebruiker ingevuld
		//		_:onderdruk = verberg de record die goed zijn (Flarm & start admin komt overeen)
		//		sort 		= veldnaam waarop gesorteerd moet worden
		//		dir 		= sorteer richting (DESCR - ASC)
		//		limit		= aantal records
		//		start		= eerste record
		// 
		// @return 	      Alles wat begint met SA komt vanuit de startlijst_view, alles wat begint met FLARM kom uit de Flarm schaduw admin
		// 	Json string 
		//		ID = Database ID van het start record uit oper_startlijst 
		//		DAGNUMMER = Dagnummer van deze start 
		//		REG_CALL = Registratie + Callsign
		//		FLARM_CODE = De code die door het vliegtuig wordt uitgezonden door Flarm
		//		VLIEGTUIG_ID = Database ID van het vliegtuig
		//		SLEEPKIST_ID = Datbase ID van het sleepvliegtuig (alleen ingevuld bij sleepstart)
		//		DATUM = Datum van de start
		//		VLIEGER_ID = Het database ID van de vlieger uit de leden tabel
		//		VLIEGERNAAM_LID = Volledige naam van de vlieger vanuit ledenlijst
		//		VLIEGERNAAM = Ingevoerde naam van de vlieger, alleen in bijzondere situaties
		//		INZITTENDE_ID = Het database ID van de inzittende uit de leden tabel
		//		INZITTENDENAAM_LID = Volledig naam van de inzitende (alleen voor tweezitters)
		//		INZITTENDENAAM = Ingevoerde naam van de inzittende, alleen in bijzondere situaties
		//		OP_REKENING_ID = Wie betaald de vlucht. ID uit leden tabel
		//		STARTTIJD = De starttijd zoals deze handmatig vastgelegd is
		//		LANDINGSTIJD = De landingstijd zoals deze handmatig vastgelegd is
		//		DUUR = Hoe lang is er gevlogen
		//		SOORTVLUCHT = Wat voor een type start is het geweest. Volledige text vanuit types tabel
		//		SOORTVLUCHT_ID = Wat voor een type start is het geweest. Het ID van de types tabel
		//		STARTMETHODE = Welke start methode is gebruikt. Volledige text vanuit types tabel
		//		STARTMETHODE_ID = Welke start methode is gebruikt. Het ID van de types tabel		
		//		FLARM_ID = Database record ID van de flarm start
		//		FLARM_STARTTIJD = De starttijd zoals deze door Flarm automatisch gedetecteerd is
		//		FLARM_LANDINGSTIJD = De landingstijd zoals deze door Flarm automatisch gedetecteerd is
		//		FLARM_CODE = Het uitgezonden Flarm ID
		//		FLARM_VLIEGTUIG_ID = Het database ID van het vliegtuig met dit Flarm ID
		//		FLARM_REG_CALL = Registratie + Callsign vanuit vliegtuig record
		//		dSTARTTIJD = Het verschil tussen de flarn starttijd en de handmatige ingevoerde tijd
		//		dLANDINGSTIJD = Het verschil tussen de flarn landingstijd en de handmatige ingevoerde tijd
	
		// @example
		// {
		//		"total":"2",
		//		"results":
		//		[
		//			{
		//				"ID": "1605060956214",
		//				"DAGNUMMER": "1",
		//				"REGISTRATIE": "PH-1292",
		//				"CALLSIGN": "E6",
		//				"REG_CALL": "PH-1292 (E6)",
		//				"FLARM_CODE": "484B5D",
		//				"VLIEGTUIG_ID": "297",
		//				"SLEEPKIST_ID": null,
		//				"DATUM": "2014-09-06",
		//				"SOORTVLUCHT_ID": "805",
		//				"STARTMETHODE_ID": "550",
		//				"STARTTIJD": "09:57",
		//				"LANDINGSTIJD": "10:04",
		//				"DUUR": "00:07",
		//				"OPMERKING": null,
		//				"LAATSTE_AANPASSING": "2016-05-06 10:04:43",
		//				"VLIEGER_ID": "10267",
		//				"VLIEGERNAAM_LID": "Marja Hoeksma",
		//				"VLIEGERNAAM": null,
		//				"INZITTENDE_ID": "10730",
		//				"INZITTENDENAAM_LID": "Peter de Groot",
		//				"INZITTENDENAAM": null,
		//				"OP_REKENING_ID": "10267",
		//				"OP_REKENING": "Marja Hoeksma",
		//				"SOORTVLUCHT": "Normale GeZC start",
		//				"STARTMETHODE": "Lierstart GeZC",
		//				"FLARM_ID": "6602",
		//				"FLARM_STARTTIJD": "09:56:55",
		//				"FLARM_LANDINGSTIJD": "10:03:10",
		//				"FLARM_REG_CALL": "PH-1292 (E6)",
		//				"dSTARTTIJD": "5",
		//				"dLANDINGSTIJD": "50"
		//			},{
		//				"ID": "1605061013035",
		//				"DAGNUMMER": "2",
		//				"REGISTRATIE": "PH-1510",
		//				"CALLSIGN": "E5",
		//				"REG_CALL": "PH-1510 (E5)",
		//				"FLARM_CODE": "484FA9",
		//				"VLIEGTUIG_ID": "296",
		//				"SLEEPKIST_ID": null,
		//				"DATUM": "2014-09-06",
		//				"SOORTVLUCHT_ID": null,
		//				"STARTMETHODE_ID": "550",
		//				"STARTTIJD": "10:15",
		//				"LANDINGSTIJD": "10:20",
		//				"DUUR": "00:05",
		//				"OPMERKING": "met andy van der stelt",
		//				"LAATSTE_AANPASSING": "2016-05-06 10:20:26",
		//				"VLIEGER_ID": "10820",
		//				"VLIEGERNAAM_LID": "Frank Nijenhuis",
		//				"VLIEGERNAAM": null,
		//				"INZITTENDE_ID": null,
		//				"INZITTENDENAAM_LID": null,
		//				"INZITTENDENAAM": null,
		//				"OP_REKENING_ID": "10820",
		//				"OP_REKENING": "Frank Nijenhuis",
		//				"SOORTVLUCHT": null,
		//				"STARTMETHODE": "Lierstart GeZC",
		//				"FLARM_ID": "6603",
		//				"FLARM_STARTTIJD": "10:15:38",
		//				"FLARM_LANDINGSTIJD": "10:20:14",
		//				"FLARM_REG_CALL": "PH-721 (E4)",
		//				"dSTARTTIJD": "38",
		//				"dLANDINGSTIJD": "14"	
		//			}
		//	]
		// }
		function StartlijstJSON()
		{	
			global $app_settings;
		
			Debug(__FILE__, __LINE__, "Controle.StartlijstJSON()");	
			Debug(__FILE__, __LINE__, sprintf("Data=%s", print_r($this->Data, true)));			
			Debug(__FILE__, __LINE__, sprintf("qParams=%s", print_r($this->qParams, true)));
		
			$where = '1=1 ';
			
			$l = MaakObject('Login');
			if (($l->isBeheerder() == false) && ($l->isBeheerderDDWV() == false))
			{
				return;
			}
			if ($l->isBeheerderDDWV() && $l->magSchrijven() == false)
			{
				return;
			}
			
			if (array_key_exists('_:datum', $this->qParams))
			{
				parent::DbUitvoeren(sprintf("CALL ControleStartlijstFlarm('%s')", $this->qParams['_:datum']));
			}
			else
			{
				parent::DbUitvoeren(sprintf("CALL ControleStartlijstFlarm('%s')", date('Y-m-d')));
			}			
			
			if (array_key_exists('_:query', $this->qParams))
			{
				if (strlen(trim($this->qParams['_:query'])) > 0)
				{
					$where = $where . " AND (VLIEGERNAAM_LID LIKE ('%%" . trim($this->qParams['_:query']) . "%%') ";
					$where = $where . " OR VLIEGERNAAM LIKE ('%%" . trim($this->qParams['_:query']) . "%%') ";
					$where = $where . " OR INZITTENDENAAM_LID LIKE ('%%" . trim($this->qParams['_:query']) . "%%') ";
					$where = $where . " OR INZITTENDENAAM LIKE ('%%" . trim($this->qParams['_:query']) . "%%') ";
					$where = $where . " OR slv.REG_CALL LIKE ('%%" . trim($this->qParams['_:query']) . "%%') ";
					$where = $where . ")";
				}
			}
			
			if (array_key_exists('_:onderdruk', $this->qParams))
			{
				if ($this->qParams['_:onderdruk'] == 'true')
					$where = $where . sprintf (" AND ((dSTARTTIJD > %d OR dLANDINGSTIJD > %d) OR dSTARTTIJD is null OR dLANDINGSTIJD is null)", $app_settings['ControleTolerantie'], $app_settings['ControleTolerantie']);			
			}			
			
			$orderby = " ORDER BY ISNULL(DAGNUMMER), CONVERT(REPLACE(DAGNUMMER, 's',''), UNSIGNED INTEGER), slv.STARTTIJD, ISNULL(fv.STARTTIJD), fv.STARTTIJD";
			if ((array_key_exists('sort', $this->Data)) && (array_key_exists('dir', $this->Data)))
			{
				$orderby = sprintf(" ORDER BY %s %s, ID ", $this->Data['sort'], $this->Data['dir']);
			}
			
			$query = "SELECT %s FROM ControleStartlijstFlarm AS C LEFT OUTER JOIN startlijst_view AS slv ON (C.SA_ID = slv.ID) LEFT OUTER JOIN flarm_view AS fv ON (C.FLARM_ID = fv.ID) WHERE " . $where . $orderby;
			
			parent::DbOpvraag(sprintf($query, "COUNT(*) AS total"));
			$total = parent::DbData();		// total amount of records in the database
			
			$limit = "";
			if (array_key_exists('limit', $this->Data))
			{
				$limit = sprintf(" LIMIT %d , %d ", $this->Data['start'], $this->Data['limit']);
			}			
			$rquery = sprintf($query, "
				slv.*, 
				FLARM_ID AS FLARM_ID, 
				fv.STARTTIJD AS FLARM_STARTTIJD, 
				fv.LANDINGSTIJD AS FLARM_LANDINGSTIJD, 
				fv.REG_CALL AS FLARM_REG_CALL,
				dSTARTTIJD, dLANDINGSTIJD") . $limit;
			parent::DbOpvraag($rquery);			
			
			Debug(__FILE__, __LINE__, sprintf("Data=%s", print_r(parent::DbData(), true)));	
			echo '{"total":"'.$total[0]['total'].'","results":'.json_encode(array_map('PrepareJSON', parent::DbData())).'}';	
		}
		
		
		// ------------------------------------------------------------------
		// alleen de starttijd opslaan
		// 
		// @param vanuit POST
		// 		ID = ID van het staer record
		//		SA_STARTTIJD = de nieuwe startijd
		// 
		// @return
		// 	Json string 
		//		success 	= Indicator of opslaan gelukt is
		//		errorCode 	= altijd -12
		//		error 		= Omschrijving van de Error
		//
		// @example
		// {
		//		"success":true,
		//		"errorCode":-1,
		//		"error":""
		// }
		function SaveStartTijd()
		{			
			Debug(__FILE__, __LINE__, "Controle.SaveStartTijd()");
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
				
			if (!array_key_exists('SA_STARTTIJD', $this->Data))
			{
				echo '{"success":false,"errorCode":-1,"error":"Geen SA_STARTTIJD in dataset"}';
				return;
			}
			else
			{
				$d['STARTTIJD'] = $this->Data['SA_STARTTIJD'];
			}
					
			parent::DbAanpassen('oper_startlijst', $this->Data['ID'], $d);
			
			echo '{"success":true,"errorCode":-1,"error":""}';
		}

		// ------------------------------------------------------------------
		// alleen de landingstijd opslaan
		// 
		// @param vanuit POST
		// 		ID = ID van het staer record
		//		SA_STARTTIJD = de nieuwe startijd
		// 
		// @return 	     
		// 	Json string 
		//		success 	= Indicator of opslaan gelukt is
		//		errorCode 	= altijd -12
		//		error 		= Omschrijving van de Error
		//
		// @example
		// {
		//		"success":true,
		//		"errorCode":-1,
		//		"error":""
		// }
		function SaveLandingsTijd()
		{			
			Debug(__FILE__, __LINE__, "Controle.SaveLandingsTijd()");
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
				
			if (!array_key_exists('SA_LANDINGSTIJD', $this->Data))
			{
				echo '{"success":false,"errorCode":-1,"error":"Geen SA_LANDINGSTIJD in dataset"}';
				return;
			}
			else
			{
				$d['LANDINGSTIJD'] = $this->Data['SA_LANDINGSTIJD'];
			}
					
			parent::DbAanpassen('oper_startlijst', $this->Data['ID'], $d);
			
			echo '{"success":true,"errorCode":-1,"error":""}';
		}
		
		
		// ------------------------------------------------------------------
		// Laat een overzicht van een dag zien met aantal starts van de aanwezige mensen
		// 
		// @param vanuit POST
		// 		_:datum = De datum voor het dag overzicht. Als het veld ontbreekt, nemen we vandaag
		//		sort 	= veldnaam waarop gesorteerd moet worden
		//		dir 	= sorteer richting (DESCR - ASC)
		//		limit	= aantal records
		//		start	= eerste record
		// 
		// @return 	      
		// 	Json string 
		//		ID 			= Het record ID van dit lid in de database dat deze dag aanwezig is geweest
		//		NAAM 		= Volledige naam van het lid
		//		DATUM 		= De datum van dit dag overzicht
		//		OPMERKIN	= Opmerking zoals deze is ingevoerd bij aanwezig
		//		DDWV_VOORAANMELDING = Had de DDWV zich vooraf aangemeld via de website
		//		STARTS		= Totaal aantal starts 
		//		VLIEGER		= Aantal starts als vlieger 	
		//		INZITTENDE	= Aantal starts als inzittende
		//		DDWV		= Aantal starts voor DDWV
		//		SLEEP		= Aantal sleep starts
		//		OPREKENING  = Aantal vluchten die het lid moet betalen voor deze dag
		//
		// @example
		// {
		//		"total":"2",
		//		"results":
		//		[
		//			{
		//				"ID":"10338",
		//				"NAAM":"Jan Jaap van Brunsum",
		//				"DATUM":"2016-07-25",
		//				"OPMERKING":null,
		//				"DDWV_VOORAANMELDING":null,
		//				"STARTS":"2",
		//				"VLIEGER":"0",
		//				"INZITTENDE":"2",
		//				"DDWV":"0",
		//				"SLEEP":"0",
		//				"OPREKENING":"0"
		//			},
		//			{
		//				"ID":"10587",
		//				"NAAM":"Diede Jongsma",
		//				"DATUM":"2016-07-25",
		//				"OPMERKING":null,
		//				"DDWV_VOORAANMELDING":null,
		//				"STARTS":"2",
		//				"VLIEGER":"2",
		//				"INZITTENDE":"0",
		//				"DDWV":"0",
		//				"SLEEP":"2",
		//				"OPREKENING":"2"
		//			}
		//		]
		// }
		function DagOverzichtJSON()
		{		
			Debug(__FILE__, __LINE__, "Controle.DagOverzichtJSON()");	
			Debug(__FILE__, __LINE__, sprintf("Data=%s", print_r($this->Data, true)));			
			Debug(__FILE__, __LINE__, sprintf("qParams=%s", print_r($this->qParams, true)));
		
			$where = '1=1';
			
			$l = MaakObject('Login');
			if (($l->isBeheerder() == false) && ($l->isBeheerderDDWV() == false))
			{
				return;
			}
			if ($l->isBeheerderDDWV() && $l->magSchrijven() == false)
			{
				return;
			}
			
			if (array_key_exists('_:datum', $this->qParams))
			{
				$where = sprintf ("DATUM = '%s'", $this->qParams['_:datum']);
			}
			else
			{
				$where = sprintf ("DATUM = '%s'", date('Y-m-d'));
			}			

			$orderby = " ";
			if ((array_key_exists('sort', $this->Data)) && (array_key_exists('dir', $this->Data)))
			{
				$orderby = sprintf(" ORDER BY %s %s, ID ", $this->Data['sort'], $this->Data['dir']);
			}
			
			$query = "SELECT * FROM dagoverzicht_view WHERE " . $where . $orderby;
			parent::DbOpvraag($query);			
			$retVal = parent::DbData();
			
			Debug(__FILE__, __LINE__, sprintf("Data=%s", print_r(parent::DbData(), true)));	
			echo '{"total":"'.count($retVal).'","results":'.json_encode(array_map('PrepareJSON', $retVal)).'}';	
		}
		
		// ------------------------------------------------------------------
		// Laat een overzicht van een vlieger voor een bepaalde dag
		// is een detail scherm van de dag overzicht
		// 
		// @param vanuit POST
		// 		_:datum = De datum voor het dag overzicht. Als het veld ontbreekt, nemen we vandaag
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
		//			REG_CALL		= Combinatie van registratie en callsing
		//			FLARM_CODE		= De flarm code zoals het bekend is in de tabel vliegtuigen
		//			VLIEGTUIG_ID	= Het record ID van het vliegtuig
		//			DATUM			= De datasum van deze start
		//			SOORTVLUCHT_ID	= Verwijzing naar soort vlucht (instructie / prive start)
		//			STARTMETHODE_ID	= Verwijzing naar start methode (slepen / lieren / zelstart)
		//			STARTTIJD		= De starttijd volgens de start administratie
		//			LANDINGSTIJD	= De landingstijd volgens de start administratie
		//			DUUR			= De vliegtijd (landingstijd - startijst)
		//			OPMERKING		= Opmerking voor deze vlucht
		//			VLIEGERNAAM		= Volledige naam van de vlieger
		//			INZITTENDENAAM	= Volledige naam van de inzittende
		//			LAATSTE_AANPASSING=
		//			VLIEGER_ID		= Verwijzing naar lid record van de vlieger
		//			INZITTENDE_ID	= Verwijzing naar lid record van de inzittende
		//			OP_REKENING_ID	= Verwijzing naar lid record van de diegene die betaald
		//			OP_REKENING		= Volledige naam van diegene die betaald
		//			SOORTVLUCHT		= Soort vlucht in volledige text vanuit omschrijving types tabel
		//			STARTMETHODE	= Start methode omschrijving in volledige text vanuit omschrijving types tabel
		//
		// @example
		// 	{
		//		"total":"3",
		//		"results":
		//		[{
		//			"ID":"1607252212552",
		//			"DAGNUMMER":"1",
		//			"REGISTRATIE":"PH-1521",
		//			"CALLSIGN":"E11",
		//			"REG_CALL":"PH-1521 (E11)",
		//			"FLARM_CODE":"485026",
		//			"VLIEGTUIG_ID":"402",
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
		//			"INZITTENDE_ID":"10338",
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
		//			"DATUM":"2016-07-25",
		//			"SOORTVLUCHT_ID":"809",
		//			"STARTMETHODE_ID":"501",
		//			"STARTTIJD":"11:39",
		//			"LANDINGSTIJD":"11:51",
		//			"DUUR":"00:12",
		//			"OPMERKING":null,
		//			"VLIEGERNAAM":"Diede Jongsma",
		//			"INZITTENDENAAM":"Jan Jaap van Brunsum",
		//			"LAATSTE_AANPASSING":"2016-07-25 22:14:22",
		//			"VLIEGER_ID":"10587",
		//			"INZITTENDE_ID":"10338",
		//			"OP_REKENING_ID":"10587",
		//			"OP_REKENING":"Diede Jongsma",
		//			"SOORTVLUCHT":"Instructie of checkvlucht",
		//			"STARTMETHODE":"Slepen (zweefkist)"
		//		}]
		//	}
		function DagOverzichtLidJSON()
		{
			Debug(__FILE__, __LINE__, "Controle.DagOverzichtJSON()");	
			Debug(__FILE__, __LINE__, sprintf("Data=%s", print_r($this->Data, true)));			
			Debug(__FILE__, __LINE__, sprintf("qParams=%s", print_r($this->qParams, true)));
		
			$where = '';
			
			$l = MaakObject('Login');
			if (($l->isBeheerder() == false) && ($l->isBeheerderDDWV() == false))
			{
				return;
			}
			
			if ($l->isBeheerderDDWV() && $l->magSchrijven() == false)
			{
				return;
			}
			
			if (array_key_exists('_:datum', $this->qParams))
			{
				$where = sprintf (" DATUM = '%s'", $this->qParams['_:datum']);
			}
			else
			{
				$where = sprintf (" DATUM = '%s'", date('Y-m-d'));
			}

			if (!array_key_exists('_:ID', $this->qParams))
			{
				echo '{"success":false,"errorCode":-1,"error":"Lid ID niet aanwezig in dataset"}';
				return;
			}
			else
			{
				$where = $where . sprintf (" AND (OP_REKENING_ID = '%s' OR VLIEGER_ID='%s' OR INZITTENDE_ID='%s') AND STARTMETHODE_ID != 502", $this->qParams['_:ID'], $this->qParams['_:ID'], $this->qParams['_:ID']);
			}				

			$orderby = " ";
			if ((array_key_exists('sort', $this->Data)) && (array_key_exists('dir', $this->Data)))
			{
				$orderby = sprintf(" ORDER BY %s %s, ID ", $this->Data['sort'], $this->Data['dir']);
			}
			
			$query = "SELECT * FROM startlijst_view WHERE " . $where . $orderby;
			parent::DbOpvraag($query);			
			$retVal = parent::DbData();
			
			Debug(__FILE__, __LINE__, sprintf("Data=%s", print_r(parent::DbData(), true)));	
			echo '{"total":"'.count($retVal).'","results":'.json_encode(array_map('PrepareJSON', $retVal)).'}';	
		}

		// ------------------------------------------------------------------
		// Laat een overzicht van een vlieger voor een bepaalde dag
		// is een detail scherm van de dag overzicht
		// 
		// @param vanuit POST
		// 		_:datum = De datum voor het dag overzicht. Als het veld ontbreekt, nemen we vandaag
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
		//			REG_CALL		= Combinatie van registratie en callsing
		//			FLARM_CODE		= De flarm code zoals het bekend is in de tabel vliegtuigen
		//			VLIEGTUIG_ID	= Het record ID van het vliegtuig
		//			DATUM			= De datasum van deze start
		//			SOORTVLUCHT_ID	= Verwijzing naar soort vlucht (instructie / prive start)
		//			STARTMETHODE_ID	= Verwijzing naar start methode (slepen / lieren / zelstart)
		//			STARTTIJD		= De starttijd volgens de start administratie
		//			LANDINGSTIJD	= De landingstijd volgens de start administratie
		//			DUUR			= De vliegtijd (landingstijd - startijst)
		//			OPMERKING		= Opmerking voor deze vlucht
		//			VLIEGERNAAM		= Volledige naam van de vlieger
		//			INZITTENDENAAM	= Volledige naam van de inzittende
		//			LAATSTE_AANPASSING=
		//			VLIEGER_ID		= Verwijzing naar lid record van de vlieger
		//			INZITTENDE_ID	= Verwijzing naar lid record van de inzittende
		//			OP_REKENING_ID	= Verwijzing naar lid record van de diegene die betaald
		//			OP_REKENING		= Volledige naam van diegene die betaald
		//			SOORTVLUCHT		= Soort vlucht in volledige text vanuit omschrijving types tabel
		//			STARTMETHODE	= Start methode omschrijving in volledige text vanuit omschrijving types tabel
		//			VLIEGER_BESTE_LID_ID = Voorstel om vlieger te vervangen (naam komt het beste overeen)
		//			INZITTENDE_BESTE_LID_ID = Voorstel om inzittende te vervangen (naam komt het beste overeen)
		//
		// @example
		// {
		//		"total":"396",
		//		"results":
		//		[{
		//			"ID":"1607191721016",
		//			"DAGNUMMER":"71",
		//			"REGISTRATIE":"PH-721",
		//			"CALLSIGN":"E4",
		//			"REG_CALL":"PH-721 (E4)",
		//			"FLARM_CODE":"484B59",
		//			"VLIEGTUIG_ID":"296",
		//			"DATUM":"2016-07-19",
		//			"SOORTVLUCHT_ID":"809",
		//			"STARTMETHODE_ID":"550",
		//			"STARTTIJD":"17:24",
		//			"LANDINGSTIJD":"17:38",
		//			"DUUR":"00:14",
		//			"OPMERKING":null,
		//			"VLIEGERNAAM":"Emiel Graven",
		//			"INZITTENDENAAM":"Peter Molenbeek",
		//			"LAATSTE_AANPASSING":"2016-07-19 17:38:16",
		//			"VLIEGER_ID":"1000215",
		//			"INZITTENDE_ID":"10109",
		//			"OP_REKENING_ID":"1000215",
		//			"OP_REKENING":"Emiel Graven",
		//			"SOORTVLUCHT":"Instructie of checkvlucht",
		//			"STARTMETHODE":"Lierstart GeZC",
		//			"VLIEGER_LIDTYPE_ID":"609",
		//			"INZITTENDE_LIDTYPE_ID":"601",
		//			"VLIEGER_BESTE_LID_ID":"10428"
		//		},
		//		{
		//			"ID":"1610171636477",
		//			"DAGNUMMER":"71",
		//			"REGISTRATIE":"PH-1083",
		//			"CALLSIGN":"FW",
		//			"REG_CALL":"PH-1083 (FW)",
		//			"FLARM_CODE":null,
		//			"VLIEGTUIG_ID":"574",
		//			"DATUM":"2016-10-17",
		//			"SOORTVLUCHT_ID":"807",
		//			"STARTMETHODE_ID":"550",
		//			"STARTTIJD":"17:00",
		//			"LANDINGSTIJD":"17:06",
		//			"DUUR":"00:06",
		//			"OPMERKING":null,
		//			"VLIEGERNAAM":"David Klein.",
		//			"INZITTENDENAAM":null,
		//			"LAATSTE_AANPASSING":"2016-10-17 17:06:34",
		//			"VLIEGER_ID":"1000241",
		//			"INZITTENDE_ID":null,
		//			"OP_REKENING_ID":"1000241",
		//			"OP_REKENING":"David Klein",
		//			"SOORTVLUCHT":"Privestart",
		//			"STARTMETHODE":"Lierstart GeZC",
		//			"VLIEGER_LIDTYPE_ID":"609",
		//			"INZITTENDE_LIDTYPE_ID":null,
		//			"VLIEGER_BESTE_LID_ID":"12"
		//		}]
		// }		
		function StartlijstTijdelijkeLedenJSON()
		{		
			Debug(__FILE__, __LINE__, "Controle.StartlijstTijdelijkeLeden()");	
			Debug(__FILE__, __LINE__, sprintf("Data=%s", print_r($this->Data, true)));			
			Debug(__FILE__, __LINE__, sprintf("qParams=%s", print_r($this->qParams, true)));
			
			$l = MaakObject('Leden');
			
			$orderby = " ORDER BY CONVERT(REPLACE(DAGNUMMER, 's',''), UNSIGNED INTEGER), sv.ID ";
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
					startlijst_view as sv
					LEFT JOIN ref_leden AS LedenVlieger  	ON (sv.VLIEGER_ID = LedenVlieger.ID)
					LEFT JOIN ref_leden AS LedenInzittende  ON (sv.INZITTENDE_ID = LedenInzittende.ID)					
				WHERE
					STARTTIJD IS NOT NULL AND (LedenVlieger.LIDTYPE_ID = 609 || LedenInzittende.LIDTYPE_ID = 609) 
					AND COALESCE(LedenVlieger.VERWIJDERD,0) = 0  
                    AND COALESCE(LedenInzittende.VERWIJDERD,0) = 0	"  . $orderby;
			
			parent::DbOpvraag(sprintf($query, "COUNT(*) AS total"));
			$total = parent::DbData();		// total amount of records in the database
			
			$limit = "";
			if (array_key_exists('limit', $this->Data))
			{
				$limit = sprintf(" LIMIT %d , %d ", $this->Data['start'], $this->Data['limit']);
			}			
			$rquery = sprintf($query, "sv.*, LedenVlieger.LIDTYPE_ID AS VLIEGER_LIDTYPE_ID, LedenInzittende.LIDTYPE_ID AS INZITTENDE_LIDTYPE_ID") . $limit;
			parent::DbOpvraag($rquery);
			
			$records = parent::DbData();		
					
			Debug(__FILE__, __LINE__, sprintf("Data=%s", print_r(parent::DbData(), true)));	
			echo '{"total":"'.$total[0]['total'].'","results":'.json_encode(array_map('PrepareJSON', $records)).'}';		
		}
	}
?>