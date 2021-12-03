// LOLCODE contents from file will go here
var code_text = "";

// codemirror invoker
var editor = CodeMirror.fromTextArea(document.getElementById('file-content'), {
	theme: "eclipse",
	lineNumbers: true
})

// set the codemirror size
editor.setSize("100%", "75%");

// codemirror's event listener for input change
editor.on('change', editor => {
	code_text = editor.doc.getValue()
})

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
		if (gui_tokens[i][0] == "VARIDENT" || gui_tokens[i][0] == "NUMBR" || gui_tokens[i][0] == "NUMBAR" || gui_tokens[i][0] == "YARN" || gui_tokens[i][0] == "LOOPIDENT" || gui_tokens[i][0] == "BTW_COMMENT" || gui_tokens[i][0] == "OBTW_COMMENT"){
			td.appendChild(document.createTextNode(gui_tokens[i][1]));
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
}
function removeTable(){
	var table = document.getElementById("tableID")
	var tableBody = document.getElementById("tbodyID")
	if(table !== null){
		table.remove(tableBody);
	}else{
		return
	}
}

function displaycode_text(code_text) {
	editor.getDoc().setValue(code_text);
}
  
document.getElementById("file-input").addEventListener("change", readSingleFile, false);
