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

allTransitions(Name, Transitions) :-
    state(id=S, parent=_, value=Name),
    findall(t(D, C), assocCode(S, Name, D, C), Transitions).

printAll :-
    state(id=S, parent=_, value=Name),
    assocCode(S, Name, D, C),
    format("~w -> ~w [~w]~n", [Name, D, C]),
    fail ; true.

allStates :-
    forall(
        state(id=S, parent=_, value=Name),
        (
            format("State: ~w~n", [Name]),
            forall(
                assocCode(S, Name, D, C),
                format("  -> ~w : ~w~n", [D, C])
            )
        )
    ).

stateTransitions(Name, Pairs) :-
    state(id=S, parent=_, value=Name),
    findall(tr(C,D), assocCode(S,Name,D,C), Pairs).
