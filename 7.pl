
transition( did=i4kYwzf, id=i13, parent=i1, source=i17, target=i20).
trCode( did=i4kYwzf, id=i14, parent=i13, value="x > w<div>{reverse ()}</div>").
transition( did=i4kYwzf, id=i15, parent=i1, source=i17, target=i23).
trCode( did=i4kYwzf, id=i16, parent=i15, value="x < 0<div>{reverse ()}</div>").
state( did=i4kYwzf, id=i17, parent=i1, value="idle").
transition( did=i4kYwzf, id=i18, parent=i1, source=i20, target=i17).
trCode( did=i4kYwzf, id=i19, parent=i18, value="x <= w").
state( did=i4kYwzf, id=i20, parent=i1, value="wait for w re-crossing").
transition( did=i4kYwzf, id=i21, parent=i1, source=i23, target=i17).
trCode( did=i4kYwzf, id=i22, parent=i21, value="x >= 0").
state( did=i4kYwzf, id=i23, parent=i1, value="wait for zero re-crossing").
