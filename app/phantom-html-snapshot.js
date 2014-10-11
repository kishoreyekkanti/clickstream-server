var validator = require('validator');
var path = require('path');
var childProcess = require('child_process');
var crypto = require('crypto');

module.exports = {
    validateAndCreateSnapshot: function (req, couchConnection, callback) {
        var docUrl = req.body.docUrl;
        var width = req.body.width;
        var height = req.body.height;
        var userid = req.body.userId;
        var relativePathToFile = getFileName();
        var absolutePathToFile = req.config.imagePath+relativePathToFile;
        var adjustedWidthAndHeight = getWidthAndHeightWithInRange(width, height);
//        var key = userid+"_"+docUrl + "_" + adjustedWidthAndHeight.width+"_"+adjustedWidthAndHeight.height;
        var key = userid+"_"+docUrl + "_" + adjustedWidthAndHeight.width;
        couchConnection.get(key, function (err, result) {
            if (err) {
                snapshot(req.body.fullUrl,absolutePathToFile, adjustedWidthAndHeight, function (err, result) {
                    if (!err) {
                        saveSnapshotResult(key, relativePathToFile, absolutePathToFile, couchConnection, adjustedWidthAndHeight, callback);
                    } else {
                        callback(err, "failure");
                    }
                });
            } else {
                console.log("Key already existing and adjusted width & height is "+adjustedWidthAndHeight.width);
                callback(null, adjustedWidthAndHeight);
            }
        });
    }
};

function getWidthAndHeightWithInRange(width, height) {
    var widthRange = [1366, 1024, 1280, 768, 1440, 1920, 320, 1600, 1680, 1360, 1920, 800];
    var heightRange = [768, 800, 1024, 1024, 900, 1080, 480, 1050, 600, 720, 768, 1200];
    var adjustedWidth = getInRange(widthRange, width);
    var adjustedHeight = getInRange(heightRange, height);
    return {width:adjustedWidth, height: adjustedHeight};
}

function getInRange(range, value){
    range.push(parseInt(value));
    var sortedRange = range.sort(function (a, b) {return a - b;});
    var position = sortedRange.indexOf(parseInt(value));
    if(position > 0 && position< sortedRange.length){
        var lowerRange = sortedRange[position] - sortedRange[position - 1];
        var higherRange = sortedRange[position + 1] - sortedRange[position];
        return lowerRange < higherRange ? sortedRange[position - 1] : sortedRange[position + 1];
    }else{
        return value;
    }
}

function saveSnapshotResult(key, relativePathToFile, absolutePathToFile, couchConnection, adjustedWidthAndHeight, callback) {
    var doc = {relativePath: relativePathToFile, absolutePath: absolutePathToFile, type: "image_paths"};
    couchConnection.set(key, doc, function (err, result) {
        if (!err) {
            console.log("created a new snapshot and adjusted width and height is "+adjustedWidthAndHeight.width+","+adjustedWidthAndHeight.height);
            callback(null, adjustedWidthAndHeight);
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
    return dateString +"/"+ fileName + ".png";
}
function snapshot(url, pathToSaveFile, adjustedWidthAndHeight, callback) {
    adjustedWidthAndHeight.width = adjustedWidthAndHeight.width ? adjustedWidthAndHeight.width : "1920";
        var childArgs = [
            path.join(__dirname, 'rasterize.js'),
            url,
            pathToSaveFile,
            adjustedWidthAndHeight.width + "px",
            1
        ];
        console.log("Started capturing image for url "+url+" with width and height "+adjustedWidthAndHeight.width+","+adjustedWidthAndHeight.height);
        childProcess.execFile("phantomjs", childArgs, function (err, stdout, stderr) {
            if (err) {
                console.log("Failed to load "+err);
                callback(err);
            } else if (stderr) {
                console.log("Failed to load "+stderr);
                callback(new Error(stderr));
            }
            else {
                console.log("Successfully fetched the image for url ",url);
                callback(null, url + "_" + adjustedWidthAndHeight, pathToSaveFile);
            }
        });
}