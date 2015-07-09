var contractsModule = require('./lib/contract');
var pipes = require('./lib/pipes/pipes');
var utils = require('./lib/utils/utils');

exports.solidityContracts = function(pipe){
    contractsModule.init(pipe);
    return contractsModule.contract;
};

exports.pipes = pipes;
exports.utils = utils;