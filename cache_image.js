var express = require("express");
var request = require("request");
var url = require("url");
var app = express();

var port = process.env.PORT || 5000;
app.set('port', port);
app.get('/image_caching', function (req, res) {
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    if (query.url != undefined) {
        var b = new Buffer(query.url, 'base64');
        var s = b.toString();
        if (isUrl(s) == true) {
            var contentType = getContentTypeForImage(s);
            var requestSettings = {
                url: s,
                method: 'GET',
                encoding: null
            };
            var cacheExpire = 60*60;
            var currentDate = new Date();
            currentDate.setHours(1);
            var expriesDate = currentDate.toUTCString();
            request(requestSettings, function (error, response, body) {
                res.set('Content-Type', contentType);
                res.set('Pragma', 'public');
                res.set('Cache-Control', 'maxage=' + cacheExpire);
                res.set('Expires', expriesDate)
                res.send(body);
            });
        } else {
            res.status(500).send('Something broke!');
        }
    } else {
        res.status(500).send('Something broke!');
    }
});


app.listen(app.get('port'), function () {
    console.log('Node app is running');
});

function isUrl(s) {
   var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
   return regexp.test(s);
}

function getContentTypeForImage(url) {
    var array = url.split('.');
    var extension = array[array.length -1];
    if (extension == 'jpg' || extension == 'jpeg') {
        return 'image/jpeg';
    } else if (extension == 'gif') {
        return 'image/gif';
    } else if (extension == 'png') {
        return 'image/png';
    } else {
        return 'image/jpeg';
    }
}