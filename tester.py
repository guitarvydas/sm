import looptest

uut = looptest.SM_looptest () # uut = unit under test

x = 0
w = 100

def reverse ():
    print (f'reverse')

print (uut.state)
uut.step ()
print (uut.state)


