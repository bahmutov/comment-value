#!/usr/bin/env node

const debug = require('debug')('comment-value')
const program = require('commander')
const spawn = require('cross-spawn')
const chokidar = require('chokidar')
const path = require('path')
const firstExisting = require('first-existing')
const la = require('lazy-ass')
const is = require('check-more-types')

program
  .option('-w, --watch', 'Keep watching input files')
  .parse(process.argv)

if (!program.args.length) {
  console.error('values <filename .js>')
  process.exit(1)
}

const filename = path.resolve(program.args[0])

function findChangedValuesModule() {
  const choices = [
    '../src/index.js',
    '../lib/node_modules/comment-value/src/index.js'
  ]
  return firstExisting(__dirname, choices)
}
const modulePath = findChangedValuesModule()
la(is.unemptyString(modulePath), 'could not find comment-value module')

function runNode(inputFilename) {
  debug('running program %s', inputFilename)
  return new Promise((resolve, reject) => {
    const args = ['-r', modulePath, inputFilename]
    const opts = {
      stdio: 'inherit'
    }
    const child = spawn('node', args, opts)
    child.on('error', err => {
      console.error(err)
      reject(err)
    })
    child.on('close', code => {
      debug('node is done, exit code %d', code)
      if (code) {
        debug('Error when running %s', inputFilename)
        return reject(new Error('Node exit code ' + code))
      }
      resolve()
    })
  })
}

function onError(err) {
  console.error('An error')
  console.error(err)
  process.exit(1)
}

function watchFile() {
  // TODO determine files to watch from
  // collected files
  console.log('watching file', filename)
  const watchOptions = {
    persistent: true,
    ignoreInitial: true
  }
  const watcher = chokidar.watch(filename, watchOptions)
  const updateComments = path => {
    debug('updating comments in %s on watch', path)
    return runNode(filename)
      .catch(onError)
  }

  watcher.on('change', path => {
    // while the update is running, remove the watcher
    // to avoid infinite loop
    debug('file %s has changed', path)
    watcher.unwatch(filename)
    updateComments(path)
      .then(() => {
        watcher.add(filename)
      })
  })
}

if (program.watch) {
  debug('watch options is true')
  runNode(filename)
    .catch(onError)
    .then(watchFile)
    .catch(console.error)
} else {
  debug('updating values once')
  runNode(filename)
    .catch(onError)
}

