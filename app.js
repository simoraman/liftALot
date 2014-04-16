var restify = require('restify')
  , userSave = require('save')('user');
var server = restify.createServer({ name: 'lift-alot-api' });

server.listen(3000, function () {
  console.log('%s listening at %s', server.name, server.url);
});

server
  .use(restify.fullResponse())
  .use(restify.bodyParser());

server.get('/', restify.serveStatic({
  directory: './public',
  default: 'index.html',
  maxAge:0
}));

server.get('/user', function (req, res, next) {
  userSave.find({}, function (error, users) {
    res.send(users);
  });
});
