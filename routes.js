var streamHandler = require("./app/controllers/stream_handler.js");

module.exports = {
    init: function(app, couchConnection){
        app.post('/click/points/:page_name', function saveStream(req, res) {
            streamHandler.saveStream(req, res, "click", couchConnection);
        });

        app.post('/mouseMove/points/:page_name', function saveStream(req, res) {
            streamHandler.saveStream(req, res, "move", couchConnection);
        });

    }
};