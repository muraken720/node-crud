var ProxyServer = require('../lib/hook').ProxyServer;
var Throttler   = require('../lib/hook').Throttler;
var http        = require('http');

// set throttling params
var limit       = 5; // how many requests allowed
var granularity = 10; // how many buckets
var timeframe   = 60; // seconds

// create throttler
var throttler = new Throttler(limit, granularity, timeframe);
var proxy     = new ProxyServer(80, 'www.twitter.com');

// filter function
// possible hooks: pre, post, reset
// return true  to allow proxied request
// return false to deny it
proxy.addFilter({ 
  pre: function ($r) {
    // in this case, use ip address as key
    var key = $r.frontend.request.connection.remoteAddress; 
    if (throttler.handle(key)) {
      return true;
    } else {
      var response = $r.frontend.response;
      response.writeHeader(403, {});
      response.end('Denied!');
      return false;
    }
  }
});

// http server listen on port 8080
http.createServer(function (req, resp) {
  proxy.proxyRequest(req, resp);
}).listen(8000);
