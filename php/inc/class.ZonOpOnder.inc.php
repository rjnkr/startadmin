<?php

	class ZonOpOnder
	{		
		function ZonOpkomst()
		{
			echo date_sunrise(time(), SUNFUNCS_RET_STRING, 52, 6, 90, $this->offsetHours());
		}	

		function ZonOnder()
		{
			echo date_sunset(time(), SUNFUNCS_RET_STRING, 52, 6, 90, $this->offsetHours());		
		}

		function offsetHours()
		{
			$timezone = new DateTimeZone(date_default_timezone_get()); 	// Get default system timezone to create a new DateTimeZone object 
			$offset = $timezone->getOffset(new DateTime('NOW')); 		// Offset in seconds to UTC 
			return $offset/3600; 										// Offset in hours to UTC 
		}
	}
?>