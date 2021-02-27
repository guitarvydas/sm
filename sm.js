// npm install ohm-js
const grammar = `
SM {

  Main = StateMachine
  StateMachine = NameSection InputSection OutputSection MachineSection
  NameSection = "name" ":" Name
  InputSection = "inputs" ":" InputPinNames
  OutputSection = "outputs" ":" OutputPinNames
  
  MachineSection = Header State+ Trailer
  Header = "machine" MachineName ":"
  Trailer = "end" "machine"

  State = "state" Name ":" EntrySection Transition*
  EntrySection = "entry" ":" string
  Transition = "on" Name ":" "next" Name



  keyword = "machine" | "name" | "inputs" | "outputs" | "end" | "state" | "entry" | "on" | "next" | "default"
  InputPinNames = nameList
  OutputPinNames = nameList
  MachineName = Name
  StateName = Name
  InputPinReference = Name
  StateReference = Name
  Name = ~keyword id
  nameList = (~keyword id delim)+



  id = firstId followId*
  firstId = "A".."Z" | "a".."z" | "_"
  followId = firstId

  string = "\\"" stringChar* "\\""
  stringChar =
        escapedChar                                
     |  anyStringChar
  escapedChar = "\\\\" any
  anyStringChar = ~"\\"" any
 
  delim = (" " | "\\t" | "\\n")+
  
}
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
    var text = getNamedFile("-");
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


var result = main ();
console.log (result.toString ());
