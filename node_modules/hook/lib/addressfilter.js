var js2 = require('js2').js2;
var JS2 = js2;

var Throttler = require('./throttler').Throttler;

var AddressFilter=exports['AddressFilter']=JS2.Class.extend( function(KLASS, OO){
  OO.addMember("DEFAULT_LIMIT",1000);

  OO.addMember("initialize",function (throttler, limit) {
    this.throttler = throttler || new Throttler(10, 60);
    this.limit     = limit || this.DEFAULT_LIMIT;
  });

  OO.addMember("pre",function ($r) {
    var key = $r.frontend.request.connection.remoteAddress;
    var res = $r.frontend.response;

    if (! this.throttler.shouldAllow(key)) {
      this.throttler.deny();
      res.writeHeader(403, {});
      res.end();
      return false;
    } else {
      this.throttler.allow();
      this.throttler.log(key, this.limit);
    }
  });
});
