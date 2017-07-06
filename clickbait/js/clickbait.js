/* ClickBait Central Game Logic */

var clicks = 0;
var gameStart = null;
var baseBalance = 10.60;
var balance = 0;
var expenditures = 0;
var cpm;

$(document).ready(function () {
    fireIntroAnimation();
    //$("#gmlogo").hide();
    $("#title-button").click(startGame);
    //startGame();
});

function fireIntroAnimation() {
    setTimeout(function () {
        $("#gmlogo").fadeOut();
        $("#title-image").css("paddingTop", 100);
        $("#title-image").animate({opacity: 1, paddingTop: 0}, 1000);

        setTimeout(function () {
            $("#title-message-1").css("paddingTop", 50);
            $("#title-message-1").animate({opacity: 1, paddingTop: 0}, 500);
            setTimeout(function () {
                $("#title-message-2").css("paddingTop", 50);
                $("#title-message-2").animate({opacity: 1, paddingTop: 0}, 500);
                setTimeout(function () {
                    $("#title-message-3").css("paddingTop", 50);
                    $("#title-message-3").animate({opacity: 1, paddingTop: 0}, 500);
                    setTimeout(function () {
                        $("#title-button").css("marginTop", 50);
                        $("#title-button").animate({opacity: 1, marginTop: 0}, 1000);
                    }, 500);
                }, 500);
            }, 500);
        }, 500);
    }, 1000);
}

function startGame() {
    $("#title-box").hide();

    populateStoreTable();
    populateAdStoreTable();
    populateAchievements();

    $("#gamearea").css("opacity", 1);

    gameStart = new Date();

    setInterval(function () {
        runClickers();
        updateStats();
        checkAchivements();
    }, 100);

    addAd("standard");
    addClicker("ez");

    $("#achievements").hover(showAchievements, hideAchievements);
}

function showAchievements() {
    $("#achievements").animate({bottom: 0}, 200);
}

function hideAchievements() {
    $("#achievements").animate({bottom: "-13vh"}, 200);
}

var availableClickers = {
    "ez": {
        title: "E-Z Clicker",
        description: "Clicks at the measly rate of once every second.",
        cost: 0.60,
        rate: 60.0,
        visible: true
    },
    "double": {
        title: "Double Clicker",
        description: "Double-clicks, sixty times a minute",
        cost: 1.10,
        rate: 60.0,
        visible: true
    },
    "frenzy": {
        title: "Frenzy Clicker",
        description: "Has a 1% to burst 100 clicks. Usually just clicks once every second.",
        cost: 6.00,
        rate: 60.0,
        visible: true
    },
    "super": {
        title: "Super Clicker",
        description: "Clicks 10 times per second.",
        cost: 10.00,
        rate: 600.0,
        visible: true
    }
}

var availableAds = {
    "standard": {
        title: "Standard Ad",
        description: "Your typical ad. Garners 1 click per click.",
        cost: 10.00,
        multiplier: 1,
        visible: true
    },
    "banner": {
        title: "Banner Ad",
        description: "A nice wide banner ad. Garners 2 clicks per click.",
        cost: 18.00,
        multiplier: 2,
        visible: true
    }
}

var achievements = {
    "firsts": {
        title: "Firsts",
        description: "Setup your first ClickFarm with a clicker and an ad.",
        reward: 0.20,
        fulfilled: false,
        test: function () {
            return Object.keys(purchasedAds).length > 0 && Object.keys(purchasedClickers).length > 0;
        }
    },
    "newcustomer": {
        title: "A New Customer",
        description: "Make your first purchase in the ClickFarm store.",
        reward: 1.00,
        fulfilled: false,
        test: function () {
            var adcount = 0;
            var clickercount = 0;
            for (var id in purchasedClickers) {
                clickercount += purchasedClickers[id].count
            }
            for (var id in purchasedAds) {
                adcount += purchasedAds[id].count
            }
            return adcount > 1 || clickercount > 1;
        }
    },
    "clickaholic": {
        title: "Click-a-Holic",
        description: "Exceed 240 clicks per minute.",
        reward: 0.20,
        fulfilled: false,
        test: function () {
            return cpm > 240;
        }
    },
}

