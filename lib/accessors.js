/**
 * Created by CalvinChen on 2015/2/22.
 */
var Smarg = require('./smarg');
var S = require('string');
var log4js = require('log4js');

var log = log4js.getLogger(__filename);

Smarg.addAccessor('cb', function () {
    if(this.isRequireCb || this.isHasCb) {
        return this._cb;
    } else {
        var msg = S('You should declare your function {{funcName}} #hasCb or #requireCb before you call #cb').template({
            funcName: this.funcName
        }).s;
        log.error(msg);
        throw new Smarg.error(msg);
    }
});

Smarg.addAccessor('all', function () {
    return Array.prototype.slice.call(this.argus);
});

Smarg.addAccessor('allButCb', function () {
    var all = this.all;
    if(this.isRequireCb || (this.isHasCb && 'function' === typeof this.last)) {
        all.slice(0, -1);
    } else return all;
});

Smarg.addAccessor('allButFirst', function () {
    return this.all.slice(1);
});

Smarg.addAccessor('first', function () {
    if(0 == this.lengthActual) return undefined;
    return this.argus[0];
});

Smarg.addAccessor('last', function () {
    if(0 == this.lengthActual) return undefined;
    return this.argus[this.lengthNow - 1];
});

Smarg.addAccessor('length', function () {
    return this.lengthNow;
});