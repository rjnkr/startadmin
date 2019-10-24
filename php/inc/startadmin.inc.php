<?php

// Dit is de base class waar alles van afgeleid wordt
abstract class StartAdmin
{
	public $qParams = array();
	public $Data = array();
	public $dbTable;
	
	private $defaultErrorLevel;
	private $HttpGetContext;
	
	// de constructor
	public function __construct() 
	{
		$defaultErrorLevel = error_reporting();
		$HttpGetContext = stream_context_create(array('http'=>
			array(
					'timeout' => 0.2, // 0.2 seconde
				  )
			));	
		
		// het intreseert ons niet hoe de data aangeleverd wordt. Stop alles in het Data veld
		$this->Data = $_POST + $_GET;
	
		if(!empty($_GET))
		{
			foreach ($_GET as $key => $val) 
			{			
				$p = strpos($key, "_:");
				
				if (($p !== false) && ($p == 0))
					$this->qParams[$key] = $val; 
			}
		}
		// now qParam contains the parameters for the query
	}
	
	
	// Functie voor slim laden van datastores in web applicatie
	function LaatsteAanpassing($query)
	{		
		$this->DbOpvraag($query);	
		$d = $this->DbData();	
		if (count($d) == 0)
		{
			echo "";
		}
		echo $d[0]['LAATSTE_AANPASSING'];
	}
	
	// Functie wordt gebruikt door sync process om een object op te haden uit de database. 
	// De betreffende class heeft de dbTable gezet in de constructor, het ID veld is de unieke sleutel om het record op te halen
	function SyncHaalObject()
	{		
		$id = $_GET["ID"];
		
		Debug(__FILE__, __LINE__, sprintf("StartAdmin.SyncHaalObject(%s, %d)", $this->dbTable, $id));
		
		$query = sprintf("SELECT * FROM %s WHERE ID = '%s'", $this->dbTable, $id);
		$this->DbOpvraag($query);
		
		echo json_encode(array_map('PrepareJSON', $this->DbData()));
	}

	// Haal op welke ID zijn aangepast
	// De betreffende class heeft de dbTable gezet in de constructor
	function SyncSamenvatting()
	{
		Debug(__FILE__, __LINE__, sprintf("StartAdmin.SyncSamenvatting(%s)",$this->dbTable));
		
		$query = sprintf("SELECT ID, UNIX_TIMESTAMP(LAATSTE_AANPASSING) AS LAATSTE_AANPASSING FROM %s ", $this->dbTable);
		
		$where = "";
		if (array_key_exists('_:datum', $this->qParams))
		{
			$where = sprintf("WHERE (LAATSTE_AANPASSING > '%s')", $this->qParams['_:datum']);
		}
		
		if (array_key_exists('IN', $this->Data))
		{
			if ($where == "")
				$where = "WHERE";
			else
				$where .= " OR";
			
	
			$where .= sprintf(" ID IN (%s)", $this->Data['IN']);
		}
		
		$this->DbOpvraag($query . $where);
		
		echo json_encode(array_map('PrepareJSON', $this->DbData()));
	}
	
	// Haal de checksum op van een setje records
	// De betreffende class heeft de dbTable gezet in de constructor
	function SyncChecksum()
	{		
		Debug(__FILE__, __LINE__, sprintf("StartAdmin.SyncChecksum(%s)", $this->dbTable));
		
		$where = '';
		if (array_key_exists('_:datum', $this->qParams))
		{
			$where = sprintf(" WHERE (`LAATSTE_AANPASSING` > '%s')", $this->qParams['_:datum']);
			Debug(__FILE__, __LINE__, sprintf("_:datum = %s", $this->qParams['_:datum']));
		}
			
		$query = sprintf("SELECT SUM(UNIX_TIMESTAMP(LAATSTE_AANPASSING)) %% 10000 AS CHECKSUM FROM  %s %s", $this->dbTable, $where);
		
		$this->DbOpvraag($query);
		$d = $this->DbData();
			
		if (count($d) > 0)
			echo $d[0]['CHECKSUM'];
		else
			echo "??";
	}
	
	// Het syncronisatie proces moet een bestaan record aanpassen
	// De betreffende class heeft de dbTable gezet in de constructor
	function SyncRecord()
	{
		$id = $_POST['ID'];
		
		Debug(__FILE__, __LINE__, sprintf("StartAdmin.SyncRecord(%s, %d)", $this->dbTable, $id));
		Debug(__FILE__, __LINE__, sprintf("Data=%s", print_r($_POST, true)));
		
		global $db;
		
		$query = sprintf("SELECT * FROM %s WHERE ID = '%s'", $this->dbTable, $id);
		$this->DbOpvraag($query);

		if ($this->NumRows() > 0)
			$db->DbAanpassen($this->dbTable, $_POST['ID'], $_POST);
		else
			$db->DbToevoegen($this->dbTable, $_POST);
	}

	
	///-------------------------------------------------------------------------------------------------------------------------------------
	/// Hier regelen we database base interactie. We hebben de mogelijk nu, om een externe trigger te starten wanneer er data in de database
	/// aangepast wordt.
	///-------------------------------------------------------------------------------------------------------------------------------------
	function DbToevoegen($table, $array)
	{
		global $db, $app_settings;
		
		$lastid = $db->DbToevoegen($table, $array);
		
		if (isset($app_settings['statusUrl']))
		{
			$syncUrl = sprintf("%s/Toevoegen?table=%s&id=%s", $app_settings['statusUrl'], get_called_class(), $lastid);
			Debug(__FILE__, __LINE__, sprintf("syncUrl=%s", $syncUrl));
			error_reporting(0);
			file_get_contents($syncUrl, false, $HttpGetContext);
			error_reporting(defaultErrorLevel);
		}
		return $lastid;
	}
	
	function DbAanpassen($table, $ID, $array)
	{
		global $db, $app_settings;
		
		$retVal = $db->DbAanpassen($table, $ID, $array);
		
		if (isset($app_settings['statusUrl']))
		{
			$syncUrl = sprintf("%s/Wijzigen?table=%s&id=%s", $app_settings['statusUrl'], get_called_class(), $ID);
			Debug(__FILE__, __LINE__, sprintf("syncUrl=%s", $syncUrl));			
			error_reporting(0);
			file_get_contents($syncUrl, false, $HttpGetContext);
			error_reporting(defaultErrorLevel);
		}
		return $retVal;	
	}
	
	function DbUitvoeren($query)
	{
		global $db;
		
		return $db->DbUitvoeren($query);
	}
	
	function DbData()
	{
		global $db;
		
		return $db->data_retrieved;
	}
	
	function DbOpvraag($query, $array = null)
	{
		global $db;	
		
		return $db->DbOpvraag($query, $array);
	}
	
	function NumRows()
	{
		global $db;	
		
		return $db->rows;
	}
}

?>