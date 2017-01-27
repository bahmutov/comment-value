function beautifyJavaScript (source) {
  const beautify = require('js-beautify').js_beautify
  return beautify(source, {indent_size: 2})
}

module.exports = beautifyJavaScript
