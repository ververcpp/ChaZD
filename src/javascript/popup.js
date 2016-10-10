var $button = document.querySelector("#search");
//var $tipsContainer = document.querySelector("#tips");
var $input = document.querySelector("#query-word");
var $queryResultContainer = document.querySelector("#query-result");

if (-1 !== window.navigator.platform.toLowerCase().indexOf("mac")) {
    document.querySelector("#ctrl-option").firstChild.nodeValue = "Command";
}
// if (!$tipsContainer.classList.contains("unshow")){
//     $tipsContainer.classList.add("unshow");
// }


function queryInPopup(queryText) {
    //$input.select();
    if ($queryResultContainer.classList.contains("unshow")){
        $queryResultContainer.classList.remove("unshow");
    }
    if ($input.value !== "") {
        $queryResultContainer.innerHTML = "ψ(._. )>词典君正在翻译。。。";
    }
    //console.log("input value: " + $input.value);
    //console.log("quertText: " + queryText);
    if (queryText) {
        $input.value = queryText;
        chrome.extension.sendMessage({queryWord: queryText, source: "popup", useHttps: useHttpsValue}, buildResult);
    }
    else {
        chrome.extension.sendMessage({queryWord: $input.value, source: "popup", useHttps: useHttpsValue}, buildResult);
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

$input.addEventListener("input", function (event) {
    var currentInput = $input.value;
    setTimeout(function () {
        if ($input.value === currentInput && $input.value !== "") {
            queryInPopup();
        }
    }, 500);
});

function buildVoice(voice) {
    var src = voice.getAttribute("data-src");
    //console.log("voice src: [] " + src);
    var audioBlock = document.createElement("audio");
    audioBlock.setAttribute("src", src);
    voice.appendChild(audioBlock);
    audioBlock.addEventListener("ended", function (event) {
        //console.log("loading src: " + this.getAttribute("src"));
        this.load();
    });
    voice.addEventListener("click", function (event) {
        //console.log("playing src: " + audioBlock.getAttribute("src"));
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

var blockHeight = totalHeight("top-menu") + totalHeight("sub-menu") + totalHeight("carved") + 32 + 56;
var linkQuery = document.querySelector("#linkQuery");
var noSelect = document.querySelector("#noSelect");
var mouseSelect = document.querySelector("#mouseSelect");
var useCtrl = document.querySelector("#useCtrl");
var autoAudio = document.querySelector("#autoAudio");
var defaultUk = document.querySelector("#defaultUk");
var defaultUs = document.querySelector("#defaultUs");
var showPositionSide = document.querySelector("#showPositionSide");
var showPositionNear = document.querySelector("#showPositionNear");
var autoHide = document.querySelector("#autoHide");
var showDuration = document.querySelector("#showDuration");
var currentDuration = document.querySelector("#currentDuration");
var turnOffTips = document.querySelector("#turn-off-tips");
var tips = document.querySelector("#tips");
var toggleKey = document.querySelector("#toggle-key");
var useHttps = document.querySelector("#useHttps");
var useHttpsValue = false;
var userkey = document.querySelector("#userkey");
var userkeyfrom = document.querySelector("#userkeyfrom");

chrome.storage.sync.get(null, function (items) { 
    if(items.currentWord !== "") {
        queryInPopup(items.currentWord);
    }
    if(items.linkQuery === true) {
        linkQuery.checked = true;
        linkQuery.nextSibling.classList.remove("unactive");
    } else {
        linkQuery.checked = false;
        linkQuery.nextSibling.classList.add("unactive");
    }
    if(items.useHttps === true) {
        useHttps.checked = true;
        useHttpsValue = true;
        useHttps.nextSibling.classList.remove("unactive");
    } else {
        useHttps.checked = false;
        useHttpsValue = false;
        useHttps.nextSibling.classList.add("unactive");
    }
    if(items.autoAudio === true) {
        autoAudio.checked = true;
        autoAudio.nextSibling.classList.remove("unactive");
    } else {
        autoAudio.checked = false;
        autoAudio.nextSibling.classList.add("unactive");
    }
    if(items.defaultVoice === 1) {
        defaultUk.checked = true;
        defaultUk.nextSibling.classList.remove("unactive");
        defaultUs.nextSibling.classList.add("unactive");
    } else if (items.defaultVoice === 2) {
        defaultUs.checked = true;
        defaultUs.nextSibling.classList.remove("unactive");
        defaultUk.nextSibling.classList.add("unactive");
    }
    if (items.selectMode === "noSelect") {
        noSelect.checked = true;
        noSelect.nextSibling.classList.remove("unactive");
        mouseSelect.nextSibling.classList.add("unactive");
        useCtrl.nextSibling.classList.add("unactive");

        toggleKey.disabled = true;
        autoAudio.disabled = true;
    }
    if (items.selectMode === "mouseSelect") {
        mouseSelect.checked = true;
        mouseSelect.nextSibling.classList.remove("unactive");
        noSelect.nextSibling.classList.add("unactive");
        useCtrl.nextSibling.classList.add("unactive");

        toggleKey.disabled = true;
        autoAudio.disabled = false;
    }
    if (items.selectMode === "useCtrl") {
        useCtrl.checked = true;
        useCtrl.nextSibling.classList.remove("unactive");
        noSelect.nextSibling.classList.add("unactive");
        mouseSelect.nextSibling.classList.add("unactive");

        toggleKey.disabled = false;
        autoAudio.disabled = false;
    }
    if (items.showTips) {
        tips.classList.remove("unshow");
    }
    if (items.showPosition === "side") {
        showPositionSide.checked = true;
        showPositionSide.nextSibling.classList.remove("unactive");
        showPositionNear.nextSibling.classList.add("unactive");
    } else if (items.showPosition === "near") {
        showPositionNear.checked = true;
        showPositionSide.nextSibling.classList.add("unactive");
        showPositionNear.nextSibling.classList.remove("unactive");
    }
    if (items.toggleKey === "ctrl") {
        toggleKey.selectedIndex = 0;
    } else if (items.toggleKey === "alt") {
        toggleKey.selectedIndex = 1;
    } else if (items.toggleKey === "shift") {
        toggleKey.selectedIndex = 2;
    }
    if (items.autoHide === true) {
        autoHide.checked = true;
        autoHide.nextSibling.classList.remove("unactive");
        showDuration.disabled = false;
    } else {
        autoHide.checked = false;
        autoHide.nextSibling.classList.add("unactive");
        showDuration.disabled = true;
    }
    if (localStorage.getItem("userkey")) {
        userkey.value = localStorage.getItem("userkey");
    }
    if (localStorage.getItem("userkeyfrom")) {
        userkeyfrom.value = localStorage.getItem("userkeyfrom");
    }
    currentDuration.innerHTML = showDuration.value = items.showDuration;
});

linkQuery.addEventListener("click", function (event) {
    var currentLinkQuery = linkQuery.checked;
    linkQuery.nextSibling.classList.toggle("unactive");
    chrome.storage.sync.set({"linkQuery": currentLinkQuery}, function() {
        //console.log("[ChaZD] Success update settings linkQuery = " + currentLinkQuery);
    });
});

useHttps.addEventListener("click", function (event) {
    var currentUseHttps = useHttps.checked;
    useHttps.nextSibling.classList.toggle("unactive");
    chrome.storage.sync.set({"useHttps": currentUseHttps});
});

autoAudio.addEventListener("click", function (event) {
    var currentAutoAudio = autoAudio.checked;
    if (currentAutoAudio) {
        autoAudio.nextSibling.classList.remove("unactive");
    } else {
        autoAudio.nextSibling.classList.add("unactive");
    }
    chrome.storage.sync.set({"autoAudio": currentAutoAudio}, function() {
        //console.log("[ChaZD] Success update settings autoAudio = " + currentAutoAudio);        
    });
});

defaultUk.addEventListener("click", function (event) {
    defaultUk.nextSibling.classList.remove("unactive");
    defaultUs.nextSibling.classList.add("unactive");
    chrome.storage.sync.set({"defaultVoice": 1}, function() {
        //console.log("[ChaZD] Success update settings defaultVoice = 1");   
    });
});

defaultUs.addEventListener("click", function (event) {
    defaultUs.nextSibling.classList.remove("unactive");
    defaultUk.nextSibling.classList.add("unactive");
    chrome.storage.sync.set({"defaultVoice": 2}, function() {
        //console.log("[ChaZD] Success update settings defaultVoice = 2");   
    });
});

turnOffTips.addEventListener("click", function (event) {
    tips.classList.add("unshow");
    chrome.storage.sync.set({"showTips": false}, function() {
        //console.log("[ChaZD] Success update settings showTips = false");
    });
});

noSelect.addEventListener("click", function (event) {
    toggleKey.disabled = true;
    autoAudio.disabled = true;

    noSelect.nextSibling.classList.remove("unactive");
    mouseSelect.nextSibling.classList.add("unactive");
    useCtrl.nextSibling.classList.add("unactive");
    chrome.storage.sync.set({"selectMode" : "noSelect"}, function() {
        //console.log("[ChaZD] Success update settings selectMode = noSelect");
    });
});

mouseSelect.addEventListener("click", function (event) {
    toggleKey.disabled = true;
    autoAudio.disabled = false;

    noSelect.nextSibling.classList.add("unactive");
    mouseSelect.nextSibling.classList.remove("unactive");
    useCtrl.nextSibling.classList.add("unactive");    
    chrome.storage.sync.set({"selectMode" : "mouseSelect"}, function() {
        //console.log("[ChaZD] Success update settings selectMode = mouseSelect");
    });
});

useCtrl.addEventListener("click", function (event) {
    //console.log(toggleKey.disabled);
    if (toggleKey.disabled) {
        toggleKey.disabled = false;
    }
    autoAudio.disabled = false;
    noSelect.nextSibling.classList.add("unactive");
    mouseSelect.nextSibling.classList.add("unactive");
    useCtrl.nextSibling.classList.remove("unactive");
    chrome.storage.sync.set({"selectMode" : "useCtrl"}, function() {
        //console.log("[ChaZD] Success update settings selectMode = useCtrl");
    });
});

showPositionSide.addEventListener("click", function (event) {
    showPositionSide.nextSibling.classList.remove("unactive");
    showPositionNear.nextSibling.classList.add("unactive");
    chrome.storage.sync.set({"showPosition" : "side"}, function() {
        //console.log("[ChaZD] Success update settings showPosition = side");
    });
});

showPositionNear.addEventListener("click", function (event) {
    showPositionSide.nextSibling.classList.add("unactive");
    showPositionNear.nextSibling.classList.remove("unactive");
    chrome.storage.sync.set({"showPosition" : "near"}, function() {
        //console.log("[ChaZD] Success update settings showPosition = near");
    });
});

autoHide.addEventListener("click", function (event) {
    var currentAutoHide = autoHide.checked;
    if (currentAutoHide) {
        autoHide.nextSibling.classList.remove("unactive");
        showDuration.disabled = false;
    } else {
        autoHide.nextSibling.classList.add("unactive");
        showDuration.disabled = true;
    }
    chrome.storage.sync.set({"autoHide" : currentAutoHide}, function() {
        //console.log("[ChaZD] Success update settings showPosition = near");
    });
});

showDuration.addEventListener("input", function (event) {
    currentDuration.innerHTML = showDuration.value;
    chrome.storage.sync.set({"showDuration" : showDuration.value}, function() {
        //console.log("[ChaZD] Success update settings toggleKey = " + this.value);
    });
}); 

toggleKey.onchange = function (event) {
    chrome.storage.sync.set({"toggleKey" : this.value}, function() {
        //console.log("[ChaZD] Success update settings toggleKey = " + this.value);
    });
};

// showDuration.addEventListener("onclick", function (event) {
//     currentDuration.innerHTML = event.target.value;
//     updateSetting("duration", event.target.value);  
// })

//在popup页内 Enter键 查询选中部分
document.addEventListener("keyup",function(e){
    if(document.activeElement.tagName=="BODY" && e.which==13){
        queryInPopup(window.getSelection().toString());
    }
});
userkey.addEventListener("change", function(event){
    localStorage.setItem("chazduserkey",this.value);
    chrome.storage.local.set({"userkey" : this.value}, function() {
        //console.log("[ChaZD] Success update settings userkey = " + this.value);
    });
});
userkeyfrom.addEventListener("change", function(event){
    localStorage.setItem("chazduserkeyfrom",this.value);
    chrome.storage.local.set({"userkeyfrom" : this.value}, function() {
        //console.log("[ChaZD] Success update settings userkeyfrom = " + this.value);
    });
});
