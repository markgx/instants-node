var CLIENT_ID = process.env.CLIENT_ID;
var CLIENT_SECRET = process.env.CLIENT_SECRET;

if (CLIENT_ID == null || CLIENT_SECRET == null) {
  console.log('ERROR: The CLIENT_ID and CLIENT_SECRET environment variables must be set.');
  return;
}

var express = require('express');
var app = express.createServer();

var instagram = require('instagram-node-lib');
instagram.set('client_id', CLIENT_ID);
instagram.set('client_secret', CLIENT_SECRET);
instagram.set('redirect_uri', 'http://localhost:3000/callback');

// config
app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.logger());
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'omg_secret' }));
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function() {
  app.use(express.errorHandler({
    dumpExceptions: true,
    showStack: true
  }));
});

app.configure('production', function() {
  app.use(express.errorHandler());
});

var isLoggedIn = function(req) {
  return req.session.accessToken != null;
}

// routes
app.get('/', function(req, res) {
  res.render('index', {
    loggedIn: isLoggedIn(req)
  });
});

app.get('/feed', function(req, res) {
  if (!isLoggedIn(req)) {
    res.redirect('/login');
  }

  var images = instagram.users.self({ access_token: req.session.accessToken });

  // TODO:

  // res.render('feed', {
  //   images: images
  // });
  // res.send(images);
});

app.get('/login', function(req, res) {
  var authUrl = instagram.oauth.authorization_url({});
  res.redirect(authUrl);
});

app.get('/callback', function(req, res) {
  // TODO: validate
  req.session.accessToken = req.query['code'];
  res.redirect('/');
});

var port = process.env.PORT || 3000;
app.listen(port);

console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
