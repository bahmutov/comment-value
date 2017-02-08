// code example from
// egghead.io/lessons/javascript-convert-a-querystring-to-an-object-using-function-composition-in-ramda
const {identity, compose, fromPairs, map, split, tail} = require('ramda')

const queryString = '?page=2&pageSize=10&total=203'

const parseQs = compose(
  fromPairs,
  map(split('=')), //> [["page","2"],["pageSize","10"],["total","203"]]
  split('&'),      //> ["page=2","pageSize=10","total=203"]
  tail             //> "page=2&pageSize=10&total=203"
)

const result = parseQs(queryString)
console.log(result)
// result: {"page":"2","pageSize":"10","total":"203"}
