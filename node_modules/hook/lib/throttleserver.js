var js2 = require('js2').js2;
var JS2 = js2;

var Throttler = require('./throttler').Throttler;
var http = require('http');

var ProxyServer=exports['ProxyServer']=JS2.Class.extend( function(KLASS, OO){
  OO.addStaticMember("start",function (serverConfig, clientConfig, filter) {
    var serverPort = this.serverConfig.port   || 8000;
    var client     = http.createClient(this.clientConfig.port || 3000, 'localhost');

    http.createServer(function(serverReq, serverRes){
      if (!filter.call(serverReq, serverRes)) { return; }

      var clientReq = client.request(serverReq.method, serverReq.url, serverReq.headers);
      clientReq.addListener("response", function(clientRes){
        serverRes.writeHeader(clientRes.statusCode, clientRes.headers);
        clientRes.addListener("data", function($1,$2,$3){ serverRes.write($1, 'bindary'); console.log('hi') });
        clientRes.addListener("end", function($1,$2,$3){ serverRes.end(); console.log('close') });
      });

      serverReq.addListener("data", function($1,$2,$3){ clientReq.write($1, 'binary') });
      serverReq.addListener("end", function($1,$2,$3){ clientReq.end(); });

    }).listen(serverPort);

    return http;
  });
});
