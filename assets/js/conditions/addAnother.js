window.onload = function () {
  const oldButtonClick = MOJFrontend.AddAnother.prototype.onAddButtonClick
  const oldRemoveClick = MOJFrontend.AddAnother.prototype.onRemoveButtonClick

  MOJFrontend.AddAnother.prototype.createRemoveButton = function (item) {
    item.append(
      '<button type="button" class="govuk-button govuk-button--warning moj-add-another__remove-button">Remove</button>'
    )
  }

  MOJFrontend.AddAnother.prototype.onAddButtonClick = function (e) {
    oldButtonClick.call(this, e)
    addBackgroundToNewFieldset()
    changeDeleteButtonTextContent()
  }

  MOJFrontend.AddAnother.prototype.onRemoveButtonClick = function (e) {
    oldRemoveClick.call(this, e)
    removeBackgroundFromFieldset()
    changeDeleteButtonTextContent()
  }

  const addBackgroundToNewFieldset = () => {
    const $addAnotherFieldsets = document.getElementsByClassName('govuk-fieldset moj-add-another__item')
    $addAnotherFieldsets[$addAnotherFieldsets.length - 2].classList.remove('newest-fieldset')
    $addAnotherFieldsets[$addAnotherFieldsets.length - 1].classList.add('newest-fieldset')
  }

  const removeBackgroundFromFieldset = () => {
    const $addAnotherFieldsets = document.getElementsByClassName('govuk-fieldset moj-add-another__item')
    $addAnotherFieldsets[$addAnotherFieldsets.length - 1].classList.remove('newest-fieldset')
  }

  const $addAnothers = document.querySelectorAll('[data-module="moj-condition-add-another"]')
  const addAnother = new MOJFrontend.AddAnother($addAnothers)

  const changeDeleteButtonTextContent = () => {
    const buttons = document.getElementsByClassName('delete-condition-button-pluralisable')
    if (buttons.length) {
      const button = buttons[0]
      button.textContent = addAnother.getItems().length > 1 ? 'Delete these conditions' : 'Delete this condition'
    }
  }
}