function populateStoreTable() {
    $("#store").html("");
    for (var id in availableClickers) {
        var clicker = availableClickers[id];
        if (clicker.visible) {
            $("#store").append("<div class='store-entry'>" +
                "<p class='store-info'>" +
                "<img class='store-image' src='media/clickers/" + id + ".png'/>" +
                "<b>" + clicker.title + "</b><br/>" +
                clicker.description +
                "</p>" +
                "<button id=\"clicker-buy-button-" + id + "\" type=\"button\" class=\"btn btn-primary store-buy\">$" + clicker.cost.toFixed(2) + "</button>" +
                "</div>");

            $("#clicker-buy-button-" + id).click(function (event) {
                if (!$(this).hasClass("disabled")) {
                    handleClickerPuchase(event);
                }
            });
        }
    }
}

function populateAdStoreTable() {
    $("#adstore").html("");
    for (var id in availableAds) {
        var ad = availableAds[id];
        if (ad.visible) {
            $("#adstore").append("<div class='store-entry'>" +
                "<p class='store-info'>" +
                "<img class='store-image' src='media/ads/" + id + ".png'/>" +
                "<b>" + ad.title + "</b><br/>" +
                ad.description +
                "</p>" +
                "<button id=\"ad-buy-button-" + id + "\" type=\"button\" class=\"btn btn-primary store-buy\">$" + ad.cost.toFixed(2) + "</button>" +
                "</div>");

            $("#ad-buy-button-" + id).click(function (event) {
                if (!$(this).hasClass("disabled")) {
                    handleAdPuchase(event);
                }
            });
        }
    }
}

function populateAchievements() {
    $("#achievements").html("");
    for (var id in achievements) {
        var ach = achievements[id];
        if (ach.fulfilled) {
            $("#achievements").append("<div class='achievement fulfilled'>" +
                "<div class='achievement-info'><p><b>" + ach.title + "</b></p><p>" + ach.description + "</p></div>" +
                "<img class='achievement-image' src='media/achievements/" + id + ".png' alt='" + ach.title + "'/>");
        } else {
            $("#achievements").append("<div class='achievement'>" +
                "<div class='achievement-info'><p><b>" + ach.title + "</b></p><p>?????</p></div>" +
                "<img class='achievement-image' src='media/achievements/" + id + ".png' alt='" + ach.title + "'/>");
        }
    }

    $(".achievement").off("hover");
    $(".achievement").hover(function () {
        var $infobox = $(this).children(".achievement-info");
        $infobox.css({top: $(this).offset().top - $infobox.height() - 30, left: $(this).offset().left});
        $infobox.show();
    }, function () {
        var $infobox = $(this).children(".achievement-info");
        $infobox.hide();
    })
}

var purchasedClickers = {};

function handleClickerPuchase(event) {
    var id = event.target.id.replace("clicker-buy-button-", "");
    addClicker(id);
}

function addClicker(id) {
    var clicker = availableClickers[id];
    expenditures += clicker.cost;
    if (!purchasedClickers.hasOwnProperty(id)) {
        purchasedClickers[id] = {"count": 0, "entities": []};
    }
    purchasedClickers[id].count++;

    var clickerSerial = Math.floor(Math.random() * 10000);
    purchasedClickers[id].entities.push({
        "serial": clickerSerial,
        //"pos": position,
        "clicks": 0,
        "lastClick": new Date()
    });

    updateStats();
    drawClicker(id, clickerSerial);
}

function drawClicker(id, clickerSerial) {

    var $clicker = $("<div>", {
        "id": "clicker-" + id + "-" + clickerSerial,
        "class": "clicker clicker-" + id
    })
    var position = {
        "top": ($("#adarea").height() - 200) * Math.random() + 100,
        "left": ($("#adarea").width() - 200) * Math.random() + 100
    }
    $clicker.css({top: position.top, left: position.left});

    $("#adarea").append($clicker);
}

var purchasedAds = {};

function handleAdPuchase(event) {
    var id = event.target.id.replace("ad-buy-button-", "");
    addAd(id);
}

function addAd(id) {
    var ad = availableAds[id];
    expenditures += ad.cost;
    if (!purchasedAds.hasOwnProperty(id)) {
        purchasedAds[id] = {"count": 0, "entities": []};
    }
    purchasedAds[id].count++;

    var adSerial = Math.floor(Math.random() * 10000);
    purchasedAds[id].entities.push({
        "serial": adSerial
    });

    updateStats();
    drawAd(id, adSerial);
}

function drawAd(id, adSerial) {
    var ad = '<div id="ad-' + id + '-' + adSerial + '" class="ad ad-' + id + '"><img src="media/ads/' + id + '.png"/></div>'
    $("#adarea").append(ad);

    $(".ad").off("hover");
    $(".ad").hover(handleAdClick, handleAdClick);
}


function runClickers() {
    var now = new Date();

    var multiplier = 0;
    for (var id in purchasedAds) {
        multiplier += purchasedAds[id].count * availableAds[id].multiplier;
    }

    for (var id in purchasedClickers) {
        purchasedClickers[id].entities.forEach(function (clicker) {
            if (now - clicker.lastClick > 60000 / availableClickers[id].rate) {
                popClicker(id, clicker.serial)
                var pulseDuration = 200;
                clicker.lastClick = now;
                if (id == "frenzy" && Math.random < 0.01) {
                    clicks += 100 * multiplier;
                    pulseDuration = 1000;
                } else if (id == "double") {
                    clicks += 2 * multiplier;
                } else {
                    clicks += multiplier;
                }

                var newid = id;
                setTimeout(function () {
                    unpopClicker(newid, clicker.serial)
                }, pulseDuration);
            }
        });
    }
}

function popClicker(id, serial) {
    $("#clicker-" + id + "-" + serial).addClass("active");
}

function unpopClicker(id, serial) {
    $("#clicker-" + id + "-" + serial).removeClass("active");
    var position = {
        "top": ($("#adarea").height() - 200) * Math.random() + 100,
        "left": ($("#adarea").width() - 200) * Math.random() + 100
    }
    $("#clicker-" + id + "-" + serial).css({top: position.top, left: position.left});
}

function updateStats() {
    var gameDuration = (new Date()) - gameStart;
    cpm = clicks / gameDuration * 1000 * 60;
    balance = parseFloat((baseBalance + clicks * 0.01 - expenditures).toFixed(2))


    $("#gamestats-cpm").text("CPM: " + String(parseInt(cpm)));
    $("#gamestats-score").text("Balance: $" + balance.toFixed(2));
    $("#store-funds").text("Your Funds: $" + balance.toFixed(2));

    for (var id in availableClickers) {
        var clicker = availableClickers[id];
        if (clicker.cost > balance) {
            $("#clicker-buy-button-" + id).addClass("disabled");
        } else {
            $("#clicker-buy-button-" + id).removeClass("disabled");
        }
    }

    for (var id in availableAds) {
        var ad = availableAds[id];
        if (ad.cost > balance) {
            $("#ad-buy-button-" + id).addClass("disabled");
        } else {
            $("#ad-buy-button-" + id).removeClass("disabled");
        }
    }
}

function checkAchivements() {
    var achievementsChanged = false;
    for (var id in achievements) {
        var ach = achievements[id];
        if (!ach.fulfilled && ach.test()) {
            ach.fulfilled = true;
            baseBalance += ach.reward;
            alertAchievement(id, ach);
            achievementsChanged = true;
        }
    }

    if (achievementsChanged) {
        populateAchievements();
        showAchievements();
        setTimeout(hideAchievements, 2000);
    }
}

function alertAchievement(id, achievement) {
    $("#achd-img").attr("src", "media/achievements/" + id + ".png");
    $("#achd-title").html("<b>" + achievement.title + "</b>");
    $("#achd-desc").html(achievement.description);
    $("#achievement-dialog").show()
    setTimeout(function () {
        $("#achievement-dialog").fadeOut(1000);
    }, 1000);
}

function handleAdClick() {
    clicks++;
    updateStats();
}

