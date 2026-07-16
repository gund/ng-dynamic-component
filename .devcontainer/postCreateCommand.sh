#!/usr/bin/env zsh

echo "Updating CA certificates..."
sudo update-ca-certificates

echo "Fixing permissions for $USER..."
sudo chown -R $USER:$USER ~/.config ~/.cache ~/.local
sudo chown -R $USER:$USER /workspaces

echo "Installing PNPM dependencies..."
npm i

