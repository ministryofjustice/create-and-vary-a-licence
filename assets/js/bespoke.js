window.onclick = function () {
  var $addAnothers = document.querySelectorAll('[data-module="moj-add-another"]')
  const addAnother = new MOJFrontend.AddAnother($addAnothers)
  const buttons = document.getElementsByClassName('delete-condition-button')
  if (buttons.length) {
    var button = buttons[0]
    button.textContent = addAnother.getItems().length > 1 ? 'Delete these conditions' : 'Delete this condition'
  }
}
