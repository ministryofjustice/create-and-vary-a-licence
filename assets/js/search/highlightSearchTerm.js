window.onload = function () {
  const searchResults = document.getElementsByClassName('govuk-table__body')

  if (searchResults === null) {
    return
  }
  const searchTerm = document.getElementById('searchTerm').value

  if (searchTerm.length < 2) {
    return
  }

  for (const result of searchResults) {
    result.innerHTML = caseInsensitiveHighlighting(result.innerHTML, searchTerm)
  }
}

function caseInsensitiveHighlighting(html, searchTerm) {
  const reg = new RegExp(searchTerm, 'gi')
  return html.replace(reg, function (str) {
    return `<mark>${str}</mark>`
  })
}
