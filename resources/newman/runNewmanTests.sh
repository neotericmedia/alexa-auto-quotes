#!/bin/bash

var_path=`dirname "$0"`
cwd=`pwd`
cd scripts;
for d in * ; do
    newman run "$d" -e "$cwd"/env/local.postman_environment 
done
