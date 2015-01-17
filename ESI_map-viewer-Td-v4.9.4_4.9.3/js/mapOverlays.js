/*jshint browser:true*/
/*global google Poi*/

(function() {

    "use strict";

/******************************************************************************/
/********************************* PUBLIC *************************************/
/******************************************************************************/

    var MapOverlay = function MapOverlay(map, markerClusterer, poi, radius) {

        if (!map || !poi || !radius) {
            throw new TypeError("Map, poi and radius parameters are required.");
        }

        this.map = map;
        this.poi = poi;
        this.markerClusterer = markerClusterer;
        this.overlaysDisplayed = false;

        this.circle = {};
        this.infoWindow = {};
        
        this.radius = radius;
		
		/*CONTENIDOS DEL GLOBO*/
		
		var contenido_g = this.poi.getInfoWindow();
		var contenido_poi = contenido_g.split('<span style="font-size:12px;">');
		var cadena_poi = "";
		var split_contenido = "";
		var tipo_cuerpo = "";	
		var contenidos_limpios = new Array(contenido_poi.length);
			
		for (var i = 0; i < contenido_poi.length; i++){
			if (contenido_poi[i].indexOf("type:")!=-1){
				if (contenido_poi[i].indexOf("Trash")!=-1){
					tipo_cuerpo = 4;
				}else if (contenido_poi[i].indexOf("SensorGas")!=-1){
					tipo_cuerpo = 5;
				}else{
					tipo_cuerpo = 1;
				}
			}
		}
		
		for (var i = 0; i < contenido_poi.length; i++){
			split_contenido = contenido_poi[i].substring(contenido_poi[i].indexOf("</b>")+4,contenido_poi[i].indexOf("</span>"));
			contenidos_limpios[i] = split_contenido;
		}
		if(tipo_cuerpo == 4) {
			for (var i = 0; i < contenido_poi.length; i++){
				cadena_poi += "<div style='display:none;'>"+i+" - "+contenido_poi[i]+"</div>";
			}
			
			var basura = "";
			
			if(contenidos_limpios[5]<=30) basura=3; else if(contenidos_limpios[5]<=55) basura=2; else if(contenidos_limpios[5]>55) basura=1;         
			
			cadena_poi += "<table width='300' height='150' border='0' cellpadding='0' cellspacing='5' style='font-size:12px; font-family:'Trebuchet MS', Arial, Helvetica, sans-serif;'><tr><td width='140' rowspan='2'><img src='http://213.0.7.235/malaga_city_sense/imgs/trashsensor_icon.png' width='135' height='140' /></td><td width='145' valign='top'><p style='color:#333; font-size:14px; font-weight:100; font-family:'trebuchet='Trebuchet' ms='MS'', Arial, helvetica,='Helvetica,' sans-serif;='sans-serif;''>"+contenidos_limpios[2]+"</p>  <p><strong>Batería</strong>: "+contenidos_limpios[3]+"%<br />  <strong>Espacio Cont.</strong>: "+contenidos_limpios[5]+"cm<br /><img src='http://213.0.7.235/malaga_city_sense/imgs/basurax"+basura+".png' width='30' height='30' /><br />    <strong>Ult. Lectura: </strong>"+contenidos_limpios[8]+"</p></td></tr><tr><td align='right' valign='top'><span style='color:#b4b4b4; font-size:10px;'>"+contenidos_limpios[9]+"</span><br /><span style='color:#b4b4b4; font-size:10px;'>"+contenidos_limpios[6]+", "+contenidos_limpios[7]+"</span></td></tr></table>";
		}else if(tipo_cuerpo == 5) {
			for (var i = 0; i < contenido_poi.length; i++){
				cadena_poi += "<div style='display:none;'>"+i+" - "+contenido_poi[i]+"</div>";
			}
			cadena_poi += "<table width='300' height='210' border='0' cellpadding='0' cellspacing='5' style='font-size:12px; font-family:'Trebuchet MS', Arial, Helvetica, sans-serif;'><tr>  <td width='140' rowspan='2'><img src='http://213.0.7.235/malaga_city_sense/imgs/sensorgas_icon.png' width='135' height='200' /></td>  <td width='145' valign='top'>  <p style='color:#333; font-size:15px; font-weight:100; font-family:'Trebuchet MS', Arial, Helvetica, sans-serif;'>"+contenidos_limpios[2]+"</p>  <p><strong>Batería</strong>: "+contenidos_limpios[3]+"%<br /><strong>CO2</strong>:  "+contenidos_limpios[4]+" ppm <br />  <strong>NO2</strong>: "+contenidos_limpios[5]+" ppm<br />  <strong>O3</strong>: "+contenidos_limpios[6]+" ppm<br><strong>Ult. Lectura: </strong>"+contenidos_limpios[9]+" </p></td></tr><tr>  <td align='right' valign='top'><span style='color:#B3B3B3; font-size:11px;'>"+contenidos_limpios[7]+", "+contenidos_limpios[8]+"</span><br /><span style='color:#B3B3B3; font-size:11px;'>"+contenidos_limpios[10]+"</span></td></tr></table>";
		}

        this.contentInfoWindow = cadena_poi;
        //this.contentInfoWindow = this.poi.getInfoWindow();

		/*CONTENIDOS DEL GLOBO*/
		
        this.position = this.poi.getDecimalCoords();
		
        this.icon = this.poi.getIcon();
        this.tooltip = this.poi.getTooltip();

        createElements.call(this);
        if (this.markerClusterer) {
            this.markerClusterer.addMarker(this.marker);
        }
        this.marker.setMap(this.map);
    };

    MapOverlay.prototype.updateRadius = function updateRadius (radius) {
        this.radius = radius;
        updateCircle.call(this);
    };

    MapOverlay.prototype.updatePoi = function updatePoi (poi) {
        this.poi = poi;

        this.contentInfoWindow = this.poi.getInfoWindow();
        this.position = this.poi.getDecimalCoords();
        this.icon = this.poi.getIcon();
        this.tooltip = this.poi.getTooltip();

        updateCircle.call(this);
		
		/*CONTENIDOS DEL GLOBO*/
		
		var contenido_g = this.poi.getInfoWindow();
		var contenido_poi = contenido_g.split('<span style="font-size:12px;">');
		var cadena_poi = "";
		var split_contenido = "";
		var tipo_cuerpo = "";	
		var contenidos_limpios = new Array(contenido_poi.length);
			
		for (var i = 0; i < contenido_poi.length; i++){
			if (contenido_poi[i].indexOf("type:")!=-1){
				 if (contenido_poi[i].indexOf("Trash")!=-1){
					tipo_cuerpo = 4;
				}else if (contenido_poi[i].indexOf("SensorGas")!=-1){
					tipo_cuerpo = 5;
				}else{
					tipo_cuerpo = 1;
				}
			}
		}
		
		for (var i = 0; i < contenido_poi.length; i++){
			split_contenido = contenido_poi[i].substring(contenido_poi[i].indexOf("</b>")+4,contenido_poi[i].indexOf("</span>"));
			contenidos_limpios[i] = split_contenido;
		}
		
		if(tipo_cuerpo == 4) {
			for (var i = 0; i < contenido_poi.length; i++){
				cadena_poi += "<div style='display:none;'>"+i+" - "+contenido_poi[i]+"</div>";
			}
			var basura = "";
			
			if(contenidos_limpios[5]<=30) basura=3; else if(contenidos_limpios[5]<=55) basura=2; else if(contenidos_limpios[5]>55) basura=1;         
			
			cadena_poi += "<table width='300' height='150' border='0' cellpadding='0' cellspacing='5' style='font-size:12px; font-family:'Trebuchet MS', Arial, Helvetica, sans-serif;'><tr><td width='140' rowspan='2'><img src='http://213.0.7.235/malaga_city_sense/imgs/trashsensor_icon.png' width='135' height='140' /></td><td width='145' valign='top'><p style='color:#333; font-size:14px; font-weight:100; font-family:'trebuchet='Trebuchet' ms='MS'', Arial, helvetica,='Helvetica,' sans-serif;='sans-serif;''>"+contenidos_limpios[2]+"</p>  <p><strong>Batería</strong>: "+contenidos_limpios[3]+"%<br />  <strong>Espacio Cont.</strong>: "+contenidos_limpios[5]+"cm<br /><img src='http://213.0.7.235/malaga_city_sense/imgs/basurax"+basura+".png' width='30' height='30' /><br />    <strong>Ult. Lectura: </strong>"+contenidos_limpios[8]+"</p></td></tr><tr><td align='right' valign='top'><span style='color:#b4b4b4; font-size:10px;'>"+contenidos_limpios[9]+"</span><br /><span style='color:#b4b4b4; font-size:10px;'>"+contenidos_limpios[6]+", "+contenidos_limpios[7]+"</span></td></tr></table>";
		}else if(tipo_cuerpo == 5) {
			for (var i = 0; i < contenido_poi.length; i++){
				cadena_poi += "<div style='display:none;'>"+i+" - "+contenido_poi[i]+"</div>";
			}
			cadena_poi += "<table width='300' height='210' border='0' cellpadding='0' cellspacing='5' style='font-size:12px; font-family:'Trebuchet MS', Arial, Helvetica, sans-serif;'><tr>  <td width='140' rowspan='2'><img src='http://213.0.7.235/malaga_city_sense/imgs/sensorgas_icon.png' width='135' height='200' /></td>  <td width='145' valign='top'>  <p style='color:#333; font-size:15px; font-weight:100; font-family:'Trebuchet MS', Arial, Helvetica, sans-serif;'>"+contenidos_limpios[2]+"</p>  <p><strong>Batería</strong>: "+contenidos_limpios[3]+"%<br /><strong>CO2</strong>:  "+contenidos_limpios[4]+" ppm <br />  <strong>NO2</strong>: "+contenidos_limpios[5]+" ppm<br />  <strong>O3</strong>: "+contenidos_limpios[6]+" ppm<br><strong>Ult. Lectura: </strong>"+contenidos_limpios[9]+" </p></td></tr><tr>  <td align='right' valign='top'><span style='color:#B3B3B3; font-size:11px;'>"+contenidos_limpios[7]+", "+contenidos_limpios[8]+"</span><br /><span style='color:#B3B3B3; font-size:11px;'>"+contenidos_limpios[10]+"</span></td></tr></table>";
		}
        this.contentInfoWindow = cadena_poi;
        //this.contentInfoWindow = this.poi.getInfoWindow();

		/*CONTENIDOS DEL GLOBO*/

        this.icon = this.poi.getIcon();
        updateInfoWindow.call(this);
        updateMarker.call(this);
    };

    MapOverlay.prototype.setMarkerHandler = function setMarkerHandler (handler) {
        google.maps.event.clearInstanceListeners(this.marker);
        google.maps.event.addListener(this.marker, "click", handler);
    };

    MapOverlay.prototype.showOverlays = function showOverlays () {
        this.circle.setMap(this.map);
        this.infoWindow.open(this.map, this.marker);
        this.overlaysDisplayed = true;
    };

    MapOverlay.prototype.hideOverlays = function hideOverlays () {
        this.circle.setMap(null);
        this.infoWindow.close();
        this.overlaysDisplayed = false;
    };

    MapOverlay.prototype.destroy = function destroy () {
        this.hideOverlays();
        if (this.markerClusterer) {
            this.markerClusterer.removeMarker(this.marker);
        }
        this.marker.setMap(null);
        
    };

    MapOverlay.prototype.getPosition = function getPosition () {
        return this.position;
    };

/******************************************************************************/
/********************************* PRIVATE ************************************/
/******************************************************************************/


/*********************************** Add **************************************/

    var createElements = function createElements () {
        var googlePosition = new google.maps.LatLng(this.position.lat, this.position.lng);
        var options = {
            "circle": { // el círculo rojo
                strokeColor: "#FF0000",
                strokeOpacity: 0.8,
                radius: this.radius,
                center: googlePosition,
                strokeWeight: 2,
                fillColor: "#FF0000",
                fillOpacity: 0.10
            },
            "infoWindow": {
                content: this.contentInfoWindow,
                //position: googlePosition
            },
            "marker": {
                map: this.map,
                //animation: google.maps.Animation.DROP,
                position: googlePosition,
                title: this.tooltip,
                visible: true
            }
        };

        if (this.icon) {
            var iconSize = new google.maps.Size(30, 40);
			
			this.icon = this.poi.getIcon();			
            var markerImage = new google.maps.MarkerImage(this.icon, null, null, null, iconSize);
            options.marker.icon = markerImage;
        }

        for (var option in options) {
            createElement.call(this, option, options[option]);
        }
    };

    var createElement = function createElement (item, options) {
        var constructor = {
            "circle": "Circle",
            "infoWindow": "InfoWindow",
            "marker": "Marker"
        };

        this[item] = new google.maps[constructor[item]](options);
    };

/****************************** Update ***********************************/

    var updateCircle = function updateCircle () {
        var googlePosition = new google.maps.LatLng(this.position.lat, this.position.lng);
        this.circle.setRadius(this.radius);
        this.circle.setCenter(googlePosition);
    };

    var updateInfoWindow = function updateInfoWindow () {
        var googlePosition = new google.maps.LatLng(this.position.lat, this.position.lng);
        this.infoWindow.setContent(this.contentInfoWindow);
        this.infoWindow.setPosition(googlePosition);
    };

    var updateMarker = function updateMarker () {
        var googlePosition = new google.maps.LatLng(this.position.lat, this.position.lng);
        this.marker.setMap(null);
        this.marker.setAnimation(null);
        this.marker.setPosition(googlePosition);
        this.marker.setIcon(this.icon);
        this.marker.setMap(this.map);
    };

/****************************** Delete ***********************************/

    var deleteCircle = function deleteCircle (circle) {
        this.circle.setMap(null);
        this.circle = null;
    };

    var deleteInfoWindow = function deleteInfoWindow (infoWindow) {
        this.infoWindow.close();
        this.infoWindow = null;
    };

    var deleteMarker = function deleteMarker (marker) {
        this.marker.setMap(null);
        this.marker = null;
    };

/******************************** Others *************************************/

    // add MapOverlay to window:
    window.MapOverlay = MapOverlay;

 })();
