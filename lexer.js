var gui_tokens = [];
var interpreter_tokens = [];

class LexicalAnalyzer {
	constructor(code) {
		this.code = code;
		this.buffer = "";
		this.tokens = [];
		this.line_number = 1;
	}

	eat() {
		this.buffer += this.code[0];
		this.code = this.code.substring(1);
	}

	skip() {
		this.code = this.code.substring(1);
	}

	clearBuffer() {
		this.buffer = "";
	}

	tokenize(lexeme) {
		// ignore if lexeme is empty
		if (!lexeme) return true;

		for (var element of all_pl_elements) {
			if (lexeme.match(element.regex)) {
				if (element.name === "VARIDENT" || element.name === "LOOPIDENT" || element.name === "TYPE") {
					this.tokens.push([element.name, lexeme, this.line_number]);
				}
				// remove quotes from yarn
				else if (element.name === "YARN") {
					this.tokens.push([element.name, lexeme.slice(1, -1), this.line_number]);
				}
				// convert numbr and numbar to int or float
				else if (element.name === "NUMBR" || element.name === "NUMBAR") {
					this.tokens.push([element.name, Number(lexeme), this.line_number]);
				}
				// convert WIN/FAIL to JS true/false
				else if (element.name === "TROOF") {
					this.tokens.push([element.name, lexeme === "WIN" ? true : false, this.line_number]);
				}
				else {
					this.tokens.push([element.name, null, this.line_number]);
				}
				// console.log("match is:", element.name)
				return true;
			}
		}
		terminal.error(`Unknown lexeme: ${lexeme}`, this.line_number, false);
		return false;
	}

	/**
	 * Merge multiword tokens into one token (I, HAS, A becomes I_HAS_A)
	 */
	merge() {
		var temp_line_number;
		for (var multiword of multiword_pl_elements) {
			for (var i = 0; i < this.tokens.length; i++) {
				var mergeable = false;
				for (var j = 0; j < multiword.words.length; j++) {
					if (i + j > this.tokens.length) continue;

					if (this.tokens[i + j][0] === multiword.words[j]) {
						mergeable = true;
					}
					else {
						mergeable = false;
						break;
					}
				}
				if (mergeable) {
					temp_line_number = this.tokens[i][2];
					this.tokens.splice(i, multiword.words.length - 1);
					this.tokens[i] = [multiword.name, null, temp_line_number];
				}
			}
		}
	}

	/**
	 * Convert a generic VARIDENT to LOOPIDENT if identifier is a label for loops
	 */
	convertIdent() {
		for (var i = 0; i < this.tokens.length; i++) {
			if (i + 1 > this.tokens.length) break;

			if ((this.tokens[i][0] === "IM_IN_YR" || this.tokens[i][0] === "IM_OUTTA_YR") && this.tokens[i + 1][0] === "VARIDENT") {
				this.tokens[i + 1][0] = "LOOPIDENT";
			}
			else if ((this.tokens[i][0] === "HOW_IZ_I" || this.tokens[i][0] === "I_IZ") && this.tokens[i + 1][0] === "VARIDENT") {
				this.tokens[i + 1][0] = "FUNIDENT";
			}
		}
	}

	/**
	 * Remove duplicate linebreaks, and linebreaks before HAI and after KTHXBYE
	 */
	cleanExcessLinebreaks() {
		// this filter function gets all LINEBREAK if previous token is not LINEBREAK, and all non-LINEBREAK tokens
		this.tokens = this.tokens.filter((token, i) =>
			this.tokens[i - 1] && (
				(this.tokens[i - 1][0] === "LINEBREAK" && token[0] !== "LINEBREAK") ||
				this.tokens[i - 1][0] !== "LINEBREAK"
			)
		);

		// remove LINEBREAK before HAI and after KTHXBYE
		if (this.tokens[0] && this.tokens[0][0] === "LINEBREAK") {
			this.tokens.shift();
		}
		if (this.tokens[this.tokens.length - 1] && this.tokens[this.tokens.length - 1][0] === "LINEBREAK") {
			this.tokens.pop();
		}
	}

