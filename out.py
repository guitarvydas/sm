class SM_✣:
    
    def enter_idle (self):
        c = self.env
        self.state = "idle"
        
    def step_idle (self):
        c = self.env
        if (c.x >= c.w):
            self.exit_idle ()
            c.reverse ()
            self.enter_wait_for_w_recrossing ()
        if (c.x <= 0):
            self.exit_idle ()
            c.reverse ()
            self.enter_wait_for_zero_recrossing ()
    def exit_idle (self):
        c = self.env
        pass
    def enter_wait_for_w_recrossing (self):
        c = self.env
        self.state = "wait for w recrossing"
        
    def step_wait_for_w_recrossing (self):
        c = self.env
        if (c.x < c.w):
            self.exit_wait_for_w_recrossing ()
            self.enter_idle ()
    def exit_wait_for_w_recrossing (self):
        c = self.env
        pass
    def enter_wait_for_zero_recrossing (self):
        c = self.env
        self.state = "wait for zero recrossing"
        
    def step_wait_for_zero_recrossing (self):
        c = self.env
        if (c.x >= 0):
            self.exit_wait_for_zero_recrossing ()
            self.enter_idle ()
    def exit_wait_for_zero_recrossing (self):
        c = self.env
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