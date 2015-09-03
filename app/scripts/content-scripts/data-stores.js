//     This file is part of Game Deals extension for Chrome and Firefox
//     https://github.com/DanielKamkha/GameDeals
//     (c) 2015 Daniel Kamkha
//     Game Deals is free software distributed under the terms of the MIT license.

(function() {
  "use strict";

  function ensureArray(value) {
    return Array.isArray(value) ? value : [value];
  }

  function arrayInsertBefore($parent, children, $reference) {
    let referenceNode = $reference[0];
    ensureArray(children).forEach(function ($child) {
      $parent[0].insertBefore($child[0], referenceNode);
    });
  }

  // Safety: circumvent jQuery .append() to avoid unintentional HTML parsing.
  function safeAppend($parent, children) {
    if ($parent.length === 0) {
      return;
    }
    ensureArray(children).forEach(function($child) {
      $parent[0].appendChild($child[0]);
    });
  }

  // Safety: circumvent jQuery .prepend() to avoid unintentional HTML parsing.
  function safePrepend($parent, children) {
    if ($parent.length === 0) {
      return;
    }
    let $reference = $parent.contents().first();
    if ($reference.length === 0) {
      safeAppend($parent, children);
    } else {
      arrayInsertBefore($parent, children, $reference);
    }
  }

  // Safety: circumvent jQuery .before() to avoid unintentional HTML parsing.
  function safeBefore($reference, children) {
    if ($reference.length === 0) {
      return;
    }
    let $parent = $reference.parent();
    if ($parent.length === 0) {
      return;
    }
    arrayInsertBefore($parent, children, $reference);
  }

  // Safety: circumvent jQuery .after() to avoid unintentional HTML parsing.
  function safeAfter($reference, children) {
    if ($reference.length === 0) {
      return;
    }
    let $parent = $reference.parent();
    if ($parent.length === 0) {
      return;
    }
    $reference = $reference.next();
    if ($reference.length === 0) {
      safeAppend($parent, children);
    } else {
      arrayInsertBefore($parent, children, $reference);
    }
  }

  function createLinkBase(dealData, iconClass, linkClass, needsSpan) {
    let $icon = $("<i>", { "class": "fa gs-icon " + iconClass });
    let $link = $("<a>", { "class": linkClass, "href": dealData.url }).text(dealData.storeTitle).prepend($icon);
    let $priceDiv = $("<div>", { "class": "gs-price" }).text(dealData.price);
    return $(needsSpan ? "<span>" : "<div>", { "class": "gs-marker" }).append($link, $priceDiv);
  }

  const storePageData = {
    "steam": {
      containerSelector: "div.game_meta_data",
      getGameId: GameDeals.Tools.getGameIdFromPathName,
      createBlock: function(blockTitle) {
        let $blockTitle = $("<div>", { "class": "block_title gs-steam-title" }).text(blockTitle + ":");
        return $("<div>", { "class": "block gs-marker" }).append($blockTitle);
      },
      createLink: function(dealData, iconClass) {
        let $icon = $("<i>", { "class": "fa fa-lg gs-steam-icon " + iconClass });
        let $iconLink = $("<a>", { "href": dealData.url }).append($icon);
        let $iconDiv = $("<div>", { "class": "icon" }).append($iconLink);

        let $priceDiv = $("<div>", { "class": "gs-steam-price" }).text(dealData.price);
        let $textLink = $("<a>", { "class": "name", "href": dealData.url }).text(dealData.storeTitle).append($priceDiv);

        return $("<div>", { "class": "game_area_details_specs" }).append($iconDiv, $textLink);
      },
      getPrice: function() {
        let $priceArea = $("#game_area_purchase");
        let $priceDiv = $priceArea.find("div.discount_final_price");
        if ($priceDiv.length === 0) {
          $priceDiv = $priceArea.find("div.game_purchase_price");
        }
        return $priceDiv.first().text();
      },
      addDealsBlock: safePrepend,
      addDealLinksToDealsBlock: safeAppend
    },
    "humblestore": {
      containerSelector: "div.product-details",
      needsObserver: true,
      getGameId: function() {
        return GameDeals.Tools.getGameIdFromPathName().split("/").pop();
      },
      createBlock: function(blockTitle) {
        return $("<dt class='gs-marker'></dt>").text(blockTitle + ":");
      },
      createLink: function(dealData, iconClass) {
        let $icon = $("<i class='fa gs-icon'></i>").addClass(iconClass);
        let $storeLink = $("<a></a>").attr("href", dealData.url).append($icon, dealData.storeTitle).addClass("gs-humble-link");
        let $dd = $("<dd class='gs-marker'></dd>").append($storeLink);
        if (dealData.price) {
          let $priceDiv = $("<div class='gs-price'></div>").text(dealData.price);
          $dd.append($priceDiv);
        }
        return $dd;
      },
      getPrice: function() {
        return $("span.price").first().text();
      },
      getDealsContainer($topContainer) {
        return $topContainer.find("dl.product-links");
      },
      addDealsBlock: function($container, $block) {
        safePrepend($container, $block);
      },
      addDealLinksToDealsBlock: function($block, dealLinks) {
        safeAfter($block, dealLinks);
      }
    },
    "gog": {
      containerSelector: "div.column--right.group-2.ng-scope",
      dealsLimit: 1,
      getGameId: function($topContainer) {
        return $topContainer.attr("gog-product");
      },
      createBlock: function(blockTitle) {
        return $("<b></b>").text(blockTitle.toUpperCase() + ": ");
      },
      createLink: function(dealData, iconClass, $block) {
        let $icon = $("<i class='fa gs-gog-icon'></i>").addClass(iconClass);
        let $link = $("<a></a>").attr("href", dealData.url).text(dealData.storeTitle);
        safePrepend($link, [$icon, $block]);
        let $priceDiv = $("<div class='gs-price'></div>").text(dealData.price);
        return $("<p class='gs-marker'></p>").append($link, $priceDiv).addClass("gs-gog-line");
      },
      getPrice: function() {
        let $priceDiv = $("span.buy-price__new");
        if ($priceDiv.length === 0) {
          $priceDiv = $("span.buy-price");
        }
        return $priceDiv.first().text();
      },
      getDealsContainer($topContainer) {
        return $topContainer.find("div.buy-footer-info");
      },
      addDealsBlock: function() { },
      addDealLinksToDealsBlock: function($block, dealLinks, $container) { // jshint ignore:line
        safePrepend($container, dealLinks);
      }
    },
    "origin": {
      containerSelector: "div.main-mod-right",
      gameIdType: 2,
      getGameId: function() {
        return $("#title").text().trim();
      },
      createBlock: function(blockTitle) {
        let $blockTitle = $("<p class='action gs-origin-title'></p>").text(blockTitle);
        let $gsBlockInner = $("<div class='price-area'></div>").append($blockTitle);
        return $("<div class='price gs-origin-block gs-marker'></div>").append($gsBlockInner);
      },
      createLink: function (dealData, iconClass) {
        return createLinkBase(dealData, iconClass, "gs-origin-link").addClass("gs-origin-line");
      },
      getPrice: function() {
        return $("p.actual-price").first().text();
      },
      addDealsBlock: function($container, $block) {
        safeAppend($container, $block);
      },
      addDealLinksToDealsBlock: function($block, dealLinks) {
        safeAppend($block, dealLinks);
      }
    },
    "wingamestore": {
      containerSelector: "div.btnlist",
      dealsLimit: 1,
      getGameId: function() {
        return GameDeals.Tools.getGameIdFromPathName().split("/")[1];
      },
      createBlock: function(blockTitle) {
        return $("<label></label>").text(blockTitle);
      },
      createLink: function(dealData, iconClass) {
        let $icon = $("<i class='fa fa-lg gs-wgs-icon'></i>").addClass(iconClass);
        let $priceDiv = $("<div class='gs-price'></div>").text(dealData.price);
        let $linkText = $("<b></b>").text(dealData.storeTitle).prepend($icon).append($priceDiv);
        return $("<a class='gs-marker'></a>").attr("href", dealData.url).append($linkText);
      },
      getPrice: function() {
        return $("span.price").first().text();
      },
      addDealsBlock: function() { },
      addDealLinksToDealsBlock: function($block, dealLinks, $container) {
        let $break = $("<br class='gs-marker'>");
        let $storeLink = dealLinks[0];
        safePrepend($storeLink, $block);
        $container.append($break, $storeLink);
      }
    },
    "gamersgate": {
      containerSelector: "#PP_data_main",
      getGameId: function() {
        return GameDeals.Tools.getGameIdFromPathName().split("/")[0];
      },
      createBlock: function(blockTitle) {
        return $("<h2 class='gs-marker gs-gamersgate-block'></h2>").text(blockTitle + ":");
      },
      createLink: function (dealData, iconClass) {
        return createLinkBase(dealData, iconClass).addClass("gs-gamersgate-line");
      },
      getPrice: function($topContainer) {
        return $topContainer.find("div.price_price").text().trim();
      },
      addDealsBlock: function($container, $block) {
        safeBefore($container.children().last(), $block);
      },
      addDealLinksToDealsBlock: safeAfter
    },
    "greenmangaming": {
      containerSelector: "#aside",
      getGameId: function() {
        return GameDeals.Tools.getGameIdFromPathName().split("/").pop();
      },
      createBlock: function(blockTitle) {
        let $blockTitle = $("<div></div>").text(blockTitle + ":");
        return $("<div class='gs-marker share_links gs-gmg-block'></div>").append($blockTitle);
      },
      createLink: createLinkBase,
      getPrice: function($topContainer) {
        return $topContainer.find("strong.curPrice").text();
      },
      addDealsBlock: function($container, $block) {
        safeAfter($container.children().first(), $block);
      },
      addDealLinksToDealsBlock: function($block, dealLinks) {
        safeAppend($block, dealLinks);
      }
    },
    "desura": {
      containerSelector: "div.sidecolumn",
      getGameId: function() {
        return $("#watchtoggle").attr("href").split("=").pop();
      },
      createBlock: function(blockTitle) {
        let $blockTitle = $("<span class='heading'></span>").text(blockTitle);
        let $blockTitleOuter = $("<div class='title'></div>").append($blockTitle);
        return $("<div class='gs-marker normalcorner'></div>").append($blockTitleOuter);
      },
      createLink: createLinkBase,
      getPrice: function($topContainer) {
        return $topContainer.find("span.price").contents().last()[0].textContent;
      },
      getDealsContainer($topContainer) {
        return $topContainer.find("div.normalbox");
      },
      addDealsBlock: function($container, $block) {
        safeAfter($container.children().first().next(), $block);
      },
      addDealLinksToDealsBlock: function($block, dealLinks) {
        let $linksContainer = $("<div class='gs-marker body gs-desura-block'></div>");
        safeAppend($linksContainer, dealLinks);
        $block.after($linksContainer);
      }
    },
    "gamesrepublic": {
      containerSelector: "div.product-right",
      gameIdType: 2,
      getGameId: function() {
        return $("#product-page").find("h1").first().text().trim();
      },
      createBlock: function(blockTitle) {
        let $blockTitle = $("<h4>").text(blockTitle);
        return $("<div>", { "class": "gs-marker gs-gamesrepublic-block" }).append($blockTitle);
      },
      createLink: createLinkBase,
      getPrice: function($topContainer) {
        return $topContainer.find("#iii-product-price-for-transaction").text();
      },
      getDealsContainer($topContainer) {
        return $topContainer.find("div.iii-sellit-container");
      },
      addDealsBlock: function($container, $block) {
        safeAfter($container, $block);
      },
      addDealLinksToDealsBlock: function($block, dealLinks) {
        safeAppend($block, dealLinks);
      }
    },
    "gamesplanet": {
      containerSelector: "div.info_sales",
      dealsLimit: 1,
      getGameId: function() {
        return GameDeals.Tools.getGameIdFromPathName().split("--").pop();
      },
      createBlock: function(blockTitle) {
        let $blockTitle = $("<strong>").text(blockTitle + ":");
        return $("<li>", { "class": "gs-marker" }).append($blockTitle);
      },
      createLink: function (dealData, iconClass) {
        return createLinkBase(dealData, iconClass, null, true);
      },
      getPrice: function($topContainer) {
        return $topContainer.find("span.price_current").text();
      },
      getDealsContainer($topContainer) {
        return $topContainer.find("ul");
      },
      addDealsBlock: function($container, $block) {
        safeAppend($container, $block);
      },
      addDealLinksToDealsBlock: function($block, dealLinks) {
        safeAppend($block, dealLinks);
      }
    },
    "uplay": {
      containerSelector: "#dr_ProductDetails",
      gameIdType: 2,
      getGameId: function() {
        //return $topContainer.find("div.productRight").find("input").val(); // gives region-dependent type-0 id
        return $("#productName").text();
      },
      createBlock: function(blockTitle) {
        let $blockTitle = $("<h3>", { "class": "gs-uplay-title" }).text(blockTitle + ":");
        return $("<div>", { "class": "gs-marker gs-uplay-block box1Column" }).append($blockTitle);
      },
      createLink: createLinkBase,
      getPrice: function($topContainer) {
        return $topContainer.find("span.dr_actualPrice").text().trim();
      },
      getDealsContainer($topContainer) {
        return $topContainer.find("div.productDesRight");
      },
      addDealsBlock: safePrepend,
      addDealLinksToDealsBlock: safeAppend
    },
    "bundlestars": {
      containerSelector: "div.col-md-4",
      getGameId: function($topContainer) {
        return $topContainer.find("input[name='productid']").val();
      },
      createBlock: function(blockTitle) {
        let $blockTitle = $("<h5>", { "class": "" }).text(blockTitle);
        return $("<div>", { "class": "gs-marker resale-notice gs-bundlestars-block" }).append($blockTitle);
      },
      createLink: createLinkBase,
      getPrice: function($topContainer) {
        return $topContainer.find("p.deal-buy-box-price").contents().first().text();
      },
      addDealsBlock: function($container, $block) {
        safeAfter($container.children().first(), $block);
      },
      addDealLinksToDealsBlock: safeAppend
    }
  };

  const storeWishlistData = {
    "steam": {
      containerSelector: "div.wishlistRow",
      dealsLimit: 1,
      getGameId: function($topContainer) {
        return $topContainer.find("a.btn_small").attr("href").split("/").slice(-2).join("/");
      },
      createBlock: function () { },
      createLink: function (dealData, iconClass) {
        return createLinkBase(dealData, iconClass + " gs-line").addClass("gs-steam-line");
      },
      getPrice: function ($container) {
        let $priceDiv = $container.find("div.discount_final_price");
        if ($priceDiv.length === 0) {
          $priceDiv = $container.find("div.price");
        }
        return $priceDiv.text().trim();
      },
      getDealsContainer($topContainer) {
        return $topContainer.find("div.gameListPriceData");
      },
      addDealsBlock: function () { },
      addDealLinksToDealsBlock: function ($block, dealLinks, $container) { // jshint ignore:line
        safeAppend($container, dealLinks);
      }
    },
    "humblestore": {
      containerSelector: "div.storefront-list-product",
      needsObserver: true,
      dealsLimit: 1,
      getGameId: function($topContainer) {
        return $topContainer.find("a.product-details-link").attr("href").split("/").pop();
      },
      createBlock: function () { },
      createLink: function (dealData, iconClass) {
        return createLinkBase(dealData, iconClass + " gs-line").addClass("gs-humble-line");
      },
      getPrice: function ($topContainer) {
        return $topContainer.find("span.text").text().trim();
      },
      getDealsContainer($topContainer) {
        return $topContainer.find("div.platforms-and-buy-button");
      },
      addDealsBlock: function () { },
      addDealLinksToDealsBlock: function ($block, dealLinks, $container) { // jshint ignore:line
        safePrepend($container, dealLinks);
      }
    },
    "gog": {
      containerSelector: "div.product-row",
      dealsLimit: 1,
      getGameId: function($topContainer) {
        return $topContainer.attr("gog-product");
      },
      createBlock: function () { },
      createLink: function (dealData, iconClass) {
        return createLinkBase(dealData, iconClass).addClass("gs-gog-link");
      },
      getPrice: function ($topContainer) {
        return $topContainer.find("div.price-btn").children().last().children().last().text().trim();
      },
      addDealsBlock: function () { },
      addDealLinksToDealsBlock: function ($block, dealLinks, $container) { // jshint ignore:line
        let $rating = $container.find("span.rating");
        safeBefore($rating, dealLinks);
        $rating.addClass("gs-hide-marker").hide();
      }
    },
    "wingamestore": {
      containerSelector: "tr.product",
      dealsLimit: 1,
      needsObserver: true,
      getGameId: function($topContainer) {
        return $topContainer.find("a.popm").attr("pid");
      },
      createBlock: function () {
        return $("<div>", { "class": "gs-marker" });
      },
      createLink: function (dealData, iconClass) {
        return createLinkBase(dealData, iconClass).addClass("product-type");
      },
      getPrice: function ($topContainer) {
        return $topContainer.find("span.price").text();
      },
      getDealsContainer($topContainer) {
        return $topContainer.find("td.details");
      },
      addDealsBlock: function ($container, $block) {
        safeAppend($container, $block);
      },
      addDealLinksToDealsBlock: function ($block, dealLinks) {
        safeAppend($block, dealLinks);
      }
    }
  };

  function getStorePageData(storeId, isWishlist) {
    let dict = isWishlist ? storeWishlistData : storePageData;
    return dict[storeId];
  }

  window.GameDeals = window.GameDeals || {};
  window.GameDeals.Stores = {
    getStorePageData: getStorePageData
  };
})();
