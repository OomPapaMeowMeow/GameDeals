//     This file is part of Game Deals extension for Chrome and Firefox
//     https://github.com/DanielKamkha/GameDeals
//     (c) 2015 Daniel Kamkha
//     Game Deals is free software distributed under the terms of the MIT license.

(function() {
  "use strict";

  const debug = false;
  const successStr = "ok:";
  const failStr = "fail:";

  const idTypeStrings = ["game_id", "url", "title"];
  const excludedStores = ["Gamesrocket"];

  const itadApiKey = "e308215aaf460543e2a5d10794d0bec772a9c31a";
  const plainRequestUrl = "http://api.isthereanydeal.com/v02/game/plain/?key=" + itadApiKey;

  function assert() {
    if (debug) {
      console.log(Array.prototype.join.call(arguments, " "));
    }
  }

  let lock = false;
  let requestQueue = new Queue();

  function processNextRequest() {
    if (lock || requestQueue.isEmpty()) {
      return;
    }
    lock = true;
    let data = requestQueue.dequeue();
    $.ajax({ method: "GET", url: data.url })
      .always(function () {
        lock = false;
        setTimeout(function () { processNextRequest(); }, 0);
      })
      .then(data.resolve, data.reject);
  }

  function makeItadGetRequest(url) {
    return new Promise(function (resolve, reject) {
      requestQueue.enqueue({ url: url, resolve: resolve, reject: reject });
      processNextRequest();
    });
  }

  function getGamePlain(storeId, gameId, idType) {
    idType = idType || 0;
    assert(getGamePlain.name, storeId, gameId, idType);
    let url = plainRequestUrl + "&shop=" + storeId + "&" + idTypeStrings[idType] + "=" + gameId;
    return makeItadGetRequest(url).then(function(response) {
      assert(getGamePlain.name, storeId, gameId, successStr, response.data.plain);
      return response.data.plain;
    }).catch(function(jqXHR) {
      assert(getGamePlain.name, storeId, gameId, failStr, jqXHR.status, jqXHR.statusText);
    });
  }

  function getBestDeals(gamePlain) {
    assert(getBestDeals.name, gamePlain);
    let url = "http://isthereanydeal.com/ajax/game/info?plain=" + gamePlain;
    return makeItadGetRequest(url).then(function(html) {
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

  window.GameDeals = window.GameDeals || {};
  window.GameDeals.Itad = {
    getGamePlain: getGamePlain,
    getBestDeals: getBestDeals
  };
})();
