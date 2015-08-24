//     This file is part of Game Deals extension for Chrome and Firefox
//     https://github.com/DanielKamkha/GameDealsChrome
//     https://github.com/DanielKamkha/GameDealsFirefox
//     (c) 2015 Daniel Kamkha
//     Game Deals is free software distributed under the terms of the MIT license.

(function() {
  "use strict";

  const urlsAndIds = [
    { regex: /.*store\.steampowered\.com\/app\/.*/, storeId: "steam" },
    { regex: /.*www\.humblebundle\.com\/store.*/, storeId: "humblestore" },
    { regex: /.*www\.gog\.com\/game\/.*/, storeId: "gog" },
    { regex: /.*www\.origin\.com\/.*\/store\/buy\/.*/, storeId: "origin" },
    { regex: /.*www\.(win|mac)gamestore\.com\/product\/.*/, storeId: "wingamestore" }
  ];

  function getStoreIdByUrl(url) {
    let storeId = null;
    urlsAndIds.some(function(urlIdData) {
      if (urlIdData.regex.test(url)) {
        storeId = urlIdData.storeId;
        return true;
      }
      return false;
    });
    return storeId;
  }

  function analyzePrice(storeData, $topContainer, deals) {
    let priceString = storeData.getPrice($topContainer);
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
      GameDeals.Comm.showPageAction(priceString, deals, dealPriceData.value <= priceData.value/2);
    }
  }

  function addDealLinks(storeId, storeData, $topContainer) {
    if ($topContainer.length === 0) {
      return;
    }
    let $container = storeData.getDealsContainer ? storeData.getDealsContainer($topContainer) : $topContainer;
    GameDeals.Comm.getGamePlain(storeId, storeData.getGameId($topContainer), storeData.gameIdType)
      .then(function(gamePlain) {
        return gamePlain ? GameDeals.Comm.getBestDeals(gamePlain) : null;
      })
      .then(function(deals) {
        if (!deals) {
          return;
        }

        analyzePrice(storeData, $topContainer, deals);
        if (storeData.dealsLimit) {
          deals = deals.slice(0, storeData.dealsLimit);
        }

        let $block = storeData.createBlock(GameDeals.Consts.getBestDealsString(deals.length));
        storeData.addDealsBlock($container, $block);

        let links = deals.map(function(dealData) {
          return storeData.createLink(dealData, GameDeals.Consts.getStoreIconByTitle(dealData.storeTitle), $block);
        });
        storeData.addDealLinksToDealsBlock($block, links, $container);
      });
  }

  function doAttach() {
    let storeId = getStoreIdByUrl(window.location.href);
    if (!storeId) {
      return;
    }
    let storeData = GameDeals.Stores.getStorePageData(storeId);
    addDealLinks(storeId, storeData, $(storeData.containerSelector));

    let observer = null;
    if (storeData.needsObserver) {
      observer = GameDeals.Tools.waitForElementObserver(storeData.containerSelector, addDealLinks.bind(null, storeId, storeData));
    }

    if (self.port) { // Firefox-specific cleanup
      self.port.on("detach", function(reason) {
        if (observer) {
          observer.disconnect();
          observer = null;
        }
        if (reason) {
          $(".gs-marker").remove();
        }
      });
    }
  }

  doAttach();
})();
