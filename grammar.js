class Abstraction {
	constructor(name, rules) {
		this.name = name;
		// replace all "this" with the actual object itself
		this.rules = rules.map(rule =>
			rule.map(symbol => symbol == "this" ? this : symbol)
		);
	}

	check(tokens, index) {
		var original_index = index;
		var valid = false;
		var strict = false;
		var temp_index;

		var temp_expected = "";
		var temp_instead_saw = "";
		var temp_error_line_number = 0;

		for (var rule of this.rules) {
			for (var symbol of rule) {
				if (tokens[index] === undefined) {
					expected = symbol;
					instead_saw = "EOF";
					return original_index;
				}

				// process.stdout.write("\t".repeat(tab_count))
				// console.log("\t".repeat(tab_count), symbol.name ? `${symbol.name}` : `${symbol} vs ${tokens[index][0]}`)

				if (typeof (symbol) === "object") {
					tab_count++;
					temp_index = index;
					index = symbol.check(tokens, index);
					tab_count--;
					if (index > temp_index) {
						// console.log("symbol", symbol.name, "is valid", index, original_index)
						valid = true;
					}
					else {
						// console.log("symbol", symbol.name, "is INVALID", index, original_index)
						// if (strict && !expected) {
						// 	expected = symbol.name;
						// 	instead_saw = `${tokens[error_index][0]} ${tokens[error_index][1] ? tokens[error_index][1] : ""}`;
						// 	error_line_number = tokens[index][2]
						// 	console.log("SYNTAX ERROR HAPPENED HERE");
						// }
						valid = false;
						break;
					}
				}
				else {
					if (tokens[index][0] === symbol) {
						if (tokens[index][0] === "LINEBREAK") {
							strict = false;
						}
						else {
							if (!strict) {
								strict = true;
							}
							// strict = false;
						}
						// console.log("valid is TRUE")
						// process.stdout.write("\t".repeat(tab_count))
						// console.log(tokens[index][0])
						valid = true;
						index++;
					}
					else {
						// console.log("valid is FALSE")
						valid = false;
						// error_index = index;
						if (strict && !expected) {
							temp_expected = symbol;
							temp_instead_saw = `${tokens[index][0]} ${tokens[index][1] ? tokens[index][1] : ""}`;
							temp_error_line_number = tokens[index][2]
						}
						break;
					}
				}
			}
			if (valid) {
				break;
			}
			// keep a copy of the index for possible error checking later
			last_index = index;
			// reset index and try the next rule
			index = original_index;
		}
		// console.log("about to return a ", valid)
		if (valid) {
			// console.log(`rule ${this.name} successful`)
			return index;
		}
		// console.log(`rule ${this.name} failed: returns ${index}`)
		if (strict && !expected) {
			expected = temp_expected;
			instead_saw = temp_instead_saw;
			error_line_number = temp_error_line_number;
			// console.log("SYNTAX ERROR HAPPENED HERE");
		}
		return original_index;
	}
}

/* ========================= GRAMMAR ========================= */
expression = new Abstraction("expression", []);
boolean_operation = new Abstraction("boolean operation", []);
code_block = new Abstraction("code block", []);
no_dec_code_block = new Abstraction("no declaration code block", []);
no_infinite_expression = new Abstraction("no infinite expression", []);
assignment_expression = new Abstraction("assignment expression", []);

literal = new Abstraction("literal", [
	["NUMBR"],
	["NUMBAR"],
	["YARN"],
	["TROOF"],
	["NOOB"]
]);

cast_assign = new Abstraction("cast assignment", [
	["VARIDENT", "IS_NOW_A", "TYPE"]
]);

cast = new Abstraction("cast", [
	["MAEK", literal, "A", "TYPE"],
	["MAEK", "VARIDENT", "A", "TYPE"]
]);

smoosh_content = new Abstraction("smoosh content", [
	[expression, "AN", "this"],
	["VARIDENT", "AN", "this"],
	[expression],
	["VARIDENT"]
]);

smoosh = new Abstraction("smoosh", [
	["SMOOSH", smoosh_content]
]);

operation_content = new Abstraction("operation content", [
	[no_infinite_expression],
	["VARIDENT"],
]);

not_equals = new Abstraction("not equals", [
	["DIFFRINT", operation_content, "AN", operation_content]
]);

equals = new Abstraction("equals", [
	["BOTH_SAEM", operation_content, "AN", operation_content],
]);

all_any_content = new Abstraction("all any content", [
	[no_infinite_expression, "AN", "this"],
	[no_infinite_expression]
]);

