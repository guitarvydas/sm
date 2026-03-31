#!/bin/bash
cd "${HOME}/projects/sm"
cp *.ohm "$1"
cp *.rwr "$1"
cp *.pl "$1"
cp "@makec" "$1"
cp commarpar.py "$1"
cp -R ./pbp "$1"
cp -R support.mjs "$1"
