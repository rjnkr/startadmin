<?php

	class Leden extends StartAdmin
	{
		function __construct() 
		{
			parent::__construct();
			$this->dbTable = "ref_leden";
		}
		
		// -------------------------------------------------------------------------------------------------------------------------
		// JSON opvraag functies
		
		// ------------------------------------------------------------------
		// Haal een object op vanuit de database.  
		// 
		// @param vanuit POST
		// 	ID = ID van het lid record
		// 
		// @return 
		// 	Json string 
		//		ID = Het record ID van dit lid in de database
		//		LIDNR = Het lidnummer volgens de club administratie
		//		CODE = Wordt niet meer gebruikt
		//		NAAM = volledige naam
		//		LIDTYPE_ID = Het type lid volgens de type table (groep 6)
		//		MOBIEL = Mobiele telefoon nummer
		// 		TELEFOON = Het tweede telefoonnummer
		// 		NOODNUMMER = Telefoonnummer	in geval van nood	
		//		VOORNAAM = Voornaam van het lid
		//		ACHTERNAAM = Achternaam van het lid, wordt gebruikt on te sorteren
		//		GPL_VERLOOPT = verloop datum GPL, null = datum onbekend
		//		MEDICAL_VERLOOPT = verloop datum medical, null = onbekend
		//		INSTRUCTEUR = 0/1, is het lid een instructeur 
		//		LIERIST = 0/1, is het lid een lierist 
		//		STARTLEIDER = 0/1, is het lid een startleider 				
		//		HEEFT_BETAALD = heeft lid aan finaniceele verplichting voldaan
		//		LAASTE_AANPASSING = wordt door de database zelf geupdate, nodig voor synchronisatie
		//
		// @example
		// 	{
		// 		success: true,
		//		data:
		//			{
		//				"ID":"9",
		//				"LIDNR":"3000",
		//				"CODE":"",
		//				"NAAM":"Pieter Janssen",
		//				"LIDTYPE_ID":"625",
		//				"MOBIEL":06-1209554,
		//				"NOODNUMMER": null,
		//				"TELEFOON":null,
		//				"VOORNAAM":Pieter,
		//				"ACHTERNAAM":Janssen,
		//				"GPL_VERLOOPT":null,
		//				"MEDICAL_VERLOOPT":null,
		//				"INSTRUCTEUR":"0",
		//				"LIERIST":"0",
		//				"STARTLEIDER":"0",
		//				"HEEFT_BETAALD":"0",
		//				"INLOGNAAM":null,
		//				"WACHTWOORD":null,
		//				"AVATAR":null,
		//				"VERWIJDERD":"0",
		//				"LAATSTE_AANPASSING":"2013-03-27 20:33:21"
		//			}
		//	}
 		// 		
		function GetObjectJSON()
		{
			Debug(__FILE__, __LINE__, "Leden.GetObjectJSON()");	
			Debug(__FILE__, __LINE__, sprintf("qParams=%s", print_r($this->qParams, true)));
			
			$id = $this->Data['ID'];
			
			$brackets = array("[", "]");		
			echo '{success: true'.',data:'. str_replace($brackets, "", json_encode($this->GetObject($id))) .'}';
	
		}

		// -------------------------------------------------------------------------------------------------------------------------
		// JSON opvraag functies
		
		// ------------------------------------------------------------------
		// Haal een object op vanuit de database.  
		// 
		// @param vanuit POST
		// 		_:query = zoek criteria door de gebruiker ingevuld
		//  	_:instructeurs = als true, toon alleen instucteurs
		//  	_:startleiders = als true, toon alleen startleiders
		//  	_:lieristen = als true, toon alleen lieristen	
		//  	_:leden = als true, toon alleen de leden van de club. Dus geen DDWV	
		//  	_:verwijderMode als true, laat alleen de leden zien die verwijderd kunnen worden
		//		sort 				= veldnaam waarop gesorteerd moet worden
		//		dir 				= sorteer richting (DESCR - ASC)
		//		limit				= aantal records
		//		start				= eerste record
		// 
		// @return 
		// 	Json string 
		//		ID = Het record ID van dit lid in de database
		//		NAAM = volledige naam
		//		ACHTERNAAM = Achternaam van het lid, wordt gebruikt on te sorteren
		//		LIDTYPE_ID = Het type lid volgens de type table (groep 6)
		//		LIDTYPE = Lidtype in text. Tekt komt uit ype tabel 
		//		MOBIEL = Mobiele telefoon nummer
		// 		TELEFOON = Het tweede telefoonnummer
		// 		NOODNUMMER = Telefoonnummer	in geval van nood		
		//		INSTRUCTEUR = 0/1, is het lid een instructeur 
		//		LIERIST = 0/1, is het lid een lierist 
		//		STARTLEIDER = 0/1, is het lid een startleider 	
		//		GPL_VERLOOPT = verloop datum GPL, null = datum onbekend
		//		MEDICAL_VERLOOPT = verloop datum medical, null = onbekend
		//		AANWEZIG = Is het lid nu aanwezig (vertrek tijd == null)
		//		AANWEZIG_GEWEEST = Is het lid vandaag aanwezig geweest misschien is hij/zij er nog steeds			
		//		HEEFT_BETAALD = heeft lid aan finaniceele verplichting voldaan
		//		LAASTE_AANPASSING = wordt door de database zelf geupdate, nodig voor synchronisatie
		//
		// @example
		// 	({
		//		"total":"2",
		//		"results":
		//		[
		//			{
		//				"ID":"10101",
		//				"NAAM":"Kees Kreveld",
		//				"ACHTERNAAM":"Kreveld",,
		//				"MOBIEL":"020-3254741",
		//				"NOODNUMMER":null,
		//				"TELEFOON":"06-48877904",
		//				"INSTRUCTEUR":"0",
		//				"STARTLEIDER":"0",
		//				"HEEFT_BETAALD":"1",
		//				"LIERIST":"1",
		//				"LIDTYPE":"Lid",
		//				"LIDTYPE_ID":"602",
		//				"GPL_VERLOOPT":"2017-08-29",
		//				"MEDICAL_VERLOOPT":"2016-08-03",
		//				"AANWEZIG":"0",
		//				"AANWEZIG_GEWEEST":"0",
		//				"LAATSTE_AANPASSING":"2016-08-13 13:54:42"
		//			}
		//			,
		//			{
		//				"ID":"10240",
		//				"NAAM":"Mees Woudenberg",
		//				"ACHTERNAAM":"Woudenberg",
		//				"MOBIEL":null,
		//				"NOODNUMMER":null,
		//				"TELEFOON":"06-26263969",
		//				"INSTRUCTEUR":"1",
		//				"STARTLEIDER":"0",
		//				"HEEFT_BETAALD":"1",
		//				"LIERIST":"1",
		//				"LIDTYPE":"Lid",
		//				"LIDTYPE_ID":"602",
		//				"GPL_VERLOOPT":"2017-05-30",
		//				"MEDICAL_VERLOOPT":"2018-04-08",
		//				"AANWEZIG":"0",
		//				"AANWEZIG_GEWEEST":"0",
		//				"LAATSTE_AANPASSING":"2017-01-24 23:29:04"
		//			}
		//		]
		//  })
 		// 		
		function GetObjectsCompleteJSON()
		{
			Debug(__FILE__, __LINE__, "Leden.GetObjectsCompleteJSON()");	
			Debug(__FILE__, __LINE__, sprintf("Data=%s", print_r($this->Data, true)));	
			Debug(__FILE__, __LINE__, sprintf("qParams=%s", print_r($this->qParams, true)));	
			
			$where = ' WHERE 1=1 ';

			$l = MaakObject('Login');
			if ($l->isBeheerder() == false)
			{
				// 600 = Diverse (Bijvoorbeeld bedrijven- of jongerendag)
				// 607 = Zusterclub
				// 609 = Nieuw lid
				// 612 = Penningmeester			
				$where = ' WHERE LIDTYPE_ID NOT IN (600, 607, 609, 612) ';
			}
				
			if (array_key_exists('_:query', $this->qParams))
			{
				if (strlen(trim($this->qParams['_:query'])) > 0)
					$where = $where . " AND NAAM LIKE ('%%" . trim($this->qParams['_:query']) . "%%') ";
			}
			if (array_key_exists('_:instructeurs', $this->qParams))
			{
				if ($this->qParams['_:instructeurs'] == 'true')
					$where = $where . " AND INSTRUCTEUR='true'";
			}
			if (array_key_exists('_:lieristen', $this->qParams))
			{
				if ($this->qParams['_:lieristen'] == 'true')
					$where = $where ." AND LIERIST='true'";
			}
			if (array_key_exists('_:startleiders', $this->qParams))
			{
				if ($this->qParams['_:startleiders'] == 'true')
					$where = $where . " AND STARTLEIDER='true'";
			}	
			if (array_key_exists('_:aanwezig', $this->qParams))
			{
				if ($this->qParams['_:aanwezig'] == 'true')
					$where = $where ." AND AANWEZIG='true'";
			}
			if (array_key_exists('_:leden', $this->qParams))
			{
				if ($this->qParams['_:leden'] == 'true')
				{
					// 601 = Erelid, 602 = lid, 603 = jeugdlid, 606 = donateur
					$where = $where ." AND LIDTYPE_ID IN (601, 602, 603, 606)";
				}	
			}				
			
			if (array_key_exists('_:verwijderMode', $this->qParams))
			{
				if ($this->qParams['_:verwijderMode'] == 'true')
				{
					$where = $where ." AND LIDTYPE_ID = 609";	// 609 = 'nieuw lid, nog niet verwerkt in ledenadministratie'
				}
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
					ledenlijst_view" . $where . $orderby;
			
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
				
				//Debug(__FILE__, __LINE__, sprintf("Data=%s", print_r(parent::DbData(), true)));
				echo '({"total":"'.$total[0]['total'].'","results":'.json_encode(array_map('PrepareJSON', parent::DbData())).'})';
			}
		}

		// ------------------------------------------------------------------
		// Haal de verkorte ledenlijst op uit de database. De lijst bevat 
		// een beperkte set met velden. Deze lijst is voldoende om een start
		// te kunnen invoeren
		// 
		// @return 
		// 	Json string 
		//		ID = LidID in de database
		//		NAAM = Volledige naam van het lid
		//		INSTRUCTEUR = 0/1, is het lid een instrcteur 
		//		AANWEZIG = Is het lid nu aanwezig (vertrek tijd == null)
		//		AANWEZIG_GEWEEST = Is het lid vandaag aanwezig geweest misschien is hij/zij er nog steeds
		//		GPL_VERLOOPT = verloop datum GPL, null = datum onbekend
		//		MEDICAL_VERLOOPT = verloop datum medical, null = onbekend
		//		LIDTYPE_ID = verwijzing naar types (groep 6)
		//		HEEFT_BETAALD = heeft lid aan finaniceele verplichting voldaan
		//  
		// @example
		// 	[{
		// 		"ID":"1000216",
		//		"NAAM":"Mister X",
		//		"INSTRUCTEUR":"0",
		// 		"AANWEZIG":"0",
		//		"AANWEZIG_GEWEEST":"0",
		//		"GPL_VERLOOPT":null,
		//		"MEDICAL_VERLOOPT":null,
		//		"LIDTYPE_ID":"609","
		//		HEEFT_BETAALD":"1"
		//	}
		//	
		//	{
		//		"ID":"20630",
		//		"NAAM":"Miss Y",
		//		"INSTRUCTEUR":"0",
		//		"AANWEZIG":"0",
		//		"AANWEZIG_GEWEEST":"0",
		//		"GPL_VERLOOPT":null,
		//		"MEDICAL_VERLOOPT":null,
		//		"LIDTYPE_ID":"625",
		//		"HEEFT_BETAALD":"1"
		//	}]
		function LedenlijstKortJSON()
		{
			Debug(__FILE__, __LINE__, "Leden.LedenlijstKortJSON()");	
			Debug(__FILE__, __LINE__, sprintf("qParams=%s", print_r($this->qParams, true)));			
		
			$query = "
				SELECT 
					%s
				FROM  
					ledenlijst_view AS L 
				WHERE
					1=1 AND %s
				ORDER BY NAAM";

			$where = "1=1 ";
			
			$di = MaakObject('Daginfo');
			$diObj = $di->GetObject();
			
			if ($diObj[0]['ID'] != -1)					// -1 = Daginfo is niet ingevuld
			{
				if ($diObj[0]['BEDRIJF_ID'] == 701)		// 701 = aleen clubbedrijf
				{
					$where = "LIDTYPE_ID != 625 ";		// alleen clubbedrijf = geen ddwv vliegers (625)
				}
			}
			
			if (array_key_exists('_:LAATSTE_AANPASSING', $this->qParams))
			{
				$query  = sprintf($query, "MAX(LAATSTE_AANPASSING) AS LAATSTE_AANPASSING", $where);
				$la = $this->LaatsteAanpassing($query);
				Debug(__FILE__, __LINE__, sprintf("LAATSTE_AANPASSING=%s", $la));	
				echo $la;
			}
			else
			{			
				$query = sprintf($query, "L.ID, L.NAAM AS NAAM, L.INSTRUCTEUR,L.AANWEZIG,L.AANWEZIG_GEWEEST, GPL_VERLOOPT, MEDICAL_VERLOOPT, LIDTYPE_ID, HEEFT_BETAALD", $where);
				parent::DbOpvraag($query);	
				echo json_encode(array_map('PrepareJSON', parent::DbData()));
			}
		}	

		function SaveObject()
		{
			Debug(__FILE__, __LINE__, "Leden.SaveObject()");
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
					
			$d['NAAM'] 			= $this->Data['NAAM']; 	
			$d['TELEFOON'] 		= null;
			$d['MOBIEL'] 		= null;
			$d['NOODNUMMER'] 	= null;
			
			if (array_key_exists('TELEFOON', $this->Data))
			{
				$d['TELEFOON'] = $this->Data['TELEFOON'];
			}
			if (array_key_exists('MOBIEL', $this->Data))
			{
				$d['MOBIEL'] = $this->Data['MOBIEL'];
			}
			if (array_key_exists('NOODNUMMER', $this->Data))
			{
				$d['NOODNUMMER'] = $this->Data['NOODNUMMER'];
			}			

			$l = MaakObject('Login');
			if ($l->isBeheerder())
			{
				if (array_key_exists('LIDTYPE_ID', $this->Data))
				{
					$d['LIDTYPE_ID'] = $this->Data['LIDTYPE_ID'];
				}	
				if (array_key_exists('CODE', $this->Data))
				{
					$d['CODE'] = $this->Data['CODE'];
				}		
				if (array_key_exists('LIDNR', $this->Data))
				{
					$d['LIDNR'] = $this->Data['LIDNR'];
				}
				if (array_key_exists('HEEFT_BETAALD', $this->Data))
				{
					$d['HEEFT_BETAALD'] = $this->Data['HEEFT_BETAALD'];
				}				
			}			
					
			$id = intval($this->Data['ID']);
			if ($id < 0)
			{
				$id = $this->NieuwID();
				$d['ID'] = $id;
				if ($l->isBeheerder() == false)			
				{
					$d['LIDTYPE_ID'] = 609;		// Nieuw lid, nog niet verwerkt in leden administratie
					$d['HEEFT_BETAALD'] = 1;				
				}				
				parent::DbToevoegen('ref_leden', $d);
				Debug(__FILE__, __LINE__, sprintf("lid toegevoegd id=%d", $id));
			}
			else
			{
				parent::DbAanpassen('ref_leden', $id, $d);
			}

			echo sprintf('{"success":true,"errorCode":-1,"error":"","ID":%d}',$id);
		}		
		
		// We gooien nooit records fysiek weg uit de database, er zijn immers starts gekoppeld aan het lid
		// Om aan te gegeven dat het lid niet meer lid is, zetten we VERWIJDERD op 1
		function VerwijderObject()
		{
			Debug(__FILE__, __LINE__, "Leden.VerwijderObject()");
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

			parent::DbAanpassen('ref_leden', $id, $d);

			echo '{"success":true,"errorCode":-1,"error":""}';
		}			


/***		
		function InstructeursLijstJSON()
		{
			Debug(__FILE__, __LINE__, "Leden.InstructeursLijstJSON()");	
			Debug(__FILE__, __LINE__, sprintf("qParams=%s", print_r($this->qParams, true)));		
			
			$query = "
				SELECT 
					%s
				FROM
					ledenlijst_view WHERE INSTRUCTEUR='true' ORDER BY NAAM";
						
			if (array_key_exists('_:LAATSTE_AANPASSING', $this->qParams))
			{
				$query  = sprintf($query, "MAX(LAATSTE_AANPASSING) AS LAATSTE_AANPASSING");
				$la = $this->LaatsteAanpassing($query);
				Debug(__FILE__, __LINE__, sprintf("LAATSTE_AANPASSING=%s", $la));	
				echo $la;
			}
			else
			{			
				$query = sprintf($query, "ID, NAAM");
				parent::DbOpvraag($query);	
				//Debug(__FILE__, __LINE__, sprintf("Data=%s", print_r(parent::DbData(), true)));
				echo json_encode(array_map('PrepareJSON', parent::DbData()));
			}
		}
		
		function LieristenLijstJSON()
		{
			Debug(__FILE__, __LINE__, "Leden.LieristenLijstJSON()");	
			Debug(__FILE__, __LINE__, sprintf("qParams=%s", print_r($this->qParams, true)));			
			
			$query = "
				SELECT 
					%s
				FROM
					ledenlijst_view WHERE LIERIST='true' ORDER BY NAAM";
						
			if (array_key_exists('_:LAATSTE_AANPASSING', $this->qParams))
			{
				$query  = sprintf($query, "MAX(LAATSTE_AANPASSING) AS LAATSTE_AANPASSING");
				$la = $this->LaatsteAanpassing($query);
				Debug(__FILE__, __LINE__, sprintf("LAATSTE_AANPASSING=%s", $la));	
				echo $la;
			}
			else
			{			
				$query = sprintf($query, "ID, NAAM");
				parent::DbOpvraag($query);	
				//Debug(__FILE__, __LINE__, sprintf("Data=%s", print_r(parent::DbData(), true)));
				echo json_encode(array_map('PrepareJSON', parent::DbData()));
			}
		}
		
		function StartleidersLijstJSON()
		{
			Debug(__FILE__, __LINE__, "Leden.StartleidersLijstJSON()");	
			Debug(__FILE__, __LINE__, sprintf("qParams=%s", print_r($this->qParams, true)));	
			
			$query = "
				SELECT 
					%s
				FROM
					ledenlijst_view WHERE STARTLEIDER='true' ORDER BY NAAM";
						
			if (array_key_exists('_:LAATSTE_AANPASSING', $this->qParams))
			{
				$query  = sprintf($query, "MAX(LAATSTE_AANPASSING) AS LAATSTE_AANPASSING");
				$la = $this->LaatsteAanpassing($query);
				Debug(__FILE__, __LINE__, sprintf("LAATSTE_AANPASSING=%s", $la));	
				echo $la;
			}
			else
			{			
				$query = sprintf($query, "ID, NAAM");
				parent::DbOpvraag($query);	
				//Debug(__FILE__, __LINE__, sprintf("Data=%s", print_r(parent::DbData(), true)));
				echo json_encode(array_map('PrepareJSON', parent::DbData()));
			}
		}
		*/

		// -------------------------------------------------------------------------------------------------------------------------
		// PHP interne functies
		
		function GetObject($id)
		{
			Debug(__FILE__, __LINE__, sprintf("Leden.GetObject(%s)", $id));	
			
			$query = sprintf("
				SELECT
					*
				FROM
					ref_leden
				WHERE
					ID = '%d'", $id);
					
			parent::DbOpvraag($query);
			Debug(__FILE__, __LINE__, sprintf("Data=%s", print_r(parent::DbData(), true)));
			return (parent::DbData());
		}	
		
		// vraag lid record op basis van de login naam, login naam is dus uniek
		function GetObjectByLoginNaam($loginnaam)
		{		
			$query = sprintf("
				SELECT
					*
				FROM
					ref_leden
				WHERE
					INLOGNAAM = '%s'", $loginnaam);
					
			parent::DbOpvraag($query);
			Debug(__FILE__, __LINE__, sprintf("Data=%s", print_r(parent::DbData(), true)));
			return (parent::DbData());
		}

		// vraag lid record op basis van het lidnummer in de club administratie. Het lidnummer is dus uniek
		function GetObjectByLidNr($lidnr)
		{		
			$query = sprintf("
				SELECT
					*
				FROM
					ref_leden
				WHERE
					LIDNR = '%s'", $lidnr);
					
			parent::DbOpvraag($query);
			Debug(__FILE__, __LINE__, sprintf("Data=%s", print_r(parent::DbData(), true)));
			return (parent::DbData());
		}			
		
		// Zoek welke leden het best overeenkomen met de ingegeven naar. 
		function ZoekBesteLid($naam, &$records)
		{
			Debug(__FILE__, __LINE__, sprintf("Leden.ZoekBesteLid(%s, %d)", $naam, $records == null));		
			
			if ($records == null)
			{
				$query = "
					SELECT 
						%s
					FROM
						ledenlijst_view WHERE LIDTYPE_ID != 609 ORDER BY NAAM";	// 609 = tijdelijke leden
							
				$query = sprintf($query, "ID, NAAM");
				parent::DbOpvraag($query);	
				
				$records = parent::DbData();
			}
			
			for ($i=0; $i < count($records); $i++)
			{
				$records[$i]['MATCH'] =  Match($records[$i]['NAAM'], $naam);
			}
			
			usort($records, function($a, $b) 
			{
				return $a['MATCH'] < $b['MATCH'];
			});
							
			return $records[0]['ID'];
		}
		
		function NieuwID()
		{
			$l = MaakObject('Login');
			if ($l->isBeheerder())
			{
				// dit zijn bijzondere leden die alleen in start administratie voorkomen
				// bijvoorbeeld andere clubs, bedrijven etc
				parent::DbOpvraag("
					SELECT 
						ID + 1 AS NIEUW_ID
					FROM 
						ref_leden
					WHERE 
						ID < 1000
					ORDER BY 
						ID DESC
					LIMIT 1;");
					
				$id = parent::DbData();
				if (count($id) > 0)
					$id = $id[0]['NIEUW_ID'];
				else
					$id = 100;
			}
			else
			{
				// Dit zijn nieuwe leden die op de vliegdag toegevoed worden. 
				// Blijkbaar is er iets fout gegaan dat deze nog niet beschikbaar zijn.
				// Hebben een hoog ID (> 1000000) zodat ze makkelijk herkenbaar zijn
				parent::DbOpvraag("
						SELECT 
							ID + 1 AS NIEUW_ID
						FROM 
							ref_leden
						WHERE 
							LIDTYPE_ID = 609 
						ORDER BY 
							ID DESC
						LIMIT 1;");
						
					$id = parent::DbData();
					if (count($id) > 0)
						$id = $id[0]['NIEUW_ID'];
					else
						$id = 1000000;			
			}
			return $id;		
		}	
	}
?>