const activeTabValue = document.getElementById('activeTab')?.value
if (activeTabValue) {
  window.location.hash = activeTabValue
}
