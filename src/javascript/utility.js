function ajax(method,url,data,cb,before){
    var xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.onreadystatechange = function(){
        if (xhr.readyState != 4) {
            return;
        }
        cb(xhr);
    };
    if(before !== undefined) {
        before(xhr);
    }
    xhr.send(data);
}

var settings = {
    selectMode : "mouseSelect",     //划词的形式：直接划词 or Ctrl + 划词
    showPosition : "near",          //划词翻译结果显示的位置
    toggleKey : "ctrl",
    showTips : true,                //是否显示 Tips
    currentWord: "",                //当前划词查询的内容
    linkQuery: false,               //在链接上划词
    autoAudio: false,               //划词自动发音
    autoHide: false,                //自动隐藏翻译结果
    showDuration: 3,                //翻译结果显示持续时间
    defaultVoice: 0,                //划词默认发音：0--真人发音；1--英音；2--美音
    useHttps: false,                //是否使用 HTTPS 的接口
    autoLearn:true,                  //是否自动加入生词本
    apiName:"shanbay"
};
var currentSettings = settings;
chrome.storage.sync.get(null, function(items) {
    for (var key in items) {
        currentSettings[key] = items[key];
    }
});
chrome.storage.onChanged.addListener(function(changes) {
    if (changes.linkQuery !== undefined) {
        currentSettings.linkQuery = changes.linkQuery.newValue;
    }
    if (changes.useHttps !== undefined) {
        currentSettings.useHttps = changes.useHttps.newValue;
    }
    if (changes.autoAudio !== undefined) {
        currentSettings.autoAudio = changes.autoAudio.newValue;
    }
    if (changes.defaultVoice !== undefined) {
        currentSettings.defaultVoice = changes.defaultVoice.newValue;
    }
    if (changes.selectMode !== undefined) {
        currentSettings.selectMode = changes.selectMode.newValue;
    }
    if (changes.toggleKey !== undefined) {
        currentSettings.toggleKey = changes.toggleKey.newValue;
    }
    if (changes.autoHide !== undefined) {
        currentSettings.autoHide = changes.autoHide.newValue;
    }
    if (changes.showDuration !== undefined) {
        currentSettings.showDuration = changes.showDuration.newValue;
    }
    if (changes.showPosition !== undefined) {
        currentSettings.showPosition = changes.showPosition.newValue;
    }
    if (changes.autoLearn !== undefined) {
        currentSettings.autoLearn = changes.autoLearn.newValue;
    }
    if (changes.apiName !== undefined) {
        currentSettings.apiName = changes.apiName.newValue;
    }
});
var frame = {
    //title frame
    titleContainer : "<div class=\"title-container #{3}\">#{1}#{2}</div>",
    titleWord : "<div class=\"title-word\">#{1}#{2}</div>",
    voiceContainer : "<div class=\"voice-container\" data-src=\"#{1}\" title=\"#{2}\" ></div>",
    titleTranslation : "<div class=\"title-translation\">#{1}</div>",

    //basic frame
    basicContainer : "<div class=\"basic-container\">#{1}#{2}</div>",

    //basic phonetic frame
    phoneticContainer : "<div class=\"phonetic-container\">#{1}#{2}</div>",
    ukPhoneticContainer : "<div class=\"uk-phonetic-container\">#{1}</div>",
    usPhoneticContainer : "<div class=\"us-phonetic-container\">#{1}</div>",

    //basic explain frame
    explainsContainer : "<div class=\"explains-container\">#{1}</div>",
    explainsList : "<ul class=\"explains-list\">#{1}</ul>",
    explain : "<li class=\"explains-item\">#{1}<span class=\"explains-item-value\">#{2}</span></li>",
    propertyContainer : "<b class=\"property-container\" title=\"#{1}\">#{2}</b>",

    //web explain frame
    webExplainsContainer : "<div class=\"web-explains-container\"><div class=\"web-title\">网络释义及短语</div>#{1}</div>",
    webExplainsList : "<ul class=\"web-explains-list\">#{1}</ul>",
    webExplain : "<li><span class=\"web-key\">#{1}</span><span class=\"web-value\">#{2}</span></li>"
};
var youdao = function(){
    var config = {key: 1116151381,keyfrom : "youdaocidian"};
    var urls = {
        dict : "http://fanyi.youdao.com/openapi.do?keyfrom=" + config.keyfrom +"&key="+ config.key +"&type=data&doctype=json&version=1.1&q=",
        voice : "http://dict.youdao.com/dictvoice?audio=",
        dictHttps : "https://fanyi.youdao.com/openapi.do?keyfrom=" + config.keyfrom +"&key="+ config.key +"&type=data&doctype=json&version=1.1&q=",
        voiceHttps : "https://dict.youdao.com/dictvoice?audio="
    };
    var self = this;
    self.initVoice = function (src, type) {
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
    self.checkCode = function (Code) {
        var response = {
            "message": "",
            "error": 0,
            "Code": 0
        };
        switch (Code) {
            case 0:
                response.Message = "查询成功";
                break;
            case 20:
                response.Message = "要翻译的文本过长";
                response.error = 1;
                response.Code = 20;
                break;
            case 30:
                response.Message = "无法进行有效的翻译";
                response.error = 1;
                response.Code = 30;
                break;
            case 40:
                response.Message = "不支持的语言类型";
                response.error = 1;
                response.Code = 40;
                break;
            case 50:
                response.Message = "无效的key";
                response.error = 1;
                response.Code = 50;
                break;
            case 60:
                response.Message = "无辞典结果";
                response.error = 1;
                response.Code = 60;
                break;
            default:
        }
        return response;
    };
    self.shortWord = function (longWord) {
        return longWord.slice(0, longWord.lastIndexOf(" ", 50)).concat(" ...");
    };
    self.getVoice = function(result, type){
        var src = (currentSettings.useHttps ? urls.voiceHttps : urls.voice) + result.query;
        if(type !== undefined) {
            src = src + "&type=" + type;
        }
        return src;
    };
    self.initTitle = function (result) {
        var translation = result.translation;
        var queryWord = result.query;
        var voiceContainer = self.initVoice(self.getVoice(result));
        queryWord = queryWord.length >= 50 && self.wordSource == "select" ? self.shortWord(queryWord) : queryWord;
        var titleWord = fmt(frame.titleWord, queryWord, voiceContainer);
        var titleTranslation = translation?fmt(frame.titleTranslation, translation.toString()): "";
        return {
            titleBlock : fmt(frame.titleContainer, titleWord,  titleTranslation, queryWord.length >=50 ? "long-text" : "")
        };
    };
    self.haveTranslation = function (result) {
        if (self.checkCode(result.errorCode).error||!translation) {
            return false;
        }
        var translation = result.translation;
        var queryWord = result.query;
        if (trim(queryWord.toLowerCase()) === trim(translation.toString().toLowerCase())) {
            return false;
        }
        return true;
    };
    self.parseBasicPhonetic = function (result) {
        var basic = result.basic;
        var ukPhonetic = basic["uk-phonetic"];
        var usPhonetic = basic["us-phonetic"];
        if (ukPhonetic !== undefined && usPhonetic !== undefined) {
            var ukVoice = self.initVoice(self.getVoice(result,1), 1);
            var ukPhoneticContainer = fmt(frame.ukPhoneticContainer, "[" + ukPhonetic + "]" + ukVoice);
            var usVoice = self.initVoice(self.getVoice(result,2), 2);
            var usPhoneticContainer = fmt(frame.usPhoneticContainer, "[" + usPhonetic + "]" + usVoice);
            return fmt(frame.phoneticContainer, ukPhoneticContainer, usPhoneticContainer);
        }
        return fmt(frame.phoneticContainer, "", "");
    };
    self.parseProperty = function (property) {
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
    self.parseBasicExplains = function (result) {
        var basic = result.basic;
        var explains = basic.explains;
        var i;
        var explainsContent = "";
        for (i = 0; i < explains.length; i++) {
            var currentExplain = explains[i];
            var haveProperty = currentExplain.indexOf(". ");
            var property = (haveProperty !== -1) ? currentExplain.slice(0, haveProperty + 1) : "";
            var propertyTitle = self.parseProperty(property);
            var propertyContainer = fmt(frame.propertyContainer, propertyTitle, property);
            var explainText = (haveProperty !== -1) ? currentExplain.slice(haveProperty + 1) : currentExplain;
            var explain = fmt(frame.explain, propertyContainer, explainText);
            explainsContent += explain;
        }
        return fmt(frame.explainsContainer, fmt(frame.explainsList, explainsContent));
    };
    self.parseBasicResult = function (result) {
        var phoneticBlock = self.parseBasicPhonetic(result);
        var explainsBlock = self.parseBasicExplains(result);
        var basicContainer = fmt(frame.basicContainer, phoneticBlock, explainsBlock);
        return basicContainer;
    };
    self.parseWebResult = function (result) {
        var web = result.web;
        var webExplainsContent = "";
        var i;
        for (i = 0; i < web.length ; i++) {
            var webExplain = fmt(frame.webExplain, web[i].key, web[i].value);
            webExplainsContent += webExplain;
        }
        return fmt(frame.webExplainsContainer, fmt(frame.webExplainsList, webExplainsContent));
    };
    self.parseResult = function (result) {
        //console.log("Response Text: \n" + responseText);
        var resultObj = self.checkCode(result.errorCode);
        resultObj.haveWebTranslation = false;
        if (!resultObj.error) {
            var title = self.initTitle(result);
            resultObj.titleBlock = title.titleBlock;
            resultObj.haveTranslation = self.haveTranslation(result);
            if (result.basic !== undefined) {
                var basicBlock = self.parseBasicResult(result);
                resultObj.basicBlock = basicBlock;
            }
            if (result.web !== undefined) {
                var webBlock = self.parseWebResult(result);
                resultObj.haveWebTranslation = true;
                resultObj.webBlock = webBlock;
            }
        }
        return resultObj;
    };
    var Query = function(queryWord, wordSource, sendResponse) {
        self.wordSource = wordSource;
        var url = (currentSettings.useHttps ? urls.dictHttps : urls.dict) + queryWord;
        ajax("GET", url, null, function (xhr) {
            var result = JSON.parse(xhr.responseText);
            if (queryWord.indexOf("-") != -1 && !self.checkCode(result.errorCode).error && !self.haveTranslation(result)) {
                //优化使用连字符的词的查询结果
                new Query(queryWord.replace(/-/g, " "), wordSource, sendResponse);
            } else {
                var ret = self.parseResult(result);
                sendResponse(ret);
            }
        });
    };
    self.Query = Query;
};

var shanbay = function(){
    var self = this;
    self.dict = "http://www.shanbay.com/api/v1/bdc/search/?word=";
    self.learn = "http://www.shanbay.com/api/v1/bdc/learning/";
    self.login = "http://www.shanbay.com/accounts/login/";
    youdao.call(this);

    /*jshint camelcase: false */
    self.getVoice = function(result,type){
        var basic = result.basic;
        var src = basic.audio;
        if(type == 1) {
            src = basic.uk_audio;
        }else if(type == 2){
            src = basic.us_audio;
        }
        return src;
    };
    self.parseBasicPhonetic = function (result) {
        var basic = result.basic;
        if (basic.pronunciations) {
            var ukPhonetic = basic.pronunciations.uk;
            var usPhonetic = basic.pronunciations.us;
            if(ukPhonetic !== undefined && usPhonetic !== undefined){
                var ukVoice = self.initVoice(self.getVoice(result,1), 1);
                var ukPhoneticContainer = fmt(frame.ukPhoneticContainer, "[" + ukPhonetic + "]" + ukVoice);
                var usVoice = self.initVoice(self.getVoice(result,2), 2);
                var usPhoneticContainer = fmt(frame.usPhoneticContainer, "[" + usPhonetic + "]" + usVoice);
                return fmt(frame.phoneticContainer, ukPhoneticContainer, usPhoneticContainer);
            }
        }
        var voice = self.initVoice(self.getVoice(result));
        var phoneticContainer = fmt(frame.usPhoneticContainer, "[" + basic.phonetic + "]" + voice);
        return fmt(frame.phoneticContainer, phoneticContainer, "");
    };
    self.parseBasicExplains = function (result) {
        var basic = result.basic;
        var definition = basic.definition;
        var i;
        var explainsContent = "";
        var explains = definition.split("\n");
        for (i = 0; i < explains.length; i++) {
            var currentExplain = explains[i];
            var haveProperty = currentExplain.indexOf(".");
            var property = (haveProperty !== -1) ? currentExplain.slice(0, haveProperty + 1) : "";
            var propertyTitle = self.parseProperty(property);
            var propertyContainer = fmt(frame.propertyContainer, propertyTitle, property);
            var explainText = (haveProperty !== -1) ? currentExplain.slice(haveProperty + 1) : currentExplain;
            var explain = fmt(frame.explain, propertyContainer, explainText);
            explainsContent += explain;
        }
        return fmt(frame.explainsContainer, fmt(frame.explainsList, explainsContent));
    };
    self.Query = function(queryWord, wordSource, sendResponse) {
        var url = self.dict + queryWord;
        /*jshint camelcase: false */
        ajax("GET", url, null, function (xhr) {
            var result = JSON.parse(xhr.responseText);
            var data = result.data;
            if (result.status_code === 0) {
                data = {basic:{
                    pronunciations:data.pronunciations,
                    phonetic:data.pron,
                    audio:data.audio,
                    us_audio:data.us_audio,
                    uk_audio:data.uk_audio,
                    cn_definition:data.cn_definition,
                    en_definition:data.en_definition,
                    definition:data.definition
                },query:data.content,errorCode:0};
                var ret = self.parseResult(data);
                sendResponse(ret);
                data = {id: result.data.id, content_type: "vocabulary"};
                //加入生词本
                if(currentSettings.autoLearn){
                    ajax("POST", self.learn, JSON.stringify(data), function (xhr) {
                        var result = JSON.parse(xhr.responseText);
                        if(xhr.status == 401){
                            if (confirm(result.msg+"\n你选择了自动加入生词本,但你没有登陆扇贝网或登陆已失效，是否现在登陆?")){
                                chrome.tabs.create({ url: self.login });
                            }else{
                                currentSettings.autoLearn = false;
                            }
                        }
                    }, function (xhr) {
                        xhr.setRequestHeader("Content-Type", "application/json");
                    });
                }
            } else if (result.status_code === 1) {
                var y = new youdao();
                y.Query(queryWord, wordSource, sendResponse);
            }
        });
    };
};

var xyuu = function(){
    shanbay.call(this);
    this.dict ="http://dict.xyuu.com.cn/search/?word=";
};

var api = {
    youdao:youdao,
    shanbay:shanbay,
    xyuu:xyuu
};

//判断一个初始化后的对象是否为空
function isEmpty(obj) {
    for (var name in obj) {
        return false;
    }
    return true;
}

/*
 * 文本模板函数fmt, @greatghoul
 * 参考TransIt。
 */
function fmt() {
    var args = arguments;
    return args[0].replace(/#{(.*?)}/g, function (match, prop) {
        return function (obj, props) {
            var prop = /\d+/.test(props[0]) ? parseInt(props[0]) : props[0];
            if (props.length > 1) {
                return arguments.callee(obj[prop], props.slice(1));
            } else {
                return obj[prop];
            }
        }(typeof args[1] === "object" ? args[1] : args, prop.split(/\.|\[|\]\[|\]\./));
    });
}

function trim(str) {
    return str.replace(/(^\s*)|(\s*$)/g, "");
}