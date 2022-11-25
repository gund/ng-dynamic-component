#!/bin/bash

PLUGINS=$1
LOCATION=$2

currdir=$(pwd)
mkdir -p $LOCATION
cd $LOCATION

plugins=( ${PLUGINS} )

for plugin in "${plugins[@]}"
do
  git clone $plugin
done

cd $currdir
