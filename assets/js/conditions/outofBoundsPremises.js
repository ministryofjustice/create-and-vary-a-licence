window.onload = function () {
  function disableHiddenInputs() {
    const hiddenInputs = document.querySelectorAll('.govuk-radios__conditional--hidden input')
    for (elem of hiddenInputs) {
      elem.disabled = true
    }
  }

  const form = document.querySelector('#additionConditionInputs')
  form.addEventListener('submit', disableHiddenInputs)
}
