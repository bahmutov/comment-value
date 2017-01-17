const hook = require('node-hook')
const instrumentSource = require('./instrument-source')
const updateSourceFile = require('./update')
const fs = require('fs')

const instrumentedFiles = []

function instrumentLoadedFiles (source, filename) {
  console.log('instrumenting', filename)

  const instrumented = instrumentSource(source)
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
    console.log('saved values', outputFilename)
    if (instrumentedFiles.length) {
      instrumentedFiles.forEach(updateSourceFile)
    }
  }
})
