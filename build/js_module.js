'use strict';

// For geth
if (typeof dapple === 'undefined') {
  var dapple = {};
}

if (typeof web3 === 'undefined' && typeof Web3 === 'undefined') {
  var Web3 = require('web3');
}

dapple['escrow'] = (function builder () {
  var environments = {};

  function ContractWrapper (headers, _web3) {
    if (!_web3) {
      throw new Error('Must supply a Web3 connection!');
    }

    this.headers = headers;
    this._class = _web3.eth.contract(headers.interface);
  }

  ContractWrapper.prototype.deploy = function () {
    var args = new Array(arguments);
    args[args.length - 1].data = this.headers.bytecode;
    return this._class.new.apply(this._class, args);
  };

  var passthroughs = ['at', 'new'];
  for (var i = 0; i < passthroughs.length; i += 1) {
    ContractWrapper.prototype[passthroughs[i]] = (function (passthrough) {
      return function () {
        return this._class[passthrough].apply(this._class, arguments);
      };
    })(passthroughs[i]);
  }

  function constructor (_web3, env) {
    if (!env) {
      env = {};
    }
    while (typeof env !== 'object') {
      if (!(env in environments)) {
        throw new Error('Cannot resolve environment name: ' + env);
      }
      env = environments[env];
    }

    if (typeof _web3 === 'undefined') {
      if (!env.rpcURL) {
        throw new Error('Need either a Web3 instance or an RPC URL!');
      }
      _web3 = new Web3(new Web3.providers.HttpProvider(env.rpcURL));
    }

    this.headers = {
      'Contract': {
        'interface': [
          {
            'inputs': [],
            'type': 'constructor'
          }
        ],
        'bytecode': '60606040525b6000600090505b50600a8060196000396000f360606040526008565b00'
      },
      'EscrowMaker': {
        'interface': [
          {
            'constant': false,
            'inputs': [
              {
                'name': 'receiver',
                'type': 'address'
              },
              {
                'name': 'amount',
                'type': 'uint256'
              }
            ],
            'name': 'makeEscrow',
            'outputs': [
              {
                'name': 'id',
                'type': 'uint256'
              }
            ],
            'type': 'function'
          },
          {
            'constant': false,
            'inputs': [
              {
                'name': 'idx',
                'type': 'uint256'
              }
            ],
            'name': 'approve',
            'outputs': [],
            'type': 'function'
          },
          {
            'constant': false,
            'inputs': [
              {
                'name': 'idx',
                'type': 'uint256'
              }
            ],
            'name': 'releaseEscrow',
            'outputs': [],
            'type': 'function'
          },
          {
            'inputs': [],
            'type': 'constructor'
          }
        ],
        'bytecode': '60606040525b60006001600050819055505b6104158061001f6000396000f360606040526000357c010000000000000000000000000000000000000000000000000000000090048063640886901461004f578063b759f95414610084578063ed6531641461009c5761004d565b005b61006e60048080359060200190919080359060200190919050506100b4565b6040518082815260200191505060405180910390f35b61009a6004808035906020019091905050610249565b005b6100b2600480803590602001909190505061035b565b005b600081803410156100c457610002565b60016000505460016001600050540110156100de57610002565b60a0604051908101604052803381526020018581526020018481526020016000815260200160008152602001506000600050600160016000505401815481101561000257906000526020600020906004020160005b5060008201518160000160006101000a81548173ffffffffffffffffffffffffffffffffffffffff0219169083021790555060208201518160010160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908302179055506040820151816002016000505560608201518160030160006101000a81548160ff0219169083021790555060808201518160030160016101000a81548160ff0219169083021790555090505060016000818150548092919060010191905055506001600050549150506102435680341115610241573373ffffffffffffffffffffffffffffffffffffffff166000348303604051809050600060405180830381858888f19350505050505b505b92915050565b6000600060005082815481101561000257906000526020600020906004020160005b5090508060000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614156102e25760018160030160006101000a81548160ff021916908302179055505b8060010160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614156103565760018160030160016101000a81548160ff021916908302179055505b5b5050565b6000600060005082815481101561000257906000526020600020906004020160005b5090508060030160009054906101000a900460ff1680156103ac57508060030160019054906101000a900460ff165b15610410578060010160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1660008260020160005054604051809050600060405180830381858888f19350505050505b5b505056'
      }
    };

    this.classes = {};
    for (var key in this.headers) {
      this.classes[key] = new ContractWrapper(this.headers[key], _web3);
    }

    this.objects = {};
    for (var i in env.objects) {
      var obj = env.objects[i];
      this.objects[i] = this.classes[obj['class']].at(obj.address);
    }
  }

  return {
    class: constructor,
    environments: environments
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = dapple['escrow'];
}
