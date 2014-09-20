var fs = require('fs');
exports.config = function (env) {
    var jsonData;
    if (env === "produciton") {
        jsonData = require('./production.json');

    } else {
        jsonData = require('./development.json');
    }
    return jsonData;
};