/**
 * Created by Calvin Chen on 2015/1/28.
 */
var S = require('string');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var log4js = require('log4js');

var log = log4js.getLogger(__filename);

function _handCb(lastNotFuncCb) {
    var lengthExpect = this.lengthExpect, lengthActual = this.lengthActual;
    var last = this.argus[lengthActual - 1];

    if('function' !== typeof last) {
        lastNotFuncCb.call(this);
    }

    if(!this.isLengthMatch) {
        if(lengthExpect > lengthActual) { // actual:1,2 into expect:1,2,3,4
            this.argus[lengthExpect - 1] = last;
            this.argus[lengthActual - 1] = undefined;
            this.lengthNow = lengthExpect;
            this.argus.length = lengthExpect;
        } else { // 1,2,3,4 into 1,2
            // do nothing.
        }
    }
    this._cb = last;
}

function _checkValid(valid, paramName, funcName, errorReason) {
    if(!valid) {
        var msg = S('{{funcName}} {{errorReason}}!' + ' the param name is {{paramName}}').template({
            funcName: funcName,
            errorReason: errorReason || 'has parameter invalid',
            paramName: paramName || 'not provided'
        }).s;
        log.error(msg);
        throw new Smarg.error(msg);
    }
}

function _isArguments(obj) {
    if(!obj || 'object' !== typeof obj) return false;
    if(('callee' in obj) && ('length' in obj)) return true;
    return false;
}

function _empty() { /* do nothing. */ }

/**
 * constructor of Smarg.
 * @param argus can be omitted.
 * @constructor
 * @throw error if recevies params more then it had expected.
 */
var Smarg = function (argus) {
    // arguments can be omitted. Smarg find them by ourself.
    if(!argus) {
        argus = arguments.callee.caller.caller.arguments;
    }

    this.funcName = argus.callee.name;
    this.lengthExpect = argus.callee.length;
    this.lengthActual = argus.length;
    this.lengthNow = this.lengthActual;

    this.argus = argus;
    this.isLengthMatch = (this.lengthExpect == this.lengthActual);
    this._cb = Smarg.cb;

    this.isRequireCb = false;
    this.isHasCb = false;
    this.emitted = false;
};

util.inherits(Smarg, EventEmitter);

/**
 * when validation failed, this error will be thrown.
 * by default Smarg will throw the most common error type Error, or you can define your own error type.
 * the constructor of your defined error type is better to have at least one first String argument to receive error string.
 * @type {Error}
 */
Smarg.error = Error;
Smarg.cb = _empty;

/**
 * when using this, it require your funcion must have a callback.
 * otherwise it will throw an error.
 * @returns {Smarg}
 */
Smarg.prototype.requireCb = function () {
    this.isRequireCb = true;
    _handCb.call(this, function () {
        var msg = S('{{funcName}} require callback!').template({
            funcName: this.funcName
        }).s;
        log.error(msg);
        throw new (Smarg.error)(msg);
    });
    return this;
};

/**
 * when using this, it assume your funcion may have a callback.
 * it's associated with #cb().
 * when the params has cb, the #cb() will return it.
 * but if they doesn't, the #cb() will return an empty function for null-safe invoking.
 * @returns {Smarg}
 */
Smarg.prototype.hasCb = function () {
    this.isHasCb = true;
    _handCb.call(this, function () {
        if(this.argus[this.lengthActual - 1] === null) {
            this.argus[this.lengthActual - 1] = Smarg.cb;
        }
    });
    return this;
};

/**
 * make current function listenable.
 */
Smarg.prototype.listenable = function () {
    if(!this.emitted) {
        this.emit(this.funcName, this.argus);
        this.emitted = true;
    } else {
        log.warn('Your function "%s" call #listenable more than once during one invoking.', this.funcName);
    }
};

/**
 * To create an instance of Smarg.
 * Receiving the arguments of current function, but actually is unnecessary because Smarg can get from context.
 * The reason of reserving is for using like jquery, e.g. $(arguments).requireCb();
 * Either way is good.
 *
 * @param argus the arguments of current function, actually can be omitted.
 * @returns {Smarg}
 */
Smarg.$ = function (argus, /* optional */ paramName) {
    var isArgus = _isArguments(argus);
    if(isArgus) {
        var smarg = new Smarg(argus);
        Smarg.current = smarg;
        return smarg;
    } else {
        Smarg.currentParam = argus;
        Smarg.currentParamName = paramName;
        return Smarg;
    }
};

Smarg.addValidator = function (funcName, func, errorMsg) {
    Smarg.prototype[funcName] = function (param, paramName) {
        var valid = func.call(this, param, Array.prototype.slice.call(arguments ,2));
        _checkValid(valid, paramName, this.funcName, errorMsg);
        return this;
    };
    var temp = function () {
        var valid = func.call(Smarg.current || Smarg, Smarg.currentParam, Array.prototype.slice.call(arguments));
        _checkValid(valid, Smarg.currentParamName, Smarg.current.funcName, errorMsg);
        return Smarg;
    };
    Smarg[funcName] = temp;
    Smarg.__defineGetter__(funcName, temp);
};

Smarg.addAccessor = function (accessorName, func) {
    Smarg.prototype.__defineGetter__(accessorName, function () {
        return func.call(this);
    });
};

module.exports = Smarg;

require('./validators');
require('./accessors');