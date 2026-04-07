import sys
import kernel0d as zd

initial_x = 25

def handler (eh,mev):
    global initial_x
    try:
        zd.send (eh, "x", str (initial_x), mev)
    except (e):
        zd.send (eh, "✗", "*** error in tester.py ***", mev)
        
def reset_handler (eh):
    global initial_x
    initial_x = 25

def instantiate (reg,owner,name, arg, template_data):
    name_with_id = zd.gensymbol ( "Tester")
    return zd.make_leaf ( name_with_id, owner, None, arg, handler, reset_handler)

# define template
def install (reg):
    zd.register_component (reg, zd.mkTemplate ("Tester", None, instantiate))


