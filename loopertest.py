import sys
import kernel0d as zd

import looper

Class Env:
    def __init__ (self):
        self.x = 1
        self.reverse = rev
    def rev (eh):
        zd.send (eh, "", " ** reverse **", mev)
        ---- unfinished!!! -------
        
def handler (eh,mev):
    global x
    uut = eh.instance_data
    try:
        if mev.port == "x":
            x = int (mev.datum.v)
            uut.step ()
            zd.send (eh, "", f"state: {uut.state}", mev)
    except (e):
        zd.send (eh, "✗", "*** error in looper test.py ***", mev)

def reset_handler (eh):
    global x
    x = 1
    
def instantiate (reg,owner,name, arg, template_data):
    name_with_id = zd.gensymbol ( "Looper Tester")
    uut = looper.SM_looper(env=sys.modules['__main__']) # uut == unit under test
    return zd.make_leaf ( name_with_id, owner, uut, arg, handler, reset_handler)

# define template
def install (reg):
    zd.register_component (reg, zd.mkTemplate ("Looper Tester", None, instantiate))


