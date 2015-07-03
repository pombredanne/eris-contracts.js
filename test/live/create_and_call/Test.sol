contract Test {

    address owner;

    function Test(){
        owner = msg.sender;
    }

    function add(int a, int b) external constant returns (int sum) {
        return a + b;
    }

    function() constant returns (address theOwner){
        return owner;
    }

}