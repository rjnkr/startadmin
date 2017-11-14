<?php
	class GPS extends StartAdmin
	{
		function __construct() 
		{
			parent::__construct();
			$this->dbTable = "oper_gps";
		}
		
		function GPSVandaag()
		{		
			
			Debug(__FILE__, __LINE__, "GPS.GPSVandaag()");			
			
			$query = sprintf("
				SELECT 
					*
				FROM
					oper_gps 
				WHERE 
					(`DATUM` = CAST(NOW()AS DATE)) 
				ORDER BY 
					ID DESC 
				LIMIT 1");
				
			parent::DbOpvraag($query);
			Debug(__FILE__, __LINE__, sprintf("Data=%s", print_r(parent::DbData(), true)));		
			return parent::DbData();
		}

		function SaveObject()
		{
			$d['BAAN_ID'] = $this->BepaalBaan($this->Data['Gebied']);
			$d['LATITUDE'] = $this->Data['Lat'];
			$d['LONGITUDE'] = $this->Data['Lon'];
			$d['DATUM'] = date('Y-m-d');
			
			$GPS = $this->GPSVandaag();
			
			if (count($GPS) > 0)	
				parent::DbAanpassen('oper_gps', $GPS[0]['ID'], $d); 
			else
				parent::DbToevoegen('oper_gps', $d);
		}
		
		function BepaalBaan($BaanOmschrijving)
		{
			$t = MaakObject('Types');
			$banen = $t->GetObjects(1,false);
			
			$BAAN_ID = null;
			foreach ($banen as $baan)
			{
				if ($baan['CODE'] == $BaanOmschrijving)
				{
					$BAAN_ID = $baan['ID'];
					break;
				}
			}
			return $BAAN_ID;
		}
	}
?>