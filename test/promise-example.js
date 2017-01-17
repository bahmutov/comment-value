Promise.resolve(42)
  // .then(x =>
  //   x + x //> undefined
  // )
  .then(x =>
    x //> 42
  )
  .then(console.log)
