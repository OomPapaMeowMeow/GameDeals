//     This file is part of Game Deals extension for Google Chrome
//     https://github.com/DanielKamkha/GameDealsChrome
//     (c) 2015 Daniel Kamkha
//     Game Deals is free software distributed under the terms of the MIT license.

(function() {
  "use strict";

  chrome.storage.sync.get(
    {
      usePageAction: true
    },
    function(items) {
      $("#page-action").prop("checked", items.usePageAction);
    }
  );

  $("#page-action").on("click", function() {
    chrome.storage.sync.set({ usePageAction: $("#page-action").prop("checked") });
  });

  $("#close").on("click", function() { window.close(); });
})();
