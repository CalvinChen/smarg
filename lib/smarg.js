/**
 * Created by Calvin Chen on 2015/1/28.
 */

var Smarg = function () {

};

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

Smarg.let = function (argus) {

}

module.exports = Smarg;