emitState(Diagram,IDstate):-
    state(did=Diagram, id=IDstate, parent=_, value=NamePlusCode),
    format("state ~q{~n", [NamePlusCode]),
    forall(
        transition(did=Diagram, id=_, parent=_, source=IDstate, target=Dest, code=C),
	state(did=Diagram ... need to parse off enter/step/exit/name from C ...
        format("%nextif {~q}~n",[C,Dest])
    ),
    format("}~n",[]).

emitAllStates(Diagram):-
    forall(
	state(did=Diagram, id=IDstate, parent=_, value=_),
	emitState(Diagram,IDstate)
    ).

emit:-
    consult("8.pl"),
    forall(
	diagram(did=Diagram),
	emitAllStates(Diagram)
    ).
