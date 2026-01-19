import sys

for line in sys.stdin:
    modified = line.replace("〖\n", "{⤷\n").replace("〗", "⤶\n}")
    sys.stdout.write(modified)
