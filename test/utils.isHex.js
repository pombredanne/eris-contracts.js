var chai = require('chai');
var utils = require('../lib/utils/utils.js');
var assert = chai.assert;

var tests = [
    { str: '0x123456789abcdefABCDEF', is: true},
    { str: '123456789abcdefABCDEF', is: true},
    { str: '0x1234TTT', is: false},
    { str: '', is: true},
    { str: '0x', is: true}
];

describe('lib/utils/utils', function () {
    describe('isHex', function () {
        tests.forEach(function (test) {
            it('shoud test if value ' + test.str + ' is hex: ' + test.is, function () {
                assert.equal(utils.isHex(test.str), test.is);
            });
        });
    });
});