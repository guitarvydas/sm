// npm install ohm-js
const grammar = `
SM {

  Main = StateMachine
  StateMachine = NameSection InputSection OutputSection MachineSection
  NameSection = "name" ":" Name
  InputSection = "inputs" ":" InputPinNames
  OutputSection = "outputs" ":" OutputPinNames
  
  MachineSection = Header State+ Default Trailer
  Header = "machine" MachineName ":"
  Trailer = "end" "machine"
  Default = "default" ":" Name

  State = "state" StateName ":" EntrySection Transition*
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

//////////// transpiler ////////

var nameCounter;

function createTranspiler (parser) {
    var semantics = parser.createSemantics ();
    nameCounter = 0;
    semantics.addOperation (
	"js",
	{
	    Main : function (_1) { return _1.js (); }, // StateMachine
	    
	    StateMachine : function (_1, _2, _3, _4) { // NameSection InputSection OutputSection MachineSection
		var nameSection = _1.js ();
		var inputSection = _2.js ();
		var outputSection = _3.js ();
		var machineSection = _4.js ();
		return `
${inputSection}
${outputSection}
${machineSection}
`;
	    },
	    
	    NameSection : function (_1, _2, _3) { return _3.js ().name; }, // "name" ":" Name
	    InputSection : function (_1, _2, _3) { return _3.js (); }, // "inputs" ":" InputPinNames
	    OutputSection : function (_1, _2, _3) { return _3.js (); }, // "outputs" ":" OutputPinNames
	    
	    MachineSection : function (_1, _2s, _3, _4) { // Header State+ Default Trailer
		var machineName = _1.js ();
		var snippets = _2s.js ();
		var defaultState = _3.js ();
		var preamble = snippets.map (snippet => { return snippet.preamble; }).join ('\n');
		var stateCode = snippets.map (snippet => { return snippet.step; }).join ('\n');
		var entryCode = snippets.map (snippet => { return snippet.entry; }).join ('\n');		
		var smCode = `
${preamble}
function ${machineName} () {
  this.state = ${defaultState};
  this.enter = function (next_state) {
    switch (next_state) {
      ${entryCode}
    }
  }
  this.step = function (event) {
    switch (this.state) {
      ${stateCode}
    };
 }
}
`;
		return smCode;
	    },
	    
	    Header : function (_1, _2, _3) { return _2.js (); }, // "machine" MachineName ":"
	    Trailer : function (_1, _2) {return "";}, // "end" "machine"
	    
	    State : function (_1, _2, _3, _4, _5s) {  // "state" StateName ":" EntrySection Transition*
		var pair = _2.js ();
		var name = pair.name;
		var preamble = pair.preamble;
		var entry = _4.js ();
		var transitions = _5s.js ();
		var stepcode = `
      case ${name}:
	switch (event.tag) {
	${transitions}
	};
      break;
`;
		var entrycode = `
case ${name}:
${entry}
this.state = ${name};
break;`;
		return { preamble: preamble, step: stepcode, entry: entrycode, defaultState: "" };
	    },
	    EntrySection : function (_1, _2, _3) {return _3.js ()}, // "entry" ":" string
	    Transition : function (_1, _2, _3, _4, _5) { // "on" Name ":" "next" Name
                var tagName = _2.js ().name;
		var nextStateName = _5.js ().name;
		var transitionCode = `
      case ${tagName}: 
	this.enter (${nextStateName});
	break;
		`;
		return transitionCode;
	    },
	    
	    Default : function (_1 ,_2, _3) { // "default" ":" Name
		var name = _3.js ().name;
		return name;
	    },
	    
	    keyword : function (_1) {return _1.js ()}, // "machine" | "name" | "inputs" | "outputs" | "end" | "state" | "entry" | "on" | "next" | "default"
	    InputPinNames : function (_1) {return _1.js ()}, // nameList
	    OutputPinNames : function (_1) {return _1.js ()}, // nameList
	    MachineName : function (_1) {return _1.js ().name}, // Name
	    StateName : function (_1) {return _1.js ()}, // Name
	    InputPinReference : function (_1) {return _1.js ().name}, // Name
	    StateReference : function (_1) {return _1.js ().name}, // Name
	    Name : function (_1) { // ~keyword id
		var name = _1.js ();
		nameCounter += 1;
		var constant = `const ${name} = ${nameCounter};`;
		return { preamble: constant, name: name };
	    },
	    nameList : function (_1s, _2s) { // (~keyword id delim)+
		var consts = _1s.js ().map (name => {
		    nameCounter += 1;
		    return `const ${name} = ${nameCounter};`;
		});
		return consts.join ('\n');
	    }, 
	    
	    
	    
	    id : function (_1, _2s) {  // firstId followId*
		var name = `${_1.js ()}${_2s.js ().join ('')}` ;
		return name;
	    },
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

// boilerplate
console.log (`
 function fire (output, value) {
  console.log ("Fire called: " + this.toString () + " output:" + output.toString () + " value:" + value.toString ());
 }
 function send (component, tag, value) {
  component.step ( {tag, value} );
 }
 function inject (component, event) {
  component.step (event);
 }
 var top = new Toggle ();
 inject (top, {tag: _in, value: true});
 inject (top, {tag: _in, value: true});
 inject (top, {tag: _in, value: true});
`);

