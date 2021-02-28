
const _in = 2;
const _no = 3;
const _yes = 4;

const _off = 6;
const _on = 9;
function Toggle () {
  this.state = _off;
  this.enter = function (next_state) {
    switch (next_state) {
      
case _off:
fire (_no, true);
this.state = _off;
break;

case _on:
fire (_yes, true);
this.state = _on;
break;
    }
  }
  this.step = function (event) {
    switch (this.state) {
      
      case _off:
	switch (event.tag) {
	
      case _in: 
	this.enter (_on);
	break;
		
	};
      break;


      case _on:
	switch (event.tag) {
	
      case _in: 
	this.enter (_off);
	break;
		
	};
      break;

    };
 }
}



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

