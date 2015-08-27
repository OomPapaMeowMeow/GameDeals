//     This file is part of Game Deals extension for Chrome and Firefox
//     https://github.com/DanielKamkha/GameDeals
//     (c) 2015 Daniel Kamkha
//     Game Deals is free software distributed under the terms of the MIT license.

(function() {
  "use strict";

  let messageId = 0;

  function sendMessage(messageName, data, callback) {
    if (typeof chrome !== "undefined") { // Chrome
      data.messageName = messageName;
      chrome.runtime.sendMessage(data, callback);
    } else {
      data.messageId = messageId;
      if (callback) {
        self.port.once(messageName + messageId, callback);
      }
      self.port.emit(messageName, data);
      messageId++;
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

  function analyzePrice(priceString, deals) {
    let priceData = GameDeals.Currency.parseCurrency(priceString);
    if (!priceData) {
      return;
    }
    let dealPriceData = GameDeals.Currency.parseCurrency(deals[0].price);
    if (!dealPriceData) {
      return;
    }
    // TODO: disregarding currency, just dumb compare the values
    if (dealPriceData.value < priceData.value) {
      showPageAction(priceString, deals, dealPriceData.value <= priceData.value/2);
    }
  }

  window.GameDeals = window.GameDeals || {};
  window.GameDeals.Comm = {
    getGamePlain: makeBackgroundRequest.bind(null, "getGamePlain", true),
    getStoreLink: makeBackgroundRequest.bind(null, "getStoreLink", true),
    getBestDeals: makeBackgroundRequest.bind(null, "getBestDeals", false),
    analyzePrice: analyzePrice
  };
})();

