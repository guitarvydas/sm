import sys
import looptest

w = 100

def reverse():
    print(f'reverse')

uut = looptest.SM_looptest(context=sys.modules['__main__'])

for x in list(range(25, 126, 25)) + list(range(100, -26, -25)) + list(range(-25, 51, 25)):
    print(f'x={x:4d}  state={uut.state}')
    uut.step()
