SRC = looptest.sm
dev:
	./pbp/t2t.bash . ./pbp sm.ohm sm-metapy.rwr support.mjs - <$(SRC) | python ./mpy2dent.py | python rebrace.py | node pbp/tas/indenter.mjs | python rigidindent.py '            ' > out.py
	cat out.py
all:
	./pbp/t2t.bash . ./pbp sm.ohm sm-metapy.rwr support.mjs - <$(SRC) | python ./mpy2dent.py | python rebrace.py | node pbp/tas/indenter.mjs | python rigidindent.py '            ' > out.py
	cat out.py

identity:
	./pbp/t2t.bash . ./pbp identity-sm.ohm identity-sm.rwr support.mjs - <$(SRC)
