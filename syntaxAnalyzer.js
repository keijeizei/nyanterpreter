// global variable to keep the expected token for syntax error
var expected = "";
var instead_saw = "";
var error_line_number = 0;
var error_index = 0;
var last_index = 0;
var tab_count = 0;		// used only for debugging

// first_symbol refers to the command in the line
// this is important to know if we are on the right rule
// first_symbol becomes false after the commands match
var first_symbol = true

function syntaxAnalyzer(tokens) {
	var index = program.check(tokens, 0);
	// console.log(index)
	if (index === 0) {
		if (expected === "") {
			// expected = "HAI"
			// instead_saw = tokens[0][0]
			terminal.error(`Unexepected token ${tokens[last_index][0]}`, error_line_number, true);
			return false;
		}
		terminal.error(`Expected ${expected}, instead saw ${instead_saw}`, error_line_number, true);
		return false;
	}
	else if (index < tokens.length) {
		terminal.error(`Unexepected token ${tokens[tokens.length - 1]} after KTHXBYE.`, error_line_number, true);
		return false;
	}
	else {
		console.log("No syntax errors.");
		return true;
	}
}
