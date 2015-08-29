
function MockEdb(){
    this._txs = new MockTxs();
    this._events = new MockEvents();
}

function MockTxs(){}

function MockEvents(){}

MockEdb.prototype.txs = function(){
    return this._txs;
};

MockEdb.prototype.events = function(){
    return this._events;
};

MockTxs.prototype.call = function (from, address, data, callback){
    callback(null, "");
};

MockTxs.prototype.transactAndHold = function (from, to, data, gas, fee, context, callback){
    var ret = {};
    if(to){
        ret.return = "";
    } else {
        ret.call_data = {};
        ret.call_data.callee = "0000000000000000000000000000000000000000";
    }
    callback(null, ret);
};

MockEvents.prototype.subSolidityEvent = function(accountAddress, createCallback, eventCallback){
    // TODO worry about this later.
};

exports.createInstance = function(){
    return new MockEdb();
};