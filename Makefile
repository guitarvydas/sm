SRC = looptest.sm
all:
	./pbp/t2t.bash . ./pbp sm.ohm sm.rwr support.mjs - <$(SRC)
identity:
	./pbp/t2t.bash . ./pbp sm.ohm identity-sm.rwr support.mjs - <$(SRC)
