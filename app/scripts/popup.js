//     This file is part of Game Deals extension for Chrome and Firefox
//     https://github.com/DanielKamkha/GameDeals
//     (c) 2015 Daniel Kamkha
//     Game Deals is free software distributed under the terms of the MIT license.

(function() {
  "use strict";

  const isChrome = typeof chrome !== "undefined";

  function createLink(dealData) {
    let $link = $("<a class='gs-black'></a>").attr("href", dealData.url).append(dealData.storeTitle);
    let $priceDiv = $("<div class='gs-price'></div>").text(dealData.price);
    return $("<div class='gs-nowrap'></div>").append($link, $priceDiv);
  }

  function showDeals(dealsAndPrice) {
    $("#price").text(dealsAndPrice.price);
    let $block = $("#deals").empty();
    let links = dealsAndPrice.deals.map(function(dealData) {
      return createLink(dealData);
    });
    $block.append(links);
  }

  function openUrlInNewTab(url) {
    if (isChrome) { // Chrome
      chrome.tabs.create({ url: url });
    } else { // Firefox
      self.port.emit("openTab", url);
    }
  }

  function getDealsForTab() {
    if (isChrome) { // Chrome
      chrome.tabs.query({ active: true, currentWindow: true }, function callback(tabs) {
        chrome.runtime.sendMessage({ messageName: "getDealsForTab", tabId: tabs[0].id }, showDeals);
      });
    } else { // Firefox
      self.port.emit("getDealsForTab");
    }
  }

  $("body").on("click", "a", function() {
    openUrlInNewTab($(this).attr("href"));
    return false;
  });

  if (isChrome) { // Chrome
    getDealsForTab();
  } else { // Firefox
    self.port.on("getDealsForTab", showDeals);
    self.port.on("show", getDealsForTab);
  }
})();
