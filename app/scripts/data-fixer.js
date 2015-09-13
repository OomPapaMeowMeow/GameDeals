//     This file is part of Game Deals extension for Chrome and Firefox
//     https://github.com/DanielKamkha/GameDeals
//     (c) 2015 Daniel Kamkha
//     Game Deals is free software distributed under the terms of the MIT license.

(function() {
  "use strict";

  const debug = false;
  const successStr = "ok:";
  const failStr = "fail:";

  const requestUrl = "http://api.fixer.io/latest?base=";

  function assert() {
    if (debug) {
      console.log(Array.prototype.join.call(arguments, " "));
    }
  }

  let lock = false;

  function makeFixerGetRequest(url) {
    return new Promise(function (resolve, reject) {
      if (lock) {
        reject({ status: 0, statusText: "Another request pending." });
      } else {
        lock = true;
        $.ajax({method: "GET", url: url})
          .always(function () { lock = false; })
          .then(resolve, reject);
      }
    });
  }

  function getExchangeRates(baseCurrency) {
    assert(getExchangeRates.name, baseCurrency);
    let url = requestUrl + baseCurrency;
    return makeFixerGetRequest(url).then(function(response) {
      assert(getExchangeRates.name, baseCurrency, successStr, response.rates.length);
      return response.rates;
    }).catch(function(jqXHR) {
      assert(getExchangeRates.name, baseCurrency, failStr, jqXHR.status, jqXHR.statusText);
    });
  }

  window.GameDeals = window.GameDeals || {};
  window.GameDeals.Fixer = {
    getExchangeRates: getExchangeRates
  };
})();
