(function(){
    var preSelection = {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        again: 0
    };

    var timeout;

    var queryInPage = function(event) {
        var selection = window.getSelection && window.getSelection();
        if(selection && selection.rangeCount > 0) {
            var selectText = trim(selection.toString());
            var selectRange = selection.getRangeAt(0).getBoundingClientRect();
            if (isExist(selectRange, preSelection) && preSelection.again) {
                preSelection.again = 0;
                return;
            }
            
            if (selectText === "" || !(/^[^\u4e00-\u9fa5]+$/.test(selectText))) {return;}
            var haveResult = document.documentElement.querySelectorAll(".ChaZD-result-container");
            for (var i = 0, len = haveResult.length; i < len; i++) {
                if (haveResult[i].getAttribute("data-text").toLowerCase() === selectText.toLowerCase()){return;}
            }
            ////////if (currentQueryWord !== "" && selectText === currentQueryWord) {return;}
            chrome.storage.sync.set({"currentWord" : selectText}, function() {
                //console.log("[ChaZD] Success update settings currentWord = " + selectText);
            });
            for (var key in preSelection) {
                if (key == "again") {
                    preSelection[key] = 1;
                }
                else {
                    preSelection[key] = selectRange[key];
                }              
            }
            if (currentSettings.showPosition === "side") {
                //console.log("in 1");
                showResultSide(selectText, currentSettings.useHttps);
            }
            if (currentSettings.showPosition === "near") {
                //console.log("in 2");
                showResultNear(selectText, currentSettings.useHttps, selectRange, event);
            }
        }       
    };

    var showResultSide = function (text, useHttps) {
        //if(isExist(text)) return;
        var $resultSideContainer = makeResultContainer(text, useHttps);
        $resultSideContainer.classList.add("ChaZD-result-side");
        document.documentElement.appendChild($resultSideContainer);

        if (currentSettings.autoHide) {
            timeout = setTimeout(function () {
                if (document.querySelector(".ChaZD-result-container")) {
                    document.documentElement.removeChild($resultSideContainer);
                    ////////currentQueryWord = "";
                }
            }, 1000 * currentSettings.showDuration);
        }
    };

    var showResultNear = function (text, useHttps, range, event) {
        //if(isExist(text)) return;
        var resultNearContainer = makeResultContainer(text, useHttps);
        var arrowMain = makeArrowDiv();
        document.documentElement.appendChild(resultNearContainer);
        document.documentElement.appendChild(arrowMain);

        var showNearPosition = {};
        //文本框中选取的内容返回的left top 为0，此时采集鼠标的位置
        if (range.left === 0 && range.top === 0) {
            range = {
                left: event.clientX,
                top: event.clientY,
                height: 15
            };
        }

        var containerWidth = resultNearContainer.offsetWidth;
        //var arrowWidth = arrowMain.width();
        var rangeWidth = range.right - range.left;
        //console.log("arrow width: " + arrowWidth);
        var left = range.left + window.pageXOffset;
        var top = range.top + window.pageYOffset;
        var rangeMiddle = rangeWidth/2 + left;
        var containerLeft = left - (containerWidth - rangeWidth)/2;
        var arrowLeft = rangeMiddle - 12;

        if (containerLeft < window.pageXOffset) {
            containerLeft = window.pageXOffset;
        } else if (containerLeft + containerWidth > window.pageXOffset + document.documentElement.clientWidth) {
            containerLeft = window.pageXOffset + document.documentElement.clientWidth - containerWidth;
        }

        var clientHeight = 0;
        clientHeight = (document.documentElement.clientHeight > document.body.clientHeight) ? document.body.clientHeight : document.documentElement.clientHeight;
        if (clientHeight === 0) {
            clientHeight = document.documentElement.clientHeight;
        }
        //console.log("[ChaZD]clientHeight : " + clientHeight);
        
        if (range.top >= 150) {
            var bottom = clientHeight - top + 10;
            var arrowBottom = bottom + 1;
            showNearPosition = {
                left: containerLeft,
                bottom: bottom,
                arrowLeft: arrowLeft,
                arrowBottom: arrowBottom
            };
        } else {
            showNearPosition = {
                left: containerLeft,
                top: top + range.height + 12,
                arrowLeft: arrowLeft,
                arrowTop: top + range.height + 1
            };
        }

        // var arrowMain = $arrowMain;
        // var resultNearContainer = resultNearContainer[0];
        //resultNearContainer.style.position = "absolute";
        resultNearContainer.style.left = showNearPosition.left + "px";
        arrowMain.style.left = showNearPosition.arrowLeft + "px";
        var chazdArrowOuter = document.querySelectorAll(".ChaZD-arrow-outer");
        var chazdArrowInner = document.querySelectorAll(".ChaZD-arrow-inner");
        var i, len;
        if (showNearPosition.bottom) {
            resultNearContainer.style.bottom = showNearPosition.bottom + "px";
            arrowMain.style.bottom = showNearPosition.arrowBottom + "px";
            for (i = 0, len = chazdArrowOuter.length; i < len; i++) {
                chazdArrowOuter[i].classList.add("ChaZD-arrow-outer-down");
                chazdArrowInner[i].classList.add("ChaZD-arrow-inner-down");
            }
        }
        if (showNearPosition.top) {
            resultNearContainer.style.top = showNearPosition.top + "px";
            arrowMain.style.top = showNearPosition.arrowTop + "px";
            for (i = 0, len = chazdArrowOuter.length; i < len; i++) {
                chazdArrowOuter[i].classList.add("ChaZD-arrow-outer-up");
                chazdArrowInner[i].classList.add("ChaZD-arrow-inner-up");
            }
        }

        if (currentSettings.autoHide) {
            timeout = setTimeout(function () {
                if (document.querySelector(".ChaZD-result-container") && document.querySelector(".ChaZD-arrow-main")) {
                    document.documentElement.removeChild(resultNearContainer);
                    document.documentElement.removeChild(arrowMain);
                    ////////currentQueryWord = "";
                }
            }, 1000 * currentSettings.showDuration);
        }
        // var t = setTimeout(function () {
        //     document.body.removeChild(resultNearContainer);
        // }, 1000 * duration);
    };

    var makeArrowDiv = function () {
        // var arrowDivMain = document.createElement("div");
        // arrowDivMain.classList.add("ChaZD-arrow-main");
        var arrowDivMain = document.createElement("div");
        arrowDivMain.classList.add("ChaZD-arrow-main");
        var arrowDivOuter = document.createElement("div");
        arrowDivOuter.setAttribute("class", "ChaZD-arrow-outer");
        var arrowDivInner = document.createElement("div");
        arrowDivInner.setAttribute("class", "ChaZD-arrow-inner");
        arrowDivMain.appendChild(arrowDivOuter);
        arrowDivMain.appendChild(arrowDivInner);

        return arrowDivMain;
    };

    var makeResultContainer = function (text, useHttps) {
        var $resultContainer = document.createElement("div");
        $resultContainer.classList.add("ChaZD-result-container");
        $resultContainer.setAttribute("data-text", text);
        var $searchingNode = document.createElement("div");
        $searchingNode.setAttribute("id", "ChaZD-searching");
        $searchingNode.innerHTML = "ψ(._. )>划词君正在翻译。。。";
        $resultContainer.appendChild($searchingNode);
        chrome.runtime.sendMessage({
            queryWord: text,
            source: "select"
        }, function(response) {
            var resultObj = response;
            $searchingNode.innerHTML = "";
            if (resultObj.Code === 0) {
                $resultContainer.innerHTML = resultObj.titleBlock;
                var singleVoiceButton = $resultContainer.querySelector(".voice-container");
                var buildVoice = function (voice) {
                    var src = voice.getAttribute("data-src");
                    var audioBlock = document.createElement("audio");
                    if(currentSettings.defaultVoice){
                        src += "&type=" + currentSettings.defaultVoice;
                    }
                    audioBlock.setAttribute("src", src);
                    voice.appendChild(audioBlock);
                    if (currentSettings.autoAudio === true) {
                        audioBlock.play();
                    }
                    audioBlock.addEventListener("ended", function (event) {
                        this.load();
                    });
                    voice.addEventListener("click", function (event) {
                        audioBlock.play();
                    });
                };
                buildVoice(singleVoiceButton);
                var temp = document.createElement("div");
                if (resultObj.basicBlock) {
                    temp.innerHTML = resultObj.basicBlock;
                    $resultContainer.appendChild(temp);
                }
                else if (resultObj.haveTranslation) {
                    $resultContainer.querySelector(".title-translation").style.display = "block";
                } else if (resultObj.haveWebTranslation) {
                    temp.innerHTML = resultObj.webBlock;
                    $resultContainer.appendChild(temp);
                    $resultContainer.querySelector(".web-title").innerHTML = "网络释义";
                } else {
                    $resultContainer.innerHTML = "╮(╯▽╰)╭划词君无能为力啊<br> 还是右键问问谷歌君吧=>";
                }
            } else {
                if (resultObj.Code == 20) {
                    $resultContainer.innerHTML = "<p>这段文字太长，词典君无能为力了（┬_┬） <br><br>试试短一点的吧~</p>";
                } else if (resultObj.Code == 40) {
                    $resultContainer.innerHTML = "<p>对不起，这段文字太高深了，请饶过词典君吧（┬_┬）</p>";
                } else {
                    $resultContainer.innerHTML = "<p>词典君罢工啦（┬_┬）<br><br> 是不是网络不太好？<br><br> 稍后再试一次吧</p>";
                }
            }
        });
        return $resultContainer;
    };

    function isExist(newRange, oldRange) {
        if (newRange.top === oldRange.top && 
            newRange.bottom === oldRange.bottom &&
            newRange.left === oldRange.left &&
            newRange.right === oldRange.right) {
            return true;
        }
        return false;
    }
    
    var classNameCollection = ["ChaZD-result-container", "title-container", "title-word", "title-translation", "basic-container", "phonetic-container", "explains-container", "explains-container", "explains-list", "property-container", "explains-item", "voice-container", "us-phonetic-container", "uk-phonetic-container", "web-explains-container", "web-explains-list", "web-key", "explains-item-value", "web-value"];

    document.documentElement.addEventListener("mousedown", function(event) {
        //console.log("event.target: " + event.target.className);
        for (var name in classNameCollection) {
            if (event.target.classList.contains(classNameCollection[name])) {
                //console.log("[ChaZD] don't remove");
                return;
            }
        }
        // var existResult = document.getElementsByClassName("ChaZD-result-container");
        // for (var i = 0; i < existResult.length; i++) {
        //     existResult[i].parentNode.removeChild(existResult[i]);
        // }
        clearTimeout(timeout);
        var chazdResult = document.querySelectorAll(".ChaZD-result-container");
        var chazdArrow = document.querySelectorAll(".ChaZD-arrow-main");
        var i, len;
        if (chazdResult) {
            for (i = 0, len = chazdResult.length; i < len; i++) {
                document.documentElement.removeChild(chazdResult[i]);
            }
        }
        if (chazdArrow) {
            for (i = 0, len = chazdArrow.length; i < len; i++) {
                document.documentElement.removeChild(chazdArrow[i]);
            }
        }
        chrome.storage.sync.set({"currentWord" : ""});
        ////////currentQueryWord = "";
        //clearSelection(event);
    });

    window.addEventListener("resize", function(event) {
        var chazdResult = document.querySelector(".ChaZD-result-container");
        var chazdArrow = document.querySelector(".ChaZD-arrow-main");
        if (chazdResult) {
            document.documentElement.removeChild(chazdResult);
        }
        if (chazdArrow) {
            document.documentElement.removeChild(chazdArrow);
        }
        ////////currentQueryWord = "";
    });
    
    var queryEvent = function (event) {
        //console.log("[ChaZD] current useCtrl: " + useCtrl);
        if (currentSettings.selectMode === "noSelect") {return;}
        if (currentSettings.selectMode === "useCtrl") {
            //console.log("current togglekey: " + toggleKey);
            if (currentSettings.toggleKey === "ctrl") {
                //console.log("[ChaZD] In Ctrl");
                if (!event.ctrlKey && !event.metaKey) {
                    //console.log("[ChaZD] Aho~~~");
                    preSelection.again = 0;
                    return;
                }
            } else if (currentSettings.toggleKey === "alt") {
                //console.log("[ChaZD] In Alt");
                if (!event.altKey) {
                    preSelection.again = 0;
                    //console.log("[ChaZD] Aho~~~");
                    return;
                }
            } else if (currentSettings.toggleKey === "shift") {
                //console.log("[ChaZD] In Shift");
                if (!event.shiftKey) {
                    preSelection.again = 0;
                    //console.log("[ChaZD] Aho~~~");
                    return;
                }
            }
        }
        queryInPage(event);
    };

    var link = null;

    var focusLink = function (event) {
        if (currentSettings.linkQuery) {
            //event.stopPropagation();
            //console.log("focusLink");
            link = event.target;
            //console.log(link);
            if(event.shiftKey) {
                // alert("have shift");
                disableLink(event);
            }

        }
    };

    var blurLink = function (event) {
        if (currentSettings.linkQuery) {
            //event.stopPropagation();
            if (link && link.classList.contains("ChaZD-link")) {
                enableLink(event, true);
            }
            link = null;
        }
    };

    var disableLink = function (event) {
        if (link && event.shiftKey) {
            clearSelection(event);
            link.setAttribute("ChaZD-href", link.getAttribute("href"));
            link.removeAttribute("href");
            link.classList.add("ChaZD-link");
        }
    };

    var enableLink = function (event, ignoreKey) {
        if (link && (ignoreKey || event.keyCode == 16)) {
            link.setAttribute("href", link.getAttribute("ChaZD-href"));
            link.removeAttribute("ChaZD-href");
            link.classList.remove("ChaZD-link");
        }
    };

    var clearSelection = function (event) {
        if (currentSettings.linkQuery && event.shiftKey) {
            window.getSelection().empty();
        }
    };
    
    document.documentElement.addEventListener("mouseup", queryEvent);
    document.documentElement.addEventListener("mouseover", function (e) {
        if (e.target.nodeName === "A" || e.target.nodeName === "a") {
            focusLink(e);
        }
    });
    document.documentElement.addEventListener("mouseout", function (e) {
        if (e.target.nodeName === "A" || e.target.nodeName === "a") {
            blurLink(e);
        }
    });
    // var links = document.querySelectorAll("a");
    // console.log(links);
    // for (var i = 0, len = links.length; i < len; i++) {
    //     links[i].addEventListener("mouseover", function (e) {
    //         console.log("heloo world");
    //     });
    //     //links[i].addEventListener("mouseleave", blurLink);
    // }
    document.documentElement.addEventListener("keydown", disableLink);
    document.documentElement.addEventListener("keyup", enableLink);
    document.documentElement.addEventListener("selectstart", queryEvent); //bug!!
})();
    