var contractsModule = require('./lib/contract');

exports.createInstance = function(pipe){
    contractsModule.init(pipe);
    // Return contract to be consistent with web3. This may not be practical later, but
    // works for now.
    return contractsModule.contract;
};