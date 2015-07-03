var contractsModule = require('./lib/contract');
var pipes = require('./lib/pipes/pipes');

exports.solidityContracts = function(pipe){
    contractsModule.init(pipe);
    return contractsModule.contract;
};

exports.pipes = pipes;