import sys
import kernel0d as zd

import looptester

x = 1
def handler (eh,mev):
    global x
    uut = eh.instance_data
    def reverse ():
        zd.send (eh, "", "reverse", mev)
    try:
        if mev.port == "x":
            x = int (mev.datum.v)
            uut.step ()
            zd.send (eh, "", f"state: {uut.state}", mev)
    except (e):
        zd.send (eh, "✗", "*** error in looptesterpart.py ***", mev)
        
def instantiate (reg,owner,name, arg, template_data):
    name_with_id = zd.gensymbol ( "looptester part")
    uut = looptest.SM_looptest(context=sys.modules['__main__']) # uut == unit under test
    return zd.make_leaf ( name_with_id, owner, uut, arg, handler)

# define template
def install (reg):
    zd.register_component (reg, zd.mkTemplate ("looptester part", None, instantiate))


