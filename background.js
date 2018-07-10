chrome.runtime.onInstalled.addListener(function() {
  var ALARM_NAME = "refreshCurrency";
  var CURRENCY_FROM = "CAD";
  var CURRENCY_TO = "BRL";
  var URL = "http://free.currencyconverterapi.com/api/v3/convert?compact=ultra&q=" + CURRENCY_FROM + "_" + CURRENCY_TO;

  function updateBadge () {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", URL, true);
    xhr.onreadystatechange = function(data){
        if (xhr.readyState == 4) {
          console.log('received');
          console.log(data);
          try {
            var value = JSON.parse(data.target.responseText)[CURRENCY_FROM + "_" + CURRENCY_TO];
            chrome.browserAction.setBadgeText({ text: value.toFixed(2).toString() });
          }
          catch (ex) {
            chrome.browserAction.setBadgeText({ text: 'Err'});
          }
        }
    }
    xhr.send();
  };
  updateBadge();

  chrome.alarms.create(ALARM_NAME, {periodInMinutes: 1});

  chrome.alarms.onAlarm.addListener(function(alarm) {
    if (alarm.name === ALARM_NAME) {
      updateBadge();
    }
  });
});