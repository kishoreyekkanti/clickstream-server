var request = require('request'),
    fs      = require('fs');

exports.upload = function(req, res, couchConnection){
    var string = req.body.snapshotImage;
    var regex = /^data:.+\/(.+);base64,(.*)$/;

    var matches = string.match(regex);
    var ext = matches[1];
    var data = matches[2];
    var buffer = new Buffer(data, 'base64');
    fs.writeFileSync('data.png', buffer);
    res.send("OK");
};

exports.getHeatMap = function(req, res, couchConnection){
    getDetails(req, res, couchConnection)
};

function getDetails(req, res, couchConnection) {
    var date = new Date();
    var dateString = date.getFullYear() + "" + getMonth(date) + "" + date.getDate();
    var id = req.query.apiToken + "_" + req.params.page_name + "_" + req.params.action + "_" + dateString;
    var output = {};
    couchConnection.get(id, function (err, result) {
        output.points = result.value;
        res.send(output);
    });
}

function getMonth(date) {
    var month = (date.getMonth() + 1);
    return  month < 10 ? "0"+month : ""+month;
}
