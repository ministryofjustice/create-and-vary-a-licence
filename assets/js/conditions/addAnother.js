window.onload = function () {
  (function () {
    function init() {
      const AddAnotherProto = MOJFrontend && MOJFrontend.AddAnother && MOJFrontend.AddAnother.prototype

      const oldButtonClick = AddAnotherProto.onAddButtonClick
      const oldRemoveClick = AddAnotherProto.onRemoveButtonClick

      function addBackgroundToNewFieldset() {
        const items = document.getElementsByClassName('govuk-fieldset moj-add-another__item')
        if (!items || items.length === 0) return

        if (items.length >= 2) {
          items[items.length - 2].classList.remove('newest-fieldset')
        }

        if (items.length > 1) {
          items[items.length - 1].classList.add('newest-fieldset')
        }
      }

      function removeBackgroundFromFieldset() {
        const items = document.getElementsByClassName('govuk-fieldset moj-add-another__item')
        if (!items || items.length === 0) return
        items[items.length - 1].classList.remove('newest-fieldset')
      }

      AddAnotherProto.createRemoveButton = function (item) {
        const btn = document.createElement('button')
        btn.type = 'button'
        btn.className = 'govuk-button govuk-button--warning moj-add-another__remove-button'
        btn.textContent = 'Remove'
        item.appendChild(btn)
      }

      AddAnotherProto.onAddButtonClick = function (e) {
        if (typeof oldButtonClick === 'function') {
          oldButtonClick.call(this, e)
        }
        addBackgroundToNewFieldset()
        changeDeleteButtonTextContent(this)
      }

      AddAnotherProto.onRemoveButtonClick = function (e) {
        oldRemoveClick.call(this, e)
        removeBackgroundFromFieldset()
        changeDeleteButtonTextContent(this)
      }

      const roots = document.querySelectorAll('[data-module="moj-condition-add-another"]')

      roots.forEach(function (el) {
        if (el && el.nodeType === 1) {
          new MOJFrontend.AddAnother(el)
        }
      })

      function changeDeleteButtonTextContent(contextInstance) {
        const buttons = document.getElementsByClassName('delete-condition-button-pluralisable')
        if (!buttons || buttons.length === 0) return

        const totalItems = contextInstance?.getItems().length
        const btn = buttons[0]
        btn.textContent = totalItems > 1 ? 'Delete these conditions' : 'Delete this condition'
      }
    }

    init()
  })()
}
