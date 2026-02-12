// decode.mjs
import { decode } from 'html-entities';


let state_names = [];

function legalize (s) {
    return s.replace (/ /g, "_");
}

function memo_state_name (s) {
    state_names.push (s);
    return "";
}

function create_stepper () {
    let result = "\n\n❴{\n";
    state_names.forEach (name => {
	result += `\n"${name}": ${legalize (name)},`;
    });
    result += "}\n❵ [self.state] ()\n";
    return result;
}

function decodeHTML(s) {
    let prev;
    do { prev = s; s = decode(s); } while (s !== prev);
    return s;
}
