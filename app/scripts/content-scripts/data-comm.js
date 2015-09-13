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

  function getOption(optionName) {
    return new Promise(function (resolve) {
      if (typeof chrome !== "undefined") { // Chrome
        chrome.storage.sync.get(optionName, resolve);
      } else {
        sendMessage("getOption", {optionName: optionName}, resolve);
      }
    });
  }

  function getExchangeRates() {
    return new Promise(function (resolve, reject) {
      sendMessage(
        "getExchangeRates",
        {},
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

  function showPageAction(price, deals, important, show) {
    sendMessage("showPageAction", { price: price, deals: deals, important: important, show: show });
  }

  function analyzePrice(priceString, deals, rates, isWishlist) {
    let priceData = GameDeals.Currency.parseCurrency(priceString);
    if (!priceData) {
      return;
    }
    let dealPriceData = GameDeals.Currency.parseCurrency(deals[0].price);
    if (!dealPriceData) {
      return;
    }
    let currentPrice = priceData.value;
    if (rates && rates[priceData.currencyType]) {
      currentPrice /= rates[priceData.currencyType];
    }
    let isBetterDeal = dealPriceData.value < currentPrice;
    if (!isWishlist) {
      let reformattedPriceString = GameDeals.Currency.formatCurrency(currentPrice, dealPriceData.currencyType);
      showPageAction(reformattedPriceString, deals, dealPriceData.value <= currentPrice/2, isBetterDeal);
    }
    return isBetterDeal;
  }

  window.GameDeals = window.GameDeals || {};
  window.GameDeals.Comm = {
    getGamePlain: makeBackgroundRequest.bind(null, "getGamePlain", true),
    getBestDeals: makeBackgroundRequest.bind(null, "getBestDeals", false),
    analyzePrice: analyzePrice,
    getOption: getOption,
    getExchangeRates: getExchangeRates
  };
})();

