//     This file is part of Game Deals extension for Google Chrome
//     https://github.com/DanielKamkha/GameDeals
//     (c) 2015 Daniel Kamkha
//     Game Deals is free software distributed under the terms of the MIT license.

(function() {
  "use strict";

  chrome.storage.sync.get(
    {
      usePageAction: true,
      showNonDeals: false
    },
    function(items) {
      $("#page-action").prop("checked", items.usePageAction);
      $("#non-deal").prop("checked", items.showNonDeals);
    }
  );

  $("#page-action").on("click", function() {
    chrome.storage.sync.set({ usePageAction: $("#page-action").prop("checked") });
  });
  $("#non-deal").on("click", function() {
    chrome.storage.sync.set({ showNonDeals: $("#non-deal").prop("checked") });
  });

  $("#close").on("click", function() { window.close(); });
})();
