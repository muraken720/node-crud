Hook
----

Hook is simple package for throttling (mainly http requests) by a given key and a limit using a rotating bucket algorithm.
    var Throttler = require('hook').Throttler;

    var limit       = 10; // how many requests allowed
    var granularity = 20; // how many buckets
    var timeframe   = 60; // seconds

    var throttler = new Throttler(limit, granularity, timeframe);

    var key   = "1234";
    var limit = 1

    console.log(throttler.handle(key, limit)); // true
    console.log(throttler.handle(key, limit)); // false

Hook also comes with a filterable proxy server:

    var ProxyServer = require('hook').ProxyServer;
    var Throttler   = require('hook').Throttler;
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

Algorithm
---------

    Timeframe: 4 seconds
    Buckets:   2 (2 seconds per bucket)
    Limit:     5 requests

    Request Time    Bucket #          Total Status
    -------------------------------------------------
    1 req @ 0:01 -> Bucket1(count: 1) 1     Allowed
    1 req @ 0:01 -> Bucket1(count: 2) 2     Allowed
    1 req @ 0:02 -> Bucket1(count: 3) 3     Allowed
    1 req @ 0:03 -> Bucket2(count: 2) 4     Allowed
    1 req @ 0:03 -> Bucket2(count: 2) 5     Allowed
    1 req @ 0:03 -> Bucket2(count: 3) 5     DENIED
    0 req @ 0:04 -> Bucket1(count: 0) 3     Bucket1 resetted
    1 req @ 0:05 -> Bucket1(count: 1) 4     Allowed
    1 req @ 0:06 -> Bucket1(count: 1) 5     Allowed


