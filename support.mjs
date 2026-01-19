let state_names = [];

function legalize (s) {
    return s.replace (" ", "_");
}

function memo_state_name (s) {
    state_names.push (s);
    return "";
}

function create_stepper () {
    let result = "\n\n〖\n";
    state_names.forEach (name => {
	result += `"${name}": ${legalize (name)},\n`;
    });
    result += "〗 [self.state] ()\n";
    return result;
}

    
