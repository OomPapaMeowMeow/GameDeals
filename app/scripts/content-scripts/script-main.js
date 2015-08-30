//     This file is part of Game Deals extension for Chrome and Firefox
//     https://github.com/DanielKamkha/GameDeals
//     (c) 2015 Daniel Kamkha
//     Game Deals is free software distributed under the terms of the MIT license.

(function() {
  "use strict";

  const idsDictStore = {
    "steampowered": "steam",
    "humblebundle": "humblestore",
    "gog": "gog",
    "origin": "origin",
    "wingamestore": "wingamestore",
    "macgamestore": "wingamestore",
    "gamersgate": "gamersgate",
    "greenmangaming": "greenmangaming",
    "desura": "desura"
  };

  const idsDictWishlist = {
    "steamcommunity": "steam",
    "humblebundle": "humblestore"
  };

  function getStoreIdFromLocation(dict) {
    let host = window.location.hostname.split(".").slice(-2, -1)[0];
    return dict[host];
  }

  function addDealLinks(storeId, storeData, isWishlist, $topContainer) {
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

        if (!isWishlist) {
          GameDeals.Comm.analyzePrice(storeData.getPrice($topContainer), deals);
        }
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

  function addAllDealLinks(storeId, storeData, isWishlist) {
    $(storeData.containerSelector).each(function() { addDealLinks(storeId, storeData, isWishlist, $(this)); });
  }

  function doAttach(isWishlist) {
    let storeId = getStoreIdFromLocation(isWishlist ? idsDictWishlist : idsDictStore);
    if (!storeId) {
      return;
    }
    let storeData = GameDeals.Stores.getStorePageData(storeId, isWishlist);
    addAllDealLinks(storeId, storeData, isWishlist);

    let observer = null;
    if (storeData.needsObserver) {
      observer = GameDeals.Tools.waitForElementObserver(
        storeData.containerSelector,
        addAllDealLinks.bind(null, storeId, storeData, isWishlist),
        false, true
      );
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

  doAttach(true);
  doAttach(false);
})();