any = new Abstraction("any", [
	["ANY_OF", all_any_content, "MKAY"]
]);

all = new Abstraction("all", [
	["ALL_OF", all_any_content, "MKAY"]
]);

infinite_operation = new Abstraction("infinite operation", [
	[all],
	[any]
]);

either = new Abstraction("either", [
	["EITHER_OF", operation_content, "AN", operation_content]
]);

not = new Abstraction("not", [
	["NOT", operation_content]
]);

won = new Abstraction("won", [
	["WON_OF", operation_content, "AN", operation_content]
]);

both = new Abstraction("both", [
	["BOTH_OF", operation_content, "AN", operation_content]
]);

boolean_operation.rules = [
	[both],
	[either],
	[won],
	[not],
	[literal],
	["VARIDENT"]
];

less = new Abstraction("less", [
	["SMALLR_OF", operation_content, "AN", operation_content]
]);

greater = new Abstraction("greater", [
	["BIGGR_OF", operation_content, "AN", operation_content]
]);

mod = new Abstraction("mod", [
	["MOD_OF", operation_content, "AN", operation_content]
]);

div = new Abstraction("div", [
	["QUOSHUNT_OF", operation_content, "AN", operation_content]
]);

mul = new Abstraction("mul", [
	["PRODUKT_OF", operation_content, "AN", operation_content]
]);

sub = new Abstraction("sub", [
	["DIFF_OF", operation_content, "AN", operation_content]
]);

add = new Abstraction("add", [
	["SUM_OF", operation_content, "AN", operation_content]
]);

function_call_arity= new Abstraction("function call arity",[
	[expression, "AN", "YR", "this"],
	["VARIDENT", "AN", "YR","this"],
	[expression],
	["VARIDENT"],
]);

function_call = new Abstraction("function call",[
    ["I_IZ","FUNIDENT","YR", function_call_arity, "MKAY"]
]);

function_return = new Abstraction("function return",[
	["FOUND_YR", expression],
	["FOUND_YR", "VARIDENT"]
]);


no_infinite_expression.rules = [
	[add],
	[sub],
	[mul],
	[div],
	[mod],
	[greater],
	[less],
	[boolean_operation],
	[equals],
	[not_equals],
	[smoosh],
];

expression.rules = [
	[add],
	[sub],
	[mul],
	[div],
	[mod],
	[greater],
	[less],
	[boolean_operation],
	[infinite_operation],
	[equals],
	[not_equals],
	[function_call],
	[smoosh],
];

assignment_expression.rules = [
	[add],
	[sub],
	[mul],
	[div],
	[mod],
	[greater],
	[cast],
	[less],
	[boolean_operation],
	[infinite_operation],
	[equals],
	[function_call],
	[not_equals],
	[smoosh],
];

loop_condition = new Abstraction("loop condition", [
	["UPPIN_YR", "VARIDENT", "TIL", expression],
	["NERFIN_YR", "VARIDENT", "TIL", expression],
	["UPPIN_YR", "VARIDENT", "WILE", expression],
	["NERFIN_YR", "VARIDENT", "WILE", expression],
]);

loop_statement = new Abstraction("loop statement", [
	["IM_IN_YR", "LOOPIDENT", loop_condition, "LINEBREAK", no_dec_code_block, "IM_OUTTA_YR", "LOOPIDENT"]
]);

switch_OMGWTF = new Abstraction("switch OMGWTF", [
	["OMGWTF", "LINEBREAK", code_block, "OIC"],
	["OIC"]
]);

switch_OMG = new Abstraction("switch OMG", [
	["OMG", literal, "LINEBREAK", no_dec_code_block, "GTFO", "LINEBREAK", "this"],
	["OMG", literal, "LINEBREAK", no_dec_code_block, "GTFO", "LINEBREAK"],
	["OMG", literal, "LINEBREAK", no_dec_code_block, "this"],
	["OMG", literal, "LINEBREAK", no_dec_code_block],
	["OMG", literal, "LINEBREAK", "this"]
]);

switch_case = new Abstraction("switch_case", [
	["WTF?", "LINEBREAK", switch_OMG, switch_OMGWTF]
]);

else_statement = new Abstraction("else statement", [
	["NO_WAI", "LINEBREAK", no_dec_code_block, "OIC"],
	["OIC"]
]);

if_statement = new Abstraction("if statement", [
	["O_RLY?", "LINEBREAK", "YA_RLY", "LINEBREAK", no_dec_code_block, else_statement]
]);

assignment = new Abstraction("assignment", [
	["VARIDENT", "R", assignment_expression],
	["VARIDENT", "R", "VARIDENT"]
]);

