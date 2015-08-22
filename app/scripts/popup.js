//     This file is part of Game Deals extension for Google Chrome
//     https://github.com/DanielKamkha/GameDealsChrome
//     (c) 2015 Daniel Kamkha
//     Game Deals is free software distributed under the terms of the MIT license.

(function() {
  "use strict";

  function createLink(dealData, iconClass) {
    let $icon = $("<i class='fa gs-icon'></i>").addClass(iconClass);
    let $link = $("<a class='gs-popup-link'></a>").attr("href", dealData.url).append($icon, dealData.storeTitle);
    let $priceDiv = $("<div class='gs-price'></div>").text(dealData.price);
    return $("<div class='gs-popup-line'></div>").append($link, $priceDiv);
  }

  function showDeals(deals) {
    let $block = $("#deals").empty();
    let links = deals.map(function(dealData) {
      return createLink(dealData, GameDeals.Consts.getStoreIconByTitle(dealData.storeTitle));
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
