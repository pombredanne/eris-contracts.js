contract Test {

    bytes32 public testBytes32 = 0x123456789ABCDEF;

    function Test(){
    }

    function setTestBytes32(bytes32 bytes32In) external returns (bytes32 bytes32Prev, bytes32 bytes32New){
        bytes32Prev = testBytes32;
        testBytes32 = bytes32In;
        // Don't care it's an extra SLOAD just want to test.
        bytes32New = testBytes32;
        return;
    }

}