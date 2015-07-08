contract example {
	bytes32 value;

	function example() {
		value = "FEEDFACE";
	}

	//set
	function set(bytes32 input) {
		value = input;
	}

	//get
	function get() returns (bytes32) {
		return value;
	}
}
