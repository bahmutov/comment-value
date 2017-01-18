const hook = require('node-hook')
const instrumentSource = require('./instrument-source')
const updateSourceFile = require('./update')
const fs = require('fs')
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
  const outputFilename = './results.json'
  if (global.__instrumenter) {
    const text = JSON.stringify(global.__instrumenter, null, 2)
    fs.writeFileSync(outputFilename, text + '\n', 'utf8')
    debug('saved values to file %s', outputFilename)
    if (instrumentedFiles.length) {
      debug('%d instrumented file(s) to update', instrumentedFiles.length)
      instrumentedFiles.forEach(updateSourceFile)
    }
  }
})
