var ALARM_NAME = "refreshCurrency";
var API_ENDPOINT = "https://free.currencyconverterapi.com/api/v5/convert?compact=ultra&q=";

function getQueryString(from, to) {
  return from + "_" + to;
}

function getTitle(from, to) {
  return from + " -> " + to;
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

function updateBadge () {
  var log = "";
  chrome.storage.local.set({
    log: log,
  });

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
        log += "\nResponse received.";
        chrome.storage.local.set({
          log: log,
        });

        try {
          var value = JSON.parse(data.target.responseText)[query];
          chrome.browserAction.setBadgeText({ text: value.toFixed(2).toString() });

          log += "\n1 " + from + " = " + value + " " + to;
          chrome.storage.local.set({
            log: log,
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
}, 60*1000);

chrome.runtime.onInstalled.addListener(function() {
  updateBadge();
});