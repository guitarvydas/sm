I want to modify the SWIPL code below to find every transition for every state.
```
:- discontiguous transitionCode/3.
:- discontiguous transition/4.

transition(id="13",parent="1",source="17",target="20").
transitionCode( id="14", parent="13", value="x > w<div>{reverse ()}</div>").
transition(id="15",parent="1",source="17",target="23").
transitionCode(id="16",parent="15",value="x<0 {reverse()}").
state( id="17", parent="1", value="idle").

assocCode(S,Name,D,C):-
    transitionCode(id=_,parent=T,value=C),
    transition(id=T,parent=_,source=S,target=D),
    state(id=S,parent=_,value=Name).
```

---

what should this .mr file be tranformed to to be queryable by SWIPL?
```
group {
    diagram {
	id="vXABhurDzZuKG-4kYwzf"
	transition { id="yK0KRwzggwMbkE22hVbx-13" parent="yK0KRwzggwMbkE22hVbx-1" source="yK0KRwzggwMbkE22hVbx-17" target="yK0KRwzggwMbkE22hVbx-20"}
	transitionCode { id="yK0KRwzggwMbkE22hVbx-14" parent="yK0KRwzggwMbkE22hVbx-13" value="x > w<div>{reverse ()}</div>"}
	transition { id="yK0KRwzggwMbkE22hVbx-15" parent="yK0KRwzggwMbkE22hVbx-1" source="yK0KRwzggwMbkE22hVbx-17" target="yK0KRwzggwMbkE22hVbx-23"}
	transitionCode { id="yK0KRwzggwMbkE22hVbx-16" parent="yK0KRwzggwMbkE22hVbx-15" value="x < 0<div>{reverse ()}</div>"}
	state { id="yK0KRwzggwMbkE22hVbx-17" parent="yK0KRwzggwMbkE22hVbx-1" value="idle"}
	transition { id="yK0KRwzggwMbkE22hVbx-18" parent="yK0KRwzggwMbkE22hVbx-1" source="yK0KRwzggwMbkE22hVbx-20" target="yK0KRwzggwMbkE22hVbx-17"}
	transitionCode { id="yK0KRwzggwMbkE22hVbx-19" parent="yK0KRwzggwMbkE22hVbx-18" value="x <= w"}
	state { id="yK0KRwzggwMbkE22hVbx-20" parent="yK0KRwzggwMbkE22hVbx-1" value="wait for w re-crossing"}
	transition { id="yK0KRwzggwMbkE22hVbx-21" parent="yK0KRwzggwMbkE22hVbx-1" source="yK0KRwzggwMbkE22hVbx-23" target="yK0KRwzggwMbkE22hVbx-17"}
	transitionCode { id="yK0KRwzggwMbkE22hVbx-22" parent="yK0KRwzggwMbkE22hVbx-21" value="x >= 0"}
	state { id="yK0KRwzggwMbkE22hVbx-23" parent="yK0KRwzggwMbkE22hVbx-1" value="wait for zero re-crossing"}
    }}
```
