//     This file is part of Game Deals extension for Google Chrome
//     https://github.com/DanielKamkha/GameDealsChrome
//     (c) 2015 Daniel Kamkha
//     Game Deals is free software distributed under the terms of the MIT license.

(function() {
  "use strict";

  function makeBackgroundRequest(requestName, cache) {
    let varArgs = Array.prototype.slice.call(arguments, 2);
    return new Promise(function (resolve, reject) {
      chrome.runtime.sendMessage(
        { methodName: "makeBackgroundRequest", requestName: requestName, cache: cache, args: varArgs },
        function(data) {
          if (data.value) {
            resolve(data.value);
          } else {
            reject(data.response);
          }
        }
      );
    });
  }

  function showPageAction(deals, important) {
    chrome.runtime.sendMessage({ methodName: "showPageAction", deals: deals, important: important });
  }

  window.GameDeals = window.GameDeals || {};
  window.GameDeals.Comm = {
    getGamePlain: makeBackgroundRequest.bind(null, "getGamePlain", true),
    getStoreLink: makeBackgroundRequest.bind(null, "getStoreLink", true),
    getBestDeals: makeBackgroundRequest.bind(null, "getBestDeals", false),
    showPageAction: showPageAction
  };
})();

