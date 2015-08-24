//     This file is part of Game Deals extension for Mozilla Firefox
//     https://github.com/DanielKamkha/GameDealsFirefox
//     (c) 2015 Daniel Kamkha
//     Game Deals is free software distributed under the terms of the MIT license.

(function() {
  "use strict";

  function makeGetRequestWithRetry(url, retryConfig) { // TODO: use addon SDK 'request' API
    return new Promise(function (resolve, reject) {
      $.ajax({ url: url }).retry(retryConfig).then(resolve, reject);
    });
  }

  window.GameDeals = window.GameDeals || {};
  window.GameDeals.XHR = {
    makeGetRequestWithRetry: makeGetRequestWithRetry
  };
})();
