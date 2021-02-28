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

///// stacks & stacks of lists /////
function stack () {
    this._stack = [null];
    this.beginScope = function () {};
    this.endScope = function () { this._stack.pop (); };
    this.pop = function () { return this._stack.pop (); };
    this.top = function () { var index = this._stack.length - 1; return this._stack[index]; };
    this.set = function (val) { var a = this.top (); a.push (val); };
    this.topToString = function () {
	var a = this.top ();
	var s = a.map (item => { return item.toString (); });
	return s.join ('');
    };
    this.toString = function () {
	var as = this._stack.map (a => { return a.toString (); });
	return as.join ('');
    };
}

function stackList () {
    this._stack = [[]];
    this.beginScope = function () {};
    this.endScope = function () { this._stack.pop (); };
    this.pop = function () { return this._stack.pop (); };
    this.top = function () { var index = this._stack.length - 1; return this._stack[index]; };
    this.append = function (val) { var a = this.top (); a.push (val); };
    this.topToString = function () {
	var a = this.top ();
	var s = a.map (item => { return item.toString (); });
	return s.join ('');
    };
    this.toString = function () {
	var as = this._stack.map (a => { return a.topToString (); });
	return as.join ('');
    };
}

//////////////////


//////////// transpiler ////////

var counterStack;
var nameStack;
var preStack;
var codeStack;
function resetStacks () { 
    countStack = new stack ();
    countStack.set (0);
    nameStack = new StackList ();
    preStack = new StackList ();
    codeStack = new StackList ();
}

function incrementCount () { countStack.set (1 + countStack.top ()); }
function gen () {
    var i = countStack.top;
    countStack.set (1 + i);
    return i;
}

function createTranspiler (parser) {
    var semantics = parser.createSemantics ();
    semantics.addOperation (
	"js",
	{
	    Main : function (_1) { // StateMachine
		_1.js ();
	    },
	    
	    StateMachine : function (_1, _2, _3, _4) { // NameSection InputSection OutputSection MachineSection
		_1.js (), _2.js (), _3.js (), _4.js ();
	    },
	    
	    NameSection : function (_1, _2, _3) { // "name" ":" Name
		_1.js (), _2.js (), _3.js ();
		preStack.append (`const ${nameStack.pop ()} = ${gen ()};`};
	    },
	    InputSection : function (_1, _2, _3) { _1.js (), _2.js (), _3.js (); }, // "inputs" ":" InputPinNames
	    OutputSection : function (_1, _2, _3) { _1.js (), _2.js (), _3.js (); }, // "outputs" ":" OutputPinNames
	    
	    MachineSection : function (_1, _2s, _3, _4) { // Header State+ Default Trailer
		// <nameStack <nameStack <codeStack <codeStack >codeStack
		_1.js (), _2.js (), _3.js (), _4.js ();
		var defaultState = nameStack.pop ();
		var machineName = nameStack.pop ();
		var stateCode = codeStack.pop ();
&&&		var entryCode = codeStack.pop ();
		var smCode = `
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
		codeStack.push (smCode);
	    },
	    
	    Header : function (_1, _2, _3) { _1.js (), _2.js (), _3.js (); }, // "machine" MachineName ":"
	    Trailer : function (_1, _2) { _1.js (), _2.js ();}, // "end" "machine"
	    
	    State : function (_1, _2, _3, _4, _5s) {  // "state" StateName ":" EntrySection Transition*
		_1.js (), _2.js (), _3.js (), _4.js (), _5s.js ();
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
		_1.js (), _2.js (), _3.js ();
		preStack.push (`const ${nameStack.pop ()} = ${gensym ()};`);
	    },
	    
	    keyword : function (_1) { _1.js ()}, // "machine" | "name" | "inputs" | "outputs" | "end" | "state" | "entry" | "on" | "next" | "default"
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

resetStacks ();
transpiler (tree).js ();

console.log (preStack.toString () + codeStack.toString ());

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

