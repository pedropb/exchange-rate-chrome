// Saves options to chrome.storage
function save_options() {
  var from = document.getElementById("from").value;
  var to = document.getElementById("to").value;
  chrome.storage.remove("lastSuccess");
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
  
  chrome.storage.local.get({
    log: ""
  }, function(items) {
    document.getElementById("log").value = items.log;
  });
}

// Initial event hooks for saving and loading options
document.addEventListener("DOMContentLoaded", restore_options);
document.getElementById("from").addEventListener("change",
    save_options);
document.getElementById("to").addEventListener("change",
    save_options);

// Change storage event to update log
chrome.storage.onChanged.addListener(function (changes, areaName) {
  if (areaName === "local" && changes.log && document.getElementById("log")) {
    document.getElementById("log").value = changes.log.newValue;
  }
});