	/**
	 * Replaces all LOLCODE's special characters with their JavaScript counterparts if they are in a YARN
	 */
	replaceSpecialCharacters() {
		this.tokens = this.tokens.map(token => {
			if(token[0] === "YARN") {
				return [
					token[0],
					token[1].replace(/:\)|:>|:o|:"|::|:/gi, matched =>
						special_characters[matched]
					),
					token[2]
				]
			}
			else return token;
		});
	}

	/**
	 * Get a version of the tokens without the linebreaks
	 * This will be shown on the GUI lexemes table
	 */
	getGUITokens() {
		gui_tokens = this.tokens.filter(token =>
			token[0] !== "LINEBREAK"	
		);
	}

	/**
	 * Get a version of the tokens without the comments and ,  and ...
	 * This is still stored in this.tokens because it still needs to be cleaned by cleanExcessLinebreaks()
	 * It will be stored later in the gloabl interpreter_tokens
	 */
	getInterpreterTokens() {
		// remove comments and commas
		this.tokens = this.tokens.filter(token => 
			!(comment_tokens.includes(token[0]) || token[0] === ",")
		);

		// remove ... together with the LINEBREAK after
		for (var i = 0; i < this.tokens.length; i++) {
			if(this.tokens[i][0] === "..." && this.tokens[i + 1][0] === "LINEBREAK") {
				this.tokens.splice(i, 2);
			}
		}
	}

	start() {
		var is_string = false;
		var is_comment = false;
		var is_multiline_comment = false;
		var valid_lexeme = true;

		while (this.code.length) {
			// console.log('buffer:', this.buffer)

			// ============== current character is not a space or tab ==============
			if (this.code[0] !== " " && this.code[0] !== "\t") {
				// character is a newline
				if (this.code[0] === "\n" || this.code[0] === "\r") {
					// TLDR then a linebreak ends a multiline comment
					// TLDR may contain leading tabs, so a regex without caret is used
					if (this.buffer.match(/TLDR$/)) {
						if(is_multiline_comment) {
							is_multiline_comment = false;
							this.tokens.push(["TLDR", null, this.line_number]);
						}
						else {
							terminal.error("matching OBTW for TLDR not found.", this.line_number, false);
							return;
						}
					}
					else if (is_comment) {
						this.tokens.push(["BTW_COMMENT", this.buffer, this.line_number]);
					}
					else if (is_multiline_comment) {
						this.tokens.push(["OBTW_COMMENT", this.buffer, this.line_number]);
					}
					else if (is_string) {
						terminal.error(`Unterminated string literal: ${this.buffer}`, this.line_number, false);
					}
					// BTW immediately followed by a LINEBREAK
					else if (this.buffer === "BTW") {
						this.tokens.push(["BTW", null, this.line_number]);
						this.clearBuffer();
					}
					// OBTW immediately followed by a LINEBREAK
					else if (this.buffer === "OBTW") {
						if (!this.tokens.length || this.tokens[this.tokens.length - 1][0] === "LINEBREAK") {
							is_multiline_comment = true;

							// push the OBTW token
							this.tokens.push(["OBTW", null, this.line_number]);
						}
						else {
							terminal.error("No statement before OBTW allowed", this.line_number, false);
							return;
						}
					}
					// buffer contains a ... , push ... token
					else if (this.buffer.slice(-4, -1) === "...") {
						valid_lexeme = this.tokenize(this.buffer.slice(4, -1));	// remove the ...

						this.tokens.push(["...", null, this.line_number]);		// push ... lexeme
						this.tokens.push(["LINEBREAK", null, this.line_number]);
					}
					// buffer contains a comma, push a soft LINEBREAK
					else if (this.buffer[this.buffer.length - 1] === ",") {
						valid_lexeme = this.tokenize(this.buffer.slice(0, -1));	// remove the comma

						this.tokens.push([",", null, this.line_number]);		// push comma lexeme
						this.tokens.push(["LINEBREAK", null, this.line_number]);
					}
					// buffer contains an exclamation, push a !
					else if (this.buffer[this.buffer.length - 1] === "!") {
						valid_lexeme = this.tokenize(this.buffer.slice(0, -1));	// remove the exclamation

						this.tokens.push(["!", null, this.line_number]);
						this.tokens.push(["LINEBREAK", null, this.line_number]);
					}
					// tokenize the buffer
					else {
						valid_lexeme = this.tokenize(this.buffer);
					}
					this.tokens.push(["LINEBREAK", null, this.line_number]);
					// linebreak automatically ends a BTW comment
					is_comment = false;

					this.skip();	// skip the newline
					this.clearBuffer();
					this.line_number++;
				}
				// double quotes outside of comment
				else if (this.code[0] === '"' && !(is_comment || is_multiline_comment)) {
					// ending " detected, end the string and tokenize
					if (is_string) {
						if (this.buffer[this.buffer.length - 1] !== ":") {
							is_string = false;

							this.eat();
							valid_lexeme = this.tokenize(this.buffer);
							this.clearBuffer();

							// skip if the next character is space or tab
							if(this.code[0] === " " || this.code[0] === "\t") {
								this.skip();
							}
							// continue;
						}
					}
					// starting " detected
					else {
						is_string = true;
						this.eat();
					}
				}
				// character is not whitespace, eat it
				else {
					this.eat();
				}
			}
			// ============== current character is a space or tab ==============

			else if (this.tokens[this.tokens.length - 1] && this.tokens[this.tokens.length - 1][0] === "TLDR") {
				terminal.error("TLDR must not be followed by a statement.", this.line_number, false);
				return;
			}
			// don't detect BTW and OBTW inside comments
			else if (!is_comment && this.buffer === "BTW") {
				is_comment = true;

				// push the BTW token
				this.tokens.push(["BTW", null, this.line_number]);

				this.skip(); // skip the space
				this.clearBuffer();
			}
			else if (!is_comment && this.buffer === "OBTW") {
				// console.log(this.tokens)
				if (this.tokens[this.tokens.length - 1][0] === "LINEBREAK") {
					is_multiline_comment = true;

					// push the OBTW token
					this.tokens.push(["OBTW", null, this.line_number]);

					this.skip(); // skip the space (or linebreak)
					this.clearBuffer();
				}
				else {
					terminal.error("No statement before OBTW allowed", this.line_number, false);
					return;
				}
			}
			else if (this.buffer === "TLDR") {
				if (is_multiline_comment) {
					is_multiline_comment = false;
					this.tokens.push(["TLDR", null, this.line_number]);
				}
				else {
					terminal.error("Matching OBTW for TLDR not found.", this.line_number, false);
					return;
				}
			}
			// current character is a space but is inside a string or comment
			else if (is_string || is_comment || is_multiline_comment) {
				this.eat();
			}
			// TODO ADD THE ... push here
			// buffer contains a comma, push a soft LINEBREAK
			else if (this.buffer[this.buffer.length - 1] === ",") {
				valid_lexeme = this.tokenize(this.buffer.slice(0, -1));	// remove the comma

				this.tokens.push([",", null, this.line_number]);
				this.tokens.push(["LINEBREAK", null, this.line_number]);

				this.skip(); // skip the space
				this.clearBuffer();
			}
			// buffer contains an exclamation, push a !
			else if (this.buffer[this.buffer.length - 1] === "!") {
				valid_lexeme = this.tokenize(this.buffer.slice(0, -1));	// remove the exclamation

				this.tokens.push(["!", null, this.line_number]);

				this.skip(); // skip the space
				this.clearBuffer();
			}
			// current character is a space, tokenize the buffer
			else {
				valid_lexeme = this.tokenize(this.buffer);

				this.skip(); // skip the space
				this.clearBuffer();
			}

			// end if an invalid lexeme is detected
			if (!valid_lexeme) {
				console.log("here")
				return;
			}
		}
		// tokenize the last buffer content (KTHXBYE)
		this.tokenize(this.buffer);

		// ERROR CHECKING
		if (is_string) {
			terminal.error("Matching closing quotes for YARN not found.", this.line_number, false);
			return;
		}
		if (is_multiline_comment) {
			terminal.error("Matching TLDR for OBTW not found.", this.line_number, false);
			return;
		}

		// console.table(this.tokens)
		this.merge();
		this.replaceSpecialCharacters();
		this.convertIdent();

		this.getGUITokens();

		this.getInterpreterTokens();
		this.cleanExcessLinebreaks();

		interpreter_tokens = this.tokens;

		// console.log("FINAL INTERPRETER TOKENS:");
		// console.table(interpreter_tokens);
	}
}
