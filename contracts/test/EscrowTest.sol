import "./EscrowMaker.sol";
import "./test/Contract.sol";
import "dapple/test.sol";

contract EscrowTest is Test {
	Contract target;
	function setUp() {
		target = new Contract();
	}

	function test1() {
		EscrowMaker e = new EscrowMaker();
		// e.makeEscrow(target, 1);
	}
}