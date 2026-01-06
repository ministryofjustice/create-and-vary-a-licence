(function () {
  function init () {
    var AddAnotherProto = MOJFrontend && MOJFrontend.AddAnother && MOJFrontend.AddAnother.prototype
    if (!AddAnotherProto) {
      console.warn('MOJFrontend.AddAnother not found on window.MOJFrontend')
      return
    }

    var oldButtonClick = AddAnotherProto.onAddButtonClick
    var oldRemoveClick = AddAnotherProto.onRemoveButtonClick

    function addBackgroundToNewFieldset () {
      var items = document.getElementsByClassName('govuk-fieldset moj-add-another__item')
      if (!items || items.length === 0) return

      if (items.length >= 2) {
        items[items.length - 2].classList.remove('newest-fieldset')
      }

      items[items.length - 1].classList.add('newest-fieldset')
    }

    function removeBackgroundFromFieldset () {
      var items = document.getElementsByClassName('govuk-fieldset moj-add-another__item')
      if (!items || items.length === 0) return
      items[items.length - 1].classList.remove('newest-fieldset')
    }

    AddAnotherProto.createRemoveButton = function (item) {
      var btn = document.createElement('button')
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
      if (typeof oldRemoveClick === 'function') {
        oldRemoveClick.call(this, e)
      }
      removeBackgroundFromFieldset()
      changeDeleteButtonTextContent(this)
    }

    var roots = document.querySelectorAll(
      '[data-module="moj-condition-add-another"], [data-module="moj-add-another"]'
    )

    var instances = []
    roots.forEach(function (el) {
      if (el && el.nodeType === 1) {
        var inst = new MOJFrontend.AddAnother(el)
        instances.push(inst)
      }
    })

    function changeDeleteButtonTextContent (contextInstance) {
      var buttons = document.getElementsByClassName('delete-condition-button-pluralisable')
      if (!buttons || buttons.length === 0) return

      var totalItems = 0

      if (contextInstance && typeof contextInstance.getItems === 'function') {
        totalItems = contextInstance.getItems().length
      } else if (instances.length) {
        instances.forEach(function (inst) {
          if (typeof inst.getItems === 'function') {
            totalItems += inst.getItems().length
          }
        })
      }

      var btn = buttons[0]
      btn.textContent = totalItems > 1 ? 'Delete these conditions' : 'Delete this condition'
    }

    changeDeleteButtonTextContent()
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
