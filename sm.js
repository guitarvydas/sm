// npm install ohm-js
const grammar = `
<<< grammar goes here >>>
`;


function parse (text) {
    var ohm = require ('ohm-js');
    var parser = ohm.grammar (grammar);
    var result = parser.match (text);
    if (result.succeeded ()) {
	var semantics = parser.createSemantics ();
	return result;
    } else {
	console.log (parser.trace (text).toString ());
	throw "Ohm matching failed";
    }
}
function main () {
    var text = getJSON("-");
    var parsed = parse (text);
    return parsed;
}



var fs = require ('fs');

function getNamedFile (fname) {
    if (fname === undefined || fname === null || fname === "-") {
	return fs.readFileSync (0, 'utf-8');
    } else {
	return fs.readFileSync (fname, 'utf-8');
    }	
}

function getJSON (fname) {
    var s = getNamedFile (fname);
    return s;
    return (JSON.parse (s));
}


var result = main ();
console.log (result.toString ());
