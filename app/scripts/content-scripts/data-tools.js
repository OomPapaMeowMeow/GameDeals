//     This file is part of Game Deals extension for Chrome and Firefox
//     https://github.com/DanielKamkha/GameDeals
//     (c) 2015 Daniel Kamkha
//     Game Deals is free software distributed under the terms of the MIT license.

(function() {
  "use strict";

  // Wait for element defined by targetSelector, under the $root.
  // When the element appears, call callback() function on it and stop waiting (if once flag is true).
  function waitForElementObserver(targetSelector, callback, once, oncePerCall, $root) {
    $root = $root || $("body");

    let observer = new MutationObserver(function (mutations, obs) {
      mutations.some(function (mutation) {
        let $target = $(mutation.addedNodes).find(targetSelector).addBack(targetSelector);
        if ($target.length > 0) {
          setTimeout(function() { callback($target); }, 0);
          if (once) {
            obs.disconnect();
            return true;
          }
          if (oncePerCall) {
            return true;
          }
        }
        return false;
      });
    });

    observer.observe($root[0], {childList: true, subtree: true});
    return observer;
  }

  function trimStartByList(str, list) {
    list.forEach(function(suffix) {
      if (str.startsWith(suffix)) {
        str = str.slice(suffix.length).trim();
      }
    });
    return str;
  }

  function trimEndByList(str, list) {
    list.forEach(function(suffix) {
      if (str.endsWith(suffix)) {
        str = str.slice(0, -suffix.length).trim();
      }
    });
    return str;
  }

  function getGameIdFromPathName() {
    let gameId = window.location.pathname;
    gameId = trimStartByList(gameId, ["/"]);
    gameId = trimEndByList(gameId, ["/"]);
    return gameId;
  }

  window.GameDeals = window.GameDeals || {};
  window.GameDeals.Tools = {
    waitForElementObserver: waitForElementObserver,
    trimStartByList: trimStartByList,
    trimEndByList: trimEndByList,
    getGameIdFromPathName: getGameIdFromPathName
  };
})();
