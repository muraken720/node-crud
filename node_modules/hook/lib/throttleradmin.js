var js2 = require('js2').js2;
var JS2 = js2;
var ThrottlerAdmin=exports['ThrottlerAdmin']=JS2.Class.extend( function(KLASS, OO){

  OO.addMember("initialize",function (throttler) {
    this.throttler = throttler;
  });

  OO.addMember("listen",function (limit) {
    var self = this;
    require('http').createServer(function($1,$2,$3){
      self.handleRquest($1, $2); 
    });
  });

  OO.addMember("handleRequest",function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(this.indexTmpl.result(this));
  });


});
