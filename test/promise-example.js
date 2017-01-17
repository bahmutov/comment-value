Promise.resolve(42)
  // .then(x =>
  //   x + x //> undefined
  // )
  .then(x =>
    x //> undefined
  )
  .then(console.log)
