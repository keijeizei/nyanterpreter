class Terminal {
	constructor() {
		this.content = "";
		this.contentregex = null;
		this.error_encountered = false;
		this.terminal = document.getElementById("terminalDiv");
		this.dummyinput = document.getElementById("dummyinput");
	}

	updateGUI() {
		this.terminal.value = this.content;
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

	error(message, line_number, is_syntax_error) {
		this.content += is_syntax_error ? "Syntax error at line " : "Error at line ";
		this.content += line_number;
		this.content += `: ${message}`;
		
		this.error_encountered = true;
		this.updateGUI();
		
		// enable execute button if error
		document.getElementById("executebutton").disabled = false;
	}
	
	handleInput() {
		this.terminal.value = this.content + this.dummyinput.value;
	}
}
