//     This file is part of Game Deals extension for Google Chrome
//     https://github.com/DanielKamkha/GameDealsChrome
//     (c) 2015 Daniel Kamkha
//     Game Deals is free software distributed under the terms of the MIT license.

(function() {
  "use strict";

  function makeCachedRequest(requestFunc, tableTame, id1, id2) {
    let varArgs = Array.prototype.slice.call(arguments, 2);
    return new Promise(function (resolve, reject) {
      chrome.storage.local.get(tableTame, function(table) {
        table = table || {};
        let subTable = table[id1] || (table[id1] = {});
        let value = subTable[id2];
        if (value !== undefined) {
          resolve(value);
        } else {
          requestFunc.apply(null, varArgs).then(function(value) {
              subTable[id2] = value;
              chrome.storage.local.set({ tableTame: table });
              resolve(value);
            },
            reject);
        }
      });
    });
  }

  function makeBackgroundRequest(message, sendResponse) {
    let requestFunc = GameDeals.Itad[message.requestName];
    let varArgs = message.args;
    if (message.cache) {
      varArgs = [requestFunc, message.requestName].concat(varArgs);
      requestFunc = makeCachedRequest;
    }
    requestFunc.apply(null, varArgs)
      .then(function (value) {
        sendResponse({value: value});
      }, function (response) {
        sendResponse({response: response});
      });
  }

  function showPageAction(message, sender) {
    let deals = message.deals; // jshint ignore:line
    chrome.pageAction.show(sender.tab.id);
  }

  chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    switch(message.methodName) {
      case "makeBackgroundRequest":
        makeBackgroundRequest(message, sendResponse);
        return true;
      case "showPageAction":
        showPageAction(message, sender);
        break;
    }
  });

})();

