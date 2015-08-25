//     This file is part of Game Deals extension for Chrome and Firefox
//     https://github.com/DanielKamkha/GameDeals
//     (c) 2015 Daniel Kamkha
//     Game Deals is free software distributed under the terms of the MIT license.

//     Currency parsing routine partially based on code from Enhanced Steam
//     https://github.com/jshackles/Enhanced_Steam/
//     Enhanced Steam is (c) 2012-2015 Jason Shackles

(function() {
  "use strict";

  const currencySymbolRegex = /(?:R\$|S\$|\$|RM|kr|Rp|€|¥|£|฿|pуб|P|₫|₩|TL|₴|Mex\$|CDN\$|A\$|NZ\$)/;
  const currencySymbolToType = {
    "pуб": "RUB",
    "€": "EUR",
    "£": "GBP",
    "R$": "BRL",
    "¥": "JPY",
    "kr": "NOK",
    "Rp": "IDR",
    "RM": "MYR",
    "P": "PHP",
    "S$": "SGD",
    "฿": "THB",
    "₫": "VND",
    "₩": "KRW",
    "TL": "TRY",
    "₴": "UAH",
    "Mex$": "MXN",
    "CDN$": "CAD",
    "A$": "AUD",
    "NZ$": "NZD"
  };
  const currencyFormatInfo = {
    "BRL": { places: 2, hidePlacesWhenZero: false, symbolFormat: "R$ ", thousand: ".", decimal: ",", right: false },
    "EUR": { places: 2, hidePlacesWhenZero: false, symbolFormat: "€", thousand: " ", decimal: ",", right: true },
    "GBP": { places: 2, hidePlacesWhenZero: false, symbolFormat: "£", thousand: ",", decimal: ".", right: false },
    "RUB": { places: 2, hidePlacesWhenZero: true,  symbolFormat: " pуб.", thousand: "", decimal: ",", right: true },
    "JPY": { places: 0, hidePlacesWhenZero: false, symbolFormat: "¥ ", thousand: ",", decimal: ".", right: false },
    "MYR": { places: 2, hidePlacesWhenZero: false, symbolFormat: "RM", thousand: ",", decimal: ".", right: false },
    "NOK": { places: 2, hidePlacesWhenZero: false, symbolFormat: " kr", thousand: ".", decimal: ",", right: true },
    "IDR": { places: 0, hidePlacesWhenZero: false, symbolFormat: "Rp ", thousand: " ", decimal: ".", right: false },
    "PHP": { places: 2, hidePlacesWhenZero: false, symbolFormat: "P", thousand: ",", decimal: ".", right: false },
    "SGD": { places: 2, hidePlacesWhenZero: false, symbolFormat: "S$", thousand: ",", decimal: ".", right: false },
    "THB": { places: 2, hidePlacesWhenZero: false, symbolFormat: "฿", thousand: ",", decimal: ".", right: false },
    "VND": { places: 2, hidePlacesWhenZero: false, symbolFormat: "₫", thousand: ",", decimal: ".", right: false },
    "KRW": { places: 2, hidePlacesWhenZero: false, symbolFormat: "₩", thousand: ",", decimal: ".", right: false },
    "TRY": { places: 2, hidePlacesWhenZero: false, symbolFormat: " TL", thousand: "", decimal: ",", right: true },
    "UAH": { places: 2, hidePlacesWhenZero: false, symbolFormat: "₴", thousand: "", decimal: ",", right: true },
    "MXN": { places: 2, hidePlacesWhenZero: false, symbolFormat: "Mex$ ", thousand: ",", decimal: ".", right: false },
    "CAD": { places: 2, hidePlacesWhenZero: false, symbolFormat: "CDN$ ", thousand: ",", decimal: ".", right: false },
    "AUD": { places: 2, hidePlacesWhenZero: false, symbolFormat: "A$ ", thousand: ",", decimal: ".", right: false },
    "NZD": { places: 2, hidePlacesWhenZero: false, symbolFormat: "NZ$ ", thousand: ",", decimal: ".", right: false },
    "USD": { places: 2, hidePlacesWhenZero: false, symbolFormat: "$", thousand: ",", decimal: ".", right: false }
  };

  function formatCurrency(number, type) {
    var info = currencyFormatInfo[type];
    if (info.hidePlacesWhenZero && number % 1 === 0) {
      info.places = 0;
    }

    let negative = number < 0 ? "-" : "";
    let i = parseInt(number = Math.abs(+number || 0).toFixed(info.places), 10) + "";
    let j = i.length > 3 ? i.length % 3 : 0;
    let formatted = negative +
      (j ? i.substr(0, j) + info.thousand : "") +
      i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + info.thousand) +
      (info.places ? info.decimal + Math.abs(number - i).toFixed(info.places).slice(2) : "");

    return info.right ? formatted + info.symbolFormat : info.symbolFormat + formatted;
  }

  function currencySymbolFromString(str) {
    let match = str.match(currencySymbolRegex);
    return match ? match[0] : "";
  }

  function parseCurrency(str) {
    if (!str) {
      return null;
    }

    let currencySymbol = currencySymbolFromString(str);
    let currencyType = currencySymbolToType[currencySymbol] || "USD";
    let info = currencyFormatInfo[currencyType];

    // remove thousand separator, replace decimal with dot, remove non-numeric
    str = str.replace(info.thousand, "")
      .replace(info.decimal, ".")
      .replace(/[^\d\.]/g, "")
      .trim();

    let value = parseFloat(str);
    if (isNaN(value)) {
      return null;
    }
    return {
      value: value,
      currencyType: currencyType,
      currencySymbol: currencySymbol
    };
  }

  window.GameDeals = window.GameDeals || {};
  window.GameDeals.Currency = {
    parseCurrency: parseCurrency,
    formatCurrency: formatCurrency
  };
})();
