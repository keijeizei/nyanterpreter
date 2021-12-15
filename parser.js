var main_symbol_table = {};

var function_symbol_tables = {};

var main_tokens = [];

/*
function_table will contain all function definitions in the code
It will contain properties of this format:
[function_identifier] = {
	"args_list": [],		<- list of argument names
	"start_index": int,		<- the index of the first token of the function code block
	"end_index": int		<- the index of the IF U SAY SO of the function code block
}
*/
var function_table = [];		// list of all functions
var function_skip = false;		// skips a function definition
var function_identifier = null;	// the name of the function that is skipping
var f_id = 0;

/**
 * Gets a line of tokens starting from index until the next LINEBREAK
 * Returns a list containing the list of tokens and the index of the next line
 */
function getLine(tokens, index) {
	var line = [];
	for (var i = index; i < tokens.length; i++) {
		if (tokens[i][0] === "LINEBREAK") {
			break;
		}
		line.push(tokens[i]);
	}
	return [line, i + 1];
}

/**
 * Given a number, return true if n is an integer, false if it is a float
 */
function isInteger(n) {
	return Number(n) === n && n % 1 === 0;
}

/**
 * Converts a NUMBAR to YARN by truncating the float to 2 decimal places.
 */
function numbarToYarn(numbar) {
    var num_s = numbar.toString(),
        dec_pos = num_s.indexOf("."),
        substr_len = dec_pos == -1 ? num_s.length : 1 + dec_pos + 2,
        trimmed_result = num_s.substr(0, substr_len),
        final_result = isNaN(trimmed_result) ? 0 : trimmed_result;

    return parseFloat(final_result).toFixed(2);
}

function getUserInput() {
	// make the termianl glow on input
	var terminal_div = document.getElementById("terminalDiv");
	terminal_div.classList.add("blinking-terminal");

	var dummyinput = document.getElementById("dummyinput");
	dummyinput.focus();
	dummyinput.value = "";
	return new Promise((resolve) => {
		var input = "";
		document.addEventListener('keyup', onKeyHandler);
		function onKeyHandler(e) {
			terminal.handleInput();
			if (e.keyCode === 13) {
				terminal_div.classList.remove("blinking-terminal");
			
				document.removeEventListener('keyup', onKeyHandler);
				terminal.write(dummyinput.value + "\n");
				resolve(dummyinput.value);
			}
		}
	});
}


/**
 * Main semantic analyzer which runs the commands.
 * Function calls are done by calling semanticAnalyzer again.
 * @param tokens - The tokens to be executed
 * @param function_name - The function's function name if it was invoked by a function, null if it is the main function
 * @param args - The function's arguments, null if it is the main function
 */
