import sys

x = 0
w = 100

import looptest

uut = looptest.SM_looptest(context=sys.modules['__main__']) # uut == unit under test

def reverse ():
    print (f'reverse')

print (uut.state)
uut.step ()
print (uut.state)


