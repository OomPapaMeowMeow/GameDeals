//     This file is part of Game Deals extension for Chrome and Firefox
//     https://github.com/DanielKamkha/GameDeals
//     (c) 2015 Daniel Kamkha
//     Game Deals is free software distributed under the terms of the MIT license.

(function() {
  "use strict";

  const urlsAndIds = [
    { regex: /.*store\.steampowered\.com\/app\/.*/, storeId: "steam" },
    { regex: /.*www\.humblebundle\.com\/store.*/, storeId: "humblestore" },
    { regex: /.*www\.gog\.com\/game\/.*/, storeId: "gog" },
    { regex: /.*www\.origin\.com\/.*\/store\/buy\/.*/, storeId: "origin" },
    { regex: /.*www\.(win|mac)gamestore\.com\/product\/.*/, storeId: "wingamestore" },
    { regex: /.*www\.gamersgate\.com\/.*/, storeId: "gamersgate" },
    { regex: /.*www\.greenmangaming\.com\/.*/, storeId: "greenmangaming" },
    { regex: /.*www\.desura\.com\/games\/.*/, storeId: "desura" }
  ];

  const urlsAndIdsWishlist = [
    { regex: /.*steamcommunity\.com\/profiles\/.*\/wishlist/, storeId: "steam" },
    { regex: /.*www\.humblebundle\.com\/store.*/, storeId: "humblestore" }
  ];

  function getStoreIdByUrl(url, array) {
    let storeId = null;
    array.some(function(urlIdData) {
      if (urlIdData.regex.test(url)) {
        storeId = urlIdData.storeId;
        return true;
      }
      return false;
    });
    return storeId;
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
    let array = isWishlist ? urlsAndIdsWishlist : urlsAndIds;
    let storeId = getStoreIdByUrl(window.location.href, array);
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
        true
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
