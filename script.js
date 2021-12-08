// LOLCODE contents from file will go here
var code_text = "";

// codemirror invoker
var editor = CodeMirror.fromTextArea(document.getElementById('file-content'), {
	theme: "monokai",
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
		if (gui_tokens[i][0] == "VARIDENT" || gui_tokens[i][0] == "NUMBR" || gui_tokens[i][0] == "NUMBAR" || gui_tokens[i][0] == "LOOPIDENT" || gui_tokens[i][0] == "BTW_COMMENT" || gui_tokens[i][0] == "OBTW_COMMENT" || gui_tokens[i][0] == "TYPE"){
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
		console.log(key)
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
        if (main_symbol_table[key].value == true) {
            symbolTabletd2.appendChild(document.createTextNode("WIN"));
        } else if (main_symbol_table[key].value == false){
            symbolTabletd2.appendChild(document.createTextNode("FAIL"));
        } else if (main_symbol_table[key].value == null){
            symbolTabletd2.appendChild(document.createTextNode("NOOB"));
        } else {
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
}
function removeTable(){
	var table = document.getElementById("tableID")
	var tableBody = document.getElementById("tbodyID")
    var symbolTable = document.getElementById("symbolTableID")
    var symbolTableBody = document.getElementById("symbolTableBodyID")
	if(table !== null){
		table.remove(tableBody);
        symbolTable.remove(symbolTableBody);
	}else{
		return
	}
}

function displaycode_text(code_text) {
	editor.getDoc().setValue(code_text);
}
  
document.getElementById("file-input").addEventListener("change", readSingleFile, false);

