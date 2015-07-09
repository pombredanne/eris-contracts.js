// Simple contract for doing integration tests.
contract IntegrationTester {

    struct TestStruct {
        bool boolVal;
        bytes32 bytesVal;
    }

    function getInts() external constant returns (int a, int b){
        a = -10;
        b = -50;
        return;
    }

    function getUints() external constant returns (uint a, uint b){
        a = 10;
        b = 50;
        return;
    }

    function getBytes32() external constant returns (bytes32 bytesOut){
        bytesOut = 0x1213;
        return;
    }

    function getStruct() external constant returns (bool boolVal, bytes32 bytesVal){
        // For now.
        var s = TestStruct({boolVal: true, bytesVal: "Test-bytes in struct."});
        boolVal = s.boolVal;
        bytesVal = s.bytesVal;
    }

}