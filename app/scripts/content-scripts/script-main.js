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

  function analyzePrice($topContainer, deals) {
    GameDeals.Comm.showPageAction(deals, false);
  }

  function addDealLinks(storeId, storeData, $topContainer) {
    if ($topContainer.length === 0) {
      return;
    }
    let $container = storeData.getDealsContainer ? storeData.getDealsContainer($topContainer) : $topContainer;
    GameDeals.Comm.getGamePlain(storeId, storeData.getGameId($topContainer), storeData.gameIdType)
      .then(function(gamePlain) {
        return gamePlain ? GameDeals.Comm.getBestDeals(gamePlain, storeData.dealsLimit) : null;
      })
      .then(function(deals) {
        if (!deals) {
          return;
        }

        analyzePrice($topContainer, deals);

        let $block = storeData.createBlock(GameDeals.Tools.getBestDealsString(deals.length));
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

    if (!chrome) { // Firefox-specific cleanup
      self.port.on("detach", function (reason) {
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
