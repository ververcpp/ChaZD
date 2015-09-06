function ChaZD(queryWord, wordSource, sendResponse) {
    this.wordSource = wordSource;
    var url = urls.dict + queryWord;
    //console.log("Query url: " + url);
    var queryResult = {};
    var self = this;
    var xhr = new XMLHttpRequest();

    xhr.open("GET", url, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState != 4) {return;}
        var result = JSON.parse(xhr.responseText);

        if (queryWord.indexOf("-") !== -1 && !self.checkErrorCode(result.errorCode).error && !self.haveTranslation(result)) {
            //优化使用连字符的词的查询结果
            new ChaZD(queryWord.replace(/-/g, " "), wordSource, sendResponse);
        } else {
            var resultObj = self.parseResult.call(self, result);
            sendResponse(resultObj);
        }
    };
    xhr.send();
}

ChaZD.prototype.checkErrorCode = function (errorCode) {
    var response = {
        "message": "",
        "error": 0,
        "errorCode": 0
    };
    switch (errorCode) {
        case 0:
            response.message = "query success";
            break;
        case 20: 
            response.message = "要翻译的文本过长";
            response.error = 1;
            response.errorCode = 20;
            break;
        case 30:
            response.message = "无法进行有效的翻译";
            response.error = 1;
            response.errorCode = 30;
            break;
        case 40:
            response.message = "不支持的语言类型";
            response.error = 1;
            response.errorCode = 40;
            break;
        case 50:
            response.message = "无效的key";
            response.error = 1;
            response.errorCode = 50;
            break;
        case 60:
            response.message = "无辞典结果";
            response.error = 1;
            response.errorCode = 60;
            break;
        default:
    }
    return response;  
};

ChaZD.prototype.parseResult = function (result) {
    //console.log("Response Text: \n" + responseText);
    var resultObj = {};
    var validResult = this.checkErrorCode(result.errorCode);
    resultObj.haveWebTranslation = false;
    if (!validResult.error) {
        var title = this.initTitle(result);
        resultObj.titleBlock = title.titleBlock;
        resultObj.haveTranslation = this.haveTranslation(result);
        if (result.basic !== undefined) {
            var basicBlock = this.parseBasicResult(result);
            resultObj.basicBlock = basicBlock;
        }

        if (result.web !== undefined) {
            var webBlock = this.parseWebResult(result);
            resultObj.haveWebTranslation = true;
            resultObj.webBlock = webBlock;
        }
    } else {
        resultObj.errorCode = validResult.errorCode;
    }
    resultObj.validMessage = validResult.message;
    
    return resultObj;
};

ChaZD.prototype.haveTranslation = function (result) {
    if (this.checkErrorCode(result.errorCode).error) {
        return false;
    }
    var translation = result.translation;
    var queryWord = result.query;
    if (trim(queryWord.toLowerCase()) === trim(translation.toString().toLowerCase())) {
        return false;
    }
    return true;
};

ChaZD.prototype.initTitle = function (result) {
    var translation = result.translation;
    var queryWord = result.query;
    //console.log("[ChaZD] queryWord: %s, translation: %s.", queryWord, translation.toString());
    // var haveTranslation = true;
    // if (trim(queryWord.toLowerCase()) === trim(translation.toString().toLowerCase())) {
    //     haveTranslation = false;
    // }

    var voiceContainer = this.initVoice(queryWord);
    //console.log("word length:", queryWord.length);
    //console.log("word source:", this.wordSource);
    queryWord = queryWord.length >= 50 && this.wordSource == "select" ? this.shortWord(queryWord) : queryWord;

    //console.log("word:", queryWord);
    var titleWord = fmt(frame.titleWord, queryWord, voiceContainer);
    var titleTranslation = fmt(frame.titleTranslation, translation.toString());


    return {
        titleBlock : fmt(frame.titleContainer, titleWord,  titleTranslation, queryWord.length >=50 ? "long-text" : ""),
        //haveTranslation : haveTranslation
    };
};

ChaZD.prototype.shortWord = function (longWord) {
    return longWord.slice(0, longWord.lastIndexOf(" ", 50)).concat(" ...");
};

ChaZD.prototype.parseBasicResult = function (result) {
    var basic = result.basic;
    var queryWord = result.query;
    
    var phoneticBlock = this.parseBasicPhonetic(basic, queryWord);
    var explainsBlock = this.parseBasicExplains(basic, queryWord);

    var basicContainer = fmt(frame.basicContainer, phoneticBlock, explainsBlock);
    return basicContainer;
};

ChaZD.prototype.parseBasicPhonetic = function (basic, queryWord) {
    var ukPhonetic = basic["uk-phonetic"];
    var usPhonetic = basic["us-phonetic"];

    if (ukPhonetic !== undefined && usPhonetic !== undefined) {
        var ukVoice = this.initVoice(queryWord, 1);
        var ukPhoneticContainer = fmt(frame.ukPhoneticContainer, "[" + ukPhonetic + "]" + ukVoice);
    
        var usVoice = this.initVoice(queryWord, 2);
        var usPhoneticContainer = fmt(frame.usPhoneticContainer, "[" + usPhonetic + "]" + usVoice);

        return fmt(frame.phoneticContainer, ukPhoneticContainer, usPhoneticContainer);
    }
  
    return fmt(frame.phoneticContainer, "", "");
};

