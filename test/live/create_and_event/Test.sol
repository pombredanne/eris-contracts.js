contract Test {

    event Added(int indexed a, int indexed b, int indexed sum, bytes32 body);

    address owner;

    function Test(){
        owner = msg.sender;
    }

    function add(int a, int b) external constant returns (int sum) {
        sum = a + b;
        Added(a, b, sum, "Added two numbers");
        return;
    }

    function() constant returns (address theOwner){
        return owner;
    }

}