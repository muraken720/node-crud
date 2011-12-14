var js2 = require('js2').js2;
var JS2 = js2;
var ThrottleTracker = require('./throttletracker').ThrottleTracker;
var http            = require('http');

/***
 * Container for throttling entities by a key.
 ***/
var Throttler=exports['Throttler']=JS2.Class.extend( function(KLASS, OO){
  OO.addStaticMember("DEFAULT_BUCKET_COUNT",10);
  OO.addStaticMember("DEFAULT_TIME",60);
  OO.addStaticMember("DEFAULT_LIMIT",1000);

  OO.addMember("initialize",function (count, seconds, limit) {
    this.bucketCount  = count || Throttler.DEFAULT_BUCKET_COUNT;
    this.lengthOfTime = (seconds || Throttler.DEFAULT_TIME) * 1000;
    this.limit        = limit || Throttler.DEFAULT_LIMIT;
    this.trackers = {};
    this.allowCount = 0;
    this.denyCount  = 0;
  });

  OO.addMember("log",function (key, limit) {
    var tracker = this.trackers[key];
    limit = limit || this.limit;

    if (!tracker) {
      tracker = this.trackers[key] = new ThrottleTracker(this.bucketCount, this.lengthOfTime, limit);
    }

    tracker.logRequest();
  });

  OO.addMember("startFlush",function (seconds) {
    var interval = (seconds || 20) * 1000;
    var self = this;
    setInterval(function($1,$2,$3){ self.flush() }, interval);
  });

  OO.addMember("flush",function () {
    var thresh = parseInt(Date.now()) - this.lengthOfTime;
    for (var k in this.trackers) {
      if (this.trackers.hasOwnProperty(k)) {
        var tracker = this.trackers[k]; 
        if (thresh > tracker.getLastRequestTime()) {
          delete this.trackers[k];
        }
      }
    }
  });

  OO.addMember("allow",function () {
    this.allowCount++;
  });

  OO.addMember("deny",function () {
    this.denyCount++;
  });

  OO.addMember("handle",function (key, limit) {
    var ret = this.shouldAllow(key);
    if (ret) {
      this.allow();
      this.log(key, limit || this.limit);
    } else {
      this.deny();
    }
    return ret;
  });

  OO.addMember("shouldDeny",function (key) {
    var tracker = this.getTracker(key);
    return tracker ? tracker.reachedLimit() : false;
  });

  OO.addMember("shouldAllow",function (key) {
    return ! this.shouldDeny(key);
  });


  OO.addMember("getCount",function (key) {
    var tracker = this.getTracker(key);
    return tracker ? tracker.getCount() : 0;
  });

  OO.addMember("getTracker",function (key) {
    return this.trackers[key];
  });

  OO.addMember("toString",function (key) {
    var tracker = this.trackers[key];
    if (!tracker) return "<empty>";
    var str = [];

    for(var i=0,_c1=tracker.buckets,_l1=_c1.length,b;(b=_c1[i])||(i<_l1);i++){
      var stars = [];
      for (var j=0; j<b.count; j++) {
        stars.push('*');
      }
      var bucketNumber = i+1;
      var space = bucketNumber < 10 ? ' ' : '';
      str.push(space + bucketNumber + ') : ' + stars.join(''))
    }
    return str.join("\n");
  });
});
