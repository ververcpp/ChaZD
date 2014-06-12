var resultSideList = document.createElement("div");
resultSideList.setAttribute("class", "ChaZD_result_side_list");
document.body.appendChild(resultSideList);

function queryInPage(event) {
    var selection = window.getSelection();
    var selectText = trim(selection.toString());
    var selectRange = selection.getRangeAt(0).getBoundingClientRect();
    if(selectText == "" || !(/[a-zA-Z\s]/.test(selectText))) return;
    console.log("Selected Text at %s : %s", location.href, selectText);
    var currentSettings = {};
    chrome.storage.sync.get(null, function(items) {
        console.log("[Settings after select]");
        for( var key in items) {
            currentSettings[key] = items[key];
            console.log("   %s : %s", key, currentSettings[key]);
        }
        if(!currentSettings["mouseSelect"]) return;
        var duration = currentSettings["duration"]
        if(currentSettings["showPosition"] == "side") {
            //console.log("in 1");
            showResultSide(selectText, duration);
        }
        if(currentSettings["showPosition"] == "near") {
            //console.log("in 2");
            showResultNear(selectText, selectRange, duration, event);
        }
    });
}

function showResultSide(text, duration) {
    if(isExist(text)) return;
    var resultSideContainer = document.createElement("div");
    resultSideContainer.setAttribute("class", "ChaZD_result_container");
    resultSideContainer.setAttribute("data-text", text);
    resultSideContainer.innerHTML = "ψ(._. )>划词君正在翻译。。。";
    chrome.runtime.sendMessage({queryWord: text}, function(response) {
        var resultObj = response;
        resultSideContainer.innerHTML = "";
        if(resultObj.validMessage === "query success") {
            resultSideContainer.innerHTML += resultObj.titleBlock;
            if(resultObj.basicBlock)
                resultSideContainer.innerHTML += resultObj.basicBlock;
            else {
                var unableMessage = "╮(╯▽╰)╭划词君无能为力啊<br>复制给词典君试试吧↗"
                resultSideContainer.innerHTML += unableMessage;
            }
        }
    });
    setTimeout(function(){
        resultSideList.appendChild(resultSideContainer);
    }, 100);
    
    setTimeout(function(){
        //resultSideContainer.classList.add("result_side_container_timeup");
        resultSideList.removeChild(resultSideContainer);
    }, 1000*duration);
}

function showResultNear(text, range, duration, event) {
    if(isExist(text)) return;
    var showNearPosition = {};
    //文本框中选取的内容返回的left top 为0，此时采集鼠标的位置
    if (range.left === 0 && range.top === 0) {
        range = { left: event.clientX, top: event.clientY, height: 15};
    }

    var left = range.left + document.body.scrollLeft;
    var top = range.top + document.body.scrollTop;
    var clientHeight = 0;
    //
    clientHeight = (document.documentElement.clientHeight > document.body.clientHeight) ? document.body.clientHeight : document.documentElement.clientHeight;
    console.log("clientHeight : " + clientHeight);
    if (range.top >= 150) {
        var bottom = clientHeight - top;
        showNearPosition = { left: left, bottom: bottom };
    } else {
        showNearPosition = { left: left, top: top + range.height + 5 };
    }

    var resultNearContainer = document.createElement("div");
    resultNearContainer.setAttribute("class", "ChaZD_result_container");
    resultNearContainer.setAttribute("data-text", text);
    resultNearContainer.style.position = "absolute";
    resultNearContainer.style.left = showNearPosition.left + "px";
    if (showNearPosition.bottom) {
        resultNearContainer.style.bottom = showNearPosition.bottom + "px";
    }
    if (showNearPosition.top) {
        resultNearContainer.style.top = showNearPosition.top + "px";
    }
    resultNearContainer.innerHTML = "ψ(._. )>划词君正在翻译。。。";
    chrome.runtime.sendMessage({queryWord: text}, function(response) {
        var resultObj = response;
        resultNearContainer.innerHTML = "";
        if(resultObj.validMessage === "query success") {
            resultNearContainer.innerHTML += resultObj.titleBlock;
            if(resultObj.basicBlock)
                resultNearContainer.innerHTML += resultObj.basicBlock;
            else {
                var unableMessage = "╮(╯▽╰)╭划词君无能为力啊<br>复制给词典君试试吧↗"
                resultNearContainer.innerHTML += unableMessage;
            }
        }
    });
    setTimeout(function() {
        document.body.appendChild(resultNearContainer);
    }, 100);
    setTimeout(function() {
        document.body.removeChild(resultNearContainer);
    }, 1000 * duration);
}

function isExist(text) {
    var resultContainerCollection = document.getElementsByClassName("ChaZD_result_container"); 
    var length = resultContainerCollection.length;
    if (length !== 0) {
        for (var i = 0; i < length; i++) {
            if (resultContainerCollection[i].getAttribute("data-text") === text)
                return true;
        }    
    }
    return false;
}   


document.body.addEventListener("mouseup", queryInPage);

