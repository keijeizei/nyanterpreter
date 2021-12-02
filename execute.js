function execute() {
	// reset global variables
	interpreter_tokens = [];
	gui_tokens = [];
	symbol_table = {};

	expected = "";
	instead_saw = "";
	error_index = 0;
	last_index = 0;
	tab_count = 0;
	first_symbol = true

	var lexer = new LexicalAnalyzer(code_text);
	lexer.start();
    addTable();
	if (interpreter_tokens) {
		var valid_syntax = syntaxAnalyzer(interpreter_tokens);
		if (valid_syntax) {
			semanticAnalyzer(interpreter_tokens);
		}
	}
}
