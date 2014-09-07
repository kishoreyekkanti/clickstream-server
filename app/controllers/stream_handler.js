var request = require('request');
var snapshotHandler = require("../phantom-html-snapshot.js");
exports.saveStream = function (req, res, action, couchConnection) {
    validateAndSave(req, res, action, couchConnection)
};

function validateAndSave(req, res, action, couchConnection) {
    var apiToken = req.body.apiToken;
    return couchConnection.get(apiToken, function (err, result) {
        if (err || req.body.docUrl.indexOf(result.value.source) < 0 || new Date(result.value.valid_to) < new Date()) {
            res.send('Invalid API Token or Bad Request', 400)
        } else {
            snapshotHandler.validateAndCreateSnapshot(req, couchConnection, function (err, result) {
                if (!err) {
                    savePoints(req, action, req.body.apiToken, couchConnection)
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

function savePoints(req, eventSource, token, couchConnection) {
    var points = req.body.points;
    var date = new Date();
    var dateString = date.getFullYear() + "" + getMonth(date) + "" + date.getDate();
    var id = token + "_" + req.params.page_name + "_" + eventSource + "_" + dateString;
    addRequestSource(req, token, couchConnection);
    addOrAppend(id, points, couchConnection);
}

function addRequestSource(req, token, couchConnection) {
    var docUrl = req.body.docUrl;
    var doc = {};
    doc[docUrl] = req.params.page_name;
    couchConnection.get(token + "_pages", function (err, result) {
        if (err) {
            couchConnection.add(token + "_pages", doc, function (err, result) {
            });
        } else {
            var dbDoc = result.value;
            dbDoc[docUrl] = req.params.page_name;
            couchConnection.set(token + "_pages", dbDoc, function (err, result) {
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