var request = require('request');

exports.show = function(req, res, couchConnection){
    couchConnection.get("!abcd1234" + "_pages", function (err, result) {
        res.render("heat_view",{"content": result.value});
    });

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
