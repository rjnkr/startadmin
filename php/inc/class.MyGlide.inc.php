<?php
	// Dit heeft niets met de start administratie te maken. Het is de interface naar MyGlide app
	// Beetje onhandig, maar meeste data kom uit start administratie
	// Door dit te gebruiken hoeven we in de myglide app geen aparte URL te hebben en is inloggen ook al gebeurd

	// mischien nog een keer naar main.php
	// Zlang we het alleen hier nodig hebben is dat niet nodig 
	
	//Import the PHPMailer class into the global namespace
	use PHPMailer\PHPMailer\PHPMailer;
	require 'vendor/autoload.php';

	class MyGlide extends StartAdmin
	{
		function __construct() 
		{
			parent::__construct();
		}
		
		function incidentMelding()
		{
			global $smtp_settings;
			
			Debug(__FILE__, __LINE__, sprintf("MyGlide.incidentMelding()"));
			Debug(__FILE__, __LINE__, sprintf("Data=%s", print_r($this->Data, true)));	
			
			//print_r($this->Data);
			
			if (!array_key_exists('EMAIL_VM', $this->Data))
			{
				Debug(__FILE__, __LINE__, "Geen EMAIL_VM in dataset");
				http_response_code(400);
				return;
			}
			
			if (!array_key_exists('EMAIL_MELDER', $this->Data))
			{
				Debug(__FILE__, __LINE__, "Geen EMAIL_MELDER in dataset");
				http_response_code(400);
				return;
			}		

			if (!array_key_exists('RAPPORT', $this->Data))
			{
				Debug(__FILE__, __LINE__, "Geen RAPPORT in dataset");
				http_response_code(400);
				return;
			}				
			
			$annoniem = false;
			if (array_key_exists('ANNONIEM', $this->Data))
			{
				$annoniem =  $this->Data['ANNONIEM'] === 'true'? true: false;
			}
			
			$from = $this->Data['EMAIL_VM'];
			if ($annoniem === false)
				$from = $this->Data['EMAIL_MELDER'];
			
			$naamMelder = $from;
			if (array_key_exists('NAAM_MELDER', $this->Data))
			{
				$naamMelder = $this->Data['NAAM_MELDER'];
			}			
			
			$mail = new PHPMailer;
	
			$mail->isSMTP();
			$mail->SMTPDebug  = 1;
			$mail->Host       = $smtp_settings['smtphost'];				// Set the hostname of the mail server
			$mail->Port       = $smtp_settings['smtpport'];				// Set the SMTP port number - likely to be 25, 465 or 587
			$mail->SMTPSecure = $smtp_settings['smtpsecure'];			// Whether to use ssl or tls
			$mail->SMTPAuth   = true; 									// Whether to use SMTP authentication
			$mail->Username   = $smtp_settings['smtpuser']; 			// Username to use for SMTP authentication
			$mail->Password   = $smtp_settings['smtppass'];		 		// Password to use for SMTP authentication	
			
			$mail->addAddress($this->Data['EMAIL_VM'],'Veiligheidsmanager GeZC'); 	//Set who the message is to be sent to
			
			if ($annoniem === true) 
			{
				$mail->setFrom($this->Data['EMAIL_VM'], 'MyGlide'); //Set who the message is to be sent from
				$mail->AddBCC($this->Data['EMAIL_MELDER'], $naamMelder);
			}
			else
			{
				$mail->setFrom($this->Data['EMAIL_MELDER'], $naamMelder); //Set who the message is to be sent from
				$mail->AddCC($this->Data['EMAIL_MELDER'], $naamMelder);
			}
			
			if (array_key_exists('from', $smtp_settings))
				$mail->setFrom( $smtp_settings['from']); 	//Some SMTP servers (e.g. Office 365) need a from address which is equal to user account

			$mail->Subject = 'MyGlide incident melding'; 	// Set the subject line
			$mail->msgHTML($this->Data['RAPPORT']);			// Message content
			
			if (!$mail->send()) {							//send the message, check for errors
				echo "Mailer Error: " . $mail->ErrorInfo;
				http_response_code(400);
			} else {
				echo "Message sent!";
			}
		}
	}
?>