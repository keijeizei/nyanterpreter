var symbol_table = {};

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

function semanticAnalyzer(tokens) {
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

	symbol_table["IT"] = {		// initialize an IT variable
		"type": "NOOB",
		"value": null
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

		operands = [];

		// skip all commands except conditional commands when skip is enabled
		if (csd > -1 && !conditional_tokens.includes(stack[0][0])) {
			if (condition_stack[csd]["skip"]) continue;
		}

		// ignore the loop skip if command is IM IN YR/IM OUTTA YR
		if (lsd > -1 && !loop_tokens.includes(stack[0][0])) {
			if (loop_stack[lsd]["skip"]) continue;
		}

		while (stack.length) {
			current_token = stack.pop();
			console.log(current_token);
			return_to_IT = false;

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
				case "LOOPIDENT":
				case "UPPIN_YR":
				case "NERFIN_YR":
				case "TIL":
				case "WILE":
					buffer.push(current_token);
					break;

				// =============== COMMANDS ===============
				case "I_HAS_A":
					operand1 = buffer.pop(); // varident
					operand2 = buffer.pop(); // possible initialization value

					// TODO are duplicate declarations allowed?
					if (symbol_table[operand1[1]]) {
						console.log(`Error: variable ${operand1[1]} is already defined.`);
						return;
					}
					// TODO this can be removed if duplicate are not allowed
					if (operand1[1] === "IT") {
						console.log(`Error: IT variable is reserved as an implicit variable.`);
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
						symbol_table[operand1[1]] = {
							"type": operand2[0],
							"value": operand2[1]
						};
					}
					break
				case "R":
					operand1 = stack.pop();	// variable to be assigned to
					operand2 = buffer.pop();	// value to be assigned

					if (!symbol_table[operand1[1]]) {
						console.log(`Error: variable ${operand1[1]} is not defined.`);
						return;
					}

					if (operand2[0] === "VARIDENT") {
						if (!symbol_table[operand2[1]]) {
							console.log(`Error: variable ${operand2[1]} is not defined.`);
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
							console.log(`Error: variable ${operand1[1]} is not defined.`);
							return;
						}
						operand1 = [symbol_table[operand1[1]]["type"], symbol_table[operand1[1]]["value"]];
					}
					if (operand2[0] === "VARIDENT") {
						if (!symbol_table[operand2[1]]) {
							console.log(`Error: variable ${operand1[1]} is not defined.`);
							return;
						}
						operand2 = [symbol_table[operand2[1]]["type"], symbol_table[operand2[1]]["value"]];
					}

					// typecast YARN to int or float
					if (operand1[0] === "YARN") {
						if (isNaN(operand1[1])) {
							console.log(`Error: ${operand1[1]} cannot be typecasted to NUMBR or NUMBAR.`);
							return;
						}
						operand1[1] = operand1[1].includes(".") ? parseFloat(operand1[1]) : parseInt(operand1[1]);
					}
					if (operand2[0] === "YARN") {
						if (isNaN(operand2[1])) {
							console.log(`Error: ${operand2[1]} cannot be typecasted to NUMBR or NUMBAR.`);
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
							console.log(`Error: variable ${operand1[1]} is not defined.`);
							return;
						}
						operand1 = [symbol_table[operand1[1]]["type"], symbol_table[operand1[1]]["value"]];
					}
					if (operand2 && operand2[0] === "VARIDENT") {
						if (!symbol_table[operand2[1]]) {
							console.log(`Error: variable ${operand2[1]} is not defined.`);
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
							answer = (operand1[1] && operand2[1]) || (operand1[1] && operand2[1]);
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
								console.log(`Error: variable ${operands[i][1]} is not defined.`);
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

					for (var operand of operands) {
						if (operand[0] === "VARIDENT") {
							operand = [symbol_table[operand[1]]["type"], symbol_table[operand[1]]["value"]];
						}
					}

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
					stack.push(["TROOF", answer ? "WIN" : "FAIL"]);
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
							console.log(`Error: variable ${operand1[1]} is not defined.`);
							return;
						}
						operand1 = [symbol_table[operand1[1]]["type"], symbol_table[operand1[1]]["value"]];
					}

					switch (operand2[1]) {
						case "NUMBR":
						case "NUMBAR":
							answer = Number(operand1[1]);
							if (operand2[1] === "NUMBAR") {
								answer = Math.floor(answer);
							}
							if (isNaN(answer)) {
								console.log(`Error: Cannot cast ${operand1[1]} to ${operand2[1]}.`);
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
						console.log(`Error: variable ${var_name} is not defined.`);
						return;
					}
					operand1 = [symbol_table[var_name]["type"], symbol_table[var_name]["value"]];

					switch (operand2[1]) {
						case "NUMBR":
						case "NUMBAR":
							answer = Number(operand1[1]);
							if (operand2[1] === "NUMBAR") {
								answer = Math.floor(answer);
							}
							if (isNaN(answer)) {
								console.log(`Error: Cannot cast ${operand1[1]} to ${operand2[1]}.`);
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

				case "OMG":
					// console.log("inside omg", skip)
					console.log(condition_stack, csd)

					operand1 = buffer.pop();

					// console.log(cases_stack)
					if (condition_stack[csd]["cases"].includes(operand1[1])) {
						console.log(`Error: OMG literal must be unique at ${operand1[1]}`);
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
					var label = buffer.pop();
					var operation = buffer.pop();
					var variable = buffer.pop();
					var til_wile = buffer.pop();
					var expr = buffer.pop();			// this is already evaluated
					// console.log(label, operation, variable, til_wile, expr)

					// push a new loop to the stack if stack is empty or a new loopident is encountered
					if (lsd === -1 || loop_stack[lsd]["loopident"] !== label[1]) {
						loop_stack.push({
							"loopident": label[1],
							"start_index": prev_index,
							"iter_varident": variable[1],
							"next_iter_value": null,
							"skip": false
						});
						lsd++;

						// if a child condition has a parent that skips, child will skip as well
						if (lsd !== 0 && loop_stack[lsd - 1]["skip"]) {
							loop_stack[lsd]["skip"] = true;
						}
					}

					// test if variable[1] exists on the symbol table
					if (!symbol_table[variable[1]]) {
						console.log(`Error: variable ${variable[1]} is not defined.`);
						return;
					}

					// test if variable[1] can be converted to number
					if (isNaN(symbol_table[variable[1]]["value"])) {
						console.log(`Error: Cannot increment or decrement non-integer types.`);
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
						// update the iter_varident with the new value
						symbol_table[loop_stack[lsd]["iter_varident"]]["value"] = loop_stack[lsd]["next_iter_value"];
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
					console.log(`Error: variable ${current_token[1]} is not defined.`);
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
		if(symbol_table["remark"] && symbol_table["remark"]["value"] === "hu r u?2") console.log("AAAAAAAAAAAAAAaa")
	}
	console.log("SYMBOL TABLE:");
	console.table(symbol_table);
}
