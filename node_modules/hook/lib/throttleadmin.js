var js2 = require('js2').js2;
var JS2 = js2;
var ThrottleAdmin=exports['ThrottleAdmin']=JS2.Class.extend( function(KLASS, OO){

  OO.addMember("initialize",function (throttler) {
    this.throttler = throttler;

    this.indexTmpl = 
JS2.TEMPLATES["jsml"].process("%h1 Throttle Admin\n"+"%div= \"Allowed: \" + this.allowCount;\n"+"%div= \"Denied: \"  + this.denyCount;\n"+"%table\n"+"  %tr\n"+"    %th Key\n"+"    %th Count\n"+"   - for (var k in this.trackers) {\n"+"    %tr\n"+"      %td= k;\n"+"      %td\n"+"        %a{ \"href\": \"/keys/\" + k }= this.trackers[k].getCount();\n");
    this.keyTmpl = 
JS2.TEMPLATES["jsml"].process("%h1= this.key;\n");  });

  OO.addMember("listen",function (port) {
    var self = this;
    require('http').createServer(function($1,$2,$3){
      self.handleRequest($1, $2); 
    }).listen(port);
  });

  OO.addMember("handleRequest",function (req, res) {
    var m = req.url.match(/\/keys\/(\.*)/);
    res.writeHead(200, { 'Content-Type': 'text/html' });

    if (m) {
      res.end(this.keyTmpl.result({ key: m[1], tracker: this.throttler.trackers[m[1]] }));
    } else {
      res.end(this.indexTmpl.result(this.throttler));
    }
  });

});
