const isIvy = !!process.env.RELEASE_IVY;

let config = getConfig();

if (isIvy) {
  config = applyAdjusterOn(config, {
    branches: adjustBranchesForIvy,
    plugins: adjustPluginsForIvy,
  });
}

const inflatedConfig = inflateConfig(config);

console.log(
  'Semantic Release Config:\n',
  JSON.stringify(inflatedConfig, null, 2),
);

module.exports = inflatedConfig;

function getConfig() {
  return {
    branches: [
      {
        name: 'master',
      },
      {
        name: 'next',
        prerelease: true,
      },
      {
        name: 'channel-ivy',
        prerelease: true,
      },
    ],
    plugins: [
      '@semantic-release/commit-analyzer',
      '@semantic-release/release-notes-generator',
      [
        '@semantic-release/changelog',
        {
          changelogFile: 'CHANGELOG.md',
          changelogTitle: '# ng-dynamic-component - Changelog',
        },
      ],
      [
        '@semantic-release/exec',
        {
          prepareCmd: 'npm run pack',
        },
      ],
      [
        '@semantic-release/npm',
        {
          pkgRoot: 'dist/ng-dynamic-component',
          tarballDir: 'dist',
        },
      ],
      [
        '@semantic-release/git',
        {
          message:
            'chore(release): release ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
          assets: ['CHANGELOG.md'],
        },
      ],
      [
        '@semantic-release/github',
        {
          assets: ({ plugins }) =>
            `${
              getPluginConfigBy('@semantic-release/npm', plugins).pkgRoot
            }.tgz`,
        },
      ],
    ],
  };
}

function adjustBranchesForIvy(branches) {
  branches.forEach(
    branch =>
      (branch.channel =
        branch.name === 'master' && !branch.channel
          ? 'ivy'
          : `${branch.channel || branch.name}-ivy`),
  );

  return branches;
}

function adjustPluginsForIvy(plugins) {
  const namesWhitelist = [
    '@semantic-release/commit-analyzer',
    '@semantic-release/npm',
    '@semantic-release/github',
  ];

  plugins = plugins.filter(plugin =>
    namesWhitelist.includes(getPluginName(plugin)),
  );

  getPluginConfigBy('@semantic-release/npm', plugins).pkgRoot += '-ivy';

  return plugins;
}

// ? #### HELPER FUNCTIONS ####

function getPluginName(plugin) {
  return typeof plugin === 'string' ? plugin : plugin[0];
}

function getPluginConfig(plugin) {
  return Array.isArray(plugin) ? plugin[1] : undefined;
}

function getPluginConfigBy(name, plugins) {
  return getPluginConfig(findPluginBy(name, plugins));
}

function findPluginBy(name, plugins) {
  return plugins.find(plugin => getPluginName(plugin) === name);
}

function applyAdjusterOn(config, adjuster) {
  Object.keys(adjuster).forEach(
    prop => (config[prop] = adjuster[prop](config[prop])),
  );

  return config;
}

function inflateConfig(config) {
  config.plugins = config.plugins || [];

  config.plugins.forEach(plugin => inflatePluginConfig(plugin, config));

  return config;
}

function inflatePluginConfig(plugin, config) {
  const pluginName = getPluginName(plugin);
  const pluginConfig = getPluginConfig(plugin);

  if (!pluginConfig && typeof pluginConfig !== 'object') {
    return;
  }

  const data = {
    pluginName,
    pluginConfig,
    plugins: config.plugins,
    config,
  };

  Object.keys(pluginConfig)
    .filter(key => typeof pluginConfig[key] === 'function')
    .forEach(key => (pluginConfig[key] = pluginConfig[key](data)));
}
