var request = require('request');

exports.saveStream = function(req, res, action, couchConnection){
    validateAndSave(req, res, action, couchConnection)
};

function validateAndSave(req, res, action, couchConnection) {
    var apiToken = req.body.apiToken;
    return couchConnection.get(apiToken, function (err, result) {
        if(err || req.body.docUrl.indexOf(result.value.source) < 0 || new Date(result.value.valid_to) < new Date()){
            res.send('Invalid API Token or Bad Request', 400)
        }else{
            savePoints(req, action, req.body.apiToken, couchConnection);
            res.send(req.params);
        }
    });
}

function savePoints(req, eventSource, token, couchConnection) {
    var points = req.body.points;
    var date = new Date();
    var dateString = date.getFullYear() + (date.getMonth() + 1) + date.getDate();
    var id = token + "_" + req.params.page_name + "_" + eventSource + "_" + dateString;
    addRequestSource(req, token, couchConnection);
    addOrAppend(id, points, couchConnection);
}

function addRequestSource(req, token, couchConnection) {
    var docUrl = req.body.docUrl;
    var doc = {};
    doc[docUrl] = req.params.page_name;
    couchConnection.add(token+"_pages", doc, function (err, result) {
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