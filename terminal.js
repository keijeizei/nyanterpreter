class Terminal {
	constructor() {
		this.content = "";
		this.error_encountered = false;
		this.terminal = document.getElementById("terminalDiv");
	}

	updateGUI() {
		this.terminal.innerHTML = this.content;
	}

	clear() {
		this.content = "";
		this.error_encountered = false;
		this.updateGUI();
	}

	write(output) {
		this.content += output;
		this.updateGUI();
	}

	// true error_type is syntax error
	// false error_type is other errors
	error(message, line_number, is_syntax_error) {
		this.content = is_syntax_error ? "Syntax error at line " : "Error at line ";
		this.content += line_number;
		this.content += `: ${message}`;
		
		this.error_encountered = true;
		this.updateGUI();
	}
}