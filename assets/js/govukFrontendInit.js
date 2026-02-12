import { initAll } from '../../../../../assets/govuk/govuk-frontend.min.js'

initAll()
// Initiate the back links
$('[class$=js-backlink]').on('click', e => {
  e.preventDefault()
  if ($('ul.govuk-error-summary__list').length > 0) {
    window.history.go(-2)
  } else {
    window.history.go(-1)
  }
})

// TEMP - can remove after DPR fix bookmark links
$('.dpr-bookmark').remove()
