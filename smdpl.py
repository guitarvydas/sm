import sys
import kernel0d as zd

[palette, env] = zd.initialize_from_files (sys.argv[3:])
top = zd.start (arg=sys.argv[1], part_name=sys.argv[2], palette=palette, env=env)
