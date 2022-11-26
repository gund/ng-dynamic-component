#!/usr/bin/env bash

USERNAME=${USERNAME:-$_REMOTE_USER}

if [ "$USERNAME" = "root" ]; then
  USER_LOCATION="/root"
else
  USER_LOCATION="/home/$USERNAME"
fi

# Create dir for vscode extension
mkdir -p /usr/local/share/vscode-extensions
chown -R $USERNAME /usr/local/share/vscode-extensions

mkdir -p $USER_LOCATION/.vscode-server
ln -s /usr/local/share/vscode-extensions $USER_LOCATION/.vscode-server/extensions
chown -R $USERNAME $USER_LOCATION/.vscode-server

# Create entrypoint to fix permissions inside container
tee /usr/local/share/fix-vscode-extensions.sh > /dev/null \
<< EOF
#!/usr/bin/env bash
sudo chown -R $USERNAME /usr/local/share/vscode-extensions
EOF
chmod +x /usr/local/share/fix-vscode-extensions.sh
