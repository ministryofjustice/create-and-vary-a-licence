window.onload = function () {
  const oldButtonClick = MOJFrontend.AddAnother.prototype.onAddButtonClick
  const oldRemoveClick = MOJFrontend.AddAnother.prototype.onRemoveButtonClick
  MOJFrontend.AddAnother.prototype.onAddButtonClick = function (e) {
    oldButtonClick.call(this, e)
    changeButtonTextContent()
  }

  MOJFrontend.AddAnother.prototype.onRemoveButtonClick = function (e) {
    oldRemoveClick.call(this, e)
    changeButtonTextContent()
  }

  var $addAnothers = document.querySelectorAll('[data-module="moj-custom-add-another"]')
  const addAnother = new MOJFrontend.AddAnother($addAnothers)

  const changeButtonTextContent = () => {
    const buttons = document.getElementsByClassName('delete-condition-button')
    if (buttons.length) {
      var button = buttons[0]
      button.textContent = addAnother.getItems().length > 1 ? 'Delete these conditions' : 'Delete this condition'
    }
  }
}
