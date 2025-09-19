window.onload = function () {
  const searchResults = document.getElementsByClassName('govuk-table__body')

  if (searchResults === null) {
    return
  }
  const searchTerm = document.getElementById('searchTerm').value

  if (searchTerm.length < 2) {
    return
  }

  for (const searchResult of searchResults) {
    if (searchResult === null) {
      continue
    }
    highlightTextInDOM(searchTerm, searchResult)
  }
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}

function highlightTextInDOM(targetText, searchResult) {
  const walker = document.createTreeWalker(
    searchResult,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: function (node) {
        const formattedNodeValue = node.nodeValue?.toLocaleLowerCase()
        const searchResult = node.parentNode?.classList.contains('search-highlight')
        const formattedTargetText = targetText.toLocaleLowerCase()
        return formattedNodeValue.includes(formattedTargetText) && searchResult
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_SKIP
      },
    },
    false
  )
  const nodesToUpdate = []
  let node
  while ((node = walker.nextNode())) {
    nodesToUpdate.push(node)
  }

  for (const textNode of nodesToUpdate) {
    const span = document.createElement('span')
    const regEx = new RegExp(`(${escapeRegExp(targetText)})`, 'ig')
    span.innerHTML = textNode.nodeValue.replaceAll(
      regEx,
      '<mark class="highlight-search-term"><strong>$1</strong></mark>'
    )
    textNode.parentNode?.replaceChild(span, textNode)
  }
}
