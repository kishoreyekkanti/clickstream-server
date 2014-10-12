var streamHandler = require("./app/controllers/stream_handler.js");
var heatmapHandler = require("./app/controllers/heatmap_handler.js");
var uploadHandler = require("./app/controllers/upload_handler.js");

module.exports = {
    init: function(app, couchConnection){
        app.post('/click/points/:page_name', function saveStream(req, res) {
            streamHandler.saveStream(req, res, "click", couchConnection);
        });

        app.post('/mouseMove/points/:page_name', function saveStream(req, res) {
            streamHandler.saveStream(req, res, "move", couchConnection);
        });

        app.get('/heatmap', function saveStream(req, res) {
            heatmapHandler.show(req, res, couchConnection);
        });
        app.get('/heatpoints/:page_name/:action', function (req, res) {
            heatmapHandler.getHeatMap(req, res, couchConnection);
        });
        app.post('/upload', function saveImage(req, res){
            uploadHandler.upload(req, res, couchConnection);
        });
    }
};