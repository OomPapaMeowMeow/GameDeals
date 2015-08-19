//     This file is part of Game Deals extension for Google Chrome
//     https://github.com/DanielKamkha/GameDealsChrome
//     (c) 2015 Daniel Kamkha
//     Game Deals is free software distributed under the terms of the MIT license.

(function() {
  "use strict";

  const tableToRequest = {
    "plain": GameDeals.Itad.getGamePlain,
    "store-link": GameDeals.Itad.getStoreLink
  };

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

  chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) { // jshint ignore:line
    let newArgs = [tableToRequest[message.tableName], message.tableName].concat(message.args);
    makeCachedRequest.apply(null, newArgs)
      .then(function(value) {
        sendResponse({ value: value });
      })
      .catch(function(response) {
        sendResponse({ response: response });
      });
    return true;
  });

})();

