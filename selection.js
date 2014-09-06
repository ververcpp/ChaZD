//var resultSideList = document.createElement("div");
var $resultSideList = $("<div></div>");
$resultSideList.addClass('ChaZD_result_side_list');
//resultSideList.setAttribute("class", "ChaZD_result_side_list");
//document.body.appendChild(resultSideList);
$("body").append($resultSideList);

function queryInPage(event) {
    var selection = window.getSelection();
    var selectText = trim(selection.toString());
    var selectRange = selection.getRangeAt(0).getBoundingClientRect();
    if (selectText == "" || !(/[a-zA-Z\s]/.test(selectText))) return;
    console.log("[ChaZD]Selected Text at %s : %s", location.href, selectText);
    var currentSettings = {};
    chrome.storage.sync.get(null, function(items) {
        console.log("[Settings after select]");
        for (var key in items) {
            currentSettings[key] = items[key];
            console.log("   %s : %s", key, currentSettings[key]);
        }
        //var duration = currentSettings["duration"]
        if (currentSettings["showPosition"] == "side") {
            //console.log("in 1");
            showResultSide(selectText);
        }
        if (currentSettings["showPosition"] == "near") {
            //console.log("in 2");
            showResultNear(selectText, selectRange, event);
        }
    });
}

function showResultSide(text) {
    //if(isExist(text)) return;
    var $resultSideContainer = makeResultContainer(text);
    //setTimeout(function () {
    $resultSideList.append($resultSideContainer);
    //}, 100);
}

function showResultNear(text, range, event) {
    //if(isExist(text)) return;
    var showNearPosition = {};
    //文本框中选取的内容返回的left top 为0，此时采集鼠标的位置
    if (range.left === 0 && range.top === 0) {
        range = {
            left: event.clientX,
            top: event.clientY,
            height: 15
        };
    }

    var left = range.left + document.body.scrollLeft;
    var top = range.top + document.body.scrollTop;
    var clientHeight = 0;
    clientHeight = (document.documentElement.clientHeight > document.body.clientHeight) ? document.body.clientHeight : document.documentElement.clientHeight;
    if (clientHeight === 0) {
        clientHeight = document.documentElement.clientHeight;
    }
    console.log("[ChaZD]clientHeight : " + clientHeight);
    if (range.top >= 150) {
        var bottom = clientHeight - top;
        showNearPosition = {
            left: left,
            bottom: bottom
        };
    } else {
        showNearPosition = {
            left: left,
            top: top + range.height + 5
        };
    }
    document.body.style.position = "static";
    var $resultNearContainer = makeResultContainer(text);
    resultNearContainer = $resultNearContainer[0];
    resultNearContainer.style.position = "absolute";
    resultNearContainer.style.left = showNearPosition.left + "px";
    if (showNearPosition.bottom) {
        resultNearContainer.style.bottom = showNearPosition.bottom + "px";
    }
    if (showNearPosition.top) {
        resultNearContainer.style.top = showNearPosition.top + "px";
    }

    $("body").append($resultNearContainer.fadeIn(400));
    // var t = setTimeout(function () {
    //     document.body.removeChild($resultNearContainer);
    // }, 1000 * duration);
}

function makeResultContainer(text) {
    var $resultContainer = $("<div></div>");
    $resultContainer.addClass("ChaZD_result_container");
    $resultContainer.attr("data-text", text);
    $resultContainer.text("ψ(._. )>划词君正在翻译。。。");
    chrome.runtime.sendMessage({
        queryWord: text
    }, function(response) {
        var resultObj = response;
        $resultContainer.html("");
        if (resultObj.validMessage === "query success") {
            $resultContainer.append(resultObj.titleBlock);
            if (resultObj.basicBlock)
                $resultContainer.append(resultObj.basicBlock);
            else if (resultObj.haveTranslation) {
                $resultContainer.children(".title_container").children(".title_translation").css("display", "block");
            } else if (resultObj.haveWebTranslation) {
                $resultContainer.append(resultObj.webBlock);
                $resultContainer.children(".web_explains_container").children(".web_title").text("网络释义");
            } else {
                $resultContainer.append("╮(╯▽╰)╭划词君无能为力啊<br>复制给词典君试试吧↗");
            }
        }
    });

    return $resultContainer;
}

// function isExist(text) {
//     var resultContainerCollection = document.getElementsByClassName("ChaZD_result_container");
//     var length = resultContainerCollection.length;
//     if (length !== 0) {
//         for (var i = 0; i < length; i++) {
//             if (resultContainerCollection[i].getAttribute("data-text") === text)
//                 return true;
//         }
//     }
//     return false;
// }

var useCtrl = true;
var toggleKey = "ctrl";
chrome.storage.sync.get(null, function(items) {
    useCtrl = (items["selectMode"] === "useCtrl") ? true : false;
    toggleKey = items["toggleKey"];
});

chrome.storage.onChanged.addListener(function(changes) {
    for (var key in changes) {
        console.log("[ChaZD]Settings Update, [%s] %s => %s", key, changes[key].oldValue, changes[key].newValue);
    }
    if (changes["selectMode"] !== undefined) {
        var selectMode = changes["selectMode"].newValue;
        useCtrl = (selectMode === "useCtrl") ? true : false;
    }
    if (changes["toggleKey"] !== undefined) {
        toggleKey = changes["toggleKey"].newValue;
    }
});

var classNameCollection = ["ChaZD_result_container", "title_container", "title_word", "title_translation", "basic_container", ".explains_container", ".explains_list", "property_container", "explains_item"];

$(document).bind("mousedown", function(event) {
    for (var name in classNameCollection) {
        if (event.target.classList.contains(classNameCollection[name])) {
            //console.log("[ChaZD] don't remove");
            return;
        }
    }
    var existResult = document.getElementsByClassName("ChaZD_result_container");
    for (var i = 0; i < existResult.length; i++) {
        existResult[i].parentNode.removeChild(existResult[i]);
    }
});

$(document).bind("mouseup", function(event) {
    //console.log("[ChaZD] current useCtrl: " + useCtrl);
    if (useCtrl) {
        //console.log("current togglekey: " + toggleKey);
        if (toggleKey === "ctrl") {
            //console.log("[ChaZD] In Ctrl");
            if (!event.ctrlKey && !event.metaKey) {
                //console.log("[ChaZD] Aho~~~");
                return;
            }
        } else if (toggleKey === "alt") {
            //console.log("[ChaZD] In Alt");
            if (!event.altKey) {
                //console.log("[ChaZD] Aho~~~");
                return;
            }
        } else if (toggleKey === "shift") {
            //console.log("[ChaZD] In Shift");
            if (!event.shiftKey) {
                //console.log("[ChaZD] Aho~~~");
                return;
            }
        }
    }
    queryInPage(event);
});
