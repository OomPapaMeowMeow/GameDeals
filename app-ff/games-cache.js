//     This file is part of Game Deals extension for Mozilla Firefox
//     https://github.com/DanielKamkha/GameDealsFirefox
//     (c) 2015 Daniel Kamkha
//     Game Deals is free software distributed under the terms of the MIT license.

(function() {
  "use strict";

  let { storage } = require("sdk/simple-storage");

  let storeToPlain = storage.storeToPlain || (storage.storeToPlain = {});
  let plainToUrl = storage.plainToUrl || (storage.plainToUrl = {});

  function getStoreToPlainData(storeId) {
    return storeToPlain[storeId] || (storeToPlain[storeId] = {});
  }

  function getItadPlain(storeId, gameId) {
    return getStoreToPlainData(storeId)[gameId];
  }

  function setItadPlain(storeId, gameId, gamePlain) {
    getStoreToPlainData(storeId)[gameId] = gamePlain;
  }

  function getPlainToUrlData(storeId) {
    return plainToUrl[storeId] || (plainToUrl[storeId] = {});
  }

  function getStoreLink(storeId, gamePlain) {
    return getPlainToUrlData(storeId)[gamePlain];
  }

  function setStoreLink(storeId, gamePlain, url) {
    getPlainToUrlData(storeId)[gamePlain] = url;
  }

  exports.gamesCache = {
    getItadPlain: getItadPlain,
    setItadPlain: setItadPlain,
    getStoreLink: getStoreLink,
    setStoreLink: setStoreLink
  };
})();
