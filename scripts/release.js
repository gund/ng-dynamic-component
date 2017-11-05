const { writeFileSync } = require('fs')
const copyfiles = require('copyfiles')

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

function updatePath(path) {
  return path.replace('dist/', '')
}
