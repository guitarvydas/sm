:- discontiguous transitionCode/3.
:- discontiguous transition/4.

transition(id="yK0KRwzggwMbkE22hVbx-13",parent="yK0KRwzggwMbkE22hVbx-1",source="yK0KRwzggwMbkE22hVbx-17",target="yK0KRwzggwMbkE22hVbx-20").
transitionCode( id="yK0KRwzggwMbkE22hVbx-14", parent="yK0KRwzggwMbkE22hVbx-13", value="x > w<div>{reverse ()}</div>").
transition(id="yK0KRwzggwMbkE22hVbx-15",parent="yK0KRwzggwMbkE22hVbx-1",source="yK0KRwzggwMbkE22hVbx-17",target="yK0KRwzggwMbkE22hVbx-23").
transitionCode(id="yK0KRwzggwMbkE22hVbx-16",parent="yK0KRwzggwMbkE22hVbx-15",value="x<0 {reverse()}").
state( id="yK0KRwzggwMbkE22hVbx-17", parent="yK0KRwzggwMbkE22hVbx-1", value="idle").

assocCode(Tr,C,S,D):-
    transitionCode(id=_,parent=Tr,value=C),
    transition(id=Tr,parent=_,source=S,target=D).
