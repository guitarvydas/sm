const grammar = `

SM {

  stateMachine = nameSection inputSection outputSection machineSection delim*
  nameSection = "name" ":" name delim*
  inputSection = "inputs" ":" name+ delim*
  outputSection = "outputs" ":" name+ delim*
  
  machineSection = header state+ trailer
  header = "machine" name ":" delim*
  trailer = "end" delim* "machine" delim*

  state = "state" name ":" delim* entrySection delim* transition*
  entrySection = "entry" ":" string delim* 
  transition = "on" name delim* ":" delim* "next" name delim*

  inputPinName = name
  outputPinName = name
  machineName = name
  stateName = name

  inputPinReference = name
  stateReference = name

  name = delim+ ~keyword id

  keyword = "machine" | "name" | "inputs" | "outputs" | "end" | "state" | "entry" | "on" | "next" | "default"

  id = firstId followId*
  firstId = "A".."Z" | "a".."z" | "_"
  followId = firstId

  string = delim* "\\"" stringChar* "\\""
  stringChar =
        escapedChar                                
     |  anyStringChar
  escapedChar = "\\\\" any
  anyStringChar = ~"\\"" any
 
  delim = " " | "\\t" | "\\n" | ","

}

`;
