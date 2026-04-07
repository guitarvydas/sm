import sys
import kernel0d as zd

def handler (eh,mev):
    try:
        zd.send (eh, "x", "25", mev)
    except (e):
        zd.send (eh, "✗", "*** error in tester.py ***", mev)
        
def instantiate (reg,owner,name, arg, template_data):
    name_with_id = zd.gensymbol ( "tester")
    return zd.make_leaf ( name_with_id, owner, None, arg, handler)

# define template
def install (reg):
    zd.register_component (reg, zd.mkTemplate ("tester", None, instantiate))


