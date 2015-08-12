contract longerTest {

    bytes32 testBytes32 = 0x123456789ABCDEF;
    mapping(uint => uint) data;

    function longerTest(){
        for(uint i = 0; i < 100; i++){
            data[i] = i;
        }
    }

    function setTestBytes32(bytes32 bytes32In) external returns (bytes32 bytes32Prev, bytes32 bytes32New){

        //waste some time doing some random operations
        uint temp = 0;
        for(uint i = 0; i < 99; i++){
            temp = ((temp +1) * data[i])/data[i+1];
            if(temp%2 == 1){
                temp = temp + 1;
            } else {
                temp = temp -1;
            }
        }

        bytes32Prev = testBytes32;
        testBytes32 = bytes32In;
        // Don't care it's an extra SLOAD just want to test.
        bytes32New = testBytes32;
        return;
    }

}