input = new Abstraction("GIMMEH", [
	["GIMMEH", "VARIDENT"]
]);

print_content = new Abstraction("print content", [
	[expression, "this"],
	["VARIDENT", "this"],
	[expression],
	["VARIDENT"],
]);

print = new Abstraction("print", [
	["VISIBLE", print_content, "!"],
	["VISIBLE", print_content],
]);

declaration = new Abstraction("declaration", [
	["I_HAS_A", "VARIDENT", "ITZ", expression],
	["I_HAS_A", "VARIDENT", "ITZ", "VARIDENT"],
	["I_HAS_A", "VARIDENT"],
]);

function_no_dec_statement = new Abstraction("function no dec statement", [
	[assignment],
	[cast],
	[cast_assign],
	[expression],
	[if_statement],
	[input],
	[loop_statement],
	[print],
	[function_return],
	[switch_case],
	["LINEBREAK"]
]);

function_no_dec_code_block = new Abstraction("function no dec code block", [
	[function_no_dec_statement, "LINEBREAK", "this"],
	[function_no_dec_statement, "LINEBREAK"]
]);

function_else_statement = new Abstraction("function else statement", [
	["NO_WAI", "LINEBREAK", function_no_dec_code_block, "OIC"],
	["OIC"]
]);

function_if_statement = new Abstraction("function if statement",[
	["O_RLY?", "LINEBREAK", "YA_RLY", "LINEBREAK", function_no_dec_code_block, function_else_statement]
]);

function_loop_statement = new Abstraction("function loop statement", [
	["IM_IN_YR", "LOOPIDENT", loop_condition, "LINEBREAK", function_no_dec_code_block, "IM_OUTTA_YR", "LOOPIDENT"]

]);

function_switch_OMGWTF = new Abstraction("function switch OMGWTF", [
	["OMGWTF", "LINEBREAK", function_no_dec_code_block, "OIC"],
	["OIC"]
]);

function_switch_OMG = new Abstraction("function switch OMG",[
	["OMG", literal, "LINEBREAK", function_no_dec_code_block, "GTFO", "LINEBREAK", switch_OMG],
	["OMG", literal, "LINEBREAK", function_no_dec_code_block, "GTFO", "LINEBREAK"],
	["OMG", literal, "LINEBREAK", function_no_dec_code_block, "this"],
	["OMG", literal, "LINEBREAK", function_no_dec_code_block],
	["OMG", literal, "LINEBREAK", "this"]
]);

function_switch_case = new Abstraction("function switch case", [
	["WTF?", "LINEBREAK", switch_OMG, switch_OMGWTF]
]);

function_inside_statement = new Abstraction("function inside statement",[
	[assignment],
	[cast],
	[cast_assign],
	[declaration],
	[expression],
	[function_if_statement],
	[input],
	[function_loop_statement],
	[print],
	[function_switch_case],
	// [function_call], TODO: add recursion feature later
	[function_return],
	["GTFO"],
	["LINEBREAK"],
]);

function_code_block = new Abstraction("function code block",[
	[function_inside_statement, "LINEBREAK", "this"],
	[function_inside_statement]
]);

function_arguments = new Abstraction("function arguments",[
	["VARIDENT", "AN", "YR", "this"],
	["VARIDENT"]
]);

function_statement= new Abstraction("function statement",[
	["HOW_IZ_I", "FUNIDENT", "YR", function_arguments, "LINEBREAK", function_code_block, "LINEBREAK", "IF_U_SAY_SO"],
]);


statement = new Abstraction("statement", [
	[assignment],
	[cast],
	[cast_assign],
	[declaration],
	[expression],
	[if_statement],
	[input],
	[loop_statement],
	[print],
	[switch_case],
	[function_statement],
	["LINEBREAK"]
]);

no_dec_statement = new Abstraction ("no dec statement", [
	[assignment],
	[cast],
	[cast_assign],
	[expression],
	[if_statement],
	[input],
	[loop_statement],
	[print],
	[switch_case],
	["LINEBREAK"]
]);

no_dec_code_block.rules = [
	[no_dec_statement, "LINEBREAK", no_dec_code_block],
	[no_dec_statement, "LINEBREAK"]
];

code_block.rules = [
	[statement, "LINEBREAK", code_block],
	[statement, "LINEBREAK"]
];

program = new Abstraction("program", [
	["HAI", "NUMBAR", "LINEBREAK", code_block, "KTHXBYE"],
	["HAI", "LINEBREAK", code_block, "KTHXBYE"],
	["HAI", "LINEBREAK", "KTHXBYE"]
]);