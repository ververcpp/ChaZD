(function() {
    var preSelection = {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        again: 0
    };
    var queryInPage = function(event) {
        var selection = window.getSelection && window.getSelection();
        if(selection && selection.rangeCount > 0) {
            var selectText = trim(selection.toString());
            var selectRange = selection.getRangeAt(0).getBoundingClientRect();
            if (isExist(selectRange, preSelection) && preSelection.again) {
                preSelection.again = 0;
                return;
            }
            if (selectText == "" || !(/[a-zA-Z\s]/.test(selectText))) return;
            for (var key in preSelection) {
                if (key == "again")
                    preSelection[key] = 1;
                else {
                    preSelection[key] = selectRange[key];
                }              
            }
            //console.log("[ChaZD]Selected Text at %s : %s", location.href, selectText);
            var currentSettings = {};
            chrome.storage.sync.get(null, function(items) {
                //console.log("[Settings after select]");
                for (var key in items) {
                    currentSettings[key] = items[key];
                    //console.log("   %s : %s", key, currentSettings[key]);
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
    }

    var showResultSide = function (text) {
        //if(isExist(text)) return;
        var $resultSideContainer = makeResultContainer(text);
        $resultSideContainer.addClass("ChaZD-result-side");
        $("html").append($resultSideContainer);
    }

    var showResultNear = function (text, range, event) {
        //if(isExist(text)) return;
        var $resultNearContainer = makeResultContainer(text);
        var $arrowMain = makeArrowDiv();
        $("html").append($resultNearContainer.fadeIn(200));
        $("html").append($arrowMain.show(100));

        var showNearPosition = {};
        //文本框中选取的内容返回的left top 为0，此时采集鼠标的位置
        if (range.left === 0 && range.top === 0) {
            range = {
                left: event.clientX,
                top: event.clientY,
                height: 15
            };
        }

        var containerWidth = $resultNearContainer[0].offsetWidth;
        //var arrowWidth = $arrowMain.width();
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

        var arrowMain = $arrowMain[0];
        var resultNearContainer = $resultNearContainer[0];
        //resultNearContainer.style.position = "absolute";
        resultNearContainer.style.left = showNearPosition.left + "px";
        arrowMain.style.left = showNearPosition.arrowLeft + "px";
        if (showNearPosition.bottom) {
            resultNearContainer.style.bottom = showNearPosition.bottom + "px";
            arrowMain.style.bottom = showNearPosition.arrowBottom + "px";
            $arrowMain.find("#ChaZD-arrow-outer").addClass("ChaZD-arrow-outer-down");
            $arrowMain.find("#ChaZD-arrow-inner").addClass("ChaZD-arrow-inner-down");
        }
        if (showNearPosition.top) {
            resultNearContainer.style.top = showNearPosition.top + "px";
            arrowMain.style.top = showNearPosition.arrowTop + "px";
            $arrowMain.find("#ChaZD-arrow-outer").addClass("ChaZD-arrow-outer-up");
            $arrowMain.find("#ChaZD-arrow-inner").addClass("ChaZD-arrow-inner-up");
        }

        
        // var t = setTimeout(function () {
        //     document.body.removeChild($resultNearContainer);
        // }, 1000 * duration);
    }

    var makeArrowDiv = function () {
        var $arrowDivMain = $("<div class=\"ChaZD-arrow-main\"></div>");
        var $arrowDivOuter = $("<div id=\"ChaZD-arrow-outer\"></div>");
        var $arrowDivInner = $("<div id=\"ChaZD-arrow-inner\"></div>");
        $arrowDivMain.append($arrowDivOuter).append($arrowDivInner);

        return $arrowDivMain;
    }

    var makeResultContainer = function (text) {
        var $resultContainer = $("<div></div>");
        $resultContainer.addClass("ChaZD-result-container");
        $resultContainer.attr("data-text", text);
        var $searchingNode = $("<div id=\"ChaZD-searching\">ψ(._. )>划词君正在翻译。。。</div>")
        $resultContainer.append($searchingNode);
        chrome.runtime.sendMessage({
            queryWord: text
        }, function(response) {
            var resultObj = response;
            $resultContainer.find("#ChaZD-searching").html("");
            if (resultObj.validMessage === "query success") {
                $resultContainer.append(resultObj.titleBlock);
                var $voiceButtom = $resultContainer.find(".voice-container");
                $voiceButtom.each(function(index, el) {
                    var voiceSource = $(this).attr("data-src");
                    var audioBlock = document.createElement("audio");
                    audioBlock.setAttribute("src", voiceSource);
                    audioBlock.addEventListener("ended", function (event) {
                        this.load();
                    });
                    $(this).click(function (event) {
                        audioBlock.play();
                    })
                })

                if (resultObj.basicBlock)
                    $resultContainer.append(resultObj.basicBlock);
                else if (resultObj.haveTranslation) {
                    $resultContainer.children(".title-container").children(".title-translation").css("display", "block");
                } else if (resultObj.haveWebTranslation) {
                    $resultContainer.append(resultObj.webBlock);
                    $resultContainer.children(".web-explains-container").children(".web-title").text("网络释义");
                } else {
                    $resultContainer.append("╮(╯▽╰)╭划词君无能为力啊<br>复制给词典君试试吧↗");
                }
            }
        });

        return $resultContainer;
    }

    function isExist(newRange, oldRange) {
        if (newRange.top === oldRange.top && 
            newRange.bottom === oldRange.bottom &&
            newRange.left === oldRange.left &&
            newRange.right === oldRange.right) 
            return true;
        return false;
    }

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

    var classNameCollection = ["ChaZD-result-container", "title-container", "title-word", "title-translation", "basic-container", "phonetic-container", "explains-container", "explains-container", "explains-list", "property-container", "explains-item", "voice-container", "us-phonetic-container", "uk-phonetic-container", "web-explains-container", "web-explains-list", "web-key", "explains-item-value", "web-value"];

    $(document).bind("mousedown", function(event) {
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
        $(".ChaZD-result-container").remove();
        $(".ChaZD-arrow-main").remove();
    });

    $(window).bind("resize", function(event) {
        $(".ChaZD-result-container").remove();
        $(".ChaZD-arrow-main").remove();
    })
    
    var queryEvent = function (event) {
        //console.log("[ChaZD] current useCtrl: " + useCtrl);
        if (useCtrl) {
            //console.log("current togglekey: " + toggleKey);
            if (toggleKey === "ctrl") {
                //console.log("[ChaZD] In Ctrl");
                if (!event.ctrlKey && !event.metaKey) {
                    //console.log("[ChaZD] Aho~~~");
                    preSelection.again = 0;
                    return;
                }
            } else if (toggleKey === "alt") {
                //console.log("[ChaZD] In Alt");
                if (!event.altKey) {
                    preSelection.again = 0;
                    //console.log("[ChaZD] Aho~~~");
                    return;
                }
            } else if (toggleKey === "shift") {
                //console.log("[ChaZD] In Shift");
                if (!event.shiftKey) {
                    preSelection.again = 0;
                    //console.log("[ChaZD] Aho~~~");
                    return;
                }
            }
        }
        queryInPage(event);
    }

    $(document).bind("mouseup", queryEvent);

    $(document).bind("selectstart", queryEvent); //bug!!

})();