/**
 * Created by CalvinChen on 2015/2/18.
 */
var Smarg = require('./smarg');
var S = require('string');
var validator = require('validator');

/**
 * This method check whether the value of obj is valid,
 * all the 'false' value (except zero, false and empty string) will occur an error.
 */
Smarg.addValidator('require', function (param) {
    // exclude the special zero and false and empty string.
    if(0 === param || false === param || '' === param) return true;
    return !!param;
}, 'is missing a required value');

Smarg.addValidator('notEmptyString', function (param) {
    if(typeof param != 'string') return false;
    return !S(param).isEmpty();
}, 'is missing a notEmpty string value');

Smarg.addValidator('notEmptyArray', function (param) {
    if(!Array.isArray(param)) return false;
    return param.length > 0;
}, 'is missing a notEmpty array value');

Smarg.addValidator('isEmail', function (param) {
    if(typeof param != 'string') return false;
    return validator.isEmail(param);
}, 'is missing a email value');

Smarg.addValidator('isNumber', function (param) {
    if('number' === typeof param) return true;
    else return false;
}, 'is missing a number value');

Smarg.addValidator('isFunction', function (param) {
    if('function' === typeof param) return true;
    else return false;
}, 'is missing a function value');

Smarg.addValidator('range', function (param, option) {
    if(!this.isNumber(param)) return false;
    if(option[0] && param < option[0]) return false;
    if(option[1] && param > option[1]) return false;
    return true;
}, 'is missing a number value within range');