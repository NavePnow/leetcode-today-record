const got = require('@/utils/got');

function replaceAll(string, FindText, RepText){
    var regExp = new RegExp(FindText, "g");
    return string.replace(regExp, RepText);
}

module.exports = async (ctx) => {
    const lang = ctx.params.lang || 'en';
    const url = 'https://leetcode-cn.com/graphql';
    let responseBasic;
    var recordPayload = "{\"operationName\": \"questionOfToday\", \"variables\":{}, \"query\":\"query questionOfToday {  todayRecord {    question {      questionFrontendId          questionTitleSlug      __typename    }    lastSubmission {      id       __typename   }    date    userStatus    __typename  }}\"}";
    responseBasic = await got({
        method: 'post',
        url: url,
        headers: {
            "content-type": "application/json"
        },
        body: recordPayload
    });

    let data = responseBasic.data.data.todayRecord[0];
    var date = data.date;
    var questionTitleSlug = data.question.questionTitleSlug;
    date = '<b>Leetcode ' + date + "</b>";

    var detailPayload = "{\"operationName\": \"questionData\", \"variables\":{\"titleSlug\": \"" + questionTitleSlug + "\"}, \"query\": \"query questionData($titleSlug: String!) {  question(titleSlug: $titleSlug) {    questionId    questionFrontendId    categoryTitle    boundTopicId    title    titleSlug    content    translatedTitle    translatedContent    isPaidOnly    difficulty    likes    dislikes    isLiked    similarQuestions    contributors {      username      profileUrl      avatarUrl      __typename    }    langToValidPlayground    topicTags {      name      slug      translatedName      __typename    }    companyTagStats    codeSnippets {      lang      langSlug      code      __typename    }    stats    hints    solution {      id      canSeeDetail      __typename    }    status    sampleTestCase    metaData    judgerAvailable    judgeType    mysqlSchemas    enableRunCode    envInfo    book {      id      bookName      pressName      source      shortDescription      fullDescription      bookImgUrl      pressImgUrl      productUrl      __typename    }    isSubscribed    isDailyQuestion    dailyRecordStatus    editorType    ugcQuestionId    style    exampleTestcases    __typename  }}\"}";

    responseBasic = await got({
        method: 'post',
        url: url,
        headers: {
            "content-type": "application/json"
        },
        body: detailPayload
    });
    data = responseBasic.data.data.question;
    
    var link;
    var content;
    // var description_pattern;
    // var example_pattern;
    var rss_title;
    var rss_link;
    if (lang === 'cn') {
        link = "https://leetcode-cn.com/problems/" + questionTitleSlug;
        content = data.translatedContent;
        // description_pattern = /[\s\S]*?(?=\u793a\u4f8b)/g;
        // example_pattern = /<p><strong>[\s\S]*?(?=<p><strong>\u63d0\u793a)/g;
        questionTitleSlug = data.translatedTitle;
        rss_title = 'Leetcode 每日一题';
        rss_link = 'https://leetcode-cn.com';
    }
    else{
        link = "https://leetcode.com/problems/" + questionTitleSlug;
        content = data.content;
        // description_pattern = /[\s\S]*?(?=Example)/g;
        // example_pattern = /<p><strong>[\s\S]*?(?=<p><strong>Constraints)/g;
        questionTitleSlug = data.titleSlug;
        rss_title = 'Leetcode Today Record';
        rss_link = 'https://leetcode.com';
    }

    var questionFrontendId = data.questionFrontendId;
    var title = questionFrontendId + "." + questionTitleSlug;

    var difficulty = data.difficulty;
    if (difficulty === 'Easy') difficulty = '🟢';
    else if (difficulty === 'Medium') difficulty = '🟡';
    else difficulty = '🔴';

    // var description;
    // if (content.match(description_pattern)) {
    //     description = content.match(description_pattern)[0];
    //     description = description.replaceAll("<p>&nbsp;</p>\n<p><strong>", "");
    //     description = description.replaceAll("<p>&nbsp;</p>\n\n<p><strong>", "");
    //     description = description.replaceAll("<p>&nbsp;</p>\n<p><b>", "");
    //     description = description.replaceAll("<p>&nbsp;</p>\n\n<p><b>", "");
    // }
    // description = '<strong>2️⃣ Description<br></strong>' + description;

    // var example = content.match(example_pattern)[0];;
    // example = '<strong>3️⃣ Example</strong>' + example;

    var topicTags = data.topicTags;
    var tags = "";
    for (var val in topicTags) {
        tags += "#" + topicTags[val].slug + " ";
    }
    tags = replaceAll(tags, "-", "_");
    tags = '<strong>🏷️ Tags<br></strong>' + tags;
    
    data = {
        "title": title,
        "description": difficulty + ' ' + date + '<br><br>' + tags + '<br><br>' + content,
        "pubDate": new Date().toUTCString(),
        "link": link
    };
    ctx.state.data = {
        title: rss_title,
        link: rss_link,
        description: rss_title,
        item: [{
            title: data.title,
            description: data.description,
            pubDate: data.pubDate,
            link: data.link,
        }, ],
    };
};
