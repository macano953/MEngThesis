(function () {

    "use strict";

    var icon;
    var flag = 0;
    var basura = 0;
    var fire = 0;
    
    MashupPlatform.wiring.registerCallback("entityInput", function (entityString) {
        var entity = JSON.parse(entityString);
        var coordinates = null;
        
	var coordinates_attr = MashupPlatform.prefs.get('coordinates_attr');
	var parts = coordinates_attr.split(new RegExp(',\\s*'));
	var latitude = entity[parts[0]];
	var longitude = entity[parts[1]];
	coordinates = {
			system: "WGS84",
			lat: parseFloat(latitude),
			lng: parseFloat(longitude)
		};
        if (coordinates) {
            MashupPlatform.wiring.pushEvent("poiOutput", JSON.stringify(entity2poi(entity, coordinates)));
        }
    });

    var entity2poi = function entity2poi(entity, coordinates) {
		
		if (entity.type=="dispositivo"){
			icon = "https://topdigital.dyndns.org/Malaga_CitySense_Temporal/imgs/poi1.png";
		}
		if (entity.type=="mac"){
			icon = "https://topdigital.dyndns.org/Malaga_CitySense_Temporal/imgs/poi2.png";
		}
		if (entity.type=="Tráfico"){
			icon = "https://topdigital.dyndns.org/Malaga_CitySense_Temporal/imgs/poi4.png";
		}
		if (entity.type=="Ocio"){
			icon = "https://topdigital.dyndns.org/Malaga_CitySense_Temporal/imgs/poi3.png";
		}		
        if (entity.type=="SensorGas"){
            for (var attr in entity){
                if(attr=="BAT"){
                    if(entity[attr]>=20){
                        icon = 'http://213.0.7.235/malaga_city_sense/imgs/sensorgas.png';
                    }else{
						icon = 'http://213.0.7.235/malaga_city_sense/imgs/sensorgasbatt.png';
					}
                }
            }
        }
		if (entity.type=="Trash Sensor"){
			flag=0;
			fire=0;
			for (var attr in entity){
				if(attr =="ST"){
					if(entity[attr]<=300) fire=1;
				}   
				if(attr =="BAT"){
					if(entity[attr]>=20) flag = 1;
				}
				if(attr=="US" && entity[attr]<=30) basura=0; else if(attr=="US" && entity[attr]<=55) basura=1; else if(attr=="US" && entity[attr]>55) basura=2;         
			 }
			if(flag==1){
				if(basura == 0) icon = 'http://213.0.7.235/malaga_city_sense/imgs/trashr.png'; else if(basura == 1) icon = 'http://213.0.7.235/malaga_city_sense/imgs/trasho.png'; else icon = 'http://213.0.7.235/malaga_city_sense/imgs/trashg.png';  
			}else{     
				if(basura == 0) icon = 'http://213.0.7.235/malaga_city_sense/imgs/trashrbatt.png'; else if(basura == 1) icon = 'http://213.0.7.235/malaga_city_sense/imgs/trashobatt.png'; else icon = 'http://213.0.7.235/malaga_city_sense/imgs/trashgbatt.png';
			}
			if(fire==1) icon = 'http://213.0.7.235/malaga_city_sense/imgs/trashrfire.png';
		} 
		    var poi = {
            id: entity.id,
            icon: icon,
            tooltip: entity.id,
            data: entity,
            infoWindow: buildInfoWindow.call(this, entity),
            currentLocation: coordinates
        };
		
        return poi;
    };

    var internalUrl = function internalUrl(data) {
        var url = document.createElement("a");
        url.setAttribute('href', data);
        return url.href;
    };

    var buildInfoWindow = function buildInfoWindow(entity) {
        var infoWindow = "<div>";
        for (var attr in entity) {
            infoWindow += '<span style="font-size:12px;"><b>' + attr + ": </b> " + entity[attr] +  "</span><br />";
        }
        infoWindow += "</div>";

        return infoWindow;
    };

    icon = internalUrl('images/icon.png');    
})();
