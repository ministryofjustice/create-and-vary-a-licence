jQuery(function () {
  $('.date-input').each(function (index, element) {
    $(element).datepicker({
      dateFormat: $(element).attr('date-format') || 'dd/mm/yy',
      showOtherMonths: true,
      selectOtherMonths: true,
    })
  })
})
