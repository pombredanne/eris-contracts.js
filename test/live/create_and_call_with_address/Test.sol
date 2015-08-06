contract Test {

    function getMyAddress() constant returns (address callerAddress){
        return msg.sender;
    }

}