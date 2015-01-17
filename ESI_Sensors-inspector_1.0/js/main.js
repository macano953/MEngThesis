
/*
 *     Created by Miguel Angel Caño.
 *
 *     Licensed under the Apache License, Version 2.0 (the "License");
 *     you may not use this file except in compliance with the License.
 *     You may obtain a copy of the License at
 *
 *          http://www.apache.org/licenses/LICENSE-2.0
 *
 *     Unless required by applicable law or agreed to in writing, software
 *     distributed under the License is distributed on an "AS IS" BASIS,
 *     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *     See the License for the specific language governing permissions and
 *     limitations under the License.
 *
 */
(function(){
	//Global variables
	var container_gas, 
	container_trash;
	
	var table_gas,
	table_trash;
	
	var handler_gas=0, 
	handler_trash=0;
	
    var notebook = new StyledElements.StyledNotebook();
	
    var loadContainers = function loadContainers() {
		//Creating containers; initialization of tables
        container_gas = notebook.createTab({name: 'Sensores de Polución', closable: false});
		container_trash = notebook.createTab({name: 'Volumétricos', closable: false});

		init_table(table_gas, 'table_gas', container_gas);
		init_table(table_trash, 'table_trash', container_trash);

		createLogo(container_gas);		
		createLogo(container_trash);	
	};
		
	//Extracting information from NGSI Source and creating the dynamic page
	MashupPlatform.wiring.registerCallback("entityInput", function (entityString) {
		var entity;
		entity = JSON.parse(entityString);
		if (entity.type=="SensorGas"){
			handler_gas = tableCreate(entity, document.getElementById("table_gas"), handler_gas);	
		}			
		else if (entity.type=="Trash Sensor"){
			handler_trash = tableCreate(entity, document.getElementById("table_trash"), handler_trash);						
		}
	});		
	
	function init_table(table, string, container){
		table = document.createElement('table');
        table.id = string;
		table.style.display='block';	
		table.className='table';
		container.appendChild(table);
	}
	
	function tableCreate(entity, div, handler){
		var td, tr, tr2, parameters={};
		div.style.borderStyle = "1px solid #DFDFDF";
		if(handler==0){
			//First row in the table: information header
				tr = div.insertRow();	
				for (var i in entity){		
					td = tr.insertCell();
					td.style.borderBottom = "1px solid #DFDFDF";
					td.style.fontWeight="bold";
					parameters[i]=i;
					td.appendChild(document.createTextNode(parameters[i]));
				}
				handler=1;
			}
		tr2 = document.getElementById("tr"+entity.id);
		if(tr2===null){
			tr2 = div.insertRow();	
			tr2.id = "tr"+entity.id;
		for(var attr in entity){
			td = tr2.insertCell();
			td.style.borderBottom = "1px solid #DFDFDF";
			td.appendChild(document.createTextNode(entity[attr]));
			tr2.appendChild(td);
			}
		}
		else{			
			//Delete information inside the table and append the new one
			tr2.innerHTML= "";
			for(var attr in entity){
				td = tr2.insertCell();
				td.appendChild(document.createTextNode(entity[attr]));
				tr2.appendChild(td);
			}
		}
		return handler;
	}
		
	function createLogo(container) {
		var iDiv = document.createElement('div');
		iDiv.id = 'copyright';
		iDiv.style.textAlign="center"; 
		iDiv.style.maxHeight ="50%"; 
		iDiv.style.maxWidth="50%";
		iDiv.style.display= "block";
		iDiv.style.margin="auto";
		iDiv.style.fontFamily= "Open Sans";
		var text = "© Powered by Miguel Ángel Caño. Only for academic purposes.";
		var text2 = document.createTextNode(text);	
		var image =  "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcRsEGmTjbSmaYJzwTOHJ4fwUylvUwti48SGXC-sYkx5-8dwYq-I";
		var element = document.createElement("img");
		element.style.maxHeight ="12%"; 
		element.style.maxWidth="12%";
		element.style.display="block";	
		element.style.margin ="auto"; 	
		element.style.paddingBottom ="20px"; 
		element.setAttribute("src",image);
		iDiv.appendChild(element);		
		iDiv.appendChild(text2);
		container.appendChild(iDiv);
	}
	
	MashupPlatform.widget.context.registerCallback(function (new_values) {
		var attr;
		for (attr in new_values) {
			entity[attr].update(new_values[attr]);
		}
		if ('heightInPixels' in new_values) {
			notebook.repaint();
		}
	});
	
    window.init = function init() {
        notebook.insertInto(document.body);
    };
	
    loadContainers();	
})();
