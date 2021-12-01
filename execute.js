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

	var lexer = new LexicalAnalyzer(code_text);
	lexer.start();
    addTable();
	if (list_of_tokens) {
		var valid_syntax = syntaxAnalyzer(list_of_tokens);
		if (valid_syntax) {
			semanticAnalyzer(list_of_tokens);
		}
	}
}
