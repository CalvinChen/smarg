/**
 * Created by Calvin Chen on 2015/1/28.
 */
var Smarg = require('../lib/smarg');
var $ = Smarg.$;
var expect = require('chai').expect;
function cb() {}
function cb1() {return 1;}
describe('Smarg.addValidators', function () {
    it('should be invokable after adding new validators', function (done) {
        // newValiName = 'is0to120';
        var errorMsg = 'is missing a value from 0 to 120';
        expect(Smarg.is0to120).to.be.undefined;
        Smarg.addValidator('is0to120', function (param) {
            if(param >= 0 && param <= 120) return true;
            return false;
        }, errorMsg);
        expect(Smarg.is0to120).not.to.be.undefined;
        var testFunc = function (num) {
            $(num).is0to120();
            return true;
        };

    });
});
describe('smarg.validators', function() {
    describe('#require', function () {
        function require1(argu1, argu2) {
            $(arguments).require(argu2);
        }
        it('should work fine when #require meet not false value', function (done) {
            try {
                require1(null, "some value");
                require1(null, false);
                require1(null, true);
                require1(null, "");
                require1(null, 0);
                done();
            } catch (e) {
                expect(e).to.be.undefined;
            }
        });
        it('should throw error when #require meet false value', function (done) {
            var falsyValus = [null, undefined, NaN]; // except zero, false and empty string
            for(var i = 0; i < falsyValus.length; i++) {
                var isError = false;
                try {
                    require1("some value", falsyValus[i]);
                    isError = true;
                } catch (e) {
                    expect(e).to.be.not.undefined;
                }
                expect(isError).to.equal(false);
            }
            done();
        });
    });
    describe('#notEmptyString', function() {
        function notEmpty1(argu1, argu2) {
            $(arguments).notEmptyString(argu2);
        }
        it('should work fine when #notEmptyString meet not empty string value', function(done) {
            try {
                notEmpty1(null, "some value");
                notEmpty1(null, " s ");
                notEmpty1(null, 's ');
                notEmpty1(null, ' s');
                done();
            } catch (e) {
                expect(e).to.be.undefined;
                throw e;
            }
        });
        it('should throw error when #notEmptyString meet empty string value', function (done) {
            var falsyValus = [""
                , "   "
                , null
                , undefined
                , NaN
                , true
                , false
                , 0
                , 99
                , []

            ];
            for(var i = 0; i < falsyValus.length; i++) {
                var isError = false;
                try {
                    notEmpty1("some value", falsyValus[i]);
                    isError = true;
                } catch (e) {
                    expect(e).to.be.not.undefined;
                }
                expect(isError).to.equal(false);
            }
            done();
        });
    });
    describe('#notEmptyArray', function () {
        function notEmptyArray1(argu1, argu2) {
            $(arguments).notEmptyArray(argu2);
        }
        it('should work fine when #notEmptyArray meet not empty array value', function (done) {
            try {
                notEmptyArray1(null, ["some value"]);
                notEmptyArray1(null, [false]);
                notEmptyArray1(null, [true]);
                notEmptyArray1(null, [""]);
                notEmptyArray1(null, [0]);
                notEmptyArray1(null, [null]);
                notEmptyArray1(null, [undefined]);
                done();
            } catch (e) {
                expect(e).to.be.undefined;
                throw e;
            }
        });
        it('should throw error when #notEmptyArray meet empty array value', function (done) {
            var list = [[], undefined, NaN, 0, 99, true, false, null];
            for(var i = 0; i < list.length; i++) {
                var isError = false;
                try {
                    notEmptyArray1("some value", list[i]);
                    isError = true;
                } catch (e) {
                    expect(e).to.be.not.undefined;
                }
                expect(isError).to.equal(false);
            }
            done();
        });
    });
});