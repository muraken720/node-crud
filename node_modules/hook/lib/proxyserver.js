var js2 = require('js2').js2;
var JS2 = js2;
var URL = require('url');

var ProxyServer=exports['ProxyServer']=JS2.Class.extend( function(KLASS, OO){
  OO.addMember("initialize",function (port, host) {
    this.client  = require('http').createClient(port, host); 

    this.client.addListener('error', function(err) {
      console.log("Unable to connect to client");
    });

    this.preFilters  = [];
    this.postFilters = [];
    this.resets      = [];
  });

  OO.addMember("getProxiedRequest",function ($r) {
    var req = $r.frontend.request;
    return this.client.request(req.method, req.url, req.headers);
  });

  OO.addMember("passedPreFilters",function ($r) {
    for(var _i1=0,_c1=this.preFilters,_l1=_c1.length,f;(f=_c1[_i1])||(_i1<_l1);_i1++){
      var val = f($r);
      if (val == false) return false;
    }
    return true;
  });

  OO.addMember("passedPostFilters",function ($r) {
    for(var _i1=0,_c1=this.postFilters,_l1=_c1.length,f;(f=_c1[_i1])||(_i1<_l1);_i1++){
      var val = f($r);
      if (val == false) return false;
    }
    return true;
  });

  OO.addMember("proxyRequest",function (serverReq, serverRes) {

    var url     = URL.parse(serverReq.url, true);
    var state   = {};
    var $r = {
      frontend: {
        request:  serverReq,
        response: serverRes
      },

      backend: {
        request:  null,
        response: null
      },

      state:  {},
      url:    url,
      params: url.query
    };

    if (!this.passedPreFilters($r)) return;

    var self = this;
    var clientReq = this.getProxiedRequest($r);
    $r.backend.request = clientReq;

    clientReq.addListener("response", function(clientRes){
      $r.backend.response = clientRes;
      if (!self.passedPostFilters($r)) return;

      serverRes.writeHeader(clientRes.statusCode, clientRes.headers);

      clientRes.addListener("data", function($1,$2,$3){ serverRes.write($1, 'binary'); });
      clientRes.addListener("end",  function($1,$2,$3){ serverRes.end(); });
    });

    serverReq.addListener("data", function($1,$2,$3){ clientReq.write($1, 'binary') });
    serverReq.addListener("end", function($1,$2,$3){ clientReq.end(); });
  });

  OO.addMember("addFilter",function (filter) {
    if (filter.pre) {
      this.preFilters.push(function($1,$2,$3){ return filter.pre.apply(filter, arguments) });
    }

    if (filter.post) {
      this.postFilters.push(function($1,$2,$3){ return filter.post.apply(filter, arguments) });
    }

    if (filter.reset) {
      this.resets.push(function($1,$2,$3){ return filter.reset.apply(filter, arguments); });
    }

  });

  OO.addMember("reset",function () {
    for(var _i1=0,_c1=this.resets,_l1=_c1.length,reset;(reset=_c1[_i1])||(_i1<_l1);_i1++){
      reset();
    }
  });
});
