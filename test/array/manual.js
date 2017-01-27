if (!global.__instrumenter) {
  global.__instrumenter = {
    "comments": [{
      "start": 58,
      "text": "> undefined",
      "index": 0,
      "from": {
        "line": 3,
        "column": 2
      },
      "to": {
        "line": 3,
        "column": 15
      },
      "filename": "/Users/gleb/git/comment-value/test/array/index.js",
      "commentStart": ">",
      "instrumented": true
    }]
  }
};
// how does it print an array
const a = ['foo', 'bar']; {
  console.log('saving a', a)
  global.__instrumenter.comments[0].value = a; global.__instrumenter.comments[0].value
} //> undefined

console.log(global.__instrumenter)
