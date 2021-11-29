// global variable to keep the expected token for syntax error
var expected = "";
var instead_saw = "";
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
			console.log(`Unexepected token ${tokens[last_index][0]}`);
			return false;
		}
		console.log(`Syntax error: Expected ${expected}, instead saw ${instead_saw}`);
		return false;
	}
	else if (index < tokens.length) {
		console.log(`Unexepected token ${tokens[tokens.length - 1]} after KTHXBYE.`);
		return false;
	}
	else {
		console.log("No syntax errors.");
		return true;
	}
}
