const fs = require('fs')
const path = require('path')
const la = require('lazy-ass')
const is = require('check-more-types')

function updateFile (filename) {
  console.log('updating comment values in', filename)
  la(is.unemptyString(filename), 'missing filename', filename)

  const source = fs.readFileSync(filename, 'utf8')
  const results = require(path.join(process.cwd(), 'results.json'))

  const lines = source.split('\n')
  results.comments.forEach(updateComment)

  function updateComment (c) {
    const commentStart = '//>'
    console.log('updating comment')
    console.log(c)
    // line starts with 1
    console.assert(c.from.line === c.to.line, 'line mismatch')
    const line = lines[c.from.line - 1]
    console.assert(line, 'missing line')
    console.log('updating line', line, 'with value', c.value)
    const k = line.indexOf(commentStart)
    console.assert(k >= 0, 'line does not have comment')
    const updatedLine = line.substr(0, k) + commentStart + ' ' + c.value
    lines[c.from.line - 1] = updatedLine
  }

  const updatedSource = lines.join('\n')
  console.log('updated source')
  console.log(updatedSource)

  fs.writeFileSync(filename, updatedSource, 'utf8')
}

module.exports = updateFile

if (!module.exports) {
  const sourceFilename = path.join(process.cwd(), process.argv[2])
  updateFile(sourceFilename)
}
