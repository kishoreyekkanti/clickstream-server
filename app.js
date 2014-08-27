var cluster = require('cluster');
var express = require('express');
var couchbase = require('couchbase');
var app = express();
var http = require('http');

app.set('port', process.env.PORT || '3000');
app.set('trust proxy', true);
app.set('http_timeout', 10000);

app.use(express.compress());
app.use(express.json());
app.use(express.cookieParser());
app.use(express.logger({
        format: ':remote-addr - :date :url :method :http-version :status :response-time :user-agent :referrer'}
));
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Credentials", true);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
var config = {
    host: [ "localhost:8091" ],
    bucket: 'clickStream'
};
var couchConnection = new couchbase.Connection(config, function (err) {
    if (err) {
        console.error("Failed to connect to cluster: " + err);
        process.exit(1);
    }
    console.log('Couchbase Connected');
});


function appendPoints(id, points) {
    couchConnection.append(id, points+",", function (err, result) {
    })
}
function addOrAppend(id, points) {
    couchConnection.get(id, {timeout: 15}, function (err, result) {
        if (err) {
            couchConnection.add(id, "", function (err, result) {
                if (!err) {
                    appendPoints(id, points);
                }
            });
        } else {
            appendPoints(id, points);
        }

    });
}
function savePoints(req, eventSource) {
    var points = req.body.points;
    var id = req.params.page_name + eventSource;
    addRequestSource(req);
    addOrAppend(id, points);
}

function addRequestSource(req){
    var docUrl = req.body.docUrl;
    var doc = {};doc[docUrl] = req.params.page_name;
    couchConnection.add("pages", doc, function(err, result){});
}

app.post('/click/points/:page_name', function createPoints(req, res) {
    savePoints(req, "click");
    console.dir(req.body);
    res.send(req.params);
});
app.post('/mouseMove/points/:page_name', function createPoints(req, res) {
    savePoints(req, "move");
    console.dir(req.body);
    res.send(req.params);
});

function getDetails(req, res, event) {
    var output = {};
    couchConnection.get(req.params.page_name + event, function (err, result) {
        output.points = result.value;
        res.send(output);
    });
}
app.get('/click/points/:page_name', function(req, res){
    getDetails(req, res, "click");
});

app.get('/mouseMove/points/:page_name', function(req, res){
    getDetails(req, res, "move");
});

app.get('/pages', function(req, res){
   couchConnection.get("pages", function(err, result){
      res.send(result.value);
   });
});

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});

