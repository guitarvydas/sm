# Overview

![diagram](looptest.drawio.png)

Convert a diagram to `.sm` format.

```
state "idle" {
    {}
    {
        %next "wait for w recrossing" %when (e.x >= e.w) {e.reverse ()}
        %next "wait for zero recrossing" %when (e.x <= 0) {e.reverse ()}
        }
    {}
    }
state "wait for w recrossing" {
    {}
    {
        %next "idle" %when (e.x < e.w)
        }
    {}
    }
state "wait for zero recrossing" {
    {}
    {
        %next "idle" %when (e.x >= 0)
        }
    {}
    }```


Then, convert the `.sm` file to some programming language, e.g. Python.

```
class SM_looper:
    
    def enter_idle (self):
        e = self.env
        self.state = "idle"
        
    def step_idle (self):
        e = self.env
        if (e.x >= e.w):
            self.exit_idle ()
            e.reverse ()
            self.enter_wait_for_w_recrossing ()
        if (e.x <= 0):
            self.exit_idle ()
            e.reverse ()
            self.enter_wait_for_zero_recrossing ()
    def exit_idle (self):
        e = self.env
        pass
    def enter_wait_for_w_recrossing (self):
        e = self.env
        self.state = "wait for w recrossing"
        
    def step_wait_for_w_recrossing (self):
        e = self.env
        if (e.x < e.w):
            self.exit_wait_for_w_recrossing ()
            self.enter_idle ()
    def exit_wait_for_w_recrossing (self):
        e = self.env
        pass
    def enter_wait_for_zero_recrossing (self):
        e = self.env
        self.state = "wait for zero recrossing"
        
    def step_wait_for_zero_recrossing (self):
        e = self.env
        if (e.x >= 0):
            self.exit_wait_for_zero_recrossing ()
            self.enter_idle ()
    def exit_wait_for_zero_recrossing (self):
        e = self.env
        pass
    def __init__ (self, env):
        self.env = env
        self.state = None
        self.enter_idle ()
    def step (self):
        {
            "idle": self.step_idle,
            "wait for w recrossing": self.step_wait_for_w_recrossing,
            "wait for zero recrossing": self.step_wait_for_zero_recrossing,
        } [self.state] ()
        
```


# usage
`./@make`

# install
`./INSTALL.bash`

