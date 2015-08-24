//     This file is part of Game Deals extension for Google Chrome
//     https://github.com/DanielKamkha/GameDealsChrome
//     (c) 2015 Daniel Kamkha
//     Game Deals is free software distributed under the terms of the MIT license.

(function() {
  "use strict";

  function makeGetRequestWithRetry(url, retryConfig) {
    return new Promise(function (resolve, reject) {
      $.ajax({ url: url }).retry(retryConfig).then(resolve, reject);
    });
  }

  window.GameDeals = window.GameDeals || {};
  window.GameDeals.XHR = {
    makeGetRequestWithRetry: makeGetRequestWithRetry
  };
})();
