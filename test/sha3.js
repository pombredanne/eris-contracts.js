var chai = require('chai');
var assert = chai.assert;
var sha3 = require('../lib/utils/sha3');
var utils = require('../lib/utils/utils');

describe('lib/utils/sha3', function () {
    var test = function (v, e) {
        it('should encode ' + v + ' to ' + e, function () {
            assert.equal(sha3(v), e);
        });
    };

    test('test123', 'F81B517A242B218999EC8EEC0EA6E2DDBEF2A367A14E93F4A32A39E260F686AD');
    test('test(int)', 'F4D03772BEC1E62FBE8C5691E1A9101E520E8F8B5CA612123694632BF3CB51B1');
    test('test123', 'F81B517A242B218999EC8EEC0EA6E2DDBEF2A367A14E93F4A32A39E260F686AD');
});