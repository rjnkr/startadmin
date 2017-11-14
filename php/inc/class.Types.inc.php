<?php
	class Types extends StartAdmin
	{
		function __construct() 
		{
			parent::__construct();
			$this->dbTable = "types";
		}
		
		function GetObjectsJSON()
		{
			Debug(__FILE__, __LINE__, "Types.GetObjectsJSON()");	
			Debug(__FILE__, __LINE__, sprintf("qParams=%s", print_r($this->qParams, true)));
			
			if (!array_key_exists('_:TYPEGROUP_ID', $this->qParams))
			{
				echo '{"success":false,"errorCode":-1,"error":"Geen TYPEGROUP_ID in dataset"}';
				return;
			}
			
			if (array_key_exists('_:LAATSTE_AANPASSING', $this->qParams))
			{
				echo $this->GetObjects($this->qParams["_:TYPEGROUP_ID"], true);
			}
			else
			{
				$data = $this->GetObjects($this->qParams["_:TYPEGROUP_ID"], false);
				echo json_encode(array_map('PrepareJSON', $data)); 				
			}
		}
	
		function GetObjects($TypeGroupID, $LaatsteAanpassing)
		{
			Debug(__FILE__, __LINE__, "Types.GetObjects()");	
			Debug(__FILE__, __LINE__, sprintf("qParams=%s", print_r($this->qParams, true)));
			
			$where = sprintf("VERWIJDERD=0 AND TYPEGROUP_ID = '%s'", $TypeGroupID);
			$query = "
				SELECT 
					%s	
				FROM
					types 
				WHERE " . $where . " 
				ORDER BY 
					SORTEER_VOLGORDE, 
					OMSCHRIJVING";

			if ($LaatsteAanpassing == true)
			{
				$query  = sprintf($query, "MAX(LAATSTE_AANPASSING) AS LAATSTE_AANPASSING");
				$la = $this->LaatsteAanpassing($query);
				Debug(__FILE__, __LINE__, sprintf("LAATSTE_AANPASSING=%s", $la));	
				return $la;
			}
			else
			{
				$query  = sprintf($query, "*");
				parent::DbOpvraag($query);
				Debug(__FILE__, __LINE__, sprintf("Data=%s", print_r(parent::DbData(), true)));
				return parent::DbData();
			}
		}
		
		function GetObjectJSON()
		{
			Debug(__FILE__, __LINE__, "Types.GetObjectsJSON()");	
			Debug(__FILE__, __LINE__, sprintf("qParams=%s", print_r($this->qParams, true)));
			
			echo json_encode(array_map('PrepareJSON', $this->GetObject($this->qParams["_:ID"]))); 
		}
		
		function GetObject($id)
		{
			Debug(__FILE__, __LINE__, sprintf("Types.GetObjects(%d)", $id));	
			
			$query = sprintf("
				SELECT 
					*	
				FROM
					types 
				WHERE
					ID = '%s'", $id);

			parent::DbOpvraag($query);
			Debug(__FILE__, __LINE__, sprintf("Data=%s", print_r(parent::DbData(), true)));
			return  parent::DbData(); 
		}		
	}
?>