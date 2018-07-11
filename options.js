// Saves options to chrome.storage
function save_options() {
  var from = document.getElementById("from").value;
  var to = document.getElementById("to").value;
  chrome.storage.sync.set({
    currencyFrom: from,
    currencyTo: to
  });
}

// Restores options with default values
function restore_options() {
  chrome.storage.sync.get({
    currencyFrom: "CAD",
    currencyTo: "BRL"
  }, function(items) {
    document.getElementById("from").value = items.currencyFrom;
    document.getElementById("to").value = items.currencyTo;
  });
}

// Initial event hooks for saving and loading options
document.addEventListener("DOMContentLoaded", restore_options);
document.getElementById("from").addEventListener("change",
    save_options);
document.getElementById("to").addEventListener("change",
    save_options);