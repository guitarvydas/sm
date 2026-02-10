            
            
            
            def enter_idle ():
                pass
            def step_idle ():
                if x < 0 :
                    exit_idle ()
                    enter_wait_for_zero_recrossing ()
                elif x > self.width :
                    exit_idle ()
                    enter_wait_for_w_recrossing ()
                else :
                    Loop ()
                
            def exit_idle ():
                pass
            
            def enter_wait_for_zero_recrossing ():
                Reverse ()
                Loop ()
                
            def step_wait_for_zero_recrossing ():
                if x >= 0 :
                    Loop ()
                    exit_wait_for_zero_recrossing ()
                    enter_idle ()
                
            def exit_wait_for_zero_recrossing ():
                pass
            
            def enter_wait_for_w_recrossing ():
                Reverse ()
                Loop ()
                
            def step_wait_for_w_recrossing ():
                if x <= self.width :
                    Loop ()
                    exit_wait_for_w_recrossing ()
                    enter_idle ()
                
            def exit_wait_for_w_recrossing ():
                pass
            
            {
                "idle": idle,
                "wait for zero recrossing": wait_for_zero_recrossing,
                "wait for w recrossing": wait_for_w_recrossing,
                
            } [self.state] ()
            
            
