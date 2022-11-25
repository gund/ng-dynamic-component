ARG NODE_VERSION=18
FROM mcr.microsoft.com/devcontainers/typescript-node:${NODE_VERSION}
ARG USERNAME=node

# Create dir for vscode extension
RUN mkdir -p /home/$USERNAME/.vscode-server/extensions \
  && chown -R $USERNAME /home/$USERNAME/.vscode-server
