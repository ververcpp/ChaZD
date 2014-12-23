var $button = document.querySelector("#search");
var $tipsContainer = document.querySelector("#tips");
var $input = document.querySelector("#query-word");
var $queryResultContainer = document.querySelector("#query-result");

if (-1 !== window.navigator.platform.toLowerCase().indexOf("mac")) {
    document.querySelector("#ctrl-option").firstChild.nodeValue = "Command";
}
if (!$tipsContainer.classList.contains("unshow")){
    $tipsContainer.classList.add("unshow");
}


function queryInPopup(queryText) {
    $input.select();
    if ($queryResultContainer.classList.contains("unshow")){
        $queryResultContainer.classList.remove("unshow");
    }
    $queryResultContainer.innerHTML = "ψ(._. )>词典君正在翻译。。。";
    console.log("input value: " + $input.value);
    console.log("quertText: " + queryText);
    if (queryText) {
        $input.value = queryText;
        chrome.extension.sendMessage({queryWord: queryText, source: "popup"}, buildResult);
    }
    else {
        chrome.extension.sendMessage({queryWord: $input.value, source: "popup"}, buildResult);
    }
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
        $queryResultContainer.innerHTML = resultBlock;
        var voiceCollection = document.querySelectorAll(".voice-container");
        //console.log("voiceCollection length: " + voiceCollection.length);
        var i, len;
        for (i = 0, len = voiceCollection.length; i < len; i++) {
            buildVoice(voiceCollection[i]);
        }
    } else {
        if (resultObj.errorCode == 20) {
            $queryResultContainer.innerHTML = "<p>这段文字太长，词典君无能为力了（┬_┬） <br><br>试试短一点的吧~</p>";
        } else if (resultObj.errorCode == 40) {
            $queryResultContainer.innerHTML = "<p>对不起，这段文字太高深了，请饶过词典君吧（┬_┬）</p>";
        } else {
            $queryResultContainer.innerHTML = "<p>词典君罢工啦（┬_┬）<br><br> 是不是网络不太好？<br><br> 稍后再试一次吧</p>";
        } 
    }
};

$button.addEventListener("click", function (event) {
    queryInPopup();
});

$input.select();
$input.addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
        queryInPopup();
    }
});

function buildVoice(voice) {
    var src = voice.getAttribute("data-src");
    console.log("voice src: [] " + src);
    var audioBlock = document.createElement("audio");
    audioBlock.setAttribute("src", src);
    voice.appendChild(audioBlock);
    audioBlock.addEventListener("ended", function (event) {
        console.log("loading src: " + this.getAttribute("src"));
        this.load();
    });
    voice.addEventListener("click", function (event) {
        console.log("playing src: " + audioBlock.getAttribute("src"));
        audioBlock.play();
    });
}


function createLink(link, url) {
    link.addEventListener("click", function (event) {
        chrome.tabs.create({"url": url});
    });
}

var issue = document.querySelector("#issue");
var email = document.querySelector("#email");
var source = document.querySelector("#source");
var keySet = document.querySelector("#key-set");
var score = document.querySelector("#score");

createLink(email, "mailto:ververcpp@gmail.com");
createLink(source, "https://github.com/ververcpp/ChaZD");
createLink(issue, "https://github.com/ververcpp/ChaZD/issues/new");
createLink(keySet, "chrome://extensions/configureCommands");
createLink(score, "https://chrome.google.com/webstore/detail/chazd/nkiipedegbhbjmajlhpegcpcaacbfggp");

document.querySelector("#setting-button").addEventListener("click", function (event) {
    var settingBlock = document.getElementById("settings");
    settingBlock.classList.toggle("active");
    if (settingBlock.classList.contains("active")) {
        settingBlock.style.height = blockHeight + "px";
    } else {
        settingBlock.style.height = 0;
    }
});

function totalHeight(className) {
    var divs = document.getElementsByClassName(className);
    var length = divs.length;
    var sum = 0;
    for (var i = 0; i < length; i++) {
        sum += divs[i].scrollHeight;
    }
    return sum + 10;
}

