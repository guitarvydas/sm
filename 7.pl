
transition( did="4kYwzf",id="13",parent="1",source="17",target="20").
transitionCode( did="4kYwzf",id="14",parent="13",value="x > w<div>{reverse ()}</div>").
transition( did="4kYwzf",id="15",parent="1",source="17",target="23").
transitionCode( did="4kYwzf",id="16",parent="15",value="x < 0<div>{reverse ()}</div>").
state( did="4kYwzf",id="17",parent="1",value="idle").
transition( did="4kYwzf",id="18",parent="1",source="20",target="17").
transitionCode( did="4kYwzf",id="19",parent="18",value="x <= w").
state( did="4kYwzf",id="20",parent="1",value="wait for w re-crossing").
transition( did="4kYwzf",id="21",parent="1",source="23",target="17").
transitionCode( did="4kYwzf",id="22",parent="21",value="x >= 0").
state( did="4kYwzf",id="23",parent="1",value="wait for zero re-crossing").
