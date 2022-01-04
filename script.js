// LOLCODE contents from file will go here
var code_text = "";

// codemirror invoker
var editor = CodeMirror.fromTextArea(document.getElementById('file-content'), {
	theme: "monokai",
	indentUnit: 4,
	indentWithTabs: true,
	lineNumbers: true
})

// set the codemirror size
editor.setSize("100%", "75%");

// codemirror's event listener for input change
editor.on('change', editor => {
	code_text = editor.doc.getValue()
})

// terminal object
var terminal = new Terminal();

/* ========== JavaScript Internal Error Handlers ========== */
window.onerror = err => {
	terminal.internalError(err);
    return true;
};

window.onunhandledrejection = err => {
	terminal.internalError(err.reason);
	return true;
}


function readSingleFile(e) {
	var file = e.target.files[0];
	if (!file) return;

	var reader = new FileReader();
	reader.onload = (e) => {
		code_text = e.target.result;
		displaycode_text(code_text);
	};
	reader.readAsText(file);
}
  

function togglePopup() {
	if (document.getElementById("popup").style.display === "block") {
		document.getElementById("popup").style.display = "none";
	}
	else {
		document.getElementById("popup").style.display = "block";
	}
}


function addTable() {
	var myTableDiv = document.getElementById("lexemeDiv");

	var table = document.createElement('TABLE');
	table.id="tableID"
	table.border = '1';

	var tableBody = document.createElement('TBODY');
	tableBody.id = 'tbodyID'
	table.appendChild(tableBody);


	for (var i = 0; i < gui_tokens.length; i++) {
		var tr = document.createElement('TR');
		tr.id="trID"
		tableBody.appendChild(tr);
		var td = document.createElement('TD');
		td.width= '50%'
		if (gui_tokens[i][0] == "VARIDENT" || gui_tokens[i][0] == "NUMBR" || gui_tokens[i][0] == "NUMBAR" || gui_tokens[i][0] == "LOOPIDENT" || gui_tokens[i][0] == "FUNIDENT" || gui_tokens[i][0] == "BTW_COMMENT" || gui_tokens[i][0] == "OBTW_COMMENT" || gui_tokens[i][0] == "TYPE"){
			td.appendChild(document.createTextNode(gui_tokens[i][1]));
		}else if (gui_tokens[i][0] == "YARN" ){
            td.appendChild(document.createTextNode('"' + gui_tokens[i][1] + '"'));
        }else if ( gui_tokens[i][0] == "TROOF"){
            if (gui_tokens[i][1] == true) { td.appendChild(document.createTextNode("WIN"))}
            else if(gui_tokens[i][1] == false) { td.appendChild(document.createTextNode("FAIL"))}
        }else{
 			td.appendChild(document.createTextNode(gui_tokens[i][0].replace(/_/g," ")));
		}
		tr.appendChild(td);

		var td2 = document.createElement('TD');
		td2.width= '50%'
		tr.appendChild(td2);
		td2.appendChild(document.createTextNode(token_to_classification[gui_tokens[i][0]]));
        tr.appendChild(td2);
		
	}
	
	myTableDiv.appendChild(table);
	//---------------------------------------SYMBOL TABLE----------------------------------
	var mysymbolTableDiv = document.getElementById("symbolTableDiv");

	var symbolTable = document.createElement('TABLE');
	symbolTable.id="symbolTableID"
	symbolTable.border = '1';

	var symbolTableBody = document.createElement('TBODY');
	symbolTableBody.id = 'symbolTableBodyID'
	symbolTable.appendChild(symbolTableBody);

	for (var key in main_symbol_table) {
		// console.log(key)
		var symbolTabletr = document.createElement('TR');
		symbolTabletr.id="symbolTabletrID"
		symbolTableBody.appendChild(symbolTabletr);
		var symbolTabletd = document.createElement('TD');
		symbolTabletd.width= '33%'
		symbolTabletd.borderColor = 'red';
		symbolTabletd.appendChild(document.createTextNode(key));
		symbolTabletr.appendChild(symbolTabletd);


		var symbolTabletd2 = document.createElement('TD');
		symbolTabletd2.width= '33%'
		symbolTabletr.appendChild(symbolTabletd2)
        if (main_symbol_table[key].value === true) {
            symbolTabletd2.appendChild(document.createTextNode("WIN"));
        } else if (main_symbol_table[key].value === false){
            symbolTabletd2.appendChild(document.createTextNode("FAIL"));
        } else if (main_symbol_table[key].value === null){
            symbolTabletd2.appendChild(document.createTextNode("NOOB"));
		}else if (main_symbol_table[key]["type"] === "NUMBAR"){
			symbolTabletd2.appendChild(document.createTextNode(main_symbol_table[key]["value"].toFixed(2)));
		} 
		else {
            symbolTabletd2.appendChild(document.createTextNode(main_symbol_table[key].value));
        }
		
		symbolTabletr.appendChild(symbolTabletd2);

		var symbolTabletd3 = document.createElement('TD');
		symbolTabletd3.width= '33%'
		symbolTabletr.appendChild(symbolTabletd3)
		symbolTabletd3.appendChild(document.createTextNode(main_symbol_table[key].type));
		symbolTabletr.appendChild(symbolTabletd3);
				
	}
	mysymbolTableDiv.appendChild(symbolTable);

//--------------------------FUNCTION TABLE-------------------------------------------

	var functionsymbolTable = document.createElement('TABLE');
	functionsymbolTable.id="functionsymbolTableID"
	functionsymbolTable.border = '1';

	var functionsymbolTableBody = document.createElement('TBODY');
	functionsymbolTableBody.id = 'functionsymbolTableBodyID'
	functionsymbolTable.appendChild(functionsymbolTableBody);

	for (var key in function_symbol_tables) {
		// console.log(key)
		var functionsymbolTabletr = document.createElement('TR');
		var functionsymbolTableth = document.createElement('TH');
		functionsymbolTabletr.id="functionsymbolTabletrID"
		functionsymbolTableth.style.textAlign = "center"
		functionsymbolTableth.colSpan = "3"
		functionsymbolTableBody.appendChild(functionsymbolTabletr);
		functionsymbolTableth.appendChild(document.createTextNode("In function: "+ key));
		functionsymbolTabletr.appendChild(	functionsymbolTableth)

		for (var key_of_keys in function_symbol_tables[key]){
			// console.log(key_of_keys)
			var functionsymbolTabletr2 = document.createElement('TR');
			functionsymbolTableBody.appendChild(functionsymbolTabletr2);
			functionsymbolTabletr2.id="functionsymbolTabletr2ID"
			var functionsymbolTabletd = document.createElement('TD');
			functionsymbolTabletd.width= '33%'
			functionsymbolTabletd.appendChild(document.createTextNode(key_of_keys));
			functionsymbolTabletr2.appendChild(functionsymbolTabletd);
			// console.log(function_symbol_tables[key][key_of_keys].value)
			// console.log(function_symbol_tables[key][key_of_keys].type)
			var functionsymbolTabletd2 = document.createElement('TD');
			functionsymbolTabletd2.width= '33%'
			functionsymbolTabletr2.appendChild(functionsymbolTabletd2)
       		if (function_symbol_tables[key][key_of_keys].value === true) {
            	functionsymbolTabletd2.appendChild(document.createTextNode("WIN"));
        	} else if (function_symbol_tables[key][key_of_keys].value === false){
            	functionsymbolTabletd2.appendChild(document.createTextNode("FAIL"));
        	} else if (function_symbol_tables[key][key_of_keys].value === null){
            	functionsymbolTabletd2.appendChild(document.createTextNode("NOOB"));
        	} else {
            	functionsymbolTabletd2.appendChild(document.createTextNode(function_symbol_tables[key][key_of_keys].value));
        	}
			functionsymbolTabletr2.appendChild(functionsymbolTabletd2);

			var functionsymbolTabletd3 = document.createElement('TD');
			functionsymbolTabletd3.width= '33%'
			functionsymbolTabletr2.appendChild(functionsymbolTabletd3)
			functionsymbolTabletd3.appendChild(document.createTextNode(function_symbol_tables[key][key_of_keys].type));
			functionsymbolTabletr2.appendChild(functionsymbolTabletd3);
		}
		
				
	}
	mysymbolTableDiv.appendChild(functionsymbolTable);
}
function removeTable(){
	var table = document.getElementById("tableID")
	var tableBody = document.getElementById("tbodyID")
    var symbolTable = document.getElementById("symbolTableID")
    var symbolTableBody = document.getElementById("symbolTableBodyID")
	var functionsymbolTable = document.getElementById("functionsymbolTableID")
	var functionsymbolTableBody = document.getElementById("functionsymbolTableBodyID")
	if(table !== null){
		table.remove(tableBody);
        symbolTable.remove(symbolTableBody);
		functionsymbolTable.remove(functionsymbolTableBody);
	}else{
		return
	}
}

function focusDummyInput() {
	document.getElementById("dummyinput").focus();
}

function displaycode_text(code_text) {
	editor.getDoc().setValue(code_text);
}
  
document.getElementById("file-input").addEventListener("change", readSingleFile, false);

