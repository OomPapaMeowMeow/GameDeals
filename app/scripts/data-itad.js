//     This file is part of Game Deals extension for Chrome and Firefox
//     https://github.com/DanielKamkha/GameDealsChrome
//     https://github.com/DanielKamkha/GameDealsFirefox
//     (c) 2015 Daniel Kamkha
//     Game Deals is free software distributed under the terms of the MIT license.

(function() {
  "use strict";

  const debug = true;
  const successStr = "ok:";
  const failStr = "fail:";

  const idTypeStrings = ["game_id", "url", "title"];
  const excludedStores = ["Gamesrocket"];

  const itadApiKey = "e308215aaf460543e2a5d10794d0bec772a9c31a";
  const plainRequestUrl = "http://api.isthereanydeal.com/v02/game/plain/?key=" + itadApiKey;
  const retryConfig = { times: 3, timeout: 1500, statusCodes: [503, 504] };

  function assert() {
    if (debug) {
      console.log(Array.prototype.join.call(arguments, " "));
    }
  }

  function getGamePlain(storeId, gameId, idType) {
    idType = idType || 0;
    assert(getGamePlain.name, storeId, gameId, idType);
    let url = plainRequestUrl + "&shop=" + storeId + "&" + idTypeStrings[idType] + "=" + gameId;
    return GameDeals.XHR.makeGetRequestWithRetry(url, retryConfig).then(function(response) {
      assert(getGamePlain.name, storeId, gameId, successStr, response.data.plain);
      return response.data.plain;
    }).catch(function(jqXHR) {
      assert(getGamePlain.name, storeId, gameId, failStr, jqXHR.status, jqXHR.statusText);
    });
  }

  function getBestDeals(gamePlain) {
    assert(getBestDeals.name, gamePlain);
    let url = "http://isthereanydeal.com/ajax/game/info?plain=" + gamePlain;
    return GameDeals.XHR.makeGetRequestWithRetry(url, retryConfig).then(function(html) {
      let $allDeals = $(html).find("tr.row");
      if ($allDeals.length === 0) {
        assert(getBestDeals.name, gamePlain, successStr, "no rows");
        return null;
      }

      let $bestDeal = $allDeals.first();
      while ($bestDeal.length > 0 && excludedStores.indexOf($bestDeal.find("a").text()) > -1) {
        $bestDeal = $bestDeal.next();
      }

      let bestPrice = $bestDeal.children("td.new").text();
      let bestDeals = [];
      $bestDeal.nextAll().addBack().each(function() {
        let $row = $(this);
        let $link = $row.find("a");
        let price = $row.children("td.new").text();
        if (price === bestPrice) {
          bestDeals.push({
            storeTitle: $link.text(),
            url: $link.attr("href"),
            price: price
          });
        } else {
          return false;
        }
      });
      assert(getBestDeals.name, gamePlain, successStr, bestDeals.length, "rows");
      return bestDeals;
    }).catch(function(jqXHR) {
      assert(getBestDeals.name, gamePlain, failStr, jqXHR.status, jqXHR.statusText);
    });
  }

  function getStoreLink(storeId, gamePlain) { // TODO: does not work if the shop is not in top 5 deals
    assert(getStoreLink.name, storeId, gamePlain);
    let url = "http://isthereanydeal.com/ajax/game/info?plain=" + gamePlain;
    return GameDeals.XHR.makeGetRequestWithRetry(url, retryConfig).then(function(html) {
      let storeTitle = GameDeals.Consts.getStoreTitleById(storeId);
      let url = $(html).find("a.shopTitle:contains('" + storeTitle + "')").attr("href");
      assert(getStoreLink.name, storeId, gamePlain, successStr, url);
      return url;
    }).catch(function(jqXHR) {
      assert(getStoreLink.name, storeId, gamePlain, failStr, jqXHR.status, jqXHR.statusText);
    });
  }

  window.GameDeals = window.GameDeals || {};
  window.GameDeals.Itad = {
    getGamePlain: getGamePlain,
    getBestDeals: getBestDeals,
    getStoreLink: getStoreLink
  };
})();
