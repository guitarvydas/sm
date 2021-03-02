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

///// stacks /////
///// an item can be a single item or a list (Array.isArray) //
function stack () {
    this._stack = [];
    this.pop = function () { return this._stack.pop (); };
    this.top = function () { var index = this._stack.length - 1; return this._stack[index]; };
    this.nth = function (n) { var index = (this._stack.length - 1) - n; return this._stack[index]; };
    this.npop = function (n) { while (n > 0) { this.pop (); n -= 1; }};
    this.push = function (val) { this._stack.push (val); };
    this.depth = function () { return this._stack.length; };
    this.squash = function (n) {
	// collect top n items into a list, pop them from the stack, push the list onto the stack
	var a = new Array ();
	while (n > 0) {
	    a.push (this._stack.pop ());
	    n -= 1;
	}
	a.reverse ();
	this.push (a);
    };
    this.squashToString = function () {
	var as = this._stack.map (a => { return a.toString (); });
	return as.reverse ().join ('\n');
    };
    this.toString = function () {
	var i = 0;
	var as = this._stack.map (a => { var n = i; i += 1; return `[${n}]: ` + a.toString (); });
	return as.reverse ().join ('\n');
    };
    this.mark = function () { this._mark = this._stack.length - 1; };
    this.collapse = function () {
	// collapse all entries into a single array, between here and mark
	var a = [];
	var i = this._stack.length - 1;
	while (i >= this._mark) {
	    a.push (this._stack.pop());
	    i -= 1;
	};
	this._stack.push (a);
    }
}

//////////////////


//////////// transpiler ////////

var count__stack;
var name__stack;
var pre__stack;
var code__stack;
var entry__stack;
var step__stack;
var transition__stack;
var string__stack;
var primitive__stack;
var char__stack;
var entry__stack;
var transition__stack;
var id__stack;
var pre__stack;
var state__stack;
var machine__stack;

function resetStacks () { 
    count__stack = new stack ();
    count__stack.push (0);
    name__stack = new stack ();
    pre__stack = new stack ();
    code__stack = new stack ();
    step__stack = new stack ();
    entry__stack = new stack ();
    transition__stack = new stack ();
    string__stack = new stack ();
    primitive__stack = new stack ();
    char__stack = new stack ();
    entry__stack = new stack ();
    transition__stack = new stack ();
    id__stack = new stack ();
    pre__stack = new stack ();
    state__stack = new stack ();
    machine_stack = new stack ();
}

function gen () {
    var i = count__stack.pop ();
    count__stack.push (1 + i);
    return i;
}

