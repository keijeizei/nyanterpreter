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

	// error printing based on whether the index proceeds
	if (index === 0) {
		if (expected === "") {
			terminal.error(`Unexepected token ${tokens[last_index][0]} ${tokens[last_index][1] ? tokens[last_index][1] : ""}`, tokens[last_index][2], true);
			return false;
		}
		terminal.error(`Expected ${expected}, instead saw ${instead_saw}`, error_line_number, true);
		return false;
	}
	else if (index < tokens.length) {
		terminal.error(`Unexepected token ${tokens[tokens.length - 1][0]} ${tokens[tokens.length - 1][1] ? tokens[tokens.length - 1][1] + " " : ""}after KTHXBYE.`, tokens[tokens.length - 1][2], true);
		return false;
	}
	// index should be equal to tokens.length if there are no syntax errors
	else {
		console.log("No syntax errors.");
		return true;
	}
}
