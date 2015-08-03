var marked = require('marked');

var markdownString = '```js\n console.log("hello"); \n```';

/*// Async highlighting with pygmentize-bundled
marked.setOptions({
    highlight: function (code, lang, callback) {
        require('pygmentize-bundled')({ lang: lang, format: 'html' }, code, function (err, result) {
            callback(err, result.toString());
        });
    }
});*/

// Using async version of marked
marked(markdownString, function (err, content) {
    if (err) throw err;
    console.log(content);
});

// Synchronous highlighting with highlight.js
marked.setOptions({
    highlight: function (code) {
        //console.log('sdf '+code)
        return require('highlight.js').highlightAuto(code).value;
    }
});

console.log(marked(markdownString));