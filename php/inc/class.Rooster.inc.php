<?php
	class Rooster extends StartAdmin
	{
		function __construct() 
		{
			parent::__construct();
			$this->dbTable = "oper_rooster";
		}
		
		function GetObjectJSON()
		{
			Debug(__FILE__, __LINE__, "Rooster.GetObjectJSON()");	
			
			$query = sprintf("
				SELECT
					ref_leden.NAAM AS OCHTEND_DDI
					, ref_leden_1.NAAM AS OCHTEND_INSTRUCTEUR
					, ref_leden_2.NAAM AS OCHTEND_HULPLIERIST
					, ref_leden_3.NAAM AS OCHTEND_STARTLEIDER
					, ref_leden_4.NAAM AS MIDDAG_DDI
					, ref_leden_5.NAAM AS MIDDAG_INSTRUCTEUR
					, ref_leden_6.NAAM AS MIDDAG_LIERIST
					, ref_leden_7.NAAM AS OCHTEND_LIERIST
					, ref_leden_8.NAAM AS MIDDAG_HULPLIERIST
					, ref_leden_9.NAAM AS MIDDAG_STARTLEIDER
				FROM
					oper_rooster
					LEFT JOIN ref_leden         			ON (oper_rooster.OCHTEND_DDI = ref_leden.ID)
					LEFT JOIN ref_leden AS ref_leden_1      ON (oper_rooster.OCHTEND_INSTRUCTEUR = ref_leden_1.ID)
					LEFT JOIN ref_leden AS ref_leden_2      ON (oper_rooster.OCHTEND_HULPLIERIST = ref_leden_2.ID)
					LEFT JOIN ref_leden AS ref_leden_3      ON (oper_rooster.OCHTEND_STARTLEIDER = ref_leden_3.ID)
					LEFT JOIN ref_leden AS ref_leden_4      ON (oper_rooster.MIDDAG_DDI = ref_leden_4.ID)
					LEFT JOIN ref_leden AS ref_leden_5      ON (oper_rooster.MIDDAG_INSTRUCTEUR = ref_leden_5.ID)
					LEFT JOIN ref_leden AS ref_leden_6      ON (oper_rooster.MIDDAG_LIERIST = ref_leden_6.ID)
					LEFT JOIN ref_leden AS ref_leden_7      ON (oper_rooster.OCHTEND_LIERIST = ref_leden_7.ID)
					LEFT JOIN ref_leden AS ref_leden_8      ON (oper_rooster.MIDDAG_HULPLIERIST = ref_leden_8.ID)
					LEFT JOIN ref_leden AS ref_leden_9      ON (oper_rooster.MIDDAG_STARTLEIDER = ref_leden_9.ID)
				WHERE 
					(`DATUM` = CAST(NOW()AS DATE)) 
				ORDER BY 
					oper_rooster.ID DESC 
				LIMIT 1");
				
			parent::DbOpvraag($query);
			Debug(__FILE__, __LINE__, sprintf("Data=%s", print_r(parent::DbData(), true)));			 
			echo json_encode(array_map('PrepareJSON', parent::DbData()));
		}
		
		function GetObject($datum = null)
		{
			Debug(__FILE__, __LINE__, "Rooster.RoosterVandaag()");	
			
			if ($datum != null)
				$where = sprintf("(`DATUM` = '%s')", $datum);
			else
				$where = "(`DATUM` = CAST(NOW()AS DATE))";
			
			$query = sprintf("
				SELECT
					*
				FROM
					oper_rooster
				WHERE %s
				ORDER BY 
					ID DESC 
				LIMIT 1", $where);
				
			parent::DbOpvraag($query);
			Debug(__FILE__, __LINE__, sprintf("Data=%s", print_r(parent::DbData(), true)));
			return parent::DbData();
		}	

		function AddRooster()
		{
			Debug(__FILE__, __LINE__, "Rooster.AddRooster()");
			Debug(__FILE__, __LINE__, sprintf("Data=%s", print_r($this->Data, true)));				
			
			$l = MaakObject('Login');
			if ($l->magSchrijven() == false)
			{	
				Debug(__FILE__, __LINE__, "Geen schrijfrechten");
				$l->toegangGeweigerd();
			}
			
			$rooster = $this->GetObject();
			if (count($rooster) > 0)
			{
				Debug(__FILE__, __LINE__, "Er is al een rooster voor vandaag");
				return;
			}
			
			$d['DATUM'] = date('Y-m-d');
			$d['OCHTEND_DDI'] 			= null;
			$d['OCHTEND_INSTRUCTEUR'] 	= null;
			$d['OCHTEND_LIERIST'] 		= null;
			$d['OCHTEND_HULPLIERIST'] 	= null;
			$d['OCHTEND_STARTLEIDER'] 	= null;
			$d['MIDDAG_DDI'] 			= null;
			$d['MIDDAG_INSTRUCTEUR'] 	= null;
			$d['MIDDAG_HULPLIERIST'] 	= null;
			$d['MIDDAG_STARTLEIDER'] 	= null;
			
			switch(date('N', time()))
			{
				case 1:	//ma
				case 2:	//di
				case 3:	//wo
				case 4:	//do
				{
					$d['DDWV'] = 1; 
					$d['CLUB_BEDRIJF'] = 0; 					
					break;
				}
				
				case 5: //vr
				{
					$d['DDWV'] = 1; 
					$d['CLUB_BEDRIJF'] = 1; 
					break;
				}
				
				case 6:	//za
				case 7: //zo
				{
					$d['DDWV'] = 0; 
					$d['CLUB_BEDRIJF'] = 1; 
					break;
				}
			}

			if (array_key_exists('DDWV', $this->Data))
			{
				$d['DDWV']  = $this->Data['DDWV'];
			}
			if (array_key_exists('CLUB_BEDRIJF', $this->Data))
			{
				$d['CLUB_BEDRIJF']  = $this->Data['CLUB_BEDRIJF'];
			}			
			if (array_key_exists('OCHTEND_DDI', $this->Data))
			{
				$d['OCHTEND_DDI']  = $this->Data['OCHTEND_DDI'];
			}
			if (array_key_exists('OCHTEND_INSTRUCTEUR', $this->Data))
			{
				$d['OCHTEND_INSTRUCTEUR']  = $this->Data['OCHTEND_INSTRUCTEUR'];
			}
			if (array_key_exists('OCHTEND_LIERIST', $this->Data))
			{
				$d['OCHTEND_LIERIST']  = $this->Data['OCHTEND_LIERIST'];
			}
			if (array_key_exists('OCHTEND_HULPLIERIST', $this->Data))
			{
				$d['OCHTEND_HULPLIERIST']  = $this->Data['OCHTEND_HULPLIERIST'];
			}			
			if (array_key_exists('OCHTEND_STARTLEIDER', $this->Data))
			{
				$d['OCHTEND_STARTLEIDER']  = $this->Data['OCHTEND_STARTLEIDER'];
			}	
			if (array_key_exists('MIDDAG_DDI', $this->Data))
			{
				$d['MIDDAG_DDI']  = $this->Data['MIDDAG_DDI'];
			}
			if (array_key_exists('MIDDAG_INSTRUCTEUR', $this->Data))
			{
				$d['MIDDAG_INSTRUCTEUR']  = $this->Data['MIDDAG_INSTRUCTEUR'];
			}
			if (array_key_exists('MIDDAG_LIERIST', $this->Data))
			{
				$d['MIDDAG_LIERIST']  = $this->Data['MIDDAG_LIERIST'];
			}
			if (array_key_exists('MIDDAG_HULPLIERIST', $this->Data))
			{
				$d['MIDDAG_HULPLIERIST']  = $this->Data['MIDDAG_HULPLIERIST'];
			}			
			if (array_key_exists('MIDDAG_STARTLEIDER', $this->Data))
			{
				$d['MIDDAG_STARTLEIDER']  = $this->Data['MIDDAG_STARTLEIDER'];
			}				
	
			parent::DbToevoegen('oper_rooster', $d);
			Debug(__FILE__, __LINE__, sprintf("rooster toegevoegd id=%d", $id));
		}	
	}
?>