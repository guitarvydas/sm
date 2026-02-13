:- dynamic diagram/1.

diagram(did=i4kYwzf).

state(did=i4kYwzf, id=i17, parent=i1, value="idle").
state(did=i4kYwzf, id=i20, parent=i1, value="wait for w re-crossing").
state(did=i4kYwzf, id=i23, parent=i1, value="wait for zero re-crossing").

:- dynamic transition/6.

transition(did=i4kYwzf, id=i13, parent=i1, source=i17, target=i20, code="x > w{reverse ()};").
transition(did=i4kYwzf, id=i15, parent=i1, source=i17, target=i23, code="x < 0{reverse ()};").
transition(did=i4kYwzf, id=i18, parent=i1, source=i20, target=i17, code="x <= w").
transition(did=i4kYwzf, id=i21, parent=i1, source=i23, target=i17, code="x >= 0").

