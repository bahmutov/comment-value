function add (a, b) {
  return a + b
}
// (typeof add) //> undefined
add(2, 3) //> 5
add(1, -2) //> -1
add(10, -2) //> 8

console.log('all done in', __filename)
