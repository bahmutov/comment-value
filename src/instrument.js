const falafel = require('falafel')
const fs = require('fs')
const source = fs.readFileSync('./index.js', 'utf8')

const __instrumenter = {
  comments: []
}

const endsBeforeInstrumentedComment = node =>
  __instrumenter.comments.some(c => c.start === node.end + 1)
const findComment = node =>
  __instrumenter.comments.find(c => c.start === node.end + 1)

function instrument (node) {
  // TODO can also handle individual value
  if (node.type === 'ExpressionStatement') {
    console.log(node.type, node.end, node.source())
    if (endsBeforeInstrumentedComment(node)) {
      console.log('need to instrument!')
      const comment = findComment(node)
      console.log(comment)
      const store = '__instrumenter.comments[' + comment.index + '].value = '
      node.update(store + node.source())
    }
  }
}

const isInstrumentComment = s => s.startsWith('>')

const parserOptions = {
  locations: true,
  onComment (block, text, start, end, from, to) {
    if (block) {
      return
    }
    if (!isInstrumentComment(text)) {
      return
    }
    console.log('comment', arguments)
    const index = __instrumenter.comments.length
    __instrumenter.comments.push({
      value: undefined,
      start: start,
      text: text,
      index: index,
      from: from,
      to: to
    })
  }
}
const output = falafel(source, parserOptions, instrument)
console.log('instrument comments')
console.log(__instrumenter.comments)
const preamble = `const __instrumenter = ` + JSON.stringify(__instrumenter, null, 2)
// console.log(preamble)
// console.log('output source\n' + output)

function saveResults () {
  const fs = require('fs')
  fs.writeFileSync('./results.json',
    JSON.stringify(__instrumenter, null, 2) + '\n', 'utf8')
}
const save = '(' + saveResults.toString() + '())\n'
const sep = ';\n'
fs.writeFileSync('./instrumented.js',
  preamble + sep + output + sep + save, 'utf8')
