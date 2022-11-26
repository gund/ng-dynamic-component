#!/usr/bin/env bash

PLUGINS=${PLUGINS:-""}
OMZSH_PLUGINS=${OMZPLUGINS:-""}
USERNAME=${USERNAME:-$_REMOTE_USER}

if [ "$USERNAME" = "root" ]; then
  USER_LOCATION="/root"
else
  USER_LOCATION="/home/$USERNAME"
fi

ZSH_CONFIG="$USER_LOCATION/.zshrc"
OMZSH_PLUGINS_LOCATION="$USER_LOCATION/.oh-my-zsh/custom/plugins"

# Install custom oh-my-zsh plugins from OMZSH_PLUGINS
currdir=$(pwd)
mkdir -p $OMZSH_PLUGINS_LOCATION
cd $OMZSH_PLUGINS_LOCATION

plugins=( ${OMZSH_PLUGINS} )

for plugin in "${plugins[@]}"
do
  git clone $plugin
done

cd $currdir

# Activate zsh plugins from PLUGINS
sed -i -e "s/plugins=.*/plugins=(git ${PLUGINS})/g" "$ZSH_CONFIG"
