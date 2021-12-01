function execute() {
	// reset global variables
	list_of_tokens = [];
	symbol_table = {};

	expected = "";
	instead_saw = "";
	error_index = 0;
	last_index = 0;
	tab_count = 0;
	first_symbol = true
	
	// get code text from textbox
	code_text = document.getElementById("file-content").value;

	var lexer = new LexicalAnalyzer(code_text);
	lexer.start();

	if (list_of_tokens) {
		var valid_syntax = syntaxAnalyzer(list_of_tokens);
		if (valid_syntax) {
			semanticAnalyzer(list_of_tokens);
		}
	}
}
