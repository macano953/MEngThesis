<?php


/*
    Author: Miguel Angel Caño.
 
*/

//Parámetros de conexión a BD:
$DATABASE = 'MeshliumDB';
$TABLE = 'pfc';
$IP = '******';
$USER = 'root';
$PASS = '******';

// Conectar con el servidor de base de datos
$conexion = mysql_connect ($IP, $USER, $PASS)
  or die ("No se puede conectar con el servidor");

// Seleccionar base de datos
mysql_select_db ($DATABASE)
  or die ("No se puede seleccionar la base de datos");
  
// Realizar una consulta MySQL
$query = 'SELECT * FROM pfc';
$result = mysql_query($query) or die('Consulta fallida: ' . mysql_error());

//Extracting variables from $_GET or $_POST :
if (count($_GET) > 0) {
    foreach ($_GET as $key => $value) {
        $data_received[$key] = $value;
    }
    
}
if (count($_POST) > 0) {
    foreach ($_POST as $key => $value) {
        $data_received[$key] = $value;
    }
}
  //Treating the whole frame
  $frame = $data_received['frame'];
  //Parsing:
 
  $frame_type = hexdec(substr($frame, 6, 2));
  $data_fields = hexdec(substr($frame, 8, 2));
  
  //Converting all to ASCII
  $frame_ascii = hex2str($frame);
  
  //Exploding the frame by #
  $array_data = explode('#', $frame_ascii);
  $id_secret = $array_data[1];
  $id_wasp = $array_data[2];
  $frame_number = $array_data[3];
  $Sensortype = $id_wasp;
  $Sensorname = $id_secret;
  
  //Now, we take all the sensors data: (BAT:89)
  for ($index = 0; $index < $data_fields; $index++) {
	  $sensor = explode(':',$array_data[$index+4]);
	  if ($debug) {
		  print_r ($sensor);
		  echo '<br>';
	  }        
	  $sensor_ascii = $sensor[0];
	  $value = $sensor[1];
	  $sensorName[$index] = $sensor_ascii;
	  $sensorValue[$index] = $value;
  }
	$instruccion = "insert into ".$TABLE." (ID, BAT, CO2, NO2, O3) VALUES ('".$id_secret."','".$sensorValue[0]."','".$sensorValue[2]."','".$sensorValue[3]."','".$sensorValue[4]."');";
	$consulta = mysql_query ($instruccion, $conexion) or die ("Fallo de inserción en BBDD");
	$flag = 0;
	$date=date("d/m/Y H:i:s");
	$uri2 = "http://130.206.82.151:1026/ngsi10/updateContext";
	if ($Sensortype == "Gas"){
		$flag=1;
		$xml_data = '<?xml version="1.0" encoding="UTF-8"?>'.
				  				'<updateContextRequest>'.
												'<contextElementList>'.

													  '<contextElement>'.

														'<entityId type='."'SensorGas'".' isPattern='."'false'".'>'.

														  '<id>'.$Sensorname.'</id>'.

														'</entityId>'.

														'<contextAttributeList>'.

														  '<contextAttribute>'.

															'<name>'.$sensorName[0].'</name>'.

															'<type>%</type>'.

															'<contextValue>'.$sensorValue[0].'</contextValue>'.

														  '</contextAttribute>'.

														  '<contextAttribute>'.

															'<name>'.$sensorName[2].'</name>'.

															'<type>ppm</type>'.

															'<contextValue>'.$sensorValue[2].'</contextValue>'.

														  '</contextAttribute>'.
														
														  '<contextAttribute>'.

															'<name>'.$sensorName[3].'</name>'.

															'<type>%</type>'.

															'<contextValue>'.$sensorValue[3].'</contextValue>'.

														  '</contextAttribute>'.

														  '<contextAttribute>'.

															'<name>'.$sensorName[4].'</name>'.

															'<type>ppm</type>'.

															'<contextValue>'.$sensorValue[4].'</contextValue>'.

														  '</contextAttribute>'.

														  '<contextAttribute>'.

															'<name>'."date".'</name>'.

															'<type></type>'.

															'<contextValue>'.$date.'</contextValue>'.

														  '</contextAttribute>'.

														  '</contextAttributeList>'.

													  '</contextElement>'.

													'</contextElementList>'.

													'<updateAction>UPDATE</updateAction>'.

												  '</updateContextRequest>';
}
  if($flag==1){
	  $flag=0;
	  $ch1 = curl_init();
	  curl_setopt($ch1, CURLOPT_URL, $uri2);
	  curl_setopt($ch1, CURLOPT_HEADER, 1);
	  curl_setopt($ch1, CURLOPT_SSL_VERIFYPEER, 0);
	  curl_setopt($ch1, CURLOPT_SSL_VERIFYHOST, 0);
	  curl_setopt($ch1, CURLOPT_RETURNTRANSFER, 1);
	  curl_setopt($ch1, CURLOPT_CUSTOMREQUEST, 'POST');
	  curl_setopt($ch1, CURLOPT_POST, 1);
	  curl_setopt($ch1, CURLOPT_POSTFIELDS, $xml_data);
	  curl_setopt($ch1, CURLOPT_HTTPHEADER, array(
											 'Content-type: application/xml', 
											 'Content-length: ' . strlen($xml_data)
										   ));
	  $output = curl_exec($ch1);
	  curl_close($ch1);
	  echo "\n".$output;
	  } 

function hex2str($hex)
{
  for($i=0;$i<strlen($hex);$i+=2)
  {
    $str.=chr(hexdec(substr($hex,$i,2)));
  }
  return $str;
}
?>