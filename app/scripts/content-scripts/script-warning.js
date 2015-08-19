//     This file is part of Game Deals extension for Chrome and Firefox
//     https://github.com/DanielKamkha/GameDealsChrome
//     https://github.com/DanielKamkha/GameDealsFirefox
//     (c) 2015 Daniel Kamkha
//     Game Deals is free software distributed under the terms of the MIT license.

(function() {
  "use strict";

  function doAttach() {
    // For now the only excluded store is Gamesrocket, so just 'fix' it without any checks
    location.href = "https://www.trustpilot.com/review/www.gamesrocket.com";
  }

  doAttach();
})();
