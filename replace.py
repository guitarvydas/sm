import sys

if len(sys.argv) != 3:
    print("Usage: replace.py <find> <replace>", file=sys.stderr)
    sys.exit(1)

x, y = sys.argv[1], sys.argv[2]
sys.stdout.write(sys.stdin.read().replace(x, y))