function createTranspiler (parser) {
    var semantics = parser.createSemantics ();
    semantics.addOperation (
	"js",
	{
	    Main : function (_1) { // StateMachine // >> code
		resetStacks ();
		_1.js ();
	    },
	    
	    StateMachine : function (_1, _2, _3, _4) {
		// NameSection InputSection OutputSection MachineSection // >> code
		_1.js (); _2.js (); _3.js (); _4.js ();
		var name = name__stack.top ();
		var inputs = pre__stack.nth (1);
		var outputs = pre__stack.nth (0);
		var machine = machine__stack.top ();
		// # name [pre] [pre] machine
		code__stack.push (name + inputs + outputs + machine);
		// # name [pre] [pre] machine code
		name__stack.npop (1);
		pre__stack.npop (2);
		machine__stack.npop (1);
		// # code
	    },
	    
	    NameSection : function (_1, _2, _3) { // "name" ":" Name // >> name
		_1.js (); _2.js (); _3.js ();
		primitive__stack.npop (2);
	    },
	    InputSection : function (_1, _2, _3) {  // "inputs" ":" InputPinNames
		_1.js (); _2.js (); _3.js (); 
		primitive__stack.npop (2); 
		// # pre
	    },
	    OutputSection : function (_1, _2, _3) { // "outputs" ":" OutputPinNames
		_1.js (); _2.js (); _3.js (); 
		primitive__stack.npop (2); 
		// # pre
	    },
	    
	    MachineSection : function (_1, _2s, _3, _4) { // Header State+ Default Trailer
		// >> machine
		_1.js ();  // >> name
		{
		    state__stack.mark ();
		    _2s.js (); // >> [state]
		    state__stack.collapse ();
		}
		_3.js ();  // >> name
		_4.js ();  // >> primitive
		// name state name primitive
		var machineName = name__stack.nth (1);
		var defaultState = name__stack.nth (0);
		var state = state__stack.nth (0);
		var smCode = `
function ${machineName} () {
  this.state = ${defaultState};
  this.step = function (event) {
    switch (this.state) {
      ${state}
    };
 }
}
`;
		name__stack.npop (2);
		state__stack.npop (1);
		machine__stack.push (smCode);
	    },
	    
	    Header : function (_1, _2, _3) {  // "machine" MachineName ":" // >> name
		_1.js (); _2.js (); _3.js (); 
		// # primitive name primitive
		primitive__stack.npop (2);
		// # name
	    },
	    Trailer : function (_1, _2) { _1.js (); _2.js (); primitive__stack.npop (2);}, // "end" "machine"
	    
	    State : function (_1, _2, _3, _4, _5s) {  
		// "state" StateName ":" EntrySection Transition*
		// >> entry step
		_1.js (); _2.js (); _3.js (); _4.js ();
		// # primitive {StateName} primitive entry
		{
		    transition__stack.mark ();
		    _5s.js ();
		    transition__stack.collapse ();
		};
		// # primitive {StateName} primitive entry transition

		var transitions = transition__stack.top ();
		var entry = entry__stack.top ();
		var name = name__stack.nth (0);
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
		entry__stack.npop (1);
		transition__stack.npop (1);
		name__stack.npop (1);
		primitive__stack.npop (2);
		step__stack.push (stepcode);
		entry__stack.push (entrycode);
	    },
	    EntrySection : function (_1, _2, _3) { 
		// "entry" ":" string 
		// >> entry
		_1.js (); _2.js (); _3.js ();
		// # primitive primitive string
		var s = string__stack.top ();
		var eCode = [];
		eCode.push (s);
		eCode.push ("break;");

		primitive__stack.npop (2);
		string__stack.npop (1);
		// #
		entry__stack.push (eCode);
		// # entry
	    },
	    Transition : function (_1, _2, _3, _4, _5) {
		// "on" Name ":" "next" Name // >> transition
		_1.js (); _2.js (); _3.js (); _4.js (); _5.js ();
		// # primitive {Name} primitive primitive {Name}
                var tagName = name__stack.nth (1);
		var nextStateName = name__stack.nth (0);
		var transitionCode = `
      case ${tagName}: 
	this.enter (${nextStateName});
	break;
		`;
		primitive__stack.npop (3);
		name__stack.npop (2);
		transition__stack.push (transitionCode);
	    },
	    
	    Default : function (_1 ,_2, _3) { // "default" ":" Name // >> {Name}
		_1.js ();
		_2.js ();
		_3.js ();
		// # primitive primitive name
		primitive__stack.npop (2);
		// # name
	    },
	    
	    keyword : function (_1) { _1.js (); primitive__stack.npop (1); }, // "machine" | "name" | "inputs" | "outputs" | "end" | "state" | "entry" | "on" | "next" | "default" //  >> primitive
	    InputPinNames : function (_1) { _1.js ()}, // nameList // >> {nameList}
	    OutputPinNames : function (_1) { _1.js ()}, // nameList // >> {nameList}
	    MachineName : function (_1) { _1.js ()}, // Name // >> name
	    StateName : function (_1) { _1.js ()}, // Name //  >> name
	    InputPinReference : function (_1) {_1.js () }, // Name // >> name
	    StateReference : function (_1) { _1.js () }, // Name //  >> name
	    Name : function (_1) { // match(~keyword id) /  >> name
		_1.js ();
		var id = id__stack.top ();
		name__stack.push (id);
		id__stack.npop (1);
	    },
	    nameList : function (_1s, _2s) { // (~keyword id delim)+ // >> [pre]
		{
		    id__stack.mark ();
		    _1s.js ();
		    id__stack.collapse ();
		};
		{
		    primitive__stack.mark ();
		    _2s.js ();
		    primitive__stack.collapse ();
		};
		// # id primitive
		pre__stack.push (`const ${id__stack.top ()} = ${gen ()};`);
		// # id primitive pre
		id__stack.npop (1);
		primitive__stack.npop (1);
		// # pre
	    }, 
	    
	    
	    
	    id : function (_1, _2s) {  // firstId followId* // >> name
		_1.js ();
		{
		    char__stack.mark ();
		    _2s.js ();
		    char__stack.collapse ();
		};
		// # char [char]
		var c = char__stack.nth (1);
		var cs = char__stack.nth (0);
		var name = `${c}${cs.join ('')}` ;
		name__stack.push (name);  // >> name
		char__stack.npop (2);
	    },
	    firstId : function (_1) { 
		// match("A".."Z" | "a".."z" | "_") // >> char
		_1.js ();
		// # primitive
		char__stack.push (primitive__stack.top ());
		// # primitive char
		primitive__stack.npop (1);
		// # char
	    },
	    followId : function (_1) { // match(firstId)>>char  // >> char
		_1.js ();
		// # char
	    },

	    string : function (_1, _2s, _3) { // "\\"" stringChar* "\\"" //  >> string
		_1.js ();  // primitive
		{
		    char__stack.mark ();
		    _2s.js (); // Array[char]
		    char__stack.collapse ();
		}
		_3.js ();  // primitive
		// # primitive char primitive
		string__stack.push (`${char__stack.top ().join ('')}`);
		// # primitive char primitive string
		primitive__stack.npop (2);
		char__stack.npop (1);
	    },
	    stringChar : function (_1) { // escapedChar | anyChar // >> char
		_1.js ();
		// # char
	    },
	    escapedChar : function (_1, _2) { // "\\\\" any // >> char
		_1.js ();
		_2.js ();
		// # primitive primitive
		char__stack.push (primitive__stack.top ());
		// # primitive primitive char
		primitive__stack.npop (2);
		// # char
	    },
	    anyStringChar : function (_1) { // match(~"\\"" any) // primitive >> char
		_1.js ();
		// # primitive
		char__stack.push (primitive__stack.top ());
		// # primitive char
		primitive__stack.npop (1);
		// # char
	    },
	    
	    delim : function (_1s) { // match(" " | "\\t" | "\\n")+) // >> char
		{
		    primitive__stack.mark ();
		    _1s.js (); // >> ArrayOf(primitive)
		    primitive__stack.collapse ();
		};
		var value = primitive__stack.top ().join ('');
		primitive__stack.npop (1);
		char__stack.push (value); // >> charList
	    },
	    
	    _terminal: function () { // >> primitive
		primitive__stack.push (this.primitiveValue); 
	    }
	});
    return semantics;
}
////////////
console.log (0);
var text = getNamedFile("-");
var {parser, tree} = parse (text);
console.log (1);
var transpiler = createTranspiler (parser);

console.log (2);
transpiler (tree).js ();

console.log (3);
console.log (code__stack.squashToString ());

console.log (4);
// boilerplate
// console.log (`
//  function fire (output, value) {
//   console.log ("Fire called: " + this.toString () + " output:" + output.toString () + " value:" + value.toString ());
//  }
//  function send (component, tag, value) {
//   component.step ( {tag, value} );
//  }
//  function inject (component, event) {
//   component.step (event);
//  }
//  var top = new Toggle ();
//  inject (top, {tag: _in, value: true});
//  inject (top, {tag: _in, value: true});
//  inject (top, {tag: _in, value: true});
// `);

