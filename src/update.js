const fs = require('fs')
const path = require('path')
const la = require('lazy-ass')
const is = require('check-more-types')
const debug = require('debug')('comment-value')
const R = require('ramda')

function updateFile (filename, results) {
  debug('updating comment values in file %s', filename)
  la(is.unemptyString(filename), 'missing filename', filename)

  const source = fs.readFileSync(filename, 'utf8')
  if (!results) {
    const resultsFilename = path.join(process.cwd(), 'results.json')
    debug('loading results from file %s', resultsFilename)
    results = require(resultsFilename)
  }

  const forThisFile = comment => comment.filename === filename

  // console.log('updating source from file', filename)
  // console.log(source)

  function debugPrintComment (c) {
    debug('comment line %d value %s', c.from.line, c.value)
  }

  function debugPrintVariable (c) {
    debug('variable line %d name %s value %s',
      c.lineIndex, c.variable, c.value)
  }

  const lines = source.split('\n')
  results.comments
    .filter(forThisFile)
    .map(R.tap(debugPrintComment))
    .forEach(updateComment)

  results.variables
    .filter(forThisFile)
    .map(R.tap(debugPrintVariable))
    .forEach(updateVariableComment)

  function updateVariableComment (c) {
    const line = lines[c.lineIndex]
    la(line, 'missing line', c.lineIndex, 'for comment', c)
    la(is.oneOf(['value', 'type'], c.find), 'invalid variable', c.variable,
      'find', c.find, c)
    const variableString = c.find === 'value'
      ? ` ${c.variable}:` : ` ${c.variable}::`
    const variableIndex = line.indexOf(variableString)
    la(is.found(variableIndex),
      'cannot find variable comment', c, 'on line', line)
    const start = line.substr(0, variableIndex + variableString.length)
    const newComment = start + ' ' + JSON.stringify(c.value)
    lines[c.lineIndex] = newComment
  }

  function updateComment (c) {
    const commentStart = c.commentStart
    la(is.unemptyString(commentStart), 'missing comment start', c)
    // console.log('updating comment')
    // console.log(c)
    // line starts with 1
    la(c.from.line === c.to.line, 'line mismatch', c)
    const line = lines[c.from.line - 1]
    la(line, 'missing line', c.from.line - 1, 'for comment', c)
    // console.log('updating line', line, 'with value', c.value)
    const k = line.indexOf(commentStart)
    la(k >= 0, 'line does not have comment', k, 'for comment', c)

    const value = c.find === 'value' ? JSON.stringify(c.value) : c.type

    const newComment = commentStart + ' ' + value
    const updatedLine = line.substr(0, k) + newComment
    lines[c.from.line - 1] = updatedLine
  }

  const updatedSource = lines.join('\n')

  if (updatedSource !== source) {
    debug('updated source is different in %s', filename)
    fs.writeFileSync(filename, updatedSource, 'utf8')
  } else {
    debug('file %s is the same as before, not overwriting', filename)
  }
}

module.exports = updateFile

if (!module.exports) {
  const sourceFilename = path.join(process.cwd(), process.argv[2])
  updateFile(sourceFilename)
}
