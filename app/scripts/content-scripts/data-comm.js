//     This file is part of Game Deals extension for Chrome and Firefox
//     https://github.com/DanielKamkha/GameDealsChrome
//     https://github.com/DanielKamkha/GameDealsFirefox
//     (c) 2015 Daniel Kamkha
//     Game Deals is free software distributed under the terms of the MIT license.

(function() {
  "use strict";

  function sendMessage(messageName, data, callback) {
    if (typeof chrome !== "undefined") { // Chrome
      data.messageName = messageName;
      chrome.runtime.sendMessage(data, callback);
    } else {
      if (callback) {
        self.port.once(messageName, callback);
      }
      self.port.emit(messageName, data);
    }
  }

  function makeBackgroundRequest(requestName, cache) {
    let varArgs = Array.prototype.slice.call(arguments, 2);
    return new Promise(function (resolve, reject) {
      sendMessage(
        "makeBackgroundRequest",
        { requestName: requestName, cache: cache, args: varArgs },
        function(data) {
          if (data) {
            if (data.value) {
              resolve(data.value);
            } else {
              reject(data.response);
            }
          } else {
            reject({});
          }
        }
      );
    });
  }

  function showPageAction(price, deals, important) {
    sendMessage("showPageAction", { price: price, deals: deals, important: important });
  }

  window.GameDeals = window.GameDeals || {};
  window.GameDeals.Comm = {
    getGamePlain: makeBackgroundRequest.bind(null, "getGamePlain", true),
    getStoreLink: makeBackgroundRequest.bind(null, "getStoreLink", true),
    getBestDeals: makeBackgroundRequest.bind(null, "getBestDeals", false),
    showPageAction: showPageAction
  };
})();

