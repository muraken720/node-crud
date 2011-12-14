
var hook = require('../lib/hook');
var http = require('http');

// throttler 10 buckets over 10 seconds
var throttler = new hook.Throttler(10, 10); 

// proxy
var proxy = new hook.ProxyServer(80, 'www.twitter.com');

// add ip address filter
proxy.addFilter(new hook.AddressFilter(throttler, 10));

// http server listen on port 8080
http.createServer(function (req, resp) {
  proxy.proxyRequest(req, resp);
}).listen(8000);

// Run throttle admin on port 8081
var admin = new hook.ThrottleAdmin(throttler);
admin.listen(8001);
