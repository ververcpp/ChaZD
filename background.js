function ChaZD(queryWord, sendResponse) {
    var url = urls.dict + queryWord;
    console.log("Query url: " + url);
    var queryResult = {};
    var self = this;
    var xhr = new XMLHttpRequest();

    xhr.open("GET", url, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState != 4) return;
        var resultObj = self.parseResult.call(self, xhr.responseText);
        sendResponse(resultObj);
    }
    xhr.send();
}

ChaZD.prototype.checkErrorCode = function (errorCode) {
    var response = {
        "message": "",
        "error": 0
    };
    switch (errorCode) {
        case 0:
            response["message"] = "query success";
            break;
        case 20: 
            response["message"] = "要翻译的文本过长";
            response["error"] = 1;
            break;
        case 30:
            response["message"] = "无法进行有效的翻译";
            response["error"] = 1;
            break;
        case 40:
            response["message"] = "不支持的语言类型";
            response["error"] = 1;
            break;
        case 50:
            response["message"] = "无效的key";
            response["error"] = 1;
            break;
        case 60:
            response["message"] = "无辞典结果";
            response["error"] = 1;
            break;
        default:
    }
    return response;  
}

ChaZD.prototype.parseResult = function (responseText) {
    var result = JSON.parse(responseText);
    var resultObj = {};
    var validResult = this.checkErrorCode(result["errorCode"]);
    if (!validResult["error"]) {
        var titleBlock = this.initTitle(result);
        resultObj.titleBlock = titleBlock;
        if (result["basic"] !== undefined) {
            var basicBlock = this.parseBasicResult(result);
            resultObj.basicBlock = basicBlock
        }

        if (result["web"] !== undefined) {
            var webBlock = this.parseWebResult(result);
            resultObj.webBlock = webBlock;
        }
    }
    resultObj.validMessage = validResult["message"];
    return resultObj;
}

ChaZD.prototype.initTitle = function (result) {
    var translation = result["translation"];
    console.log(translation + "   " + result["translation"] );
    var queryWord = result["query"];
    
    var voiceContainer = this.initVoice(queryWord);
    var titleWord = fmt(frames.titleWord, queryWord, voiceContainer);
    var titleTranslation = fmt(frames.titleTranslation, translation.toString());

    return fmt(frames.titleContainer, titleWord,  titleTranslation);
}

ChaZD.prototype.parseBasicResult = function (result) {
    var basic = result["basic"];
    var queryWord = result["query"];
    
    var phoneticBlock = this.parseBasicPhonetic(basic, queryWord);
    var explainsBlock = this.parseBasicExplains(basic, queryWord);

    var basicContainer = fmt(frames.basicContainer, phoneticBlock, explainsBlock);
    return basicContainer;
}

ChaZD.prototype.parseBasicPhonetic = function (basic, queryWord) {
    var ukPhonetic = basic["uk-phonetic"];
    var usPhonetic = basic["us-phonetic"];

    if (ukPhonetic !== undefined && usPhonetic !== undefined) {
        var ukVoice = this.initVoice(queryWord, 1);
        var ukPhoneticContainer = fmt(frames.ukPhoneticContainer, "[" + ukPhonetic + "]" + ukVoice);
    
        var usVoice = this.initVoice(queryWord, 2);
        var usPhoneticContainer = fmt(frames.usPhoneticContainer, "[" + usPhonetic + "]" + usVoice);

        return fmt(frames.phoneticContainer, ukPhoneticContainer, usPhoneticContainer);
    }
  
    return fmt(frames.phoneticContainer, "", "");
}

ChaZD.prototype.initVoice = function (queryWord, type) {
    var src = urls.voice + queryWord;
    if(type !== undefined) 
        src = src + "&type=" + type;
    var title = ""; 
    if(type === 1){
        title = "英音";
    } else if (type === 2){
        title = "美音";
    } else {
        title = "真人发音";
    }

    return fmt(frames.voiceContainer, src, title);
}

ChaZD.prototype.parseBasicExplains = function (basic, queryWord) {
    var explains = basic["explains"];
    var i;
    var explainsContent = "";
    for (i = 0; i < explains.length; i++) {
        var currentExplain = explains[i];
        
        var haveProperty = currentExplain.indexOf(" ");
        var property = (haveProperty !== -1) ? currentExplain.slice(0, haveProperty) : "";
        var propertyTitle = this.parseProperty(property);
        var propertyContainer = fmt(frames.propertyContainer, propertyTitle, property);
        var explainText = (haveProperty !== -1) ? currentExplain.slice(haveProperty) : currentExplain;
        
        var explain = fmt(frames.explain, propertyContainer, explainText);
        explainsContent += explain;
    } 
    
    return fmt(frames.explainsContainer, fmt(frames.explainsList, explainsContent));
}

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
}



ChaZD.prototype.parseWebResult = function (result) {
    var web = result["web"];
    var webExplainsContent = "";
    var i;
    for (i = 0; i < web.length ; i++) {
        var webEplain = fmt(frames.webEplain, web[i].key + web[i].value);
        webExplainsContent += webEplain;
    }

    return fmt(frames.webExplainsContainer, fmt(frames.webEplainsList, webExplainsContent));
}

/*
ChaZD.prototype.parsePhrase = function (queryWord, key) {
    var words = [];
    words = queryWord.split(/\s+/);
}
*/

chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse){
        console.log("message from sender:" + JSON.stringify(message));
        console.log("sender is " + JSON.stringify(sender));
        new ChaZD(message.queryWord, sendResponse);

        return true;
});
