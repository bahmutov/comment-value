function add (a, b) {
  return a + b
}
setTimeout(() => {
  add(2, 3) //> 5
  console.log('all done')
}, 100)

add(1, -2) //> -1

