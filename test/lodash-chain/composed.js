var R = require('ramda')
var users = [
  { 'user': 'barney',  'age': 36 },
  { 'user': 'fred',    'age': 40 },
  { 'user': 'pebbles', 'age': 1 }
];

var youngest = R.pipe(
  R.sortBy(R.prop('age')), //> [{"user":"pebbles","age":1},{"user":"barney","age":36},{"user":"fred","age":40}]
  R.head
)(users)
console.log(youngest) //> {"user":"pebbles","age":1}
