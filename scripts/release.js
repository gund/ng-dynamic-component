const { writeFileSync } = require('fs')
const copyfiles = require('copyfiles')
const copyDir = require('copy-dir')

writeNewPackage('dist/package.json')
copyFiles({
  files: [
    'README.MD',
    'LICENSE',
    '.npmignore',
    'yarn.lock',
  ],
  to: 'dist',
})
copyGit('dist')

function writeNewPackage(to) {
  const package = require('../package.json')

  const pathKeys = ['main', 'typings', 'module', 'es2015']
  pathKeys.forEach(k => package[k] = updatePath(package[k]))

  delete package.scripts
  delete package.devDependencies

  console.log(`Writing new package.json to ${to}...`)
  writeFileSync(
    to,
    JSON.stringify(package, null, '  '),
    'utf-8')
  console.log('OK')
}

function copyFiles({ files, to }) {
  console.log(`Copying files to ${to} [${files.join(', ')}]`)
  copyfiles([...files, to], {}, () => null)
  console.log('OK')
}

function copyGit(to) {
  console.log(`Copying .git folder to ${to}`)
  copyDir.sync('.git', to + '/.git')
  console.log('OK')
}

function updatePath(path) {
  return path.replace('dist/', '')
}
