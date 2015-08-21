//     This file is part of Game Deals extension for Chrome and Firefox
//     https://github.com/DanielKamkha/GameDealsChrome
//     https://github.com/DanielKamkha/GameDealsFirefox
//     (c) 2015 Daniel Kamkha
//     Game Deals is free software distributed under the terms of the MIT license.

(function() {
  "use strict";

  const storeId = "humblestore";
  const steamStoreId = "steam";
  const steamStoreTitle = GameDeals.Consts.getStoreTitleById(steamStoreId);

  function addBundleSteamLink() {
    // jshint validthis:true
    let $topContainer = $(this);
    let gameId = $topContainer.children("h2").text();
    GameDeals.Comm.getGamePlain(storeId, gameId, 2)
      .then(function(gamePlain) {
        return gamePlain ? GameDeals.Comm.getStoreLink(steamStoreId, gamePlain) : null;
      })
      .then(function(url) {
        if (!url) {
          return;
        }

        let $icon = $("<i class='fa gs-icon'></i>").addClass(GameDeals.Consts.getStoreIconByTitle(steamStoreTitle));
        let $steamLink = $("<a></a>").attr("href", url).append($icon, steamStoreTitle);
        $steamLink.addClass("game-dev-link gs-marker");
        $topContainer.find("a.game-dev-link").last().after($steamLink);
      });
  }

  function doAttach() {
    $("div.game-description").each(addBundleSteamLink);

    if (!chrome) { // Firefox-specific cleanup
      self.port.on("detach", function (reason) {
        if (reason) {
          $(".gs-marker").remove();
        }
      });
    }
  }

  doAttach();
})();
