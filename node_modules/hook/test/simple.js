var js2 = require('js2').js2;
var Throttler = require('../lib/hook').Throttler;

js2.test(function (assert) {
  var counter = 0;
  var throttler = Throttler(5, 5); 
  var key1 = "abcd";

  var test = function () {
    throttler.log(key1);
    assert.eq(1, throttler.count(key));
  };
});
