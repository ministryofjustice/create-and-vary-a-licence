window.onload = function () {
  // Loops through dom and finds all elements with card--clickable class
  document.querySelectorAll('.card--clickable').forEach(card => {
    const link = card.querySelector('a')
    if (link !== null) {
      link.addEventListener('click', e => {
        if (e.target.classList.contains('disable-link')) {
          e.preventDefault()
        }

        e.stopPropagation()
      })
      card.addEventListener('click', e => {
        e.stopPropagation()
        link.click()
      })
    }
  })
}
