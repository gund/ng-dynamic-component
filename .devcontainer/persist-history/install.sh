#!/usr/bin/env bash

SHELL_NAME=${SHELLNAME:-"bash"}
USERNAME=${USERNAME:-$_REMOTE_USER}

if [ "$SHELL_NAME" = "bash" ]; then
  SHELL_CONFIG_FILE=".bashrc"
  SHELL_HISTORY_FILE=".bash_history"
elif [ "$SHELL_NAME" = "zsh" ]; then
  SHELL_CONFIG_FILE=".zshrc"
  SHELL_HISTORY_FILE=".zsh_history"
else
  echo "Unsupported shellName '$SHELL_NAME'! Please specify one of (bash, zsh)"
  exit 1
fi

if [ "$USERNAME" = "root" ]; then
  USER_LOCATION="/root"
else
  USER_LOCATION="/home/$USERNAME"
fi

# Persist zsh history
mkdir -p /usr/local/share/commandhistory
touch /usr/local/share/commandhistory/$SHELL_HISTORY_FILE
SNIPPET="export PROMPT_COMMAND='history -a' && export HISTFILE=/usr/local/share/commandhistory/$SHELL_HISTORY_FILE"
echo "$SNIPPET" >> "$USER_LOCATION/$SHELL_CONFIG_FILE"

# Create entrypoint to fix permissions inside container
tee /usr/local/share/fix-history.sh > /dev/null \
<< EOF
#!/usr/bin/env bash
sudo chown -R $USERNAME /usr/local/share/commandhistory
EOF
chmod +x /usr/local/share/fix-history.sh
