(function () {
 
    "use strict";
    var alarm = 0,
    	address,
    	phone_number = MashupPlatform.prefs.get('phone_number'),
		parameter = MashupPlatform.prefs.get('parameter'),
		operator = MashupPlatform.prefs.get('operator'),
		value = MashupPlatform.prefs.get('value'),
		email = MashupPlatform.prefs.get('email'),
		notification = MashupPlatform.prefs.get('notification'); 

    MashupPlatform.wiring.registerCallback("entityInput", function (entityString) {
		alarm = 0;
        var entity = JSON.parse(entityString);          
        for (var attr in entity){
			if(operator=='>' || operator=='>='){
            	if(attr == parameter && entity[attr]>=value)
            		alarm = 1;
				if(attr == "address"){
					address = entity[attr];
				}
			}
			else if(operator== '='){
            	if(attr == parameter && entity[attr]==value)
            		alarm = 1;
				if(attr == "address"){
					address = entity[attr];
				}
			}
			else if(operator=='!='){
            	if(attr == parameter && entity[attr]!=value)
            		alarm = 1;
				if(attr == "address"){
					address = entity[attr];
				}
			}
			else if(operator=='<' || operator=='<='){
            	if(attr == parameter && entity[attr]<=value)
            		alarm = 1;
				if(attr == "address"){
					address = entity[attr];
				}
			}		
        }			
		if(alarm == 1 && typeof(address)!="undefined"){
			sendAjax(address, phone_number, parameter, operator, value, email, notification);
			MashupPlatform.widget.log("Notificación enviada",MashupPlatform.log.INFO);
			address = undefined;
		}
    });
	
    function sendAjax(address, phone_number, parameter, operator, value, email, notification){
        $.ajax({async:true, 
                type:"POST", 
                url: "http://topdigitalsensors2.hol.es/php/sms.php", 
                data: {address: address, phone_number: phone_number,  parameter: parameter, operator: operator, value: value, email: email, notification: notification}, 
                success: function sent(data){
					document.getElementById("info").style.display = "none";
					var delay=5000;
					if(data.indexOf("email_success") != -1){
						document.getElementById("email_success").style.display = "block";
						setTimeout(function(){
						$( "#email_success" ).fadeOut( "slow", function() {
							document.getElementById("info").style.display = "block";
						  });
						},delay);
					}
					else if(data.indexOf("email_failure") != -1){
						document.getElementById("email_failure").style.display = "block";
						setTimeout(function(){
						$( "#email_failure" ).fadeOut( "slow", function() {
							document.getElementById("info").style.display = "block";
						  });							
						},delay);
					}
					else if(data.indexOf("sms_success") != -1){
						document.getElementById("sms_success").style.display = "block";
						setTimeout(function(){
						$( "#sms_success" ).fadeOut( "slow", function() {
							document.getElementById("info").style.display = "block";
						  });							
						},delay);
						  
					}    
				}});
        return false;
    }
})();
    