var api = {
    key: 1116151381,
    keyfrom : "youdaocidian"
};

var urls = {
    dict : "http://fanyi.youdao.com/openapi.do?keyfrom=" + api.keyfrom +"&key="+ api.key +"&type=data&doctype=json&version=1.1&q=",
    voice : "http://dict.youdao.com/dictvoice?audio="
};

var settings = {
    selectMode : "mouseSelect",     //划词的形式：直接划词 | Ctrl+划词
    showPosition : "side",   //划词翻译结果显示的位置
    //duration : 5,           //翻译结果显示的时间
    toggleKey : "ctrl",
    showTips : true         //是否显示Tips
}

var frames = {
    //title frame
    titleContainer : "<div class=\"title_container\">#{1}#{2}</div>",
    titleWord : "<div class=\"title_word\">#{1}#{2}</div>",
    voiceContainer : "<div class=\"voice_container\" data-src=\"#{1}\" title=\"#{2}\"></div>",
    titleTranslation : "<div class=\"title_translation\" title=\"结果来自有道翻译\">#{1}</div>",

    //basic frame
    basicContainer : "<div class=\"basic_container\">#{1}#{2}</div>",

    //basic phonetic frame
    phoneticContainer : "<div class=\"phonetic_container\">#{1}#{2}</div>",
    ukPhoneticContainer : "<div class=\"uk_phonetic_container\">#{1}</div>",
    usPhoneticContainer : "<div class=\"us_phonetic_container\">#{1}</div>",

    //basic explain frame
    explainsContainer : "<div class=\"explains_container\">#{1}</div>",
    explainsList : "<ul class=\"explains_list\">#{1}</ul>",
    explain : "<li class=\"explains_item\">#{1}#{2}</li>",
    propertyContainer : "<b class=\"property_container\" title=\"#{1}\">#{2}</b>",

    //web explain frame
    webExplainsContainer : "<div class=\"web_explains_container\"><div class=\"web_title\">网络释义及短语</div>#{1}</div>",
    webEplainsList : "<ul class=\"web_explains_list\">#{1}</ul>",
    webEplain : "<li><span class=\"web_key\">#{1}</span><span class=\"web_value\">#{2}</span></li>"
}

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
        }(typeof args[1] === 'object' ? args[1] : args, prop.split(/\.|\[|\]\[|\]\./));
    });
}

function trim(str) {
    return str.replace(/(^\s*)|(\s*$)/g, "");
}