async function semanticAnalyzer(tokens, function_name, args) {
	var index = 0;				// current index in the code
	var prev_index = 0;			// the previous index
	var stack = [];				// main stack where line tokens get pushed
	var buffer = [];			// temporary storage of popped tokens from the stack
	var line = [];				// the line of tokens

	var current_token = null;	// the current token from stack's top
	var return_to_IT = false;	// boolean value whether last token's value gets assigned to IT

	var operand1 = null;		// for binary operations
	var operand2 = null;
	var operands = [];			// for infinite operations
	var answer = null;


	// if(function_name) {			// add the argments if function call
		var symbol_table = {
			"IT": {
				"type": "NOOB",
				"value": null
			},
			...args
		}
		console.table(symbol_table)
	// }
	// else {
		// symbol_table["IT"] = {		// initialize an IT variable
			// "type": "NOOB",
			// "value": null
		// }
	// }

	// save a global copy of the main_tokens. this is needed by recursive functions
	if (!function_name) {
		main_tokens = tokens
	}

	/*
	condition_stack will contain the stack of IF and SWITCH calls to support nesting
	It will contain objects of this format:
	{
		IT: {type, value},		<- the IT for the if/switch
		cases: []],				<- all the omg literals of the switch
		skip: boolean,			<- if the current block should skip
		antiskip: boolean		<- if the current block should not skip
	}
	
	antiskip prevents a skip on multiple cases on switch
	if a matching case is found, force execute all the succeeding lines until GTFO or OIC is found
	*/
	var condition_stack = [];
	var csd = -1;				// condition stack depth

	/*
	loop_stack will contain objects of this format:
	{
		start_index: int		<- the starting index of the IM_IN_YR loop
		iter_varident: int		<- the varident that gets incremented/decremented
		next_iter_value: int	<- the resulting value after varident is incremented/decremented
		skip: boolean			< if the loop should skip
	}
	*/
	var loop_stack = [];
	var lsd = -1;				// loop stack depth

	while (index < tokens.length) {
		// getLine returns [tokens_list, new_index]
		line = getLine(tokens, index);
		stack = line[0];
		prev_index = index;
		index = line[1];

		buffer = [];

		// skip all commands except conditional commands when skip is enabled
		if (csd > -1 && !conditional_tokens.includes(stack[0][0])) {
			if (condition_stack[csd]["skip"]) continue;
		}

		// skip all commands except loop commands when loop_skip is enabled
		if (lsd > -1 && !loop_tokens.includes(stack[0][0])) {
			if (loop_stack[lsd]["skip"]) continue;
		}

		// skip all commands except IF_U_SAY_SO when function_skip is enabled
		if (function_skip && stack[0][0] !== "IF_U_SAY_SO") {
			continue;
		}

		while (stack.length) {
			current_token = stack.pop();
			console.log(current_token);
			return_to_IT = false;

			operands = [];

			switch (current_token[0]) {
				case "NUMBR":
				case "NUMBAR":
				case "TROOF":
				case "YARN":
				case "TYPE":
				case "NOOB":
				case "VARIDENT":
					buffer.push(current_token);
					return_to_IT = true;
					break;
				case "!":
				case "LOOPIDENT":
				case "FUNIDENT":
				case "UPPIN_YR":
				case "NERFIN_YR":
				case "TIL":
				case "WILE":
					buffer.push(current_token);
					break;

				// ============================== COMMANDS ==============================
				case "I_HAS_A":
					operand1 = buffer.pop(); // varident
					operand2 = buffer.pop(); // possible initialization value

					// error if variable name is IT
					if (operand1[1] === "IT") {
						terminal.error(`IT variable is reserved as an implicit variable.`, current_token[2], false);
						return;
					}
					// error if variable is already declared
					if (symbol_table[operand1[1]]) {
						terminal.error(`variable ${operand1[1]} is already defined.`, current_token[2], false);
						return;
					}

					// variable declaration only
					if (operand2 === undefined) {
						symbol_table[operand1[1]] = {
							"type": "NOOB",
							"value": null
						};
					}
					// variable initialization
					else {
						if (operand2[0] === "VARIDENT") {
							if (!symbol_table[operand2[1]]) {
								terminal.error(`variable ${operand2[1]} is not defined.`, current_token[2], false);
								return;
							}
							operand2 = [
								symbol_table[operand2[1]]["type"],
								symbol_table[operand2[1]]["value"]
							];
						}
						symbol_table[operand1[1]] = {
							"type": operand2[0],
							"value": operand2[1]
						};
					}
					break;

				case "R":
					operand1 = stack.pop();	// variable to be assigned to
					operand2 = buffer.pop();	// value to be assigned

					if (!symbol_table[operand1[1]]) {
						terminal.error(`variable ${operand1[1]} is not defined.`, current_token[2], false);
						return;
					}

					if (operand2[0] === "VARIDENT") {
						if (!symbol_table[operand2[1]]) {
							terminal.error(`variable ${operand2[1]} is not defined.`, current_token[2], false);
							return;
						}
						operand2 = [
							symbol_table[operand2[1]]["type"],
							symbol_table[operand2[1]]["value"]
						];
					}

					symbol_table[operand1[1]]["type"] = operand2[0];
					symbol_table[operand1[1]]["value"] = operand2[1];
					break;

				case "VISIBLE":
					while (buffer.length) {
						operands.push(buffer.pop());
					}

					for (var i = 0; i < operands.length; i++) {
						if (operands[i][0] === "VARIDENT") {
							if (!symbol_table[operands[i][1]]) {
								terminal.error(`variable ${operands[i][1]} is not defined.`, current_token[2], false);
								return;
							}
							operands[i] = [
								symbol_table[operands[i][1]]["type"],
								symbol_table[operands[i][1]]["value"]
							];
						}
					}

					var suppress_newline = false;
					for (var i = 0; i < operands.length; i++) {
						if(i === operands.length - 1 && operands[i][0] === "!") {
							suppress_newline = true;
							break;
						}

						if (operands[i][0] === "TROOF") {
							operands[i][1] = operands[i][1] ? "WIN" : "FAIL";
						}
						else if (operands[i][0] === "NUMBAR") {
							operands[i][1] = numbarToYarn(operands[i][1]);
						}
						else if (operands[i][0] === "NOOB") {
							terminal.error("cannot implicitly cast NOOB to YARN.", current_token[2], false);
							return;
						}
						terminal.write(operands[i][1]);
					}

					if (!suppress_newline) {
						terminal.write("\n");
					}
					break;

				case "GIMMEH": 
					operand1 = buffer.pop();
					var input = await getUserInput();
					console.log(input)
					
					if (!symbol_table[operand1[1]]) {
						terminal.error(`variable ${operand1[1]} is not defined.`, current_token[2], false);
					}
					else {
						if (input.match(/^-?[0-9]+$/g)) {
							symbol_table[operand1[1]]["type"] = "NUMBR";
							symbol_table[operand1[1]]["value"] = Number(input);
						}
						else if (input.match(/^-?[0-9]*\.?[0-9]+$/g)) {
							symbol_table[operand1[1]]["type"] = "NUMBAR";
							symbol_table[operand1[1]]["value"] = Number(input);
						}
						else {
							symbol_table[operand1[1]]["type"] = "YARN";
							symbol_table[operand1[1]]["value"] = input;
						}
					}
					break;

				// arithmetic operations
				case "SUM_OF":
				case "DIFF_OF":
				case "PRODUKT_OF":
				case "QUOSHUNT_OF":
				case "MOD_OF":
				case "BIGGR_OF":
				case "SMALLR_OF":
					operand1 = buffer.pop();
					operand2 = buffer.pop();

					// fetch variable value from symbol table
					if (operand1[0] === "VARIDENT") {
						if (!symbol_table[operand1[1]]) {
							terminal.error(`variable ${operand1[1]} is not defined.`, current_token[2], false);
							return;
						}
						operand1 = [symbol_table[operand1[1]]["type"], symbol_table[operand1[1]]["value"]];
					}
					if (operand2[0] === "VARIDENT") {
						if (!symbol_table[operand2[1]]) {
							terminal.error(`variable ${operand1[1]} is not defined.`, current_token[2], false);
							return;
						}
						operand2 = [symbol_table[operand2[1]]["type"], symbol_table[operand2[1]]["value"]];
					}

					// typecast YARN to int or float
					if (operand1[0] === "YARN") {
						if (isNaN(operand1[1])) {
							terminal.error(`${operand1[1]} cannot be typecasted to NUMBR or NUMBAR.`, current_token[2], false);
							return;
						}
						operand1[1] = operand1[1].includes(".") ? parseFloat(operand1[1]) : parseInt(operand1[1]);
					}
					if (operand2[0] === "YARN") {
						if (isNaN(operand2[1])) {
							terminal.error(`${operand2[1]} cannot be typecasted to NUMBR or NUMBAR.`, current_token[2], false);
							return;
						}
						operand2[1] = operand2[1].includes(".") ? parseFloat(operand2[1]) : parseInt(operand2[1]);
					}

					// perform the specific operation
					switch (current_token[0]) {
						case "SUM_OF":
							answer = operand1[1] + operand2[1];
							break;
						case "DIFF_OF":
							answer = operand1[1] - operand2[1];
							break;
						case "PRODUKT_OF":
							answer = operand1[1] * operand2[1];
							break;
						case "QUOSHUNT_OF":
							answer = operand1[1] / operand2[1];
							break;
						case "MOD_OF":
							answer = operand1[1] % operand2[1];
							break;
						case "BIGGR_OF":
							answer = operand1[1] > operand2[1] ? operand1[1] : operand2[1];
							break;
						case "SMALLR_OF":
							answer = operand1[1] < operand2[1] ? operand1[1] : operand2[1];
							break;
					}

					stack.push([isInteger(answer) ? "NUMBR" : "NUMBAR", answer]);
					return_to_IT = true;
					break;

				// binary/unary logical operators
				case "BOTH_SAEM":
				case "DIFFRINT":
				case "BOTH_OF":
				case "EITHER_OF":
				case "WON_OF":
				case "NOT":
					operand1 = buffer.pop();
					operand2 = buffer.pop();

					// fetch variable value from symbol table
					if (operand1[0] === "VARIDENT") {
						if (!symbol_table[operand1[1]]) {
							terminal.error(`variable ${operand1[1]} is not defined.`, current_token[2], false);
							return;
						}
						operand1 = [symbol_table[operand1[1]]["type"], symbol_table[operand1[1]]["value"]];
					}
					if (operand2 && operand2[0] === "VARIDENT") {
						if (!symbol_table[operand2[1]]) {
							terminal.error(`variable ${operand2[1]} is not defined.`, current_token[2], false);
							return;
						}
						operand2 = [symbol_table[operand2[1]]["type"], symbol_table[operand2[1]]["value"]];
					}

					// perform the specific operation
					switch (current_token[0]) {
						case "BOTH_SAEM":
							answer = operand1[1] === operand2[1];
							break;
						case "DIFFRINT":
							answer = operand1[1] !== operand2[1];
							break;
						case "BOTH_OF":
							answer = operand1[1] && operand2[1];
							break;
						case "EITHER_OF":
							answer = operand1[1] || operand2[1];
							break;
						case "WON_OF":
							answer = (operand1[1] && !operand2[1]) || (!operand1[1] && operand2[1]);
							break;
						case "NOT":
							answer = !operand1[1];
							if (operand2) {
								buffer.push(operand2);
							}
							break;
					}

					// !!answer performs a double negative and typecasts answer to a boolean
					stack.push(["TROOF", !!answer]);
					return_to_IT = true;
					break;

				// smoosh operator
				case "SMOOSH":
					answer = "";
					while (buffer.length) {
						operands.push(buffer.pop());
					}

					for (var i = 0; i < operands.length; i++) {
						if (operands[i][0] === "VARIDENT") {
							if (!symbol_table[operands[i][1]]) {
								terminal.error(`variable ${operands[i][1]} is not defined.`, current_token[2], false);
								return;
							}
							operands[i] = [
								symbol_table[operands[i][1]]["type"],
								symbol_table[operands[i][1]]["value"]
							];
						}
					}

					for (var i = 0; i < operands.length; i++) {
						if (operands[i][0] === "TROOF") {
							operands[i][1] = operands[i][1] ? "WIN" : "FAIL";
						}
						else if (operands[i][0] === "NUMBAR") {
							operands[i][1] = numbarToYarn(operands[i][1]);
						}
						else if (operands[i][0] === "NOOB") {
							terminal.error("cannot implicitly cast NOOB to YARN.", current_token[2], false);
							return;
						}
						answer += operands[i][1];
					}

					stack.push(["YARN", answer]);
					return_to_IT = true;
					break;

				// infinite operators
				case "ANY_OF":
				case "ALL_OF":
					while (buffer.length) {
						operands.push(buffer.pop());
					}

					for (var i = 0; i < operands.length; i++) {
						if (operands[i][0] === "VARIDENT") {
							if (!symbol_table[operands[i][1]]) {
								terminal.error(`variable ${operands[i][1]} is not defined.`, current_token[2], false);
								return;
							}
							operands[i] = [
								symbol_table[operands[i][1]]["type"],
								symbol_table[operands[i][1]]["value"]
							];
						}
					}
					console.log(operands)
					// perform the specific operation
					switch (current_token[0]) {
						case "ANY_OF":
							answer = false;
							for (var operand of operands) {
								answer = answer || operand[1];
							}
							break;
						case "ALL_OF":
							answer = true;
							for (var operand of operands) {
								answer = answer && operand[1];
							}
							break;
					}

					stack.push(["TROOF", answer]);
					return_to_IT = true;
					break;

				// typecast operator
				case "MAEK":
					operand1 = buffer.pop();	// variable to be typecasted
					operand2 = buffer.pop();	// target type
					console.log(operand1, operand2);

					// fetch variable value from symbol table
					if (operand1[0] === "VARIDENT") {
						if (!symbol_table[operand1[1]]) {
							terminal.error(`variable ${operand1[1]} is not defined.`, current_token[2], false);
							return;
						}
						operand1 = [symbol_table[operand1[1]]["type"], symbol_table[operand1[1]]["value"]];
					}

					switch (operand2[1]) {
						case "NUMBR":
						case "NUMBAR":
							answer = Number(operand1[1]);
							if (operand2[1] === "NUMBR") {
								answer = Math.floor(answer);
							}
							if (isNaN(answer)) {
								terminal.error(`cannot cast ${operand1[1]} to ${operand2[1]}.`, current_token[2], false);
								return;
							}
							break
						case "TROOF":
							answer = operand1[1] ? true : false;
							break;
						case "YARN":
							switch (operand1[0]) {
								case "TROOF":
									answer = operand1[1] ? "WIN" : "FAIL";
									break;
								case "NOOB":
									answer = "";
									break;
								default:
									answer = operand1[1].toString();
							}
							break;
					}

					stack.push([operand2[1], answer]);
					return_to_IT = true;
					break;
				case "IS_NOW_A":
					operand1 = stack.pop();	// variable to be typecasted
					operand2 = buffer.pop();	// target type

					var var_name = operand1[1];	// save variable name for later assignment

					// fetch variable value from symbol table
					if (!symbol_table[var_name]) {
						terminal.error(`variable ${var_name} is not defined.`, current_token[2], false);
						return;
					}
					operand1 = [symbol_table[var_name]["type"], symbol_table[var_name]["value"]];

					switch (operand2[1]) {
						case "NUMBR":
						case "NUMBAR":
							answer = Number(operand1[1]);
							if (operand2[1] === "NUMBR") {
								answer = Math.floor(answer);
							}
							if (isNaN(answer)) {
								terminal.error(`cannot cast ${operand1[1]} to ${operand2[1]}.`, current_token[2], false);
								return;
							}
							break;
						case "TROOF":
							answer = operand1[1] ? true : false;
							break;
						case "YARN":
							switch (operand1[0]) {
								case "TROOF":;
									answer = operand1[1] ? "WIN" : "FAIL";
									break;
								case "NOOB":
									answer = "";
									break;
								default:
									answer = operand1[1].toString();
							}
							break;
					}

					symbol_table[var_name]["type"] = operand2[1];
					symbol_table[var_name]["value"] = answer;
					break;

				// if and switch commands
				case "WTF?":
					condition_stack.push({
						"IT": { ...symbol_table["IT"] },
						"cases": [],
						"skip": false,
						// "antiskip": false,
						"superskip": false
					});
					csd++;
					// if a child condition has a parent that skips, child will skip as well
					if (csd !== 0 && condition_stack[csd - 1]["skip"]) {
						condition_stack[csd]["superskip"] = true;
						condition_stack[csd]["skip"] = true;
					}
					console.log("WTF/O_RLY CONDITION STACK:")
					console.table(condition_stack)
					break;

				case "O_RLY?":
					condition_stack.push({
						"IT": { ...symbol_table["IT"] },
						"cases": [],
						"skip": false,
						"antiskip": false,
						"superskip": false
					});
					csd++;
					// if a child condition has a parent that skips, child will skip as well
					if (csd !== 0 && condition_stack[csd - 1]["skip"]) {
						condition_stack[csd]["superskip"] = true;
						condition_stack[csd]["skip"] = true;
					}
					console.log("WTF/O_RLY CONDITION STACK:")
					console.table(condition_stack)
					break;

				case "YA_RLY":
				case "NO_WAI":
					// determine the skip value depending on the IT
					if(!condition_stack[csd]["superskip"]) {
						switch (current_token[0]) {
							case "YA_RLY":
								condition_stack[csd]["skip"] = condition_stack[csd]["IT"]["value"] ? false : true;
								break;
							case "NO_WAI":
								condition_stack[csd]["skip"] = !condition_stack[csd]["IT"]["value"] ? false : true;
								break;
						}
						// console.log("here", condition_stack[csd]["skip"], condition_stack[csd]["IT"])
					}
					console.table(condition_stack)
					break;

				case "MEBBE":
					operand1 = buffer.pop();
					// determine the skip value depending on the IT and the operand
					if(!condition_stack[csd]["superskip"]) {
						condition_stack[csd]["skip"] = !operand1[1];
					}
					console.table(condition_stack)
					break;

				case "OMG":
					// console.log("inside omg", skip)
					console.log(condition_stack, csd)

					operand1 = buffer.pop();

					// console.log(cases_stack)
					if (condition_stack[csd]["cases"].includes(operand1[1])) {
						terminal.error(`OMG literal must be unique at ${operand1[1]}`, current_token[2], false);
						return;
					}
					condition_stack[csd]["cases"].push(operand1[1]);

					// if case matches, enable antiskip, disable skip, if antiskip is enabled, ignore the case
					if (condition_stack[csd]["antiskip"] || condition_stack[csd]["IT"]["value"] === operand1[1]) {
						condition_stack[csd]["antiskip"] = true;
						if(!condition_stack[csd]["superskip"]) {
							condition_stack[csd]["skip"] = false;
						}
					}
					// case doesnt match, enable skip
					else {
						condition_stack[csd]["skip"] = true;
					}

					console.log("omg", condition_stack[csd]["skip"])
					break;

				case "OMGWTF":
					console.table(condition_stack)
					// execute default only if superskip is disabled
					if (!condition_stack[csd]["superskip"]) {
						condition_stack[csd]["skip"] = false;
					}
					else {
						condition_stack[csd]["skip"] = true;
					}

					break;

				case "GTFO":
					// GTFO ends a function with return 0 only if outside a switch statement
					// only switch statements have an antiskip key
					if(function_name && (csd === -1 || condition_stack[csd] && "antiskip" in condition_stack)) {
						function_symbol_tables[`${function_name}#${++f_id}`] = symbol_table;
						
						return ["NUMBR", 0];
					}

					// this will execute on the first GTFO from a matching case
					// enables superskip to skip the rest of the switch block
					if(condition_stack[csd]["antiskip"]) {
						condition_stack[csd]["skip"] = true;
						condition_stack[csd]["antiskip"] = true;
						condition_stack[csd]["superskip"] = true;
					}
					// condition_stack[csd]["skip"] = true;
					// condition_stack[csd]["antiskip"] = false;
					break;

				case "OIC":
					condition_stack.pop();
					csd--;
					console.log("OIC CONDITION STACK:")
					console.table(condition_stack)
					break;

				// loop commands
				case "IM_IN_YR":
					console.log("here")
					var label = buffer.pop();
					console.log(label)
					var operation = buffer.pop();
					var variable = buffer.pop();
					var til_wile = buffer.pop();
					var expr = buffer.pop();			// this expresson is already evaluated
					// console.log(label, operation, variable, til_wile, expr)

					// push a new loop to the stack if stack is empty or a new loopident is encountered
					if (lsd === -1 || loop_stack[lsd]["loopident"] !== label[1]) {
						loop_stack.push({
							"loopident": label[1],
							"start_index": prev_index,
							"iter_varident": variable ? variable[1] : null, // null if infinite loop
							"next_iter_value": null,
							"skip": false
						});
						lsd++;

						// if a child loop has a parent that skips, child will skip as well
						if (lsd !== 0 && loop_stack[lsd - 1]["skip"]) {
							loop_stack[lsd]["skip"] = true;
						}

						// make loop infinite (add a times_looped counter) if there is no operation
						if (!operation) {
							loop_stack[lsd]["times_looped"] = 1;
						}
					}

					/* ========== FOR INFINITE LOOP ========== */
					// increment times_looped counter and check if it exceeds max loop iterations
					if (loop_stack[lsd]["times_looped"]) {
						loop_stack[lsd]["times_looped"]++;

						if (loop_stack[lsd]["times_looped"] > 420) {
							loop_stack[lsd]["skip"] = true;
							terminal.write("Maximum loop iterations for infinite loop reached. Loop terminated.");
						}
						break;
					}

					/* ========== FOR NON-INFINITE LOOP ========== */
					// test if variable[1] exists on the symbol table
					if (!symbol_table[variable[1]]) {
						terminal.error(`variable ${variable[1]} is not defined.`, current_token[2], false);
						return;
					}

					// test if variable[1] can be converted to number
					if (isNaN(symbol_table[variable[1]]["value"])) {
						terminal.error(`cannot increment or decrement non-integer types.`, current_token[2], false);
						return;
					}

					// expr is true on TIL, go out of the loop
					if (expr[1] && til_wile[0] === "TIL") {
						loop_stack[lsd]["skip"] = true;

						console.log("til ending...")
						break;
					}
					// expr is false on WILE, go out of the loop
					if (!expr[1] && til_wile[0] === "WILE") {
						loop_stack[lsd]["skip"] = true;

						console.log("wile ending...")
						break;
					}

					switch (operation[0]) {
						case "UPPIN_YR":
							loop_stack[lsd]["next_iter_value"] = symbol_table[variable[1]]["value"] + 1;
							break;
						case "NERFIN_YR":
							loop_stack[lsd]["next_iter_value"] = symbol_table[variable[1]]["value"] - 1;
							break;
					}

					console.log("IM_IN_YR LOOP STACK:")
					console.table(loop_stack)
					break;

				case "IM_OUTTA_YR":
					var label = buffer.pop();
					
					// jump back to start of the loop if skip is disabled
					if (!loop_stack[lsd]["skip"]) {
						// update the iter_varident with the new value if not infinite loop
						if (loop_stack[lsd]["iter_varident"]) {
							symbol_table[loop_stack[lsd]["iter_varident"]]["value"] = loop_stack[lsd]["next_iter_value"];
						}
						index = loop_stack[lsd]["start_index"];
					}
					// exit the loop if skip is enabled
					else {
						loop_stack.pop();
						lsd--;
						console.log("IM_OUTTA_YR LOOP STACK:")
						console.table(loop_stack)
						break;
					}
					break;
				
				case "HOW_IZ_I":
					while (buffer.length) {
						operands.push(buffer.pop());
					}

					function_identifier = operands.shift()[1];

					var args_list = [];
					for (var i = 0; i < operands.length; i++) {
						args_list.push(operands[i][1]);
					}

					function_table[function_identifier] = {
						"args_list": args_list,
						"start_index": index,
						"end_index": null
					};

					function_skip = true;
					break;

				case "IF_U_SAY_SO":
					// return the IT and break if inside a function
					if(function_name) {
						function_symbol_tables[`${function_name}#${++f_id}`] = symbol_table;
						return [symbol_table["IT"]["type"], symbol_table["IT"]["value"]];
						break;
					}
					// define the end_index if in main function
					function_skip = false;
					function_table[function_identifier]["end_index"] = index - 1;
					
					function_identifier = null;
					console.log("FUNCTIONS:")
					console.table(function_table)
					break;
				
				case "I_IZ":
					while (buffer.length) {
						operands.push(buffer.pop());
					}

					var function_to_be_called = operands.shift()[1];

					var args_values = [];
					for (var i = 0; i < operands.length; i++) {
						if (operands[i][0] === "VARIDENT") {
							if (!symbol_table[operands[i][1]]) {
								terminal.error(`variable ${operands[i][1]} is not defined.`, current_token[2], false);
								return;
							}
							operands[i] = [
								symbol_table[operands[i][1]]["type"],
								symbol_table[operands[i][1]]["value"]
							];
						}
						args_values.push({
							"type": operands[i][0],
							"value": operands[i][1]
						});
					}
// console.log("calling", function_to_be_called)
// console.log(function_table[function_to_be_called]["args_list"])
					if (args_values.length !== function_table[function_to_be_called]["args_list"].length) {
						terminal.error(`function ${function_to_be_called} expects ${function_table[function_to_be_called][args_list].length} arguments, instead saw ${args_values.length}`, current_token[2], false);
						return;
					}

					var args_to_be_passed = {}

					function_table[function_to_be_called]["args_list"].forEach((key, i) => 
						args_to_be_passed[key] = args_values[i]
					);

					// TODO make this functional
					if (Object.keys(function_symbol_tables).length > 420) {
						terminal.error("Maximum recursion depth reached.", current_token[2], false);
					}

					// run the function by calling semantiAnalyzer on the function code block
					var return_value = await semanticAnalyzer(
						main_tokens.slice(
							function_table[function_to_be_called]["start_index"],
							function_table[function_to_be_called]["end_index"]
						),
						function_to_be_called,
						args_to_be_passed
					);

					stack.push(return_value);
					break;

				case "FOUND_YR":
					// variable name to be returned
					function_symbol_tables[`${function_name}#${++f_id}`] = symbol_table;
					
					operand1 = buffer.pop()
					if (operand1[0] === "VARIDENT") {
						return [symbol_table[operand1[1]]["type"], symbol_table[operand1[1]]["value"]];
					}
					return operand1;
					break;
			}
			// console.log(csd);
			// console.log(condition_stack)

			// console.table(stack)
			// console.log("buffer:", buffer)
			// console.log(return_to_IT)
		}

		// store the last token's value to IT
		if (return_to_IT) {
			// if last token is a VARIDENT, store its value to IT
			if (current_token[0] === "VARIDENT") {
				if (!symbol_table[current_token[1]]) {
					terminal.error(`Error: variable ${current_token[1]} is not defined.`);
					return;
				}
				current_token = [
					symbol_table[current_token[1]]["type"],
					symbol_table[current_token[1]]["value"]
				];
			}
			symbol_table["IT"]["type"] = current_token[0];
			symbol_table["IT"]["value"] = current_token[1];
		}
	}
	console.log("SYMBOL TABLE of ", function_name ? function_name : "main");
	console.table(symbol_table);
	//console.table(symbol_table['IT'].value);

	// in the absence of any explicit break, when the end of the code block is reached, the value in IT is returned.
	if(function_name) {
		function_symbol_tables[`${function_name}#${++f_id}`] = symbol_table;
		return symbol_table["IT"];
	}
	// set main symbol table to the symbol table if function is main
	else {
		main_symbol_table = symbol_table;
		addTable();
		document.getElementById("executebutton").disabled = false;
		console.log(function_symbol_tables)
	}
}