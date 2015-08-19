//     This file is part of Game Deals extension for Google Chrome
//     https://github.com/DanielKamkha/GameDealsChrome
//     (c) 2015 Daniel Kamkha
//     Game Deals is free software distributed under the terms of the MIT license.

(function() {
  "use strict";

  function makeCachedRequest(tableName) {
    let varArgs = Array.prototype.slice.call(arguments, 1);
    return new Promise(function (resolve, reject) {
      chrome.runtime.sendMessage(
        { tableName: tableName, args: varArgs },
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

  window.GameDeals = window.GameDeals || {};
  window.GameDeals.Cache = {
    getGamePlain: makeCachedRequest.bind(null, "plain"),
    getStoreLink: makeCachedRequest.bind(null, "store-link")
  };
})();

