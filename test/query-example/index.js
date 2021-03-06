// code example from
// egghead.io/lessons/javascript-convert-a-querystring-to-an-object-using-function-composition-in-ramda
// using tool https://github.com/bahmutov/comment-value
const R = require('ramda')
const queryString = '?page=2&pageSize=10&total=foo'

const parseQs = R.pipe(
  R.tail,       //> "page=2&pageSize=10&total=foo"
  R.split('&'), //> ["page=2","pageSize=10","total=foo"]
  R.map(R.split('=')),
    //> [["page","2"],["pageSize","10"],["total","foo"]]
  R.fromPairs
)

const result = parseQs(queryString)
console.log(result)
// result: {"page":"2","pageSize":"10","total":"foo"}
// target {"page":"2","pageSize":"10","total":"203"}
