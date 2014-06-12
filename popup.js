var button = $("search");
var tipsContainer = $("tips");
var input = $("query_word");
var queryResultContainer = $("query_result");

function queryInPopup() {
    if (!tipsContainer.classList.contains("unshow"))
        tipsContainer.classList.add("unshow");
    input.select();
    if (queryResultContainer.classList.contains("unshow"))
        queryResultContainer.classList.remove("unshow");
    queryResultContainer.innerHTML = "ψ(._. )>词典君正在翻译。。。";
    chrome.extension.sendMessage({queryWord: input.value}, function(response) {
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
            queryResultContainer.innerHTML = resultBlock;
            var voiceCollection = document.querySelectorAll(".voice_container");
            for (var i = 0; i < voiceCollection.length; i++) {
                var src = voiceCollection[i].getAttribute("data-src");
                var audioBlock = document.createElement("audio");
                audioBlock.setAttribute("src", src);
                voiceCollection[i].appendChild(audioBlock);
                audioBlock.addEventListener("ended", function(event) {
                    this.load();
                })
                voiceCollection[i].addEventListener("click", function(event) {
                    this.firstChild.play();
                })
            }
        } else {
            queryResultContainer.innerHTML = resultObj.validMessage + "<br>词典君崩溃了（┬_┬）";
        }
    });
}

button.addEventListener("click", function(event) {
    queryInPopup();
});

input.focus();
input.addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {
        queryInPopup();
    }
});

function createLink(link, url) {
    link.addEventListener("click", function(event) {
        chrome.tabs.create({'url': url});
    });
}

var issue = $("issue");
var email = $("email");
var source = $("source");
var keySet = $("key_set");

createLink(email, "mailto:ververcpp@gmail.com");
createLink(source, "https://github.com/ververcpp/ChaZD");
createLink(issue, "https://github.com/ververcpp/ChaZD/issues/new");
createLink(keySet, "chrome://extensions/configureCommands")

var setting_button = $("setting_button");
setting_button.addEventListener("click", function(event) {
    //alert(JSON.stringify( $("settings").style));
    this.classList.toggle("setting_button_clicked");
    $("settings").classList.toggle("unshow");
})

var mouseSelect = $("mouseSelect");
var showPositionSide = $("showPositionSide");
var showPositionNear = $("showPositionNear");
var showDuration = $("showDuration");
var currentDuration = $("currentDuration");
var turnOffTips = $("turn_off_tips");
var tips = $("tips");

chrome.storage.sync.get(null, function(items) { 
    mouseSelect.checked = items["mouseSelect"];
    if (items.showTips) {
        tips.classList.remove("unshow");
    }
    if (items.showPosition === "side") {
        showPositionSide.checked = true;
    } else if (items.showPosition === "near") {
        showPositionNear.checked = true;
    }
    currentDuration.innerHTML = showDuration.value = items["duration"];
});

turnOffTips.addEventListener("click", function(event) {
    tips.classList.add("unshow");
    updateSetting("showTips", false);
})

mouseSelect.addEventListener("click", function(event) {
    var isChecked = event.target.checked;
    updateSetting("mouseSelect", isChecked);
});

showPositionSide.addEventListener("click", function(event) {
    updateSetting("showPosition", "side");
});

showPositionNear.addEventListener("click", function(event) {
    updateSetting("showPosition", "near");
});

showDuration.addEventListener("click", function(event) {
    currentDuration.innerHTML = event.target.value;
    updateSetting("duration", event.target.value);  
})