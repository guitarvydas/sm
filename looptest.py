
class SM_looptest:
    
    def enter_idle (self):
        self.state = "idle"
        
    def step_idle (self):
        if (x > w):
            self.exit_idle ()
            reverse ()
            self.enter_wait_for_w_recrossing ()
        if (x < 0):
            self.exit_idle ()
            reverse ()
            self.enter_wait_for_zero_recrossing ()
    def exit_idle (self):
        pass
    def enter_wait_for_w_recrossing (self):
        self.state = "wait for w recrossing"
        
    def step_wait_for_w_recrossing (self):
        if (x <= w):
            self.exit_wait_for_w_recrossing ()
            self.enter_idle ()
    def exit_wait_for_w_recrossing (self):
        pass
    def enter_wait_for_zero_recrossing (self):
        self.state = "wait for zero recrossing"
        
    def step_wait_for_zero_recrossing (self):
        if (x >= 0):
            self.exit_wait_for_zero_recrossing ()
            self.enter_idle ()
    def exit_wait_for_zero_recrossing (self):
        pass
    def __init__ (self):
        self.state = None
        self.enter_idle ()
    def step (self):
        {
            "idle": self.step_idle,
            "wait for w recrossing": self.step_wait_for_w_recrossing,
            "wait for zero recrossing": self.step_wait_for_zero_recrossing,
        } [self.state] ()
        
sm = SM_looptest ()