var blockHeight = totalHeight("top-menu") + totalHeight("sub-menu") + totalHeight("carved") + 10;
var linkQuery = document.querySelector("#linkQuery");
var noSelect = document.querySelector("#noSelect");
var mouseSelect = document.querySelector("#mouseSelect");
var useCtrl = document.querySelector("#useCtrl");
var showPositionSide = document.querySelector("#showPositionSide");
var showPositionNear = document.querySelector("#showPositionNear");
//var showDuration = $("showDuration");
//var currentDuration = $("currentDuration");
var turnOffTips = document.querySelector("#turn-off-tips");
var tips = document.querySelector("#tips");
var toggleKey = document.querySelector("#toggle-key");

chrome.storage.sync.get(null, function (items) { 
    if(items.currentWord !== "") {
        queryInPopup(items.currentWord);
    }
    if(items.linkQuery === true) {
        linkQuery.checked = true;
    } else {
        linkQuery.checked = false;
    }
    if (items.selectMode === "noSelect") {
        noSelect.checked = true;
        toggleKey.disabled = true;
    }
    if (items.selectMode === "mouseSelect") {
        mouseSelect.checked = true;
        toggleKey.disabled = true;
    }
    if (items.selectMode === "useCtrl") {
        useCtrl.checked = true;
        toggleKey.disabled = false;
    }
    if (items.showTips) {
        tips.classList.remove("unshow");
    }
    if (items.showPosition === "side") {
        showPositionSide.checked = true;
    } else if (items.showPosition === "near") {
        showPositionNear.checked = true;
    }
    if (items.toggleKey === "ctrl") {
        toggleKey.selectedIndex = 0;
    } else if (items.toggleKey === "alt") {
        toggleKey.selectedIndex = 1;
    } else if (items.toggleKey === "shift") {
        toggleKey.selectedIndex = 2;
    }
    //currentDuration.innerHTML = showDuration.value = items["duration"];
});

linkQuery.addEventListener("click", function (event) {
    var currentLinkQuery = linkQuery.checked;
    chrome.storage.sync.set({"linkQuery": currentLinkQuery}, function() {
        console.log("[ChaZD] Success update settings linkQuery = " + currentLinkQuery);
    });
});

turnOffTips.addEventListener("click", function (event) {
    tips.classList.add("unshow");
    chrome.storage.sync.set({"showTips": false}, function() {
        console.log("[ChaZD] Success update settings showTips = false");
    });
});

noSelect.addEventListener("click", function (event) {
    toggleKey.disabled = true;
    chrome.storage.sync.set({"selectMode" : "noSelect"}, function() {
        console.log("[ChaZD] Success update settings selectMode = noSelect");
    });
});

mouseSelect.addEventListener("click", function (event) {
    toggleKey.disabled = true;
    chrome.storage.sync.set({"selectMode" : "mouseSelect"}, function() {
        console.log("[ChaZD] Success update settings selectMode = mouseSelect");
    });
});

useCtrl.addEventListener("click", function (event) {
    console.log(toggleKey.disabled);
    if (toggleKey.disabled) {
        toggleKey.disabled = false;
    }
    chrome.storage.sync.set({"selectMode" : "useCtrl"}, function() {
        console.log("[ChaZD] Success update settings selectMode = useCtrl");
    });
});

showPositionSide.addEventListener("click", function (event) {
    chrome.storage.sync.set({"showPosition" : "side"}, function() {
        console.log("[ChaZD] Success update settings showPosition = side");
    });
});

showPositionNear.addEventListener("click", function (event) {
    chrome.storage.sync.set({"showPosition" : "near"}, function() {
        console.log("[ChaZD] Success update settings showPosition = near");
    });
});

toggleKey.onchange = function (event) {
    chrome.storage.sync.set({"toggleKey" : this.checked}, function() {
        console.log("[ChaZD] Success update settings toggleKey = " + this.checked);
    });
};

// showDuration.addEventListener("onclick", function (event) {
//     currentDuration.innerHTML = event.target.value;
//     updateSetting("duration", event.target.value);  
// })