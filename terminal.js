class Terminal {
	constructor() {
		this.content = "";
		this.terminal = document.getElementById("terminal");
	}

	updateGUI() {
		this.terminal.innerHTML = this.content;
	}

	clear() {
		this.content = "";
		this.updateGUI();
	}

	write(output) {
		this.content += output;
		this.updateGUI();
	}

	error(message) {
		this.content = message;
		this.updateGUI();
	}
}