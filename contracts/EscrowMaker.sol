// @title multisig escrow script
contract EscrowMaker {
	struct Escrow {
		address sender;
		address receiver;
		uint amount; // wei
		bool senderApprove;
		bool receiverApprove;
	}

	Escrow[] escrows;
	uint tail; // last filled index of escrows
	
	modifier costs_NoRefund(uint _amount) {
		if (msg.value < _amount) {
			throw;
		}
		_
	}

	function EscrowMaker() {
		tail = 0; // note: 0th index wont get filled
	}

	// Creates an escrow between msg.sender and receiver. 
	// @param amount - amount of eth in wei
	function makeEscrow(address receiver, uint amount) costs_NoRefund(amount) returns(uint id) {
		if (tail+1 < tail) throw; // overflow

		escrows[tail+1] = Escrow(msg.sender, receiver, amount, false, false);
		tail++;

		if (msg.value > amount) { // return excess if too much money sent
			msg.sender.send(msg.value-amount);
		}
		return tail; // index id number of escrow
	}
	function releaseEscrow(uint idx) {
		Escrow e = escrows[idx];
		if (e.senderApprove && e.receiverApprove) {
			e.receiver.send(e.amount);
		}
	}
	// Signs escrow if function caller is the escrow sender or receiver. 
	function approve(uint idx) {
		Escrow e = escrows[idx];
		if (msg.sender == e.sender) {
			e.senderApprove = true;
		}
		if (msg.sender == e.receiver) {
			e.receiverApprove = true;
		}
	}
}