/**
 * Created by Calvin Chen on 2015/1/28.
 */
var S = require('string');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var log4js = require('log4js');
var Errors = require('./errors');

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
        throw new Smarg.Errors.ValidationError(msg);
    }
}

function _isArguments(obj) {
    if(!obj || 'object' !== typeof obj) return false;
    if(('callee' in obj) && ('length' in obj)) return true;
    return false;
}

function _makeSureToBeArray(param, isAlwaysWrapArray) {
    if(!Array.isArray(param) || isAlwaysWrapArray) {
        param = [param];
    }
    return param;
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

var Validator = function(name, func, msg, isAcceptArray) {
	this.name = name;
	this.func = func;
	this.msg = msg;
    this.isAcceptArray = isAcceptArray;
}

util.inherits(Smarg, EventEmitter);

/**
 * when validation failed, this error will be thrown.
 * by default Smarg will throw the most common error type Error, or you can define your own error type.
 * the constructor of your defined error type is better to have at least one first String argument to receive error string.
 * @type {Error}
 */
Smarg.error = Error;
Smarg.Errors = Errors;
Smarg.cb = _empty;

Smarg.validators = {};

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
 * The reason of reserving is for using like jquery, e.g. $(arguments).requireCb() and saving a little more time;
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

Smarg.addValidator = function (funcNames, func, errorMsg) {
    funcNames = _makeSureToBeArray(funcNames);

    for(var i = 0; i < funcNames.length; i++) {
        var funcName = funcNames[i];
        _addValidator.call(this, funcName, func, errorMsg);
    }

    function _addValidator(funcName, func, errorMsg) {
        // save for farther use and modify.
        var isAcceptArray = S(funcName).startsWith('are');
        var validator = new Validator(funcName, func, errorMsg, isAcceptArray);
        Smarg.validators[funcName] = validator;

        // add to Smarg.prototype
        Smarg.prototype[funcName] = function (params, paramNames) {
            var validator = Smarg.validators[funcName];
            var isAcceptArray = validator.isAcceptArray;

            params = _makeSureToBeArray(params, !isAcceptArray);
            paramNames = _makeSureToBeArray(paramNames, !isAcceptArray);

            if(!isAcceptArray) {
                params = params.slice(0, 1);
            }

            for(var i = 0; i < params.length; i++) {
                var param = params[i];
                var paramName = paramNames[i];

                var valid = validator.func.call(this, param, Array.prototype.slice.call(arguments ,2));
                _checkValid(valid, paramName, this.funcName, validator.msg);
            }

            return this;
        };

        var temp = function () {
            var validator = Smarg.validators[funcName];
            var isAcceptArray = validator.isAcceptArray;

            var currentParams = Smarg.currentParam;
            var currentParamNames = Smarg.currentParamName;

            currentParams = _makeSureToBeArray(currentParams, !isAcceptArray);
            currentParamNames = _makeSureToBeArray(currentParamNames, !isAcceptArray);

            if(!isAcceptArray) {
                currentParams = currentParams.slice(0, 1);
            }

            for(var i = 0; i < currentParams.length; i++) {
                var currentParam = currentParams[i];
                var currentParamName = currentParamNames[i];

                var valid = validator.func.call(Smarg.current || Smarg, currentParam, Array.prototype.slice.call(arguments));
                _checkValid(valid, currentParamName, Smarg.current.funcName, validator.msg);
            }
            return Smarg;
        };

        // add to Smarg
        Smarg[funcName] = temp;

        // add to Smarg getter
        Smarg.__defineGetter__(funcName, temp);
    }
};

Smarg.addAccessor = function (accessorName, func) {
    Smarg.prototype.__defineGetter__(accessorName, function () {
        return func.call(this);
    });
};

module.exports = Smarg;

require('./validators');
require('./accessors');