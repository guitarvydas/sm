import sys
import looptest

w = 100

def reverse():
    print(f'reverse')

uut = looptest.SM_looptest(context=sys.modules['__main__'])

for x in list(range(0, 126, 21)) + list(range(100, -26, -21)) + list(range(-21, 51, 21)):
    print(f'x={x:4d}  state={uut.state}')
    uut.step()
