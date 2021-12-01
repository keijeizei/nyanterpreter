// LOLCODE contents from file will go here
var code_text = "";

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
  
function displaycode_text(code_text) {
	document.getElementById("file-content").value = code_text;
}
  
document.getElementById("file-input").addEventListener("change", readSingleFile, false);
