/**
 * Created by Calvin Chen on 2015/1/28.
 */

var Smarg = function (argus) {
    this.argus = argus;
    this.funcName = argus.callee.name;
    this.expectLength = argus.callee.length;
    this.actualLength = argus.length;
};

/**
 * when validation failed, this error will be thrown.
 * by default Smarg will throw the most common error type Error, or you can define your own error type.
 * the constructor of your defined error type is better to have at least one first String argument to receive error string.
 * @type {Error}
 */
Smarg.error = Error;
Smarg.startFrom = 1;

Smarg.prototype.ifOnlyCb = function(arguList, arguSize) {
    if(!arguSize) throw new Error('Expected arguments size has to be set');
    if(!arguList || arguList.length !== 1) return;
    if(typeof arguList[0] != 'function') return;
    arguList[arguSize - 1] = arguList[0];
    for(var i = 0; i < arguSize - 1; i++) {
        arguList[i] = null;
    }
    return;
};

Smarg.prototype.requireCb = function () {
    var last = this.argus[this.actualLength - 1];
    if('function' === typeof last) {
        if(this.expectLength > this.actualLength) {
            this.argus[this.actualLength - 1] = undefined;
            this.argus[this.expectLength - 1] = last;
        } else if(this.expectLength < this.actualLength) {
            this.argus[this.expectLength - 1] = last;
        }
        return this;
    } else {
        throw new Smarg.error(this.funcName + ' require callback!');
    }
};

Smarg.prototype.hasCb = function () {
    var last = this.argus[this.actualLength - 1];
    if('function' !== typeof last) {
        this.argus[this.actualLength - 1] = empty;
    }
    if(this.expectLength > this.actualLength) {
        this.argus[this.actualLength - 1] = undefined;
        this.argus[this.expectLength - 1] = last;
    } else if(this.expectLength < this.actualLength) {
        this.argus[this.expectLength - 1] = last;
    }
    return this;
};

Smarg.prototype.require = function() {

};

Smarg.$ = function (argus) {
    var  smarg = new Smarg(argus);
    return smarg;
}

function empty() {
    // do nothing.
}

module.exports = Smarg;