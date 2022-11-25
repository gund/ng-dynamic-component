# Contributing guide

Thank you for investing your time in contributing to this project!

Read our [Code of Conduct](/CODE_OF_CONDUCT.md) to keep our community approachable and respectable.

## New contributor guide

To get an overview of the project, please read the [README](/README.md).

Here are some resources to help you get started with open source contributions:

- [GitHub flow](https://docs.github.com/en/get-started/quickstart/github-flow)
- [Collaborating with pull requests](https://docs.github.com/en/github/collaborating-with-pull-requests)

## Issues

### Create a new issue

If you spot a problem in this project, [search if an issue already exists](https://docs.github.com/en/github/searching-for-information-on-github/searching-on-github/searching-issues-and-pull-requests#search-by-the-title-body-or-comments).

If a related issue doesn't exist, you can open a new issue using a relevant [issue form](https://github.com/gund/ng-dynamic-component/issues/new/choose).

### Solve an issue

Scan through our [existing issues](https://github.com/gund/ng-dynamic-component/issues) to find one that interests you.
You can narrow down the search using `labels` as filters.
See [Labels](https://github.com/github/docs/blob/main/contributing/how-to-use-labels.md) for more information.
As a general rule, we don’t assign issues to anyone but it has an assignee - it's already being worked on by someone else so you should probably skip it.
If you find an issue to work on, you are welcome to open a PR with a fix.

## Make Changes

### Environment

It is important to meet environment requirements in order to execute commands locally.

There are 2 ways to do that:

1. Use [Github Codespaces](https://docs.github.com/en/codespaces) to make changes directly online where everything is preconfigured (Recommended)
2. Using docker you can boot a dev container and connect to it from VSCode using [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) which will have everything ready
3. Manually install required dependencies on your local device:
   - Install NodeJS v16+
   - Install NPM v8+

### Steps to make changes

1. Fork the repository
2. Install dependencies (`npm install`)
3. Create a new branch
4. Make the changes
5. Update/add unit tests related to changes
6. Make sure all unit tests (`npm run test`) and build pass (`npm run build`)
7. Commit changes (preferably following conventional changelogs format `npm run ct`)

### Open pull request

When you're finished with the changes, create a pull request, also known as a PR.

- Add descriptive summary of your changes and motivation
- Don't forget to [link PR to an issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue) if you are solving one
- We may ask for changes to be made before a PR can be merged, either using suggested changes or pull request comments
- As you update your PR and apply changes, mark each conversation as [resolved](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/commenting-on-a-pull-request#resolving-conversations).

### Your PR is merged!

Congratulations! We thank you for your contribution!
