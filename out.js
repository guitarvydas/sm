
const _off = 3;
const _on = 4;
const _in = 0;
const _no = 1;
const _yes = 2;
function Toggle () {
    this.state = _off;
    this.enter = function (nextState) {
        switch (nextState) {
            
        case _off:
            fire (_no, true);
            this.state = _off;
            break;
        case _on:
            fire (_yes, true);
            this.state = _on;
            break;
        };
    };
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

