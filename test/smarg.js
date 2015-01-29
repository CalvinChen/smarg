/**
 * Created by Calvin Chen on 2015/1/28.
 */
var Smarg = require('../lib/smarg');
var $ = Smarg.$;
var expect = require('chai').expect;
function cb() {}
describe('smarge', function() {
    describe('#requireCb', function () {
        function requireCb1param(cb) {
            var smarg = $().requireCb();
            cb = smarg.cb;
            return {
                argus: arguments,
                cb: cb
            };
        }
        function requireCb3param(param0, param1, cb) {
            var smarg = $(arguments).requireCb();
            cb = smarg.cb;
            return {
                argus: arguments,
                param1: param0,
                param2: param1,
                cb: cb
            };
        }
        it('should work fine when passing cb', function (done) {
            var re = requireCb1param(cb);
            expect(re.argus.length).to.equal(1);
            expect(re.argus[0]).to.equal(cb);
            expect(re.cb).to.equal(cb);

            re = requireCb3param(cb);
            expect(re.argus.length).to.equal(1);
            expect(re.argus[0]).to.be.undefined();
            expect(re.argus[1]).to.be.undefined();
            expect(re.argus[2]).to.equal(cb);
            expect(re.cb).to.equal(cb);
            done();
        });
        it('should throw error when not passing cb', function (done) {
            try {
                requireCb1param();
            } catch (e) {
                expect(e).is.not.null();
                done();
            }
        });
    });
    describe('#hasCb', function() {
        function funWith2argus(argu1, cb) {
            $(arguments).hasCb();
            return arguments;
        }
        function funWith6argus(argu1, argu2, argu3, argu4, argu5, cb) {
            $(arguments).hasCb();
            return arguments;
        }
        it('should change the arguments which has only one callback', function() {
            var argus = funWith2argus();
            expect(argus.length).to.equal(0);
            argus = funWith2argus(cb);
            expect(argus[0]).to.be.undefined;
            expect(argus[1]).to.equal(cb);
            argus = funWith2argus(1, cb);
            expect(argus[1]).to.equal(cb);

            argus = funWith6argus(cb);
            expect(argus[0]).to.be.undefined;
            expect(argus[1]).to.be.undefined;
            expect(argus[2]).to.be.undefined;
            expect(argus[3]).to.be.undefined;
            expect(argus[4]).to.be.undefined;
            expect(argus[5]).to.equal(cb);

            argus = funWith6argus(1, 2, 3, 4, 5, cb);
            expect(argus[0]).to.equal(1);
            expect(argus[5]).to.equal(cb);
        });
    });
});