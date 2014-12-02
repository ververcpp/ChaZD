var $button = $("#search");
var $tipsContainer = $("#tips");
var $input = $("#query-word");
var $queryResultContainer = $("#query-result");

if (-1 !== window.navigator.platform.toLowerCase().indexOf("mac")) {
    $("#ctrl-option").html("Command");
}
if (!$tipsContainer.hasClass("unshow")){
    $tipsContainer.addClass("unshow");
}


function queryInPopup(queryText) {
    $input.select();
    if ($queryResultContainer.hasClass("unshow")){
        $queryResultContainer.removeClass("unshow");
    }
    $queryResultContainer.html("ψ(._. )>词典君正在翻译。。。");
    console.log("input value: " + $input.val());
    console.log("quertText: " + queryText);
    if (queryText) {
        $input.val(queryText);
        chrome.extension.sendMessage({queryWord: queryText, source: "popup"}, buildResult);
    }
    else
        chrome.extension.sendMessage({queryWord: $input.val(), source: "popup"}, buildResult);
}

var buildResult = function(response) {
    //alert("response from xhr: " + JSON.stringify(response));
    var resultObj = response;
    var resultBlock = "";
    if (resultObj.validMessage == "query success") {
        resultBlock += resultObj.titleBlock;
        if (resultObj.basicBlock !== undefined) {
            resultBlock += resultObj.basicBlock;
        }
        if (resultObj.webBlock !== undefined) {
            resultBlock += resultObj.webBlock;
        }
        $queryResultContainer.html(resultBlock);
        var voiceCollection = $(".voice-container");
        //console.log("voiceCollection length: " + voiceCollection.length);
        voiceCollection.each(function(index, el) {
            var src = $(this).attr("data-src");
            //console.log(src);
            var audioBlock = document.createElement("audio");
            audioBlock.setAttribute("src", src);
            //$.get();
            audioBlock.addEventListener("ended", function (event) {
                this.load();
            })
            $(this).click(function (event) {
                audioBlock.play();
            })
        });
    } else {
        if (resultObj.errorCode == 20) {
            $queryResultContainer.html("<p>这段文字太长，词典君无能为力了（┬_┬） <br><br>试试短一点的吧~</p>");
        } else if (resultObj.errorCode == 40) {
            $queryResultContainer.html("<p>对不起，这段文字太高深了，请饶过词典君吧（┬_┬）</p>");
        } else {
            $queryResultContainer.html("<p>词典君罢工啦（┬_┬）<br><br> 是不是网络不太好？<br><br> 稍后再试一次吧</p>");
        } 
    }
};

$button.click(function (event) {
    queryInPopup();
});

$input.focus();
$input.keyup(function (event) {
    if (event.keyCode === 13) {
        queryInPopup();
    }
});

function createLink(link, url) {
    link.click(function (event) {
        chrome.tabs.create({'url': url});
    });
}

var issue = $("#issue");
var email = $("#email");
var source = $("#source");
var keySet = $("#key-set");
var score = $("#score");

createLink(email, "mailto:ververcpp@gmail.com");
createLink(source, "https://github.com/ververcpp/ChaZD");
createLink(issue, "https://github.com/ververcpp/ChaZD/issues/new");
createLink(keySet, "chrome://extensions/configureCommands");
createLink(score, "https://chrome.google.com/webstore/detail/chazd/nkiipedegbhbjmajlhpegcpcaacbfggp");

$("#setting-button").click(function (event) {
    //alert(JSON.stringify( $("settings").style));
    if ($("#settings").css("display") === "none") {
        $("#settings").slideDown();
    } else {
        $("#settings").slideUp();
    }
});

var linkQuery = $("#linkQuery");
var mouseSelect = $("#mouseSelect");
var useCtrl = $("#useCtrl");
var showPositionSide = $("#showPositionSide");
var showPositionNear = $("#showPositionNear");
//var showDuration = $("showDuration");
//var currentDuration = $("currentDuration");
var turnOffTips = $("#turn-off-tips");
var tips = $("#tips");
var toggleKey = $("#toggle-key");

chrome.storage.sync.get(null, function (items) { 
    if(items.currentWord !== "") {
        queryInPopup(items.currentWord);
    }
    if(items.linkQuery === true) {
        linkQuery.attr("checked", true);
    } else {
        linkQuery.attr("checked", false);
    }
    if (items.selectMode === "mouseSelect") {
        mouseSelect.attr("checked", true);
        toggleKey.prop('disabled', 'disabled');
    }
    if (items.selectMode === "useCtrl") {
        useCtrl.attr("checked",true);
        toggleKey.prop('disabled', false);
    }
    if (items.showTips) {
        tips.removeClass("unshow");
    }
    if (items.showPosition === "side") {
        showPositionSide.attr("checked", true);
    } else if (items.showPosition === "near") {
        showPositionNear.attr("checked", true);
    }
    if (items.toggleKey === "ctrl") {
        toggleKey.get(0).selectedIndex = 0;
    } else if (items.toggleKey === "alt") {
        toggleKey.get(0).selectedIndex = 1;
    } else if (items.toggleKey === "shift") {
        toggleKey.get(0).selectedIndex = 2;
    }
    //currentDuration.innerHTML = showDuration.value = items["duration"];
});

linkQuery.click(function (event) {
    var currentLinkQuery = $("#linkQuery:checked").length > 0;
    chrome.storage.sync.set({"linkQuery": currentLinkQuery}, function() {
        console.log("[ChaZD] Success update settings linkQuery = " + currentLinkQuery);
    });
});

turnOffTips.click(function (event) {
    tips.addClass("unshow");
    chrome.storage.sync.set({"showTips": false}, function() {
        console.log("[ChaZD] Success update settings showTips = false");
    });
});

mouseSelect.click(function (event) {
    toggleKey.prop('disabled', 'disabled');
    chrome.storage.sync.set({"selectMode" : "mouseSelect"}, function() {
        console.log("[ChaZD] Success update settings selectMode = mouseSelect");
    });
});

useCtrl.click(function (event) {
    if (toggleKey.is(":disabled")) {
        toggleKey.prop('disabled', false);
    }
    chrome.storage.sync.set({"selectMode" : "useCtrl"}, function() {
        console.log("[ChaZD] Success update settings selectMode = useCtrl");
    });
});

showPositionSide.click(function (event) {
    chrome.storage.sync.set({"showPosition" : "side"}, function() {
        console.log("[ChaZD] Success update settings showPosition = side");
    });
});

showPositionNear.click(function (event) {
    chrome.storage.sync.set({"showPosition" : "near"}, function() {
        console.log("[ChaZD] Success update settings showPosition = near");
    });
});

toggleKey.change(function (event) {
    chrome.storage.sync.set({"toggleKey" : $(this).val()}, function() {
        console.log("[ChaZD] Success update settings selectMode = mouseSelect");
    });
});

// showDuration.addEventListener("click", function (event) {
//     currentDuration.innerHTML = event.target.value;
//     updateSetting("duration", event.target.value);  
// })