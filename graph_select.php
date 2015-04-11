<?php
//CORS FIWARE Header - Allow cross-origin requests
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

//Connecting to MYSQL database
session_start();
$_SESSION['servidorMySql'] = "topdigital.dyndns.org"; 	
$_SESSION['dbMySql'] = "MeshliumDB"; 	
$_SESSION['usuarioMySql'] = "root"; 	
$_SESSION['passwordMySql'] = "libelium2007"; 	
$grafica = $_GET['grafica'];
$ID = $_GET['ID'];
$days = $_GET['days'];
$parametro = $_GET['parametro'];
$readings= $_GET['readings'];

$link = mysqli_connect($_SESSION['servidorMySql'], $_SESSION['usuarioMySql'], $_SESSION['passwordMySql'],$_SESSION['dbMySql']) or die ("No ha sido posible conectar con el servidor mysql."); 
mysqli_set_charset($link, "utf8");

//Last readings graph 
if($grafica == 1){
	$consulta="SELECT ".$parametro.",DATE FROM MeshliumDB.pfc WHERE ID =".$ID." ORDER BY NUM DESC LIMIT ".$readings."";
	  $myArray = array();
    if ($resultado=mysqli_query($link,$consulta))
	{
        $tempArray = array();
        while($row = mysqli_fetch_object($resultado)) {
                $tempArray = $row;
                array_push($myArray, $tempArray);
            }

        echo json_encode($myArray);
    }
}

//MaxMedMin graph
if ($_GET['grafica'] == 2){
	$columna = $_GET['valor'];
	$consulta="SELECT MIN(".$parametro.") as mini,AVG(".$parametro.") as medi,MAX(".$parametro.") as maxi, DATE from MeshliumDB.pfc where ID = ".$ID." group by DATE(`pfc`.`DATE`) ORDER BY NUM DESC LIMIT  ".$days."";
	 $myArray = array();
    if ($resultado=mysqli_query($link,$consulta))
	{
        $tempArray = array();
        while($row = mysqli_fetch_object($resultado)) {
                $tempArray = $row;
                array_push($myArray, $tempArray);
            }

        echo json_encode($myArray);
    }
}
if($grafica == 3){
	$consulta="SELECT MAX(".$parametro."),TIMESTAMP FROM pfc WHERE ID =".$ID."";
	$resultado=mysqli_query($link,$consulta) or die("No se puede ejecutar $consulta");	
	$grafica = array(json_encode($resultado[0]),json_encode($resultado[1]));
	echo json_encode($grafica);
}

mysqli_close($link);
	/*$meses=array('Meses','Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre');
	$i = 0;
	$consuta_registro="SELECT fecha_alta, count(*) as totalFechas, MONTH(fecha_alta) as mes FROM usuarios WHERE YEAR(fecha_alta) = '".date('Y')."' GROUP BY MONTH(fecha_alta)";
	$registros_registro=mysqli_query($link,$consuta_registro) or die("no se puede ejecutar $consuta_registro");
	while($fila_registro=mysqli_fetch_array($registros_registro)){
		$meses_extra[$i] .= $meses[$fila_registro['mes']];
		$data_extra[$i] .= $fila_registro['totalFechas'];		
		$i++;
	}

	$consuta_registro="SELECT date, count(DISTINCT imei) as totalImei, MONTH(date) as mes FROM sensors_measures WHERE YEAR(date) = '".date('Y')."' GROUP BY MONTH(date)";
	$registros_registro=mysqli_query($link,$consuta_registro) or die("no se puede ejecutar $consuta_registro");
	while($fila_registro=mysqli_fetch_array($registros_registro)){
		$meses_extra_dos[$i] .= $meses[$fila_registro['mes']];
		$data_dos[$i] .= $fila_registro['totalImei'];	
		//echo $meses_extra_dos[$i]." - ".$data_extra_dos[$i]." - ".$fila_registro['imei']."<br />";
		$i++;
		
	}

	$d=0;
	$mes_actual = date('m');
	for($a=1;$a<count($meses);$a++){
		if ($a <= $mes_actual){
			if (in_array($meses[$a],$meses_extra)){
				$layer[$a] .= $meses_extra[$d];
				$data[$a] .= $data_extra[$d]+$data[$a-1];		
				$d++;
			}else{
				$layer[$a] .= $meses[$a];
				$data[$a] .= 0+$data[$a-1];		
			}
			//echo $layer[$a]." - ".$data[$a]."<br />";
		}
	}
	
	//var_dump($layer);
	$grafica = array(json_encode($layer),json_encode($data),json_encode($data_dos));
	echo json_encode($grafica);

if ($_GET['grafica'] == 2){
	
	$i = 0;
	$consuta_registro="SELECT fecha_alta, count(*) as totalFechas FROM usuarios GROUP BY fecha_alta  ORDER BY fecha_alta DESC";
	$registros_registro=mysqli_query($link,$consuta_registro) or die("no se puede ejecutar $consuta_registro");
	while($fila_registro=mysqli_fetch_array($registros_registro)){
		$dias_extra[$i] .= $fila_registro['fecha_alta'];
		$totalFechas_extra[$i] .= $fila_registro['totalFechas'];
		//echo $dias_extra[$i] ." (". $totalFechas_extra[$i].") <br />";
		$i++;
	}
		
	$d=0;
	for($a=0;$a<14;$a++){
		
		$dia = time()-($a*24*60*60); 
		$dia_fin = date('Y-m-d', $dia);
		$dia_comp = $dia_fin;
		
		if (in_array($dia_comp,$dias_extra)){
			$fia = explode("-",$dias_extra[$d]);
			$fecha_insert = $fia[2]."/".$fia[1]."/".$fia[0];
			$layer[14-$a] .= $fecha_insert;
			$data[$a] .= $totalFechas_extra[$d];		
			$d++;
		}else{
			$fia = explode("-",$dia_comp);
			$fecha_insert = $fia[2]."/".$fia[1]."/".$fia[0];
			$layer[14-$a] .= $fecha_insert;
			$data[$a] .= 0;		
		}
		//echo $layer[$a]." - ".$data[$a]."<br />";
	}
		
	//var_dump($layer);
	$grafica = array(json_encode($layer),json_encode($data));
	echo json_encode($grafica);
	
}*/

?>