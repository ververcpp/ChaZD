var api = {
    key: 2078867566,
    keyfrom : "lytofbblogger"
};

var urls = {
    dict : "http://fanyi.youdao.com/openapi.do?keyfrom=" + api.keyfrom +"&key="+ api.key +"&type=data&doctype=json&version=1.1&q=",
    voice : "http://dict.youdao.com/dictvoice?audio=",
    dictHttps : "https://fanyi.youdao.com/openapi.do?keyfrom=" + api.keyfrom +"&key="+ api.key +"&type=data&doctype=json&version=1.1&q=",
    voiceHttps : "https://dict.youdao.com/dictvoice?audio=",
};

var templateUrls = {
    dict : "http://fanyi.youdao.com/openapi.do?keyfrom=#{2}&key=#{1}&type=data&doctype=json&version=1.1&q=",
    voice : "http://dict.youdao.com/dictvoice?audio=",
    dictHttps : "https://fanyi.youdao.com/openapi.do?keyfrom=#{2}&key=#{1}&type=data&doctype=json&version=1.1&q=",
    voiceHttps : "https://dict.youdao.com/dictvoice?audio=",
};
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
    defaultVoice: 1,                //划词默认发音：1--英音；2--美音
    useHttps: false,                //是否使用 HTTPS 的接口
    userkey:undefined,              //用户自定义key
    userkeyfrom:undefined           //用户自定义keyfrom
};

var frame = {
    //title frame
    titleContainer : "<div class=\"title-container #{3}\">#{1}#{2}</div>",
    titleWord : "<div class=\"title-word\">#{1}#{2}</div>",
    voiceContainer : "<div class=\"voice-container\" data-src=\"#{1}\" title=\"#{2}\" ></div>",
    titleTranslation : "<div class=\"title-translation\" title=\"结果来自有道翻译\">#{1}</div>",

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
