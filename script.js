// ==UserScript==
// @name         Azota to Markdown
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Convert Azota result page to Markdown
// @author       LEWIS
// @match        https://azota.vn/vi/test/answer-test/*
// @grant        none
// @require http://code.jquery.com/jquery-3.4.1.min.js
// ==/UserScript==

(function($) {
    'use strict';
    const configs = {
        'TITLE': '.contentDocx',
        'ANSWERS': '.content_dx_wrap > *:last-child()',
        'KEY': '.keyText',

        'Q_PREFIX': 'Câu',
        'Q_SUFFIX': '.',
        'Q_BOLD_SYNTAX': '**',
        'Q_BOLD_WHOLE': false,
        'Q_DELIMITER': '\n\n',

        'K_SYNTAX': "_",
    };

    let copyToClipboard = function(str) {
        var $temp = $("<input>");
        $("body").append($temp);
        $temp.val(str).select();
        document.execCommand("copy");
        $temp.remove();
    };
    let genQuestions = function() {
        let questions = $("azt-question-item");
        let sterilizedQuestions = questions.map((i, item) => {
            let $cur = $(item);
            let title = $cur.find(configs.TITLE).text().trim();
            let ans = $cur.find(configs.ANSWERS).children().map((i, item) => $(item).text().trim());
            let key = $cur.find(configs.KEY).text().slice(-1).charCodeAt(0) - 65;

            return {
                i: i+1,
                title: title,
                answers: ans.toArray(),
                key: key,
            };
        });

        return sterilizedQuestions.toArray();
    };
    let genMarkdown = function(obj) {
        let str = "";
        obj.forEach((cur) => {
            let substr = "";
            // Question title
            substr += `${configs.Q_BOLD_SYNTAX.trim()}${configs.Q_PREFIX.trim()} ${cur.i}${configs.Q_SUFFIX.trim()}${(configs.Q_BOLD_WHOLE) === false ? configs.Q_BOLD_SYNTAX.trim() : ''} ${cur.title}${(configs.Q_BOLD_WHOLE) === true ? configs.Q_BOLD_SYNTAX.trim() : ''}\n`;
            // Answers
            cur.answers = cur.answers.map((item, i) => (i === cur.key) ? `${configs.K_SYNTAX}${item}${configs.K_SYNTAX}` : item);
            substr += cur.answers.join("\n") + configs.Q_DELIMITER;

            str += substr;
        });
        return str;
    };

    let button = $("<button style='position: fixed; z-index: 10000; bottom: 48px; left: 16px;'>Generate Markdown</button>");
    button.on("click", () => {
        copyToClipboard( genMarkdown(genQuestions()) );
        alert("Copied to clipboard");
    });

    $("body").append(button);
})(jQuery);
