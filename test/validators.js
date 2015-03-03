/**
 * Created by Calvin Chen on 2015/1/28.
 */
var Smarg = require('../lib/smarg');
var $ = Smarg.$;
var expect = require('chai').expect;
function cb() {}
function cb1() {return 1;}
function shouldNotThrowError(func, done) {
    try {
        func();
        if(done) done();
    } catch (e) {
        expect(e).to.be.undefined;
    }
}
function shouldThrowError(func, done) {
    var sthWrong = false;
    try {
        func();
        sthWrong = true;
    } catch (e) {
        expect(e).to.be.not.undefined;
    }
    expect(sthWrong).to.equal(false);
    if(done) done();
}
describe('Smarg.addValidators', function () {
    it('should be invokable after adding new validators', function (done) {
        // newValiName = 'is0to120';
        var errorMsg = 'is missing a value from 0 to 120';
        expect(Smarg.is0to120).to.be.undefined;
        Smarg.addValidator('is0to120', function (param) {
            if(param >= 0 && param <= 120) return true;
            return false;
        }, errorMsg);
        var testFunc = function (num) {
            $(num).is0to120();
            return true;
        };
        shouldNotThrowError(function () {
            testFunc(45);
        });
        shouldThrowError(function () {
            testFunc(121);
        });
        done();
    });
});
describe('smarg.validators', function() {
    describe('#isRequired', function () {
        doTest(function(argu1, argu2) {
            $(arguments).isRequired(argu2);
        });

        doTest(function(argu1, argu2) {
            $(argu2).isRequired();
        });

        doTest(function(argu1, argu2) {
            $(argu2).isRequired;
        });

        function doTest(requireArgu2) {
            it('should work fine when #require meet not false value', function (done) {
                shouldNotThrowError(function () {
                    requireArgu2(null, "some value");
                    requireArgu2(null, false);
                    requireArgu2(null, true);
                    requireArgu2(null, "");
                    requireArgu2(null, 0);
                }, done);
            });
            it('should throw error when #require meet false value', function (done) {
                var falsyValus = [null, undefined, NaN]; // except zero, false and empty string
                for(var i = 0; i < falsyValus.length; i++) {
                    shouldThrowError(function(){
                        requireArgu2("some value", falsyValus[i]);
                    });
                }
                done();
            });
        }
    });
    describe('#areRequired', function () {
        doTest(function(argu1, argu2) {
            $(arguments).areRequired([argu1, argu2]);
        });

        doTest(function(argu1, argu2) {
            $([argu1, argu2]).areRequired();
        });

        doTest(function(argu1, argu2) {
            $([argu1, argu2]).areRequired;
        });

        function doTest(requireBoth) {
            it('should work fine when #areRequired meet not false value', function (done) {
                shouldNotThrowError(function () {
                    requireBoth(1, "some value");
                    requireBoth(2, false);
                    requireBoth(3, true);
                    requireBoth(4, "");
                    requireBoth(5, 0);
                }, done);
            });
            it('should throw error when #areRequired meet false value', function (done) {
                var falsyValus = [null, undefined, NaN]; // except zero, false and empty string
                for(var i = 0; i < falsyValus.length; i++) {
                    shouldThrowError(function(){
                        requireBoth("some value", falsyValus[i]);
                    });
                }
                for(var i = 0; i < falsyValus.length; i++) {
                    shouldThrowError(function(){
                        requireBoth(falsyValus[i], "some value");
                    });
                }
                done();
            });
        }
    });
    describe('#notEmptyString', function() {
        function notEmpty1(argu1, argu2) {
            $(arguments).isNotEmptyString(argu2);
        }
        it('should work fine when #notEmptyString meet not empty string value', function(done) {
            shouldNotThrowError(function () {
                notEmpty1(null, "some value");
                notEmpty1(null, " s ");
                notEmpty1(null, 's ');
                notEmpty1(null, ' s');
            }, done);
        });
        it('should throw error when #notEmptyString meet empty string value', function (done) {
            var falsyValus = ["", "   ", null, undefined, NaN, true, false, 0, 99, []];
            for(var i = 0; i < falsyValus.length; i++) {
                shouldThrowError(function () {
                    notEmpty1("some value", falsyValus[i]);
                });
            }
            done();
        });
    });
    describe('#notEmptyArray', function () {
        function notEmptyArray1(argu1, argu2) {
            $(arguments).isNotEmptyArray(argu2);
        }
        it('should work fine when #notEmptyArray meet not empty array value', function (done) {
            shouldNotThrowError(function () {
                notEmptyArray1(null, ["some value"]);
                notEmptyArray1(null, [false]);
                notEmptyArray1(null, [true]);
                notEmptyArray1(null, [""]);
                notEmptyArray1(null, [0]);
                notEmptyArray1(null, [null]);
                notEmptyArray1(null, [undefined]);
            }, done);
        });
        it('should throw error when #notEmptyArray meet empty array value', function (done) {
            var list = [[], undefined, NaN, 0, 99, true, false, null];
            for(var i = 0; i < list.length; i++) {
                shouldThrowError(function () {
                    notEmptyArray1("some value", list[i]);
                });
            }
            done();
        });
    });
});