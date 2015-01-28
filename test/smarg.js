/**
 * Created by Calvin Chen on 2015/1/28.
 */
var Smarg = require('../lib/smarg');
var $ = Smarg.$;
var expect = require('chai').expect;
describe('smarge', function() {
    describe('#hasCb', function() {
        function funWith2argus(argu1, cb) {
            $(arguments).hasCb();
            return arguments;
        }
        function funWith6argus(argu1, argu2, argu3, argu4, argu5, cb) {
            $(arguments).hasCb();
            return arguments;
        }
        function cb() {}
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