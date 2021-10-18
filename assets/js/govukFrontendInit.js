window.GOVUKFrontend.initAll()

// Initiate the back links
$('[class$=js-backlink]').click(e => {
  e.preventDefault()
  window.history.go(-1)
})
