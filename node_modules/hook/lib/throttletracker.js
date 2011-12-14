var js2 = require('js2').js2;
var JS2 = js2;
var ThrottleBucket = require('./throttlebucket').ThrottleBucket;

/***
 * Used by throttler to track an entity.  Uses
 * multiple throttle buckets to handle this logic.
 ***/
var ThrottleTracker=exports['ThrottleTracker']=JS2.Class.extend( function(KLASS, OO){
  OO.addMember("initialize",function (bucketCount, time, limit) {
    this.limit         = limit;
    this.bucketCount   = bucketCount;
    this.lengthOfTime  = time;
    this.timePerBucket = Math.floor(time / this.bucketCount);

    this.buckets = [];
    for (var i=0; i<bucketCount; i++) {
      this.buckets.push(new ThrottleBucket()); 
    }
  });

  OO.addMember("reachedLimit",function () {
    if (this.getCount() >= this.limit) {
      var now = parseInt(Date.now());
      this.clearOld(now);
    }

    return this.getCount() >= this.limit;
  });

  OO.addMember("logRequest",function () {
    var now = parseInt(Date.now());

    var base = now % this.lengthOfTime;
    var n    = Math.floor(base / this.timePerBucket);

    if (this.buckets[n]) {
      this.buckets[n].increment(now);
    }
  });

  OO.addMember("getCount",function () {
    var count = 0;
    for(var _i1=0,_c1=this.buckets,_l1=_c1.length,b;(b=_c1[_i1])||(_i1<_l1);_i1++){
      count += b.count;
    }
    return count;
  });

  OO.addMember("getLastRequestTime",function () {
    var ret = 0;
    for(var _i1=0,_c1=this.buckets,_l1=_c1.length,b;(b=_c1[_i1])||(_i1<_l1);_i1++){
      if (ret < b.lastRequestTime) {
        ret = b.lastRequestTime;
      }
    }
    return ret;
  });

  OO.addMember("clearOld",function (time) {
    var threshold = time - this.lengthOfTime;
    for(var _i1=0,_c1=this.buckets,_l1=_c1.length,b;(b=_c1[_i1])||(_i1<_l1);_i1++){
      if (b.lastRequestTime < threshold) {
        b.clear();
      }
    }
  });
});
