var cluster = require('cluster');
var express = require('express');
var couchbase = require('couchbase');
var app = express();
var http = require('http');
var path = require('path');
var routes = require('./routes');
var appConfig = require('./app/config/configuration.js').config([app.get('env')]);
app.set('port', process.env.PORT || '3000');
app.set('trust proxy', true);
app.set('http_timeout', 10000);

app.set('views', path.join(__dirname, 'app/views'));
var expressHandlebars = require('express3-handlebars');
app.engine('.hbs', expressHandlebars({
    defaultLayout: 'heat_view',
    extname: '.hbs',
    layoutsDir: 'app/views',
    partialsDir: 'app/views/partials'
}));

app.set('view engine', '.hbs');
app.enable('view cache');
app.use(express.compress());
app.use(express.json());
app.use(express.cookieParser());
app.use(express.static(path.join(__dirname, 'static')));
app.use(express.logger({
        format: ':remote-addr - :date :url :method :http-version :status :response-time :user-agent :referrer'}
));
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(function(req, res, next){
    req.config = appConfig;
    return next();
});

app.use(app.router);
app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Credentials", true);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
var couchConfig = {
    host: [ "localhost:8091" ],
    bucket: 'clickStream'
};
var couchConnection = new couchbase.Connection(couchConfig, function (err) {
    if (err) {
        console.error("Failed to connect to cluster: " + err);
        process.exit(1);
    }
    console.log('Couchbase Connected');
});

routes.init(app, couchConnection);

app.get('/click/points/:page_name', function (req, res) {
    getDetails(req, res, "click");
});
app.get('/mouseMove/points/:page_name', function (req, res) {
    getDetails(req, res, "move");
});

app.get('/pages', function (req, res) {
    couchConnection.get("pages", function (err, result) {
        res.send(result.value);
    });
});

app.get("/pages", function (req, res) {
    var apiToken = req.body.apiToken;
    couchConnection.get(apiToken + "_pages", function (err, result) {
        res.send(result.value);
    });
});
http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});

function getDetails(req, res, event) {
    var output = {};
    couchConnection.get(req.params.page_name + event, function (err, result) {
        output.points = result.value;
        res.send(output);
    });
}
