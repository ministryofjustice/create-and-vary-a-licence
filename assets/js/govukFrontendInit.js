window.GOVUKFrontend.initAll()

// Initiate the back links
$('[class$=govuk-back-link]').click(e => {
  e.preventDefault()
  window.history.go(-1)
})
