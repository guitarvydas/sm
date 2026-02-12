transition( id="yK0KRwzggwMbkE22hVbx-13", parent="yK0KRwzggwMbkE22hVbx-1", source="yK0KRwzggwMbkE22hVbx-17", target="yK0KRwzggwMbkE22hVbx-20").
transitionCode( id="yK0KRwzggwMbkE22hVbx-14", parent="yK0KRwzggwMbkE22hVbx-13", value="x > w<div>{reverse ()}</div>").
state( id="yK0KRwzggwMbkE22hVbx-17", parent="yK0KRwzggwMbkE22hVbx-1", value="idle").

lab(P,C,D,Name):-
    transitionCode(id=_,parent=P,value=C),
    transition(id=P,parent=_,source=S,target=D),
    state(id=S,parent=_,value=Name).
