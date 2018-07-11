chrome.runtime.onInstalled.addListener(function() {
  var ALARM_NAME = "refreshCurrency";
  var API_ENDPOINT = "http://free.currencyconverterapi.com/api/v5/convert?compact=ultra&q=";

  function getQueryString(from, to) {
    return from + "_" + to;
  }

  function getTitle(from, to) {
    return from + " -> " + to;
  }

  function updateBadge () {
    chrome.storage.sync.get({
      currencyFrom: "CAD",
      currencyTo: "BRL"
    }, function(items) {
      var from = items.currencyFrom;
      var to = items.currencyTo;
      var query = getQueryString(from, to);

      chrome.browserAction.setBadgeText({ text: "..." });

      var xhr = new XMLHttpRequest();
      xhr.open("GET", API_ENDPOINT + query, true);
      xhr.onreadystatechange = function(data){
          if (xhr.readyState == 4) {
            try {
              var value = JSON.parse(data.target.responseText)[query];
              chrome.browserAction.setBadgeText({ text: value.toFixed(2).toString() });
            }
            catch (ex) {
              chrome.browserAction.setBadgeText({ text: "Err" });
            }
            chrome.browserAction.setTitle({ title: getTitle(from, to) });
          }
        }
      xhr.send();
    });
  };
  updateBadge();

  chrome.alarms.create(ALARM_NAME, {periodInMinutes: 1});

  chrome.alarms.onAlarm.addListener(function(alarm) {
    if (alarm.name === ALARM_NAME) {
      updateBadge();
    }
  });

  chrome.storage.onChanged.addListener(function (changes, areaName) {
    if (areaName === "sync" && (changes.currencyFrom || changes.currencyTo)) {
      updateBadge();
    }
  });
});