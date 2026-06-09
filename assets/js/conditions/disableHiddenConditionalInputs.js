window.addEventListener('load', function () {
  function disableHiddenInputs() {
      const hiddenInputs = document.querySelectorAll('.govuk-radios__conditional--hidden input, .govuk-radios__conditional--hidden select')
      for (elem of hiddenInputs) {
        elem.disabled = true
      }
  }

  const form = document.querySelector('#additionConditionInputs')
  form.addEventListener('submit', disableHiddenInputs)
})
