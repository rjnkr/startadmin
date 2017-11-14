// convert a time object to a time string. 
function TijdStempel(tijd)
{
	var time= new Date();
	
	if (tijd != null)
		time = tijd;

    var hours = "0" + time.getHours();
    var mins = "0" + time.getMinutes();
	var secs = "0" + time.getSeconds();
	var msec = "00" + time.getMilliseconds();
	
	var h = String(hours).length;
	var m = String(mins).length;
	var s = String(secs).length;
	var a = String(msec).length;
	
	return hours.substring(h, h-2) + ":" + mins.substring(m, m-2) + ":" + secs.substring(s, s-2) + "." + msec.substring(a, a-3);
}

function stringNaarSec(time) 
{
    time = time.split(/:/);
    var retValue = time[0] * 3600 + time[1] * 60;
			
	return retValue;
}

function stringNaarMin(time) 
{
    time = time.split(/:/);
    var retValue = time[0] * 60 + time[1];
			
	return retValue;
}

function tijdNaarSec(time) 
{
	tijd = TijdStempel(time);
    return stringNaarSec(tijd);
}

function tijdNaarMin(time) 
{
	tijd = TijdStempel(time);
    return stringNaarMin(tijd);
}

function addMinutes(date, minutes) 
{
    return new Date(date.setMinutes(date.getMinutes() + minutes));
}