var request = require('request');
var snapshotHandler = require("../phantom-html-snapshot.js");
exports.saveStream = function (req, res, action, couchConnection) {
    validateAndSave(req, res, action, couchConnection)
};

function validateAndSave(req, res, action, couchConnection) {
    var apiToken = req.body.apiToken;
    return couchConnection.get(apiToken, function (err, result) {
        if (err || req.body.docUrl.indexOf(result.value.hostname) < 0 || new Date(result.value.valid_to) < new Date()) {
            res.send('Invalid API Token or Bad Request', 400)
        } else {
            req.body.userId = result.value.userid;
            req.body.fullUrl = req.body.docUrl;
            req.body.docUrl = req.body.docUrl.substr(0, req.body.docUrl.indexOf("?"));
            snapshotHandler.validateAndCreateSnapshot(req, couchConnection, function (err, result) {
                if (!err) {
                    var width = result.width;
                    savePoints(req, width, action, couchConnection)
                }
            });
            res.send(req.params);
        }
    });
}

function getMonth(date) {
    var month = (date.getMonth() + 1);
    return  month < 10 ? "0" + month : "" + month;
}

function savePoints(req, width, eventSource, couchConnection) {
    var points = req.body.points;
    var userId = req.body.userId;
    var date = new Date();
    var dateString = date.getFullYear() + "" + getMonth(date) + "" + date.getDate();
    console.log("Creating the points with width "+width);
    var id = userId + "_" + req.params.page_name + "_" + eventSource + "_" + width + "_" + dateString;
    addRequestSource(req, userId, couchConnection);
    addOrAppend(id, points, couchConnection);
}

function addRequestSource(req, userid, couchConnection) {
    var docUrl = req.body.docUrl;
    var doc = {};
    doc[docUrl] = req.params.page_name;
    couchConnection.get(userid + "_pages", function (err, result) {
        if (err) {
            couchConnection.add(userid + "_pages", doc, function (err, result) {
            });
        } else {
            var dbDoc = result.value;
            dbDoc[docUrl] = req.params.page_name;
            couchConnection.set(userid + "_pages", dbDoc, function (err, result) {
            });
        }
    });
}

function appendPoints(id, points, couchConnection) {
    couchConnection.append(id, points + ",", function (err, result) {
    })
}

function addOrAppend(id, points, couchConnection) {
    couchConnection.get(id, {timeout: 15}, function (err, result) {
        if (err) {
            couchConnection.add(id, "", function (err, result) {
                if (!err) {
                    appendPoints(id, points, couchConnection);
                }
            });
        } else {
            appendPoints(id, points, couchConnection);
        }

    });
}