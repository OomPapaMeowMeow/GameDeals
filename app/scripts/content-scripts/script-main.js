//     This file is part of Game Deals extension for Mozilla Firefox
//     https://github.com/DanielKamkha/GameDealsFirefox
//     (c) 2015 Daniel Kamkha
//     Game Deals is free software distributed under the terms of the MIT license.

(function() {
  "use strict";

  function addDealLinks(storeId, storeData, $topContainer) {
    if ($topContainer.length === 0) {
      return;
    }
    let $container = storeData.getDealsContainer ? storeData.getDealsContainer($topContainer) : $topContainer;
    GameDeals.Cache.getGamePlain(storeId, storeData.getGameId($topContainer), storeData.gameIdType)
      .then(function(gamePlain) {
        return gamePlain ? GameDeals.Itad.getBestDeals(gamePlain, storeData.dealsLimit) : null;
      })
      .then(function(dataArray) {
        if (!dataArray) {
          return;
        }

        let $block = storeData.createBlock(GameDeals.Tools.getBestDealsString(dataArray.length));
        storeData.addDealsBlock($container, $block);

        let links = dataArray.map(function(dealData) {
          return storeData.createLink(dealData, GameDeals.Stores.getStoreIconByTitle(dealData.storeTitle), $block);
        });
        storeData.addDealLinksToDealsBlock($block, links, $container);
      });
  }

  function doAttach() {
    let storeId = self.options.storeId;
    let storeData = GameDeals.Stores.getStorePageData(storeId);
    addDealLinks(storeId, storeData, $(storeData.containerSelector));

    let observer = null;
    if (storeData.needsObserver) {
      observer = GameDeals.Tools.waitForElementObserver(storeData.containerSelector, addDealLinks.bind(null, storeId, storeData));
    }

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

  doAttach();
})();
