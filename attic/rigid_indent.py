import sys

for line in sys.stdin:
    modified = sys.argv [1] + line
    sys.stdout.write(modified)
