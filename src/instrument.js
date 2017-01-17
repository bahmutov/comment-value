const instrumentSource = require('./instrument-source')
const fs = require('fs')

function instrumentFile (filename, outputFilename) {
  const source = fs.readFileSync(filename, 'utf8')
  const instrumented = instrumentSource(source)
  // TODO move outside
  function saveResults () {
    /* global __instrumenter */
    const fs = require('fs')
    process.on('exit', function writeResults () {
      fs.writeFileSync('./results.json',
        JSON.stringify(__instrumenter, null, 2) + '\n', 'utf8')
    })
  }
  const save = '(' + saveResults.toString() + '())\n'
  const sep = ';\n'
  fs.writeFileSync(outputFilename, instrumented + sep + save, 'utf8')
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

