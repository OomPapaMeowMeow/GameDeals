//     This file is part of Game Deals extension for Google Chrome
//     https://github.com/DanielKamkha/GameDealsChrome
//     (c) 2015 Daniel Kamkha
//     Game Deals is free software distributed under the terms of the MIT license.

(function() {
  "use strict";

  function createLink(dealData) {
    let $link = $("<a class='gs-popup-link'></a>").attr("href", dealData.url).append(dealData.storeTitle);
    let $priceDiv = $("<div class='gs-price'></div>").text(dealData.price);
    return $("<div class='gs-popup-line'></div>").append($link, $priceDiv);
  }

  function showDeals(dealsAndPrice) {
    $("#price").text(dealsAndPrice.price);
    let $block = $("#deals").empty();
    let links = dealsAndPrice.deals.map(function(dealData) {
      return createLink(dealData);
    });
    $block.append(links);
  }

  chrome.tabs.query({ active: true, currentWindow: true }, function callback(tabs) {
    chrome.runtime.sendMessage({ methodName: "getDealsForTab", tabId: tabs[0].id }, showDeals);
  });

  $("body").on("click", "a", function() {
    chrome.tabs.create({ url: $(this).attr("href") });
    return false;
  });
})();
