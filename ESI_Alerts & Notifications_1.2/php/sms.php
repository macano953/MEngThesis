<?php

header('Access-Control-Allow-Origin: *');  
require_once 'src/autoload.php';

$phone_number=$_POST['phone_number'];
$address=$_POST['address'];
$parameter=$_POST['parameter'];
$operator=$_POST['operator'];
$value=$_POST['value'];
$email=$_POST['email'];
$notification=$_POST['notification'];
$email_from = "fiware-alerts@topdigitalsensors2.hol.es";

if($notification == 1){
	$message = new \Esendex\Model\DispatchMessage(
		"WebApp", // Send from
		$phone_number, // Send to any valid number
		"Alarma en el sensor situado en: ".$address." (".$parameter. " ".$operator." ".$value.").",
		\Esendex\Model\Message::SmsType
	);
	$authentication = new \Esendex\Authentication\LoginAuthentication(
		"EX0092384", // Your Esendex Account Reference
		"manuel.illanes@topdigital.es", // Your login email address
		"UPhzHJpzKVMh" // Your password
	);
	$service = new \Esendex\DispatchService($authentication);
	$result = $service->send($message);
	echo "sms_success";
}
else 
{
	$email_subject = "Alerta de ".$parameter."";
	$email_message = "Alarma en el sensor situado en: ".$address." (".$parameter. " ".$operator." ".$value.").";
	$headers = 'From: '.$email_from."\r\n".
		'Reply-To: '.$email_from."\r\n" .
		'X-Mailer: PHP/' . phpversion();
	if(mail($email, $email_subject, $email_message, $headers))
		echo "email_success";
	else
		echo "email_failure";
}
?>