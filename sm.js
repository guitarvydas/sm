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
    var cst = parser.match (text);
    if (cst.succeeded ()) {
	return {parser: parser, tree: cst};
    } else {
	console.log (parser.trace (text).toString ());
	throw "Ohm matching failed";
    }
}


var fs = require ('fs');

function getNamedFile (fname) {
    if (fname === undefined || fname === null || fname === "-") {
	return fs.readFileSync (0, 'utf-8');
    } else {
	return fs.readFileSync (fname, 'utf-8');
    }	
}

////////////
function createTranspiler (parser) {
    var semantics = parser.createSemantics ();
    semantics.addOperation (
	"js",
	{
	    Main : function (_1) { return _1.js (); }, // StateMachine
	    
	    StateMachine : function (_1, _2, _3, _4) { // NameSection InputSection OutputSection MachineSection
		var nameSection = _1.js ();
		var inputSection = _2.js ();
		var outputSection = _3.js ();
		var machineSection = _4.js ();
		return machineSection;
	    },
	    
	    NameSection : function (_1, _2, _3) {}, // "name" ":" Name
	    InputSection : function (_1, _2, _3) {}, // "inputs" ":" InputPinNames
	    OutputSection : function (_1, _2, _3) {}, // "outputs" ":" OutputPinNames
	    
	    MachineSection : function (_1, _2s, _3) { // Header State+ Trailer
		var machineName = _1.js ();
		var triples = _2s.js ();
		var stateCode = triples.map (triple => { return triple.step; }).join ('\n');
		var defaultState = triples.map (triple => { return triple.defaultState; }).join ('\n');
		var entryCode = triples.map (triple => { return triple.entry; }).join ('\n');
		
		var smCode = `
function ${machineName} () {
  this.state = null;
  this.step = function (event) {
    switch (this.state) {
      ${stateCode}
      default: ${defaultState}
    };
  this.enter = function (next_state) {
    switch (next_state) {
      ${entryCode}
    }
  }
 }
}
`;
		return smCode;
	    },
	    
	    Header : function (_1, _2, _3) { return _2.js (); }, // "machine" MachineName ":"
	    Trailer : function (_1, _2) {return "";}, // "end" "machine"
	    
	    State : function (_1, _2, _3, _4, _5s) {  // "state" Name ":" EntrySection Transition*
		var name = _2.js ();
		var entry = _4.js ();
		var transitions = _5s.js ();
		var stepcode = `case ${name}:\n${transitions}\nbreak;`;
		var entrycode = `case ${name}:\n${entry}\nbreak;`;
		return { step: stepcode, entry: entrycode, defaultState: "" };
	    },
	    EntrySection : function (_1, _2, _3) {return _3.js ()}, // "entry" ":" string
	    Transition : function (_1, _2, _3, _4, _5) { // "on" Name ":" "next" Name
                var tagName = _2.js ();
		var nextStateName = _5.js ();
		var transitionCode = `
case ${tagName}: 
  this.enter (${nextStateName});
  break;
		`;
	    },
	    
	    
	    
	    keyword : function (_1) {return _1.js ()}, // "machine" | "name" | "inputs" | "outputs" | "end" | "state" | "entry" | "on" | "next" | "default"
	    InputPinNames : function (_1) {return _1.js ()}, // nameList
	    OutputPinNames : function (_1) {return _1.js ()}, // nameList
	    MachineName : function (_1) {return _1.js ()}, // Name
	    StateName : function (_1) {return _1.js ()}, // Name
	    InputPinReference : function (_1) {return _1.js ()}, // Name
	    StateReference : function (_1) {return _1.js ()}, // Name
	    Name : function (_1) {return _1.js ()}, // ~keyword id
	    nameList : function (_1s, _2s) { // (~keyword id delim)+
		return _1s.js ().map (name => {
		    inputCounter += 1;
		    return `const ${name} = ${inputCounter};`;
		});
	    }, 
	    
	    
	    
	    id : function (_1, _2s) { return `${_1.js ()}${_2s.js ().join ('')}` }, // firstId followId*
	    firstId : function (_1) {return _1.js ()}, // "A".."Z" | "a".."z" | "_"
	    followId : function (_1) {return _1.js ()}, // firstId
	    
	    string : function (_1, _2s, _3) { return `${_2s.js ().join ('')}`; }, // "\\"" stringChar* "\\""
	    escapedChar : function (_1, _2) { return _2.js (); }, // "\\\\" any
	    anyStringChar : function (_1) {return _1.js ();}, // ~"\\"" any
	    
	    delim : function (_1s) {return _1s.js ().join (''); }, // (" " | "\\t" | "\\n")+
	    
	    _terminal: function () { return this.primitiveValue; }
	});
    return semantics;
}
////////////

var text = getNamedFile("-");
var {parser, tree} = parse (text);
var transpiler = createTranspiler (parser);
console.log (transpiler (tree).js ());
