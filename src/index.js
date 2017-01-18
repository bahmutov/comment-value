const hook = require('node-hook')
const instrumentSource = require('./instrument-source')
const updateSourceFile = require('./update')
const debug = require('debug')('comment-value')

const instrumentedFiles = []

function instrumentLoadedFiles (source, filename) {
  debug('instrumenting file %s', filename)

  const instrumented = instrumentSource(source, filename)
  if (instrumented !== source) {
    instrumentedFiles.push(filename)
  }

  return instrumented
}
hook.hook('.js', instrumentLoadedFiles)

process.on('exit', function writeResults () {
  if (global.__instrumenter) {
    if (instrumentedFiles.length) {
      debug('%d instrumented file(s) to update', instrumentedFiles.length)
      instrumentedFiles.forEach(name =>
        updateSourceFile(name, global.__instrumenter))
    }
  }
})
