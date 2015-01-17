(function () {
	
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	Date.shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    Date.longMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    Date.shortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    Date.longDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // defining patterns
    var replaceChars = {
        // Day
        d: function() { return (this.getDate() < 10 ? '0' : '') + this.getDate(); },
        D: function() { return Date.shortDays[this.getDay()]; },
        j: function() { return this.getDate(); },
        l: function() { return Date.longDays[this.getDay()]; },
        N: function() { return (this.getDay() == 0 ? 7 : this.getDay()); },
        S: function() { return (this.getDate() % 10 == 1 && this.getDate() != 11 ? 'st' : (this.getDate() % 10 == 2 && this.getDate() != 12 ? 'nd' : (this.getDate() % 10 == 3 && this.getDate() != 13 ? 'rd' : 'th'))); },
        w: function() { return this.getDay(); },
        z: function() { var d = new Date(this.getFullYear(),0,1); return Math.ceil((this - d) / 86400000); }, // Fixed now
        // Week
        W: function() { 
            var target = new Date(this.valueOf());
            var dayNr = (this.getDay() + 6) % 7;
            target.setDate(target.getDate() - dayNr + 3);
            var firstThursday = target.valueOf();
            target.setMonth(0, 1);
            if (target.getDay() !== 4) {
                target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
            }
            return 1 + Math.ceil((firstThursday - target) / 604800000);
        },
        // Month
        F: function() { return Date.longMonths[this.getMonth()]; },
        m: function() { return (this.getMonth() < 9 ? '0' : '') + (this.getMonth() + 1); },
        M: function() { return Date.shortMonths[this.getMonth()]; },
        n: function() { return this.getMonth() + 1; },
        t: function() { var d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 0).getDate() }, // Fixed now, gets #days of date
        // Year
        L: function() { var year = this.getFullYear(); return (year % 400 == 0 || (year % 100 != 0 && year % 4 == 0)); },   // Fixed now
        o: function() { var d  = new Date(this.valueOf());  d.setDate(d.getDate() - ((this.getDay() + 6) % 7) + 3); return d.getFullYear();}, //Fixed now
        Y: function() { return this.getFullYear(); },
        y: function() { return ('' + this.getFullYear()).substr(2); },
        // Time
        a: function() { return this.getHours() < 12 ? 'am' : 'pm'; },
        A: function() { return this.getHours() < 12 ? 'AM' : 'PM'; },
        B: function() { return Math.floor((((this.getUTCHours() + 1) % 24) + this.getUTCMinutes() / 60 + this.getUTCSeconds() / 3600) * 1000 / 24); }, // Fixed now
        g: function() { return this.getHours() % 12 || 12; },
        G: function() { return this.getHours(); },
        h: function() { return ((this.getHours() % 12 || 12) < 10 ? '0' : '') + (this.getHours() % 12 || 12); },
        H: function() { return (this.getHours() < 10 ? '0' : '') + this.getHours(); },
        i: function() { return (this.getMinutes() < 10 ? '0' : '') + this.getMinutes(); },
        s: function() { return (this.getSeconds() < 10 ? '0' : '') + this.getSeconds(); },
        u: function() { var m = this.getMilliseconds(); return (m < 10 ? '00' : (m < 100 ?
    '0' : '')) + m; },
        // Timezone
        e: function() { return "Not Yet Supported"; },
        I: function() {
            var DST = null;
                for (var i = 0; i < 12; ++i) {
                        var d = new Date(this.getFullYear(), i, 1);
                        var offset = d.getTimezoneOffset();
    
                        if (DST === null) DST = offset;
                        else if (offset < DST) { DST = offset; break; }                     else if (offset > DST) break;
                }
                return (this.getTimezoneOffset() == DST) | 0;
            },
        O: function() { return (-this.getTimezoneOffset() < 0 ? '-' : '+') + (Math.abs(this.getTimezoneOffset() / 60) < 10 ? '0' : '') + (Math.abs(this.getTimezoneOffset() / 60)) + '00'; },
        P: function() { return (-this.getTimezoneOffset() < 0 ? '-' : '+') + (Math.abs(this.getTimezoneOffset() / 60) < 10 ? '0' : '') + (Math.abs(this.getTimezoneOffset() / 60)) + ':00'; }, // Fixed now
        T: function() { return this.toTimeString().replace(/^.+ \(?([^\)]+)\)?$/, '$1'); },
        Z: function() { return -this.getTimezoneOffset() * 60; },
        // Full Date/Time
        c: function() { return this.format("Y-m-d\\TH:i:sP"); }, // Fixed now
        r: function() { return this.toString(); },
        U: function() { return this.getTime() / 1000; }
    };

    // Simulates PHP's date function
    Date.prototype.format = function(format) {
        var date = this;
        return format.replace(/(\\?)(.)/g, function(_, esc, chr) {
            return (esc === '' && replaceChars[chr]) ? replaceChars[chr].call(date) : chr;
        });
    };

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	function grafica(columna1, columna2, columna3, columna4, color1, color2, color3) {
			
		var barChartData = {
			labels : columna4,
			datasets : [
				{	label: "Minimo",
					fillColor : "rgba("+color1+",0.5)",
					strokeColor : "rgba("+color1+",0.8)",
					highlightFill: "rgba("+color1+",0.75)",
					highlightStroke: "rgba("+color1+",1)",
					data : columna1
				},
				{	label: "Medio",
					fillColor : "rgba("+color2+",0.5)",
					strokeColor : "rgba("+color2+",0.8)",
					highlightFill: "rgba("+color2+",0.75)",
					highlightStroke: "rgba("+color2+",1)",
					data : columna2
				},
				{	label: "Maximo",
					fillColor : "rgba("+color3+",0.5)",
					strokeColor : "rgba("+color3+",0.8)",
					highlightFill: "rgba("+color3+",0.75)",
					highlightStroke: "rgba("+color3+",1)",
					data : columna3
				}
				
			]
	
		}
		var ctx = document.getElementById("canvas").getContext("2d");
		window.myBar = new Chart(ctx).Bar(barChartData, {
			responsive : true
		});
	}

	window.init = function init() {

		var titulo = MashupPlatform.prefs.get('NameOfGraph');
		var parametro = MashupPlatform.prefs.get('Parameter');
		var days = MashupPlatform.prefs.get('days');
		var color = MashupPlatform.prefs.get('Color-min');
		var color2 = MashupPlatform.prefs.get('Color-med');
		var color3 = MashupPlatform.prefs.get('Color-max');
		var ID = MashupPlatform.prefs.get('ID');
		
		document.getElementById('titulo').innerHTML='<h4>'+titulo+'</h4>';
		MashupPlatform.wiring.registerCallback("entityInput", function (entityString) {
			var entity = JSON.parse(entityString);
			if(entity.id == ID){
				$.ajax({
					async:true, 
					type:"GET", 
					url: 'http://*******.es/carpeta/graph_select.php?grafica=2&ID='+ID+'&parametro='+parametro+'&days='+days, 
					success: function (datos){
							var columna1=[];
							var columna2=[];
							var columna3=[];
							var columna4=[];
							$.each(datos, function(index, element) {
								columna1.push(element.mini);
								columna2.push(element.medi);
								columna3.push(element.maxi);
								var t = (element.DATE).split(/[- :]/);
								// Apply each element to the Date function
								var d = new Date(t[0], t[1]-1, t[2], t[3], t[4]).format('d-m-y');
								columna4.push(d);
					 });
							grafica(columna1.reverse(),columna2.reverse(), columna3.reverse(), columna4.reverse(), color, color2, color3);
					},
					dataType:"json"
				});
			}
		});
	}
})();
