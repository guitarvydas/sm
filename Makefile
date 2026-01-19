SRC = looptest.sm
all:
	./pbp/t2t.bash . ./pbp sm.ohm sm.rwr support.mjs - <$(SRC) | python ./pbp/tas/mpy2dent.py | node pbp/tas/indenter.mjs

identity:
	./pbp/t2t.bash . ./pbp identity-sm.ohm identity-sm.rwr support.mjs - <$(SRC)
