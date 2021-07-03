var token = '';
var chat_id = "@leetcodeTodayRecord";

var tg_url = "https://api.telegram.org/bot" + token;

var url = 'https://leetcode.com/graphql';


var headers = {
    "content-type": "application/json",
};


function getLeetcode() {
    var recordPayload = "{\"query\":\"    query questionOfToday {  currentDailyCodingChallenge {    questionOfToday {      date      userStatus      link      question {        acRate        difficulty        freqBar        frontendQuestionId: questionFrontendId        isFavor        paidOnly: isPaidOnly        status        title        titleSlug        hasVideoSolution        hasSolution        topicTags {          name          id          slug        }      }    }  }}    \",\"variables\":{}}";

    var options = {
        'method': 'post',
        'headers': headers,
        'payload': recordPayload
    };

    var response = UrlFetchApp.fetch(url, options);
    if (!response) {
        var error_text = "*Leetcode " + "登录失败*" + "\n 请重新获取 Cookie";
        originalData(error_text);
    } else {
        var data = JSON.parse(response).data.currentDailyCodingChallenge.questionOfToday;
        var date = data.date;
        var questionTitleSlug = data.question.titleSlug;
        date = '<b>Leetcode.com ' + date + "</b>";
        getDetails(questionTitleSlug, date);
    }

}

String.prototype.replaceAll = function (FindText, RepText) {
    regExp = new RegExp(FindText, "g");
    return this.replace(regExp, RepText);
}

function getDetails(questionTitleSlug, date) {
    var detailPayload = "{\"operationName\": \"questionData\", \"variables\":{\"titleSlug\": \"" + questionTitleSlug + "\"}, \"query\": \"query questionData($titleSlug: String!) {  question(titleSlug: $titleSlug) {    questionId    questionFrontendId    categoryTitle    boundTopicId    title    titleSlug    content    translatedTitle    translatedContent    isPaidOnly    difficulty    likes    dislikes    isLiked    similarQuestions    contributors {      username      profileUrl      avatarUrl      __typename    }    langToValidPlayground    topicTags {      name      slug      translatedName      __typename    }    companyTagStats    codeSnippets {      lang      langSlug      code      __typename    }    stats    hints    solution {      id      canSeeDetail      __typename    }    status    sampleTestCase    metaData    judgerAvailable    judgeType    mysqlSchemas    enableRunCode    envInfo    book {      id      bookName      pressName      source      shortDescription      fullDescription      bookImgUrl      pressImgUrl      productUrl      __typename    }    isSubscribed    isDailyQuestion    dailyRecordStatus    editorType    ugcQuestionId    style    exampleTestcases    __typename  }}\"}";
    var options = {
        'method': 'post',
        'headers': headers,
        'payload': detailPayload
    };

    var response = UrlFetchApp.fetch('https://leetcode-cn.com/graphql', options);
    if (!response) {
        var error_text = "*Leetcode " + "登录失败*" + "\n 请重新获取 Cookie";
        originalData(error_text);
    } else {
        let data = JSON.parse(response).data.question;
        var questionFrontendId = data.questionFrontendId;
        var title = questionFrontendId + "." + questionTitleSlug;
        var cn_link = "https://leetcode-cn.com/problems/" + questionTitleSlug;
        var en_link = "https://leetcode.com/problems/" + questionTitleSlug;
        var cn_solution_link = cn_link + "/solution";
        var en_solution_link = en_link + "/solution";
        
        var content = data.content;
        var difficulty = data.difficulty;
        if (difficulty == 'Easy') difficulty = '🟢';
        else if (difficulty == 'Medium') difficulty = '🟡';
        else difficulty = '🔴';
        var description_pattern = /[\s\S]*?(?=Example)/g;
        var description;
        // console.log(data);
        console.log(content);
        if (content.match(description_pattern)) {
            description = content.match(description_pattern)[0];
            console.log(description);
            description = description.replaceAll(/<font[\s\S]*?>/g, "");
            description = description.replaceAll("</font>", "");
            description = description.replaceAll(/<img[\s\S]*?\/>/g, "");
            description = description.replaceAll(/<p>&nbsp;<\/p>[\s\S]*?<p><strong>/g, "");
            description = description.replaceAll("<p>&nbsp;</p>\n\n<p><strong>", "");
            description = description.replaceAll(/<p>&nbsp;<\/p>[\s\S]*?<p><b>/g, "");
            description = description.replaceAll("<p>&nbsp;</p>\n\n<p><b>", "");
            description = description.replaceAll("&nbsp;", " ");
            description = description.replaceAll("<p>", "");
            description = description.replaceAll("</p>", "");
            description = description.replaceAll("<strong>", "");
            description = description.replaceAll("</strong>", "");
            // description = description.replaceAll("<pre>", "");
            description = description.replaceAll("<ul>", "");
            description = description.replaceAll("</ul>", "");
            description = description.replaceAll("<li>", "");
            description = description.replaceAll("</li>", "");
            description = description.replaceAll("<ol>", "");
            description = description.replaceAll("</ol>", "");
            description = description.replaceAll("<sup>", "");
            description = description.replaceAll("</sup>", "");
            description = description.replaceAll("<sub>", "");
            description = description.replaceAll("</sub>", "");
            description = '<strong>Description \n</strong>' + description;
        }

        var example_pattern_1 = /<strong>Input[\s\S]*?(?=<\/pre>)/g;
        var example_pattern_2 = /<b>Input[\s\S]*?(?=<\/pre>)/g;
        var example;
        if (content.match(example_pattern_1)) {
            example = content.match(example_pattern_1)[0];
        } else if (content.match(example_pattern_2)) {
            example = content.match(example_pattern_2)[0];
        }
        if(example){
            example = example.replaceAll("&nbsp;", " ");
            example = example.replaceAll("</p>", "");
            example = example.replaceAll(/<span id=[\s\S]*?">/g, "");
            example = example.replaceAll("</span>", "");
            example = example.replaceAll("<sup>", "");
            example = example.replaceAll("</sup>", "");
            example = '<strong>Example</strong>\n<pre>' + example + '</pre>';
        }
        

        var pattern_image = /src="[\s\S]*?(?=" style)/g;
        var image;
        if (content.match(pattern_image)) {
            image = content.match(pattern_image)[0];
            image = image.replace("src=\"", "");
        }

        image = "<a href=\"" + image + "\">" + difficulty + "</a>";

        var topicTags = JSON.parse(response).data.question.topicTags;
        var tags = "";
        for (var val in topicTags) {
            tags += "#" + topicTags[val].slug + " ";
        }
        tags = tags.replaceAll("-", "_");
        tags = '<strong>🏷️ Tags\n</strong>' + tags;

        originalData(date + '\n' + image + ' <b>' + title + '</b>\n\n' + tags + '\n\n' + description + example, cn_link, en_link, cn_solution_link, en_solution_link);
    }
}

function originalData(estring, cn_link, en_link, cn_solution_link, en_solution_link) {
    var payload = {
        "method": "sendMessage",
        "chat_id": chat_id,
        "text": estring,
        "parse_mode": "Html",
        "reply_markup": "{\"inline_keyboard\" : [" +
            "[" +
            "{\"text\":\"EN\", \"url\" : \"" + en_link + "\"}," +
            "{\"text\":\"EN Solution\", \"url\" : \"" + en_solution_link + "\"}" +
            "]" +
            "]}"
    };
    sendMsg(payload)
}

function sendMsg(payload) {
    var options = {
        'method': 'post',
        'payload': payload
    };

    UrlFetchApp.fetch(tg_url + "/", options)
}