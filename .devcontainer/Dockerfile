ARG NODE_VERSION=18
FROM mcr.microsoft.com/devcontainers/typescript-node:${NODE_VERSION}
ARG USERNAME=node
ARG ZSH_PLUGINS=""
ARG OMZSH_CUSTOM_PLUGINS=""

# Create dir for vscode extension
RUN mkdir -p /home/$USERNAME/.vscode-server/extensions \
  && chown -R $USERNAME /home/$USERNAME/.vscode-server

# Persist zsh history
RUN SNIPPET="export PROMPT_COMMAND='history -a' && export HISTFILE=/commandhistory/.zsh_history" \
  && mkdir /commandhistory \
  && touch /commandhistory/.zsh_history \
  && chown -R $USERNAME /commandhistory \
  && echo "$SNIPPET" >> "/home/$USERNAME/.zshrc"

# Install custom oh-my-zsh plugins from OMZSH_CUSTOM_PLUGINS
COPY ./.devcontainer/install-zsh-plugins.sh .
RUN ./install-zsh-plugins.sh "${OMZSH_CUSTOM_PLUGINS}" "/home/${USERNAME}/.oh-my-zsh/custom/plugins"

# Activate zsh plugins from ZSH_PLUGINS
RUN sed -i -e "s/plugins=.*/plugins=(git ${ZSH_PLUGINS})/g" /home/$USERNAME/.zshrc
