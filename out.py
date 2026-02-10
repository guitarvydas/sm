            
            
            
            def enter_idle ():
                pass
            def step_idle ():
                if x < 0 :
                    exit_idle ()
                    enter_wait for zero recrossing ()
                elif x > self.width :
                    exit_idle ()
                    enter_wait for w recrossing ()
                else :
                    Loop ()
                
            def exit_idle ():
                pass
            
            def enter_wait_for zero recrossing ():
                Reverse ()
                Loop ()
                
            def step_wait for zero recrossing ():
                if x >= 0 :
                    Loop ()
                    exit_wait for zero recrossing ()
                    enter_idle ()
                
            def exit_wait for zero recrossing ():
                pass
            
            def enter_wait_for w recrossing ():
                Reverse ()
                Loop ()
                
            def step_wait for w recrossing ():
                if x <= self.width :
                    Loop ()
                    exit_wait for w recrossing ()
                    enter_idle ()
                
            def exit_wait for w recrossing ():
                pass
            
            {
                "idle": idle,
                "wait for zero recrossing": wait_for zero recrossing,
                "wait for w recrossing": wait_for w recrossing,
                
            } [self.state] ()
            
            
