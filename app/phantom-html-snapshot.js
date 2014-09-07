var validator = require('validator');
var path = require('path');
var childProcess = require('child_process');
var crypto = require('crypto');

module.exports = {
    validateAndCreateSnapshot: function (req, couchConnection, callback) {
        var docUrl = req.body.docUrl;
        var width = req.body.width;
        var pathToFile = getFileName();
        var key = docUrl + "_" + width;
        couchConnection.get(key, function (err, result) {
            if (err) {
                snapshot(docUrl, pathToFile, width, function (err, result) {
                    if (!err) {
                        saveSnapshotResult(key, pathToFile, couchConnection, callback);
                    } else {
                        callback(err, "failure");
                    }
                });
            } else {
                callback(null, "success");
            }
        });
    }
};

function saveSnapshotResult(key, pathToFile, couchConnection, callback) {
    var doc = {path: pathToFile};
    couchConnection.set(key, doc, function (err, result) {
        if (!err) {
            callback(null, "success");
        }
    });
}
function appendZeroIfLessThan10(number) {
    return  number < 10 ? "0" + number : "" + number;
}
function getFileName() {
    var date = new Date();
    var dateString = date.getFullYear() + "" + appendZeroIfLessThan10(date.getMonth() + 1) + "" + appendZeroIfLessThan10(date.getDate());
    var fileName = crypto.randomBytes(20).toString('hex');
    return "/tmp/" + dateString +"/"+ fileName + ".png";
}
function snapshot(url, pathToSaveFile, viewPortWidth, callback) {
    viewPortWidth = viewPortWidth ? viewPortWidth : "1920";
    console.log(viewPortWidth);
    if (validator.isURL(url)) {
        var childArgs = [
            path.join(__dirname, 'rasterize.js'),
            url,
            pathToSaveFile,
            viewPortWidth+"px",
            1
        ];

        childProcess.execFile("phantomjs", childArgs, function (err, stdout, stderr) {
            if (err) {
                callback(err);
            } else if (stderr) {
                callback(new Error(stderr));
            }
            else {
                callback(null, url + "_" + viewPortWidth, pathToSaveFile);
            }
        });
    }
    else {
        callback(new Error('Invalid URL'));
    }
}