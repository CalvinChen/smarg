
var Errors = {};

Errors.ValidationError = function(msg) {
	this.msg = msg;
};

Errors.SmargError = function(msg) {
	this.msg = msg;
};

module.exports = Errors;