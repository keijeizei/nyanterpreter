var gui_tokens = [];
var interpreter_tokens = [];

class LexicalAnalyzer {
	constructor(code) {
		this.code = code;
		this.buffer = "";
		this.tokens = [];
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
					this.tokens.push([element.name, lexeme]);
				}
				// remove quotes from yarn
				else if (element.name === "YARN") {
					this.tokens.push([element.name, lexeme.slice(1, -1)]);
				}
				// convert numbr and numbar to int or float
				else if (element.name === "NUMBR" || element.name === "NUMBAR") {
					this.tokens.push([element.name, Number(lexeme)]);
				}
				// convert WIN/FAIL to JS true/false
				else if (element.name === "TROOF") {
					this.tokens.push([element.name, lexeme === "WIN" ? true : false]);
				}
				else {
					this.tokens.push([element.name, null]);
				}
				// console.log("match is:", element.name)
				return true;
			}
		}
		console.log("Error: Unknown lexeme: ", lexeme);
		return false
	}

	/**
	 * Merge multiword tokens into one token (I, HAS, A becomes I_HAS_A)
	 */
	merge() {
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
					this.tokens.splice(i, multiword.words.length - 1);
					this.tokens[i] = [multiword.name, null];
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
		}
	}

	/**
	 * Remove duplicate linebreaks, and linebreaks before HAI and after KTHXBYE
	 */
	cleanExcessLinebreaks() {
		// this filter function gets all LINEBREAK if next token is not LINEBREAK, and all non-LINEBREAK tokens
		this.tokens = this.tokens.filter((token, i) =>
			(this.tokens[i + 1] &&
				(token[0] === "LINEBREAK" && this.tokens[i + 1][0] !== "LINEBREAK")
			) || token[0] !== "LINEBREAK"
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
					)
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
	 * Get a version of the tokens without the comments
	 * This is still stored in this.tokens because it still needs to be cleaned by cleanExcessLinebreaks()
	 * It will be stored later in the gloabl interpreter_tokens
	 */
	getInterpreterTokens() {
		this.tokens = this.tokens.filter(token =>
			comment_tokens.includes(token[0]) ? false : true
		);
	}

	start() {
		var is_string = false;
		var is_comment = false;
		var is_multiline_comment = false;
		var valid_lexeme = true;

		while (this.code.length) {
			// console.log('buffer:', this.buffer)

			if (this.buffer[0] === '"') {
				is_string = true;
			}
			if (this.buffer[this.buffer.length - 1] === '"') {
				is_string = false;
			}

			if (this.buffer === "BTW") {
				is_comment = true;

				// push the BTW token
				this.tokens.push(["BTW", null]);

				this.skip(); // skip the space
				this.clearBuffer();
			}
			if (this.buffer === "OBTW") {
				// console.log(this.tokens)
				if (this.tokens[this.tokens.length - 1][0] === "LINEBREAK") {
					is_multiline_comment = true;

					// push the OBTW token
					this.tokens.push(["OBTW", null]);

					this.skip(); // skip the space (or linebreak)
					this.clearBuffer();
				}
				else {
					console.log("Error: No statement before OBTW allowed");
					return;
				}
			}

			// current character is not a space
			if (this.code[0] != " ") {
				// character is a tab
				if (this.code[0] == "\t") {
					// eat the tab if inside comment
					if (is_comment || is_multiline_comment) {
						this.eat();
					}
					// tokenize the buffer
					else {
						valid_lexeme = this.tokenize(this.buffer);

						this.skip(); // skip the tab
						this.clearBuffer();
					}
				}
				// character is a newline
				else if (this.code[0] === "\n" || this.code[0] === "\r") {
					// TLDR then a linebreak ends a multiline comment
					// TLDR may contain leading tabs, so a regex without caret is used
					if (this.buffer.match(/TLDR$/) && is_multiline_comment) {
						is_multiline_comment = false;
						this.tokens.push(["TLDR", null]);
					}
					else if (is_comment) {
						this.tokens.push(["BTW_COMMENT", this.buffer]);
					}
					else if (is_multiline_comment) {
						this.tokens.push(["OBTW_COMMENT", this.buffer]);
					}
					// tokenize the buffer
					else {
						valid_lexeme = this.tokenize(this.buffer);
					}
					this.tokens.push(["LINEBREAK", null]);
					// linebreak automatically ends a BTW comment
					is_comment = false;

					this.skip();	// skip the newline
					this.clearBuffer();
				}
				// character is not whitespace, eat it
				else {
					this.eat();
				}
			}
			// current character is a space but is inside a string or comment
			else if (is_string || is_comment || is_multiline_comment) {
				this.eat();
			}
			// current character is a space, tokenize the buffer
			else {
				valid_lexeme = this.tokenize(this.buffer);

				this.skip(); // skip the space
				this.clearBuffer();
			}

			// end if an invalid lexeme is detected
			if (!valid_lexeme) {
				return;
			}
		}
		// tokenize the last buffer content (KTHXBYE)
		this.tokenize(this.buffer);

		// ERROR CHECKING
		if (is_string) {
			console.log("Error: Matching closing quotes for YARN not found.");
			return;
		}
		if (is_multiline_comment) {
			console.log("Error: Matching TLDR for OBTW not found.");
			return;
		}

		// console.log("RAW TOKENS:", this.tokens)
		this.merge();
		this.replaceSpecialCharacters();
		this.convertIdent();

		this.getGUITokens();

		this.getInterpreterTokens();
		this.cleanExcessLinebreaks();

		interpreter_tokens = this.tokens;

		console.log("FINAL INTERPRETER TOKENS:");
		console.table(interpreter_tokens);
	}
}
