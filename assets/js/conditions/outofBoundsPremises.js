window.onload = function () {
  function disableHiddenInputs() {
    console.log('disabling........')
    const hiddenInputs = document.querySelectorAll('.govuk-radios__conditional--hidden input')
    for (elem of hiddenInputs) {
      elem.disabled = true
    }
  }

  console.log('initialising.........')
  const form = document.querySelector('#additionConditionInputs')
  form.addEventListener('submit', disableHiddenInputs)
}
