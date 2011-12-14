var js2 = require('js2').js2;
var JS2 = js2;
var ThrottleBucket=exports['ThrottleBucket']=JS2.Class.extend( function(KLASS, OO){
  OO.addMember("initialize",function () {
    this.lastRequestTime = 0;
    this.clear();
  });

  OO.addMember("increment",function (time) {
    this.lastRequestTime = time;
    this.count++;
  });

  OO.addMember("clear",function () {
    this.count = 0;
  });
});
