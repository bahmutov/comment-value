const instrumentSource = require('./instrument-source')
const fs = require('fs')
const debug = require('debug')('comment-value')
const beautify = require('./beautify')

function instrumentFile (filename, outputFilename) {
  debug('instrumenting file %s', filename)
  const source = fs.readFileSync(filename, 'utf8')
  const instrumented = instrumentSource(source, filename)
  // TODO move outside
  function saveResults () {
    const fs = require('fs')
    process.on('exit', function writeResults () {
      fs.writeFileSync('./results.json',
        JSON.stringify(global.__instrumenter, null, 2) + '\n', 'utf8')
    })
  }
  const save = '(' + saveResults.toString() + '())\n'
  const sep = ';\n'
  const output = beautify(instrumented + sep + save) + '\n'
  fs.writeFileSync(outputFilename, output, 'utf8')
}

module.exports = instrumentFile

if (!module.parent) {
  const path = require('path')
  const sourceFilename = process.argv[2]
  console.log('updating comment values in', sourceFilename)
  const fullFilename = path.join(process.cwd(), sourceFilename)
  const outputFilename = './instrumented.js'
  instrumentFile(fullFilename, outputFilename)
}