ChaZD.prototype.initVoice = function (queryWord, type) {
    var src = urls.voice + queryWord;
    if(type !== undefined) {
        src = src + "&type=" + type;
    }
    var title = ""; 
    if(type === 1){
        title = "英音";
    } else if (type === 2){
        title = "美音";
    } else {
        title = "真人发音";
    }

    return fmt(frame.voiceContainer, src, title);
};

ChaZD.prototype.parseBasicExplains = function (basic, queryWord) {
    var explains = basic.explains;
    var i;
    var explainsContent = "";
    for (i = 0; i < explains.length; i++) {
        var currentExplain = explains[i];
        
        var haveProperty = currentExplain.indexOf(". ");
        var property = (haveProperty !== -1) ? currentExplain.slice(0, haveProperty + 1) : "";
        var propertyTitle = this.parseProperty(property);
        var propertyContainer = fmt(frame.propertyContainer, propertyTitle, property);
        var explainText = (haveProperty !== -1) ? currentExplain.slice(haveProperty + 1) : currentExplain;
        
        var explain = fmt(frame.explain, propertyContainer, explainText);
        explainsContent += explain;
    } 
    
    return fmt(frame.explainsContainer, fmt(frame.explainsList, explainsContent));
};

ChaZD.prototype.parseProperty = function (property) {
    var propertyText = "";
    switch (property) {
        case "adj." :
            propertyText = "形容词";
            break;
        case "adv." :
            propertyText = "副词";
            break;
        case "n." : 
            propertyText = "名词";
            break;
        case "vi." :
            propertyText = "不及物动词";
            break;
        case "vt." :
            propertyText = "及物动词";
            break;
        case "prep." :
            propertyText = "介词";
            break;
        case "conj." :
            propertyText = "连词";
            break;
        case "int." :
            propertyText = "感叹词";
            break;
        case "abbr." :
            propertyText = "代词";
            break;
        case "pron." :
            propertyText = "";
            break;
        default :
    }

    return propertyText;
};



ChaZD.prototype.parseWebResult = function (result) {
    var web = result.web;
    var webExplainsContent = "";
    var i;
    for (i = 0; i < web.length ; i++) {
        var webExplain = fmt(frame.webExplain, web[i].key, web[i].value);
        webExplainsContent += webExplain;
    }

    return fmt(frame.webExplainsContainer, fmt(frame.webExplainsList, webExplainsContent));
};

//字符串预处理，解析驼峰命名法和下划线命名法的单词、词组
function preprocessWord (originWord) {
    if (originWord.indexOf(" ") === -1) {
        originWord = originWord.replace(/_/g, " ");
        if (/[a-z]+/.test(originWord)) {
            originWord = trim(originWord.replace(/([A-Z])/g, " $1"));
        }
    }
    return originWord;
}

/*
ChaZD.prototype.parsePhrase = function (queryWord, key) {
    var words = [];
    words = queryWord.split(/\s+/);
}
*/
window.Notifications = window.Notifications || window.webkitNotifications;

function showNotification(note) {
    if (!Notifications) {
        //console.log("[ChaZD] Your browse don't support notification.");
        return;
    }
    var notification = null, havePermission = Notifications.checkPermission();
    if (havePermission === 0) {
        notification = Notifications.createNotification(
            note.icon || chrome.extension.getURL("icons/icon128.png"),
            note.title || "ChaZD 查字典",
            note.content
        );
        notification.onclick = function () {
            window.open("https://chrome.google.com/webstore/detail/chazd/nkiipedegbhbjmajlhpegcpcaacbfggp");
        };
        notification.show();
    } else {
        Notifications.requestPermission();
    }

    return notification;
}

chrome.runtime.onInstalled.addListener(
    function (details) {
        if (details.reason === "install") {
            //console.log("[ChaZD] first install.");
            showNotification({
                title : "感谢支持ChaZD！",
                content : "ChaZD力求成为最简洁易用的Chrome词典扩展，欢迎提出您的意见或建议。" + 
                    "如果觉得ChaZD还不错，记得给5星好评哦:)"
            });
            //alert("Thank you for install my app:)");
        } else if (details.reason === "update") {
            //console.log("[ChaZD] update from version " + details.previousVersion);
            //alert("New version has updated!");
            showNotification({
                title : "ChaZD 更新到0.8.15版！",
                content : "修改 bug"
                          
            });
        }
    }
);

chrome.storage.sync.get(null,function (items) {
    //console.log(JSON.stringify(items));
    if (items.showTips === undefined ) {
        //console.log("storage 是空的");
        chrome.storage.sync.set(settings);
    } else {
        //console.log("[ChaZD][Current Settings]");
        for (var key in items) {
            if (settings[key] === undefined) {
                chrome.storage.sync.remove(key);
                //console.log("Remove setting item '%s'", key);
            } else {
                settings[key] = items[key];
            }
        }
        chrome.storage.sync.set(settings);
    }
});

chrome.runtime.onMessage.addListener(
    function (message, sender, sendResponse) {
        //console.log("message from sender:" + JSON.stringify(message));
        //console.log("sender is " + JSON.stringify(sender));
        new ChaZD(preprocessWord(message.queryWord), message.source, sendResponse);

        return true;
});
