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


const { log } = require('console');
var fs = require ('fs');

function getNamedFile (fname) {
    if (fname === undefined || fname === null || fname === "-") {
        return fs.readFileSync (0, 'utf-8');
    } else {
        return fs.readFileSync (fname, 'utf-8');
    }   
}

///// stacks /////

function trimBrackets (s) {
    return s
        .replace (/\[/g, '')
        .replace (/\]/g, '');
}

function simpleStack () {
    this._icStack = [];
    this.push = function (n) {
        this._icStack.push (n);
    };
    this._checkUnderflow = function () {
        if (this._icStack.length <= 0) {
            throw "initialConditions: can't happen";
        };
    };
    this.pop = function () {
        this._checkUnderflow ();
        this._icStack.pop ();
    };
    this.dup = function () { 
        this._checkUnderflow ();
        var val = this._icStack.pop ();
        this._icStack.push (val);
        this._icStack.push (val);
    };
    this.top = function () {
        this._checkUnderflow ();
        var index = this._icStack.length - 1;
        return this._icStack[index];
    };
}

var initialConditions = simpleStack;

function showp (name) {
    return false;
    //return (name == "NameSection");
};

function stackChecker () {
    this._list = [];
    this.add = function (name) { this._list.push (name); };
    this._depth = 0;
    this._spaces = function () {
        var i = this._depth;
        while (i > 0) {
            process.stdout.write ('.');
            i -= 1;
        }
    };
    this.enter = function (name) {
        if (showp (name)) {
            this._spaces ();
            process.stdout.write ("enter: " + name);
            process.stdout.write ('\n');
        };
        this._depth += 1;
        this._list.forEach (stack  => {
            stack.enter ();
        })
    };
    this.exit = function (name, obj) {
        if (showp (name)) {
            this._spaces ();
            console.log ("exit: " + name);
        };
        this._list.forEach (stack  => {
            stack.exitCheck (obj);
            stack.exit (obj);
        })
        this._depth -= 1;
    };
    this.debug = function (msg) {
        var s = this._list.map (stack  => {
            return stack.debug ();
        });
        console.log (msg + " " + s.join(''));
    };
}

var sc = new stackChecker ();

///// an item can be a single item or a list (Array.isArray) //
function stack (ty) {
    this._stack = [];
    this._type = ty;
    this._markmemo = new simpleStack ();
    this.lengthAsString = function () { 
        return `${this._type}[${this._stack.length}]`; 
    };
    this.pop = function () { 
        if (this._stack.length <= 0) {
            throw "pop: can't happen";
        };
        return this._stack.pop (); 
    };
    this._topIndex = function () { return this._stack.length - 1; };
    this.top = function () { var index = this._topIndex (); return this._stack[index]; };
    this.nth = function (n) { 
        var index = (this._topIndex ()) - n; 
        if (index < 0) {
            throw "nth: can't happen";
        }
        return this._stack[index]; };
    this.npop = function (n) { 
        while (n > 0) { 
            this.pop (); 
            n -= 1; 
        }
    };
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
    this.mark = function () { this._markmemo.push (this._topIndex ()); };
    this.collapse = function () {
        // collapse all entries into a single array, between here and mark
        var a = [];
        var i = this._topIndex ();
        var memoIndex = this._markmemo.top ();
        while (i > memoIndex) {  // collapse only items since mark
            a.push (this.pop());
            i -= 1;
        };  
        this.push (a.reverse ());
        this._markmemo.pop ();
    };
    this.collapseAndSquashToString = function () {
	this.collapse ();
	var a = this.top ();
	this.pop ();
	this.push (a.join (''));
    },
    this._initialConditions = new initialConditions ();
    this._fail = function (msg) { 
        console.log (msg);
        throw '** stack error **';
    };
    this._forMe = function (obj) { return (this._type in obj); };
    this._currentDepth = function () {
        return this._stack.length;
    }
    this._checkChange = function (n) {
        var currDepth = this._currentDepth ();
        var currentDiff = currDepth - this._initialConditions.top ();
        if (currentDiff !== n) {
            console.log (`** ${this._type} expected a change of ${n} but got ${currentDiff} (depth=${currDepth})`);
            this._fail (`** ${this._type} expected a change of ${n} but got ${currentDiff} (depth=${currDepth})`);
        }
    };
    
    this.enter = function () { 
        this._initialConditions.push (this._currentDepth ());
    };
    this.exit = function (obj) { 
        /*ignore obj*/ 
        this._initialConditions.pop ();
    };
    this.exitCheck = function (obj) {
        if (this._forMe (obj)) {
            var expected = obj[this._type];
            this._checkChange (expected);
        } else {
            this._checkChange (0);
        };
    };

    this.debug = function () {
        return this.lengthAsString () + `${this._initialConditions.top ()} `;
    }

}

//////////////////


//////////// transpiler ////////

var count__stack;
var delim__stack;
var name__stack;
var pre__stack;
var code__stack;
var entry__stack;
var step__stack;
var transition__stack;
var string__stack;
var primitive__stack;
var char__stack;
var id__stack;
var state__stack;
var machine__stack;

function resetStacks () { 
    count__stack = new stack ("count");
    sc.add (count__stack);
    count__stack.push (0);
    
    name__stack = new stack ("name");
    sc.add (name__stack);
    
    pre__stack = new stack ("pre");
    sc.add (pre__stack);

    code__stack = new stack ("code");
    sc.add (code__stack);

    step__stack = new stack ("step");
    sc.add(step__stack);

    entry__stack = new stack ("entry");
    sc.add (entry__stack);

    transition__stack = new stack ("transition");
    sc.add (transition__stack);

    string__stack = new stack ("string");
    sc.add (string__stack);

    primitive__stack = new stack ("primitive");
    sc.add (primitive__stack);

    char__stack = new stack ("char");
    sc.add (char__stack);

    delim__stack = new stack ("delim");
    sc.add (delim__stack);

    id__stack = new stack ("id");
    sc.add (id__stack);

    machine__stack = new stack ("machine");
    sc.add (machine__stack);
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
                sc.enter ('Main');
                _1.js ();
                var c = code__stack.top ();
                code__stack.pop ();
                code__stack.push (c);
                sc.exit ('Main', {code: 1});
            },
            
            StateMachine : function (_1, _2, _3, _4) {
                // NameSection InputSection OutputSection MachineSection // >> code
		//  NameSection >> name,
		//  InputSection >> pre,
		//  OutputSection >> pre,
		//  MachineSection >> pre, machine
                sc.enter ('StateMachine');
                _1.js ();
                _2.js (); 
                _3.js (); 
                _4.js ();
                var name = name__stack.top ();
                var inputs = pre__stack.nth (2);
                var outputs = pre__stack.nth (1);
                var states  = pre__stack.nth (0);
                var machine = machine__stack.top ();
                code__stack.push (states + inputs + outputs + machine);
                // # name [pre] [pre] machine code
                name__stack.npop (1);
                pre__stack.npop (3);
                machine__stack.npop (1);
                sc.exit ('StateMachine', {code: 1});
            },
            
            NameSection : function (_1, _2, _3) { // "name" ":" Name // >> name
                sc.enter ('NameSection');
                _1.js (); 
                _2.js (); 
                primitive__stack.npop (2);
                _3.js ();
                var nm = name__stack.top ();
                name__stack.npop (1);
                name__stack.push (nm);
                sc.exit ('NameSection', {name: 1});
            },
            InputSection : function (_1, _2, _3) {  // "inputs" ":" InputPinNames
                sc.enter ('InputSection');
                _1.js (); 
                _2.js (); 
                primitive__stack.npop (2); 
                _3.js ();
                var p = pre__stack.top ();
                pre__stack.npop (1);
                pre__stack.push (p);
                sc.exit ('InputSection', {pre: 1});
            },
            OutputSection : function (_1, _2, _3) { // "outputs" ":" OutputPinNames
                sc.enter ('OutputSection');
                _1.js (); 
                _2.js (); 
                _3.js (); 
                var p = pre__stack.top ();
                pre__stack.npop (1);
                pre__stack.push (p);
                primitive__stack.npop (2); 
                sc.exit ('OutputSection', {pre: 1});
            },
            
            MachineSection : function (_1, _2s, _3, _4) { // Header State+ Default Trailer
                // >> machine
                sc.enter ('MachineSection');
                _1.js ();  // >> name
                {
		    pre__stack.mark ();
                    step__stack.mark ();
                    entry__stack.mark ();
                    _2s.js (); // >> [pre] [entry] [step]
                    step__stack.collapseAndSquashToString ();
                    entry__stack.collapseAndSquashToString ();
		    pre__stack.collapseAndSquashToString ();
                }
                _3.js ();  // >> name
                _4.js ();  // >> primitive
                // name state name primitive
                var machineName = name__stack.nth (1);
                var defaultState = name__stack.nth (0);
                var stepCode = step__stack.nth (0);
                var entryCode = entry__stack.nth (0);
                var mCode = `
                    function ${machineName} () {
                        this.state = ${defaultState};
                        this.enter = function (nextState) {
                        switch (nextState) {
                            ${entryCode}
                          };
                        };
                        this.step = function (event) {
                        switch (this.state) {
                            ${stepCode}
                        };
                      }
                    }
                    `;
                name__stack.npop (2);
                step__stack.npop (1);
                entry__stack.npop (1);

                machine__stack.push (mCode);
                sc.exit ('MachineSection', {pre: 1, machine: 1});
            },
            
            Header : function (_1, _2, _3) {  // "machine" MachineName ":" // >> name
                sc.enter ('Header');
                _1.js (); _2.js (); _3.js (); 
                // # primitive name primitive
                primitive__stack.npop (2);
                // # name
                var n = name__stack.top ();
                name__stack.npop (1);
                name__stack.push (n);
                sc.exit ('Header', {name: 1});
            },
            Trailer : function (_1, _2) { 
                sc.enter ('Trailer');
                _1.js (); 
                _2.js (); 
                primitive__stack.npop (2);
                sc.exit ('Trailer',{});
            }, // "end" "machine"
            
            State : function (_1, _2, _3, _4, _5s) {  
                // "state" StateName ":" EntrySection Transition*
                // >> entry step
                sc.enter ('State');
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
		pre__stack.push (`\nconst ${name} = ${gen ()};`);

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

		entry__stack.push (entrycode);
		step__stack.push (stepcode);

                sc.exit ('State', {pre: 1, entry:1, step: 1});
            },

            EntrySection : function (_1, _2, _3) { 
                // "entry" ":" string 
                // >> entry
                sc.enter ('EntrySection');
                _1.js (); _2.js (); _3.js ();
                var s = string__stack.top ();
                var eCode = s;

                primitive__stack.npop (2);
                string__stack.npop (1);
                entry__stack.push (s);
                sc.exit ('EntrySection',{entry: 1});
            },

            Transition : function (_1, _2, _3, _4, _5) {
                // "on" Name ":" "next" Name // >> transition
                sc.enter ('Transition');
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
                sc.exit ('Transition',{transition: 1});
            },
            
            Default : function (_1 ,_2, _3) { // "default" ":" Name // >> {Name}
                sc.enter ('Default');
                _1.js ();
                _2.js ();
                _3.js ();
                // # primitive primitive name
                primitive__stack.npop (2);
                // # name
                var n = name__stack.top ();
                name__stack.npop (1);
                name__stack.push (n);
                sc.exit ('Default',{name: 1});
            },
            
            keyword : function (_1) { 
                sc.enter ('keyword');
                _1.js (); 
                primitive__stack.npop (1); 
                sc.exit ('keyword',{});
            }, // "machine" | "name" | "inputs" | "outputs" | "end" | "state" | "entry" | "on" | "next" | "default" //  >> primitive
            InputPinNames : function (_1) { 
                sc.enter ('InputNames');
                _1.js ()
                var p = pre__stack.top ();
                pre__stack.npop (1);
                pre__stack.push (p);
                sc.exit ('InputNames', {pre: 1});
            }, // nameList // >> {nameList}
            OutputPinNames : function (_1) { 
                sc.enter ('OutputNames');
                _1.js ();
                var p = pre__stack.top ();
                pre__stack.npop (1);
                pre__stack.push (p);
                sc.exit ('OutputNames',{pre: 1});
            }, // nameList // >> {nameList}
            MachineName : function (_1) { 
                sc.enter ('MachineName');
                _1.js ();
                var n = name__stack.top ();
                name__stack.npop (1);
                name__stack.push (n);
                sc.exit ('MachineName',{name: 1});
            }, // Name // >> name
            StateName : function (_1) {
                sc.enter ('StateName');
                _1.js ()
                var n = name__stack.top ();
                name__stack.npop (1);
                name__stack.push (n);
                sc.exit ('StateName',{name: 1});
            }, // Name //  >> name
            InputPinReference : function (_1) {
                sc.enter ('InputReference');
                _1.js ();
                var n = name__stack.top ();
                name__stack.npop (1);
                name__stack.push (n);
                sc.exit ('InputReference',{name: 1});
            }, // Name // >> name
            StateReference : function (_1) { 
                sc.enter ('StateReference');
                _1.js ();
                var n = name__stack.top ();
                name__stack.npop (1);
                name__stack.push (n);
                sc.exit ('StateReference',{name: 1});
            }, // Name //  >> name
            Name : function (_1) { // match(~keyword id) /  >> name
                sc.enter ('Name');
                _1.js ();
                var id = id__stack.top ();
                name__stack.push (id);
                id__stack.npop (1);
                sc.exit ('Name',{name: 1});
            },
            nameList : function (_1s, _2s) { // (~keyword id delim)+ // >> [pre]
                sc.enter ('namelist');
                {
                    id__stack.mark ();
                    _1s.js ();
                    id__stack.collapse ();
                };
                {
                    delim__stack.mark ();
                    _2s.js ();
                    delim__stack.collapse ();
                };
		var idarray = id__stack.top ();
                delim__stack.npop (1);
		{
		    pre__stack.mark ();
		    idarray.forEach (id => { pre__stack.push (`\nconst ${id} = ${gen ()};`) });
		    pre__stack.collapseAndSquashToString ();
		};
                id__stack.npop (1);
                sc.exit ('namelist',{pre: 1});
            }, 
            
            
            
            id : function (_1, _2s) {  // firstId followId* // >> id
                sc.enter ('id');
                // console.log ("/" + _1.sourceString + "/./" + _2s.sourceString + "/");
                _1.js ();
                {
                    char__stack.mark ();
                    _2s.js ();
                    char__stack.collapse ();
                };
                var c = char__stack.nth (1);
                var cs = char__stack.nth (0);
                var name;
                if (Array.isArray (cs)) {
                    var name = `${c}${cs.join ('')}` ;
                } else {
                    var name = `${c}` ;
                };
                id__stack.push (name);
                char__stack.npop (2);
                sc.exit ('id',{id: 1});
            },
            firstId : function (_1) { 
                // match("A".."Z" | "a".."z" | "_") // >> char
                sc.enter ('firstId');
                _1.js ();
                char__stack.push (primitive__stack.top ());
                primitive__stack.npop (1);
                sc.exit ('firstId',{char: 1});
            },
            followId : function (_1) { // match(firstId) // >> char
                sc.enter ('followId');
                _1.js ();
                var c = char__stack.top ();
                char__stack.npop (1);
                char__stack.push (c);
                sc.exit ('followId',{char: 1});
            },

            string : function (_1, _2s, _3) { // "\\"" stringChar* "\\"" //  >> string
                sc.enter ('string');
                _1.js ();  // primitive
                {
                    char__stack.mark ();
                    _2s.js (); // Array[char]
                    char__stack.collapse ();
                }
                _3.js ();  // primitive
                string__stack.push (`${char__stack.top ().join ('')}`);
                primitive__stack.npop (2);
                char__stack.npop (1);
                sc.exit ('string',{string: 1});
            },
            stringChar : function (_1) { // escapedChar | anyChar // >> char
                sc.enter ('stringChar');
                _1.js ();
                var ch = char__stack.top ();
                char__stack.npop (1);
                char__stack.push (ch);
                sc.exit ('stringChar',{char: 1});
            },
            escapedChar : function (_1, _2) { // "\\\\" any // >> char
                sc.enter ('escapedChar');
                _1.js ();
                _2.js ();
                var p = primitive__stack.top ();
                primitive__stack.npop (2);
                char__stack.push (p);
                sc.exit ('escapedChar',{char: 1});
            },
            anyStringChar : function (_1) { // match(~"\\"" any) // >> char
                sc.enter ('anyStringChar');
                _1.js ();
                var p = primitive__stack.top ();
                primitive__stack.npop (1);
                char__stack.push (p);
                sc.exit ('anyStringChar',{char: 1});
            },
            
            delim : function (_1s) { // match(" " | "\\t" | "\\n")+) // >> char
                sc.enter ('delim');
                // console.log ("/" + _1s.sourceString + "/");
                {
                    primitive__stack.mark ();
                    _1s.js (); // >> ArrayOf(primitive)
                    primitive__stack.collapse ();
                };
                var value = primitive__stack.top ().join ('');
                primitive__stack.npop (1);
                delim__stack.push (value); // >> delim
                sc.exit ('delim',{delim: 1});
            },
            
            _terminal: function () { // >> primitive
                sc.enter ('_terminal');
                primitive__stack.push (this.primitiveValue);
                sc.exit ('_terminal',{primitive: 1});
            }
        });
    return semantics;
}
////////////
var text = getNamedFile("toggle.scl");
var {parser, tree} = parse (text);
var transpiler = createTranspiler (parser);

transpiler (tree).js ();

console.log (code__stack.squashToString ());

// boilerplate
console.log (`
 function fire (outputPort, value) {
  console.log ("Fire called: " + this.toString () + " output port:" + outputPort.toString () + " value:" + value.toString ());
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

//// tests ////

// var s = new stack ('test');

// s.mark ();
// s.push ('1');
// s.collapse ();
// console.log (s.toString ());

// s.mark ();
// s.push ('2');
// s.push ('3');
// s.collapse ();
// console.log(s.toString ());

// s.push ('4');
// s.mark ();
// s.push ('5');
// s.push ('6');
// console.log(s.toString ());
// s.collapse ();
// console.log(s.toString ());

// s.push ('7');
// s.mark ();
// s.push ('8');
// s.push ('9');
// s.collapse ();
// s.push ('10');
// console.log(s.toString ());

// s.push ('11');
// s.mark ();
// s.push ('12');
// s.push ('13');
// s.collapse ();
// s.push ('14');
// console.log(s.squashToString ());
