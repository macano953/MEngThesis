/*
 *     Copyright (c) 2013-2014 CoNWeT Lab., Universidad Politécnica de Madrid
 *
 *     This file is part of the observation2poi operator.
 *
 *     observation2poi is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published
 *     by the Free Software Foundation, either version 3 of the License, or (at
 *     your option) any later version.
 *
 *     observation2poi is distributed in the hope that it will be useful, but
 *     WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero
 *     General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with observation2poi. If not, see <http://www.gnu.org/licenses/>.
 *
 *     Linking this library statically or dynamically with other modules is
 *     making a combined work based on this library.  Thus, the terms and
 *     conditions of the GNU Affero General Public License cover the whole
 *     combination.
 *
 *     As a special exception, the copyright holders of this library give you
 *     permission to link this library with independent modules to produce an
 *     executable, regardless of the license terms of these independent
 *     modules, and to copy and distribute the resulting executable under
 *     terms of your choice, provided that you also meet, for each linked
 *     independent module, the terms and conditions of the license of that
 *     module.  An independent module is a module which is not derived from
 *     or based on this library.  If you modify this library, you may extend
 *     this exception to your version of the library, but you are not
 *     obligated to do so.  If you do not wish to do so, delete this
 *     exception statement from your version.
 *
 */

/*global MashupPlatform*/

(function () {

    "use strict";

    var icon;
    var flag = 0;
    var basura = 0;
    var fire = 0;
    
    MashupPlatform.wiring.registerCallback("entityInput", function (entityString) {
        var entity = JSON.parse(entityString);
        var coordinates = null;
/*

        var coordinates_attr = MashupPlatform.prefs.get('coordinates_attr');
        if (entity[coordinates_attr]) {
            var parts = entity[coordinates_attr].split(new RegExp(',\\s*'));
            if (parts.length === 2) {
                coordinates = {
                    system: "WGS84",
                    lat: parseFloat(parts[0]),
                    lng: parseFloat(parts[1])
                };
            }
        }
	*/	
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
