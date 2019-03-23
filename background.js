var API_ENDPOINT = "https://free.currencyconverterapi.com/api/v6/convert?apiKey=sample-api-key&compact=ultra&q=";
var INTERVAL = 60*5;

function getQueryString(from, to) {
  return from + "_" + to;
}

function getTitle(from, to) {
  return from + " -> " + to;
}

// Forex market is open 24 hours a day from 5 p.m. UTC-5 on Sunday until 4 p.m. UTC-5 on Friday
function isForexOpen() {
  var ISO_DATE_LENGTH = "yyyy-mm-dd".length;
  var UTC_TO_EST = -5;
  var OPENING_DAY = 0;
  var OPENING_HOURS = 17;
  var CLOSING_DAY = 5;
  var CLOSING_HOURS = 16; 

  var currentDateTime = new Date();
  var dayUTC = currentDateTime.getUTCDay(); // 0-6, 0: Sunday, 1: Monday ...
  var hoursUTC = currentDateTime.getUTCHours(); // 0-23 (24h format)

  var isYesterdayInEST = hoursUTC + UTC_TO_EST < 0;
  var dayEST = isYesterdayInEST ? (7 + dayUTC - 1) % 7 : dayUTC;
  var hoursEST = (24 + hoursUTC + UTC_TO_EST) % 24;

  return (dayEST == OPENING_DAY && hoursEST >= 17) ||
         (dayEST > OPENING_DAY && dayEST < CLOSING_DAY) ||
         (dayEST == CLOSING_DAY && hoursEST < CLOSING_HOURS);
}

chrome.webRequest.onBeforeSendHeaders.addListener(function(details){
  var newRef = "https://free.currencyconverterapi.com";
  var gotRef = false;
  for(var n in details.requestHeaders){
      gotRef = details.requestHeaders[n].name.toLowerCase()=="referer";
      if(gotRef){
          details.requestHeaders[n].value = newRef;
          break;
      }
  }
  if(!gotRef){
      details.requestHeaders.push({name:"Referer",value:newRef});
  }
  return {requestHeaders:details.requestHeaders};
},{
  urls:["https://free.currencyconverterapi.com/*"]
},[
  "requestHeaders",
  "blocking"
]);

function fetchExchangeRate() {
  chrome.storage.local.remove(["lastSuccess", "log"]);
  
  chrome.storage.sync.get({
    currencyFrom: "CAD",
    currencyTo: "BRL"
  }, function(items) {
    var log = "";
    var from = items.currencyFrom;
    var to = items.currencyTo;
    var query = getQueryString(from, to);

    chrome.browserAction.setBadgeText({ text: "..." });

    var xhr = new XMLHttpRequest();
    xhr.open("GET", API_ENDPOINT + query, true);
    xhr.onreadystatechange = function(data){
      if (xhr.readyState == 4) {
        log += "\nResponse received.";
        chrome.storage.local.set({
          log: log,
        });

        try {
          var value = JSON.parse(data.target.responseText)[query];
          chrome.browserAction.setBadgeText({ text: value.toFixed(2).toString() });

          log += "\n1 " + from + " = " + value + " " + to;
          var now = new Date();
          chrome.storage.local.set({
            log: log,
            lastSuccess: now.toLocaleDateString() + " - " + now.toLocaleTimeString(),
          });
        }
        catch (ex) {
          chrome.browserAction.setBadgeText({ text: "Err" });
          log += "\nUnexpected response: " + data.target.responseText;
          chrome.storage.local.set({
            log: log,
          });
        }
        chrome.browserAction.setTitle({ title: getTitle(from, to) });
      }
    }
    var now = new Date;
    log = now.toLocaleDateString() + " - " + now.toLocaleTimeString() + "\n" +
      "Checking exchange rate from " + from + " to " + to + "\nSending request...";
    chrome.storage.local.set({
      log: log,
    }, function () { xhr.send(); });
  });
}

function updateBadge () {
  chrome.storage.sync.get({
    lastSuccess: "Never",
  }, function (items) {
    if (items.lastSuccess === "Never" || isForexOpen()) {
      fetchExchangeRate();
    }
    else {
      chrome.storage.local.set({
        log: "Forex markets closed.\nLast exchange rate: " + items.lastSuccess
      });
    }
  });
};

// Change storage event to trigger update with new exchange rate
chrome.storage.onChanged.addListener(function (changes, areaName) {
  if (areaName === "sync" && (changes.currencyFrom || changes.currencyTo)) {
    updateBadge();
  }
  if (areaName === "local" && changes.log && document.getElementById("log")) {
    document.getElementById("log").value = changes.log.newValue;
  }
});

// Click event on the extension to show options page
chrome.browserAction.onClicked.addListener(function() {
  chrome.runtime.openOptionsPage();
});

setInterval(function () {
  updateBadge();
}, INTERVAL*1000);

chrome.runtime.onInstalled.addListener(function() {
  updateBadge();
});