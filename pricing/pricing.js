var mxtPricingFeed = "https://static-mxt.r.worldssl.net/buy/pricing",
    countryDetectFeed = "https://api.ipdata.co/?api-key=24974915667d7e516d67ddf4ac01cc913856d491b6b377652c209d26",
    data = "";
$(document).ready(function () {
    $("#credit-country").select2({ placeholder: "Select a country", dropdownParent: $(".box-country") }),
        $(document)
            .ajaxStart(function () {
                $(".loader-price").hasClass("is-visible") || $(".section-inner-loader").show();
            })
            .ajaxStop(function () {
                $(".section-inner-loader")
                    .delay(2e3)
                    .fadeOut(300, function () {
                        $(".loader-price").addClass("is-visible");
                    });
            }),
        $.ajax({
            url: mxtPricingFeed,
            dataType: "json",
            type: "GET",
            success: function (e) {
                (s.productData = e.productData), (s.productPrices = e.productPrices), (s.operatorData = e.operatorData), (s.operatorPrices = e.operatorPrices), s.init();
            },
        });
});
var s = {};
function getCookie(e) {
    for (var r = e + "=", s = document.cookie.split(";"), t = 0; t < s.length; t++) {
        for (var i = s[t]; " " == i.charAt(0); ) i = i.substring(1);
        if (0 == i.indexOf(r)) return i.substring(r.length, i.length).replace(/[+]/g, " ");
    }
    return "";
}
(s.productData = {}),
    (s.productPrices = {}),
    (s.operatorData = { countryOperators: [], names: {} }),
    (s.operatorPrices = { index: [], prices: {} }),
    (s.creditCountrySelect = null),
    (s.euroCurrency = 3),
    (s.uaeCurrency = 14),
    (s.defaultCurrency = 6),
    (s.audCurrency = 1),
    (s.selectedTier = null),
    (s.intl_rate = 0),
    (s.max_prices = {}),
    (s.monthly_fees = {}),
    (s.tier_names = { "pre-free": "Basic", "pre-bronze": "Advanced", "pre-silver": "Business", "pre-gold": "Enterprise", "pre-premium": "Premium Enterprise" }),
    (s.min_spend = { "pre-bronze": 0, "pre-silver": 0, "pre-gold": 0, "pre-premium": 0 }),
    (s.smsglobalPrices = { "pre-free": {}, "pre-bronze": {}, "pre-silver": {}, "pre-gold": {}, "pre-premium": {} }),
    (s.detectedCountry = null),
    (s.init = function () {
        s.operatorIndex = {};
        for (var e = 0; e < s.operatorPrices.index.length; e++) s.operatorIndex[s.operatorPrices.index[e]] = e;
        if (
            ((s.creditCountrySelect = $("#credit-country")),
            (s.firstCurrency = $("#first-currency")),
            (s.firstCurrencyLabel = $("#first-currency-label")),
            (s.secondCurrency = $("#second-currency")),
            (s.creditCurrency = $("input[name=currency]")),
            (s.creditCurrencyContainer = $("#credit-currency")),
            (s.subscriptionMethodContainer = $(".box-subscription-method")),
            (s.priceContainer = $(".price-container")),
            (s.priceContainerUs = $(".subscription-content")),
            (s.priceContent = $(".pricing-content")),
            (s.priceTable = $("#price")),
            (s.detectedCountry = "Australia"),
            s.fillCountries(),
            -1 != window.location.href.indexOf("/us/"))
        ) {
            var r = s.creditCountrySelect.find("option:contains(USA)").val();
            s.creditCountrySelect.val(r).trigger("change");
        } else if (-1 != window.location.href.indexOf("/ae/")) {
            var t = s.creditCountrySelect.find("option:contains(UAE)").val();
            s.creditCountrySelect.val(t).trigger("change");
        } else s.detectCountry();
        s.creditCountrySelect.on("change", s.populateCurrency).trigger("change"), s.creditCurrency.on("change", s.populatePrice).trigger("change");
    }),
    (s.fillCountries = function () {
        for (var e in s.productData.countryNames) {
            var r = s.productData.countryNames[e],
                t = $("<option></option>", { text: r, attr: { value: e } });
            r === s.detectedCountry && t.attr("selected", "selected"), s.creditCountrySelect.append(t);
        }
        s.sort("credit-country"), s.creditCountrySelect.val(s.creditCountrySelect.find("option[selected='selected']").val());
    }),
    (s.detectCountry = function () {
        $.getJSON(countryDetectFeed, function (e) {
            if (
                (e &&
                    "United Arab Emirates" === e.country_name &&
                    ((e.country_name = "UAE"),
                    $(".note").html('<span>* Sending higher volumes â€“ Call us at <a href="tel:+97144402600">+971 4 440 2600</a> for a special rate.</br><a href="/terms-conditions/">Terms and Conditions apply</a></span>')),
                e && "United States" === e.country_name && (e.country_name = "USA"),
                s.detectedCountry !== e.country_name)
            ) {
                var r = s.creditCountrySelect.find("option:contains(" + e.country_name + ")").val();
                r > 0 && s.creditCountrySelect.val(r).trigger("change");
            } else $(".note").html('<span>* Prices applicable when you buy in a single transaction <a href="/terms-conditions/">Terms and Conditions apply</a></span>');
        });
    }),
    (s.detectCampaignCountry = function (e) {
        var r = s.creditCountrySelect.find("option:contains(" + e + ")").val();
        r > 0 && s.creditCountrySelect.val(r).trigger("change");
    }),
    (s.populateCurrency = function () {
        var e = !1,
            r = s.getCurrencyCountry(s.creditCountrySelect.val());
        r === s.euroCurrency && ((e = !0), (r = s.defaultCurrency));
        var t = s.getCurrencySubunit(r);
        s.firstCurrency.attr("value", r),
            s.firstCurrencyLabel.html(t.symbollarge),
            (s.creditCountrySelected = $("#credit-country option:selected").text()),
            "Canada" == s.creditCountrySelected ? s.firstCurrency.prop("checked", !0) : e ? s.secondCurrency.prop("checked", !0) : s.firstCurrency.prop("checked", !0),
            s.populatePrice();
    }),
    (s.populatePrice = function () {
        var e = s.creditCountrySelect.val();
        s.getCurrencyCountry(s.creditCountrySelect.val());
        if (((s.smsglobalPrices = []), (s.smsglobalPricesFixed = []), s.isSingleRate(e))) {
            var r = s.getOperatorPrice(s.getCountryOperators(e)[0], 8);
            s.getOperatorPriceFixed(s.getCountryOperators(e)[0], 8);
            isNaN(r) || 0 === r ? s.addOperatorRow(s.getCountryOperators(e)[1]) : s.addOperatorRow(s.getCountryOperators(e)[0]);
        } else for (var t in s.getCountryOperators(e)) s.addOperatorRow(s.getCountryOperators(e)[t]);
        var i = parseInt(s.getCurrencyCountry(s.creditCountrySelect.val()));
        (s.min_spend["pre-bronze"] = Math.floor(s.productPrices[i][38582][8])),
            (s.min_spend["pre-silver"] = Math.floor(s.productPrices[i][41151][8])),
            (s.min_spend["pre-gold"] = Math.floor(s.productPrices[i][38592][8])),
            (s.min_spend["pre-premium"] = Math.floor(s.productPrices[i][38592][8])),
            s.displayPrice();
    }),
    (s.isSingleRate = function (e) {
        var r = [],
            t = !0;
        for (var i in s.operatorData.countryOperators[e]) {
            var a = s.operatorData.countryOperators[e][i];
            s.eachDisplayTier(function (e) {
                var i = s.getOperatorPrice(a, e);
                if (!isNaN(i) && i > 0)
                    if (void 0 === r[e]) r[e] = i;
                    else if (r[e] !== i) return void (t = !1);
            });
        }
        return t;
    }),
    (s.addOperatorRow = function (e) {
        s.eachDisplayTier(function (r) {
            var t = s.getTierCode(r),
                i = s.getOperatorPrice(e, r),
                a = s.getOperatorPriceFixed(e, r);
            (!isNaN(i) || i > 0) &&
                (s.getCurrencyCountry(s.creditCountrySelect.val()) !== s.audCurrency && "pre-premium" === t && ((i = s.getOperatorPrice(e, s.getTierId("pre-gold"))), (a = s.getOperatorPriceFixed(e, s.getTierId("pre-gold")))),
                (s.smsglobalPrices[t] || (s.smsglobalPrices[t] = [])).push({ priceText: s.addSmsPrice(i), price: i, operator: s.getOperatorName(e) }),
                (s.smsglobalPricesFixed[t] || (s.smsglobalPricesFixed[t] = [])).push({ priceText: s.addSmsPrice(a), price: a, operator: s.getOperatorName(e) }));
        });
    }),
    (s.eachDisplayTier = function (e) {
        var r = ["pre-free", "pre-bronze", "pre-silver", "pre-gold", "pre-premium"];
        for (var t in r) e(s.getTierId(r[t]));
    }),
    (s.getTierId = function (e) {
        return s.productData.tierCodes[e];
    }),
    (s.getOperatorPrice = function (e, r) {
        var t = parseInt(s.creditCurrency.filter(":checked").val()),
            i = s.operatorIndex[e];
        return s.operatorPrices.prices[t + "-" + r] && !isNaN(s.operatorPrices.prices[t + "-" + r][i]) && s.operatorPrices.prices[t + "-" + r][i] > 0 ? s.operatorPrices.prices[t + "-" + r][i] : 0;
    }),
    (s.getOperatorPriceFixed = function (e, r) {
        var t = parseInt(s.getCurrencyCountry(s.creditCountrySelect.val())),
            i = s.operatorIndex[e];
        return s.operatorPrices.prices[t + "-" + r] && !isNaN(s.operatorPrices.prices[t + "-" + r][i]) && s.operatorPrices.prices[t + "-" + r][i] > 0 ? s.operatorPrices.prices[t + "-" + r][i] : 0;
    }),
    (s.addSmsPrice = function (e) {
        var r;
        return (isNaN(e) || "" === e) && (e = 0), (r = s.getPriceInSubunit(e)) ? r[0] : e.toFixed(2);
    }),
    (s.getCurrencyCountry = function (e) {
        var r = {
            1: 12,
            2: 10,
            3: 8,
            4: 3,
            5: 3,
            6: 3,
            7: 4,
            8: 3,
            9: 3,
            10: 3,
            11: 3,
            12: 3,
            13: 3,
            14: 7,
            15: 3,
            16: 3,
            17: 3,
            18: 3,
            19: 3,
            20: 1,
            21: 3,
            22: 3,
            23: 18,
            24: 3,
            25: 3,
            26: 3,
            27: 3,
            28: 3,
            29: 3,
            30: 3,
            31: 3,
            32: 3,
            33: 3,
            34: 3,
            35: 3,
            36: 3,
            37: 3,
            38: 3,
            39: 3,
            40: 3,
            41: 3,
            42: 3,
            43: 3,
            44: 3,
            45: 3,
            46: 3,
            47: 3,
            48: 3,
            49: 3,
            50: 3,
            51: 3,
            52: 3,
            53: 3,
            54: 15,
            55: 6,
            56: 3,
            57: 3,
            58: 8,
            61: 3,
            62: 3,
            63: 3,
            64: 3,
            65: 3,
            66: 3,
            67: 3,
            68: 3,
            69: 3,
            70: 3,
            71: 3,
            72: 9,
            74: 3,
            75: 3,
            77: 3,
            78: 3,
            79: 3,
            80: 3,
            81: 3,
            82: 3,
            83: 3,
            84: 3,
            85: 3,
            86: 3,
            87: 3,
            88: 3,
            89: 3,
            90: 3,
            91: 3,
            92: 16,
            93: 7,
            94: 3,
            95: 3,
            96: 3,
            97: 3,
            98: 3,
            99: 3,
            100: 3,
            101: 3,
            102: 3,
            103: 3,
            104: 3,
            105: 3,
            106: 3,
            107: 3,
            108: 3,
            109: 3,
            110: 3,
            111: 3,
            112: 2,
            113: 3,
            114: 3,
            115: 3,
            116: 3,
            117: 19,
            118: 3,
            119: 3,
            120: 3,
            121: 6,
            122: 3,
            123: 3,
            124: 3,
            125: 3,
            126: 3,
            127: 3,
            128: 3,
            129: 6,
            130: 17,
            131: 3,
            132: 3,
            133: 3,
            134: 3,
            135: 3,
            136: 11,
            137: 3,
            138: 3,
            139: 3,
            140: 3,
            141: 3,
            142: 13,
            143: 3,
            144: 3,
            145: 3,
            146: 3,
            147: 3,
            148: 3,
            149: 3,
            150: 3,
            151: 3,
            152: 3,
            153: 3,
            154: 3,
            155: 3,
            156: 3,
            157: 3,
            158: 3,
            159: 3,
            160: 3,
            161: 14,
            162: 3,
            163: 3,
            164: 6,
            165: 3,
            166: 3,
            167: 3,
            168: 6,
            169: 3,
            170: 3,
            171: 3,
            172: 3,
            173: 3,
            174: 3,
            175: 3,
            176: 3,
            177: 3,
            178: 6,
            179: 3,
            180: 3,
            181: 3,
            182: 3,
            183: 3,
            184: 3,
            185: 1,
            186: 3,
            187: 3,
            188: 3,
            189: 3,
            190: 3,
            191: 3,
            192: 1,
            193: 3,
            194: 3,
            195: 3,
            196: 3,
            197: 3,
            198: 3,
            199: 3,
            200: 3,
            201: 3,
            202: 3,
            203: 3,
            204: 3,
            205: 3,
            206: 3,
            207: 3,
            208: 3,
            209: 3,
            210: 3,
            211: 3,
            212: 3,
            213: 3,
            214: 3,
            215: 3,
            216: 3,
            217: 3,
            218: 3,
            219: 3,
            220: 2,
            221: 0,
            735: 3,
            991: 3,
            1001: 3,
            3571: 1,
            3574: 0,
        };
        return void 0 !== r[e] ? r[e] : s.defaultCurrency;
    }),
    (s.getCurrencySubunit = function (e) {
        return {
            1: { multiplier: 100, symbolsmall: "c", symbollarge: "$", code: "AUD - Excluding. GST" },
            2: { multiplier: 100, symbolsmall: "c", symbollarge: "$", code: "NZD" },
            3: { multiplier: 100, symbolsmall: "c", symbollarge: "&euro;", code: "EUR" },
            4: { multiplier: 100, symbolsmall: "p", symbollarge: "Â£", code: "GBP" },
            6: { multiplier: 100, symbolsmall: "c", symbollarge: "$", code: "USD" },
            7: { multiplier: 100, symbolsmall: "c", symbollarge: "CHF", code: "CHF" },
            8: { multiplier: 100, symbolsmall: "Ã¸re", symbollarge: "kr", code: "DKK" },
            9: { multiplier: 100, symbolsmall: "c", symbollarge: "$", code: "HKD" },
            10: { multiplier: 100, symbolsmall: "Ã¸re", symbollarge: "kr$", code: "NOK" },
            11: { multiplier: 100, symbolsmall: "Hal", symbollarge: "SAR", code: "SAR" },
            12: { multiplier: 100, symbolsmall: "Ã¶re", symbollarge: "kr", code: "SEK" },
            13: { multiplier: 100, symbolsmall: "c", symbollarge: "$", code: "SGD" },
            14: { multiplier: 100, symbolsmall: "Fils", symbollarge: "AED", code: "AED - Excl. VAT" },
            15: { multiplier: 100, symbolsmall: "Piaster", symbollarge: "Â£", code: "EGP" },
            16: { multiplier: 100, symbolsmall: "Piastre", symbollarge: "Â£", code: "LBP" },
            17: { multiplier: 100, symbolsmall: "Dir", symbollarge: "QR", code: "QAR" },
            18: { multiplier: 100, symbolsmall: "Fils", symbollarge: "BD", code: "BHD" },
            19: { multiplier: 100, symbolsmall: "Baisa", symbollarge: "OMR", code: "OMR" },
        }[e];
    }),
    (s.getPriceInSubunit = function (e) {
        var r = s.getCurrencySubunit(parseInt(s.creditCurrency.filter(":checked").val()));
        return 1 !== r.multiplier && [(e * r.multiplier).toFixed(3).replace(/0{0,2}$/, ""), r.symbolsmall];
    }),
    (s.getTierCode = function (e) {
        return s.productData.tiers[e];
    }),
    (s.getOperatorName = function (e) {
        return s.operatorData.names[e];
    }),
    (s.getCountryOperators = function (e) {
        return s.operatorData.countryOperators[e];
    }),
    (s.getPriceFromTier = function (e, r) {
        var t = 0,
            i = "";
        for (var a in s.smsglobalPrices[r]) (0 === t || s.smsglobalPrices[r][a].price < t) && ((t = s.smsglobalPrices[r][a].price), (i = s.smsglobalPrices[r][a].priceText));
        return { price: numberWithCommas(Math.floor(e / t)), priceText: i, priceUnit: s.addPriceUnit(t) };
    }),
    (s.displayPrice = function () {
        var e = !0,
            r = 0,
            t = s.getCurrencyCountry(s.creditCountrySelect.val());
        for (var i in ((s.creditCountrySelected = $("#credit-country option:selected").text()), s.tier_names)) {
            if (s.smsglobalPrices[i][0])
                if (0 === r) r = s.smsglobalPrices[i][0].price;
                else if (r !== s.smsglobalPrices[i][0].price) {
                    e = !1;
                    break;
                }
            if (!e && s.smsglobalPricesFixed[i][0])
                if (0 === r) r = s.smsglobalPricesFixed[i][0].price;
                else if (r !== s.smsglobalPricesFixed[i][0].price) {
                    e = !1;
                    break;
                }
        }
        var a = s.getCurrencySubunit(parseInt(s.creditCurrency.filter(":checked").val()));
        if ((s.priceTable.html(""), "USA" == s.creditCountrySelected)) s.subscriptionMethodContainer.show(), s.priceContainerUs.show(), s.priceContainer.addClass("us"), s.priceContent.addClass("us"), $(".cta-table").hide();
        else if ((s.subscriptionMethodContainer.hide(), s.priceContainerUs.hide(), s.priceContainer.removeClass("us"), s.priceContent.removeClass("us"), $(".cta-table").show(), e)) {
            r = r.countDecimals() < 2 ? r.toFixed(2) : r.countDecimals() > 3 ? r.toFixed(3) : r;
            var o = $("<table class='box-flat-price'>");
            o.append($("<thead>").html("<tr><th><p class='label-flat'>Flat rate pricing in " + a.code)),
                o.append($("<tbody>").html("<tr><td><p class='flat-price'><span class='currency'>" + a.symbollarge + "</span><span class='price'>" + r + "</span><span class='label-price'>per message</span>")),
                o.append($("<tfoot>").html("<tr><td><p class='label-flat'>Price to send</p>")),
                s.priceTable.append(o);
        } else {
            s.priceContainerUs.hide(), s.priceContainer.removeClass("us");
            var n = 0,
                c = $("<table>");
            for (i in (c.append("<thead><tr><th ><span class='b-upper-text'>SMS Volume</span><span>Single transaction</span></th><th ><span class='b-upper-text' style='text-align:right;'>Price</span><span style='text-align:right;'>(" + a.code + ")</span></th><th  ><span class='b-upper-text' style='text-align:center;'>Twilio</span><span></span></th><th  ><span class='b-upper-text' style='text-align:right;'>MessageMedia</span><span></span></th><th  ><span class='b-upper-text' style='text-align:center;'>ClickSend</span><span></span></th><th  ><span class='b-upper-text' style='text-align:center;'>BurstSMS</span><span></span></th></tr></thead><tbody>"),
            s.tier_names)) {
                var l = $("<tr class='item-price'>");
                if (n !== s.roundVolume(s.min_spend[i] / s.smsglobalPricesFixed[i][0].price)) {
                    (n = s.roundVolume(s.min_spend[i] / s.smsglobalPricesFixed[i][0].price)),
                        "pre-free" === i
                            ? l.append($("<td class='volume'>").html("<span class='volume-amount'>1 or more</span>"))
                            : l.append($("<td class='volume'>").html("<span class='volume-amount'>" + n.toLocaleString() + " or more</span>"));
                    var p = s.smsglobalPrices[i][0].price;
                    (p = p.countDecimals() < 2 ? p.toFixed(2) : p.countDecimals() > 3 ? p.toFixed(3) : p),
                        l.append($("<td class='price'>").html("<span class='span-price'><span class='span-currency'>" + a.symbollarge + "</span> " + p + "</span>")),
                        l.append($("<td class='price'>").html("<span class='span-price'><span class='span-currency' style='text-align:right;'>" + a.symbollarge + "</span> 0.08</span>")),
                        l.append($("<td class='price'>").html("<span class='span-price'><span class='span-currency'style='text-align:center;'>" + a.symbollarge + "</span> 0.06</span>")),
                        l.append($("<td class='price'>").html("<span class='span-price'><span class='span-currency' style='text-align:right;'>" + a.symbollarge + "</span> 0.065</span>")),
                        l.append($("<td class='price'>").html("<span class='span-price'><span class='span-currency' style='text-align:right;'>" + a.symbollarge + "</span> 0.07</span>")),

                        c.prepend(l);
                }
            }
            s.priceTable.append(c);
        }
        t === s.uaeCurrency
            ? $(".note").html('<span>* Sending higher volumes â€“ Call us at <a href="tel:+97144402600">+971 4 440 2600</a> for a special rate.</br><a href="/terms-conditions/">Terms and Conditions apply</a></span>')
            : $(".note").html('<span>* Prices applicable when you buy in a single transaction <a href="/terms-conditions/">Terms and Conditions apply</a></span>');
    }),
    (s.sort = function (e) {
        var r = $.makeArray($("#" + e + " option")).sort(function (e, r) {
            return $(e).text() < $(r).text() ? -1 : 1;
        });
        $("#" + e)
            .empty()
            .html(r);
    }),
    (s.roundVolume = function (e) {
        return e < 1e3 ? (e = 100 * Math.floor(e / 100)) : e < 5e3 ? 1e3 * Math.floor(e / 1e3) : 5e3 * Math.floor(e / 5e3);
    }),
    (Number.prototype.countDecimals = function () {
        return Math.floor(this.valueOf()) === this.valueOf() ? 0 : this.toString().split(".")[1].length || 0;
    });
