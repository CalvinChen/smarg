/**
 * Created by Calvin Chen on 2015/1/28.
 */
var S = require('string');
var Smarg = function (argus) {
    // arguments can be omitted.
    if(!argus) {
        argus = arguments.callee.caller.caller.arguments;
    }

    this.argus = argus;
    this.funcName = argus.callee.name;
    this.expectLength = argus.callee.length;
    this.actualLength = argus.length;
    this.isLengthMatch = (this.expectLength == this.actualLength);
    this.cb = _empty;
};

/**
 * when validation failed, this error will be thrown.
 * by default Smarg will throw the most common error type Error, or you can define your own error type.
 * the constructor of your defined error type is better to have at least one first String argument to receive error string.
 * @type {Error}
 */
Smarg.error = Error;
Smarg.funcParamNamesCache = {};

Smarg.prototype.requireCb = function () {
    _handCb(this, function () {
        var msg = S('{{funcName}} require callback!').template({
            funcName: this.funcName
        }).s;
        throw new (Smarg.error)(msg);
    });
    return this;
};

Smarg.prototype.hasCb = function () {
    _handCb(this, function () {
        this.argus[this.actualLength - 1] = _empty;
    });
    return this;
};

/**
 * By invoking this method, smarg assume that the actual arguments' length is matching the expected.
 * Mismatching will occur an error.
 *
 * This method check whether the value of obj is valid,
 * all the 'false' value (except zero, false and empty string) will occur an error.
 *
 * @param param which is expected to be a function param, but actually it can be any value you want to require.
 * @param paramName optional for identifying which param is missing when throwing error.
 * @returns {Smarg} for chain invoking.
 */
Smarg.prototype.require = function(param, /* optional */ paramName) {
    if(!this.isLengthMatch) {
        var msg = S('{{funcName}} expect {{expectLength}} param(s)! but there are {{actualLength}} params.').template({
            funcName: this.funcName,
            expectLength: this.expectLength,
            actualLength: this.actualLength
        }).s;
        throw new Smarg.error(msg);
    }
    var valid = _require(param);
    if(!valid) {
        var msg = S('{{funcName}} is missing a required value!' + ' the param name is {{paramName}}').template({
            funcName: this.funcName,
            paramName: ( paramName ? paramName : 'not provided' )
        }).s;
        throw new Smarg.error(msg);
    }
    return this;
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
Smarg.$ = function (argus) {
    var  smarg = new Smarg(argus);
    return smarg;
};

function _handCb(smarg, lastNotFuncCb) {
    var actualLength = smarg.actualLength, expectLength = smarg.expectLength;
    var last = smarg.argus[actualLength - 1];

    if('function' !== typeof last) {
        lastNotFuncCb.call(smarg);
    }

    if(!smarg.isLengthMatch) {
        _moveLastToRealLast(smarg, last);
    }
    smarg.cb = last;
}

function _moveLastToRealLast(smarg, last) {
    var expectLength = smarg.expectLength, actualLength = smarg.actualLength;

    if(expectLength > actualLength) {
        smarg.argus[actualLength - 1] = undefined;
        smarg.argus[expectLength - 1] = last;

    } else if(expectLength < actualLength) {
        smarg.argus[expectLength - 1] = last;
    }
}

function _getParamName(func, index) {
    var paramNames = Smarg.funcParamNamesCache[func.name];

    if(paramNames) {
        return paramNames[index];
    }

    paramNames = _extactParamNames(func.toString(), func.name);
    Smarg.funcParamNamesCache[func.name] = paramNames;
    return paramNames;
}

function _extactParamNames(funcStr, funcName) {
    var start = funcStr.indexOf(funcName + '(') + 1;
    var end = funcStr.indexOf(')');

    return funcStr.substring(start, end).replace(/\ /g, '').split(',');
}

function _require(obj) {
    // exclude the special zero and false and empty string.
    if(0 === obj || false === obj || '' === obj) return true;

    return !!obj;
}

function _empty() {
    // do nothing.
}

module.exports = Smarg;