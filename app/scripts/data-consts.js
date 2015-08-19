//     This file is part of Game Deals extension for Chrome and Firefox
//     https://github.com/DanielKamkha/GameDealsChrome
//     https://github.com/DanielKamkha/GameDealsFirefox
//     (c) 2015 Daniel Kamkha
//     Game Deals is free software distributed under the terms of the MIT license.

(function() {
  "use strict";

  const storeTitles = {
    "steam": "Steam",
    "humblestore": "Humble Store",
    "gog": "GOG",
    "origin": "Origin PC",
    "wingamestore": "WinGameStore"
  };

  const storeIcons = {
    "Steam": "fa-steam"
    //"Amazon": "fa-amazon" // TODO: bug, does not pick up FontAwesome 4.4, still uses 4.3
  };

  function getStoreTitleById(storeId) {
    return storeTitles[storeId] || storeId;
  }

  function getStoreIconByTitle(storeTitle) {
    return storeIcons[storeTitle] || "fa-shopping-cart";
  }

  window.GameDeals = window.GameDeals || {};
  window.GameDeals.Consts = {
    getStoreTitleById: getStoreTitleById,
    getStoreIconByTitle: getStoreIconByTitle
  };
})();
