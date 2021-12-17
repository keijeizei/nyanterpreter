function execute() {
	// disable execute button to prevent double execution
	document.getElementById("executebutton").disabled = true;

	// reset global variables
	interpreter_tokens = [];
	gui_tokens = [];
	symbol_table = {};
	function_symbol_tables = {};
	
	expected = "";
	instead_saw = "";
	error_index = 0;
	last_index = 0;
	tab_count = 0;
	f_id = 0;
	first_symbol = true;

	terminal.clear();
	
	var lexer = new LexicalAnalyzer(code_text);
	lexer.start();
	removeTable();
	if (!terminal.error_encountered) {
		syntaxAnalyzer(interpreter_tokens, null, {});
		if (!terminal.error_encountered) {
			semanticAnalyzer(interpreter_tokens);
		}
	}
	
	// enable execute button if error is encountered
	if(terminal.error_encountered) {
		document.getElementById("executebutton").disabled = false;
	}
}

