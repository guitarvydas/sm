# Overview

Convert a diagram to `.sm` format.

Then, convert the `.sm` file to some programming language, e.g. Python.

# status 2026-03-04

conversion of `looptest.drawio` to `looptest.sm` runs
- steps 1-7a use {PBP}/t2t
- step 8 uses swipl
- step 9 uses PPBP/t2t
- step 10 uses swipl again
- result in `looptest.sm`

- doesn't convert the result `looptest.sm` into Python yet

# usage
`./@make`

(@make contains boilerplate, @makec is the custom script for this project)

