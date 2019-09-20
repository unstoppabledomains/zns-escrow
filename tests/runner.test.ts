import {Value} from '@zilliqa-js/contract/src/types';
import {execSync} from 'child_process';
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'fs';
import {join} from 'path';

const node =
  '0x0000000000000000000000000000000000000000000000000000000000000000';
const seller = '0x1111111111111111111111111111111111111111';
const buyer = '0x2222222222222222222222222222222222222222';
const registry = '0x3333333333333333333333333333333333333333';
const thisAddress = '0x4444444444444444444444444444444444444444';
const address = '0x5555555555555555555555555555555555555555';
const price = '10';

const init = [
  {
    vname: '_scilla_version',
    type: 'Uint32',
    value: '0',
  },
  {
    vname: 'registry',
    type: 'ByStr20',
    value: registry,
  },
  {
    vname: 'seller',
    type: 'ByStr20',
    value: seller,
  },
  {
    vname: 'buyer',
    type: 'ByStr20',
    value: buyer,
  },
  {
    vname: 'escrowedNode',
    type: 'ByStr32',
    value: node,
  },
  {
    vname: 'price',
    type: 'Uint128',
    value: price,
  },
  {
    vname: '_this_address',
    type: 'ByStr20',
    value: thisAddress,
  },
  {
    vname: '_creation_block',
    type: 'BNum',
    value: '0',
  },
];

function createState({
  _balance = 0,
  sold = false,
  funderTmp = '0x0000000000000000000000000000000000000000',
} = {}) {
  return [
    {
      vname: '_balance',
      type: 'Uint128',
      value: _balance.toString(),
    },
    {
      vname: 'sold',
      type: 'Bool',
      value: {
        constructor: sold ? 'True' : 'False',
        argtypes: [],
        arguments: [],
      },
    },
    {
      vname: 'funderTmp',
      type: 'ByStr20',
      value: funderTmp,
    },
  ];
}

function scillaRun({
  init: initArr = init,
  state,
  message,
  blockchain = [{vname: 'BLOCKNUMBER', type: 'BNum', value: '1'}],
  gaslimit = 10000,
}: {
  init?: Value[] | never[];
  state?: Value[] | never[];
  message?: {
    _tag: string;
    _amount: string;
    _sender: string;
    params: Value[] | never[];
  };
  blockchain?: Value[];
  gaslimit?: number | string;
} = {}) {
  if (!existsSync('/tmp/zns-escrow')) {
    mkdirSync('/tmp/zns-escrow');
  }

  writeFileSync('/tmp/zns-escrow/init.json', JSON.stringify(initArr));
  if (state) {
    writeFileSync('/tmp/zns-escrow/state.json', JSON.stringify(state));
  }
  if (message) {
    writeFileSync('/tmp/zns-escrow/message.json', JSON.stringify(message));
  }
  writeFileSync('/tmp/zns-escrow/blockchain.json', JSON.stringify(blockchain));

  const result = execSync(`scilla-runner \
      -i ${join(__dirname, '../contracts/escrow.scilla')} \
      -init /tmp/zns-escrow/init.json \
      ${state ? '-istate /tmp/zns-escrow/state.json \\' : '\\'}
      ${message ? '-imessage /tmp/zns-escrow/message.json \\' : '\\'}
      -iblockchain /tmp/zns-escrow/blockchain.json \
      -o /tmp/zns-escrow/output.json \
      -gaslimit ${gaslimit} \
      -libdir ${join(__dirname, '../contracts/stdlib')}
  `);

  return JSON.parse(readFileSync('/tmp/zns-escrow/output.json', 'utf8'));
}

it('should deploy', () => {
  const output = scillaRun();

  expect(output.states).toEqual(createState());
});

it('should buy', () => {
  const message = {
    _tag: 'buy',
    _amount: '10',
    _sender: address,
    params: [],
  };

  const output = scillaRun({
    message,
    state: createState(),
  });

  expect(output._accepted).toBe('true');
  expect(output.states.find(v => v.vname === 'funderTmp').value).toBe(address);
  expect(output.message.params.find(v => v.vname === 'owner').value).toBe(
    buyer,
  );
  expect(output.message._recipient).toBe(registry);

  expect(output).toMatchSnapshot('buy_success');
});

it('should fail to buy with incorrect price', () => {
  const message = {
    _tag: 'buy',
    _amount: '1',
    _sender: address,
    params: [],
  };

  const output = scillaRun({
    message,
    state: createState(),
  });

  expect(output._accepted).toBe('false');
  expect(output.states.find(v => v.vname === 'funderTmp').value).toBe(
    '0x0000000000000000000000000000000000000000',
  );
  expect(output.message).toBeNull();

  expect(output).toMatchSnapshot('buy_failure');
});

it('should payout seller on transfer success', () => {
  const message = {
    _tag: 'onTransferSuccess',
    _amount: '0',
    _sender: registry,
    params: [
      {vname: 'owner', type: 'ByStr20', value: buyer},
      {vname: 'node', type: 'ByStr32', value: node},
    ],
  };

  const output = scillaRun({
    message,
    state: createState({
      _balance: Number(price),
      funderTmp: address,
    }),
  });

  expect(output._accepted).toBe('false');
  expect(output.states.find(v => v.vname === 'sold').value).toEqual({
    argtypes: [],
    arguments: [],
    constructor: 'True',
  });
  expect(output.states.find(v => v.vname === 'funderTmp').value).toBe(address);
  expect(output.message._recipient).toBe(seller);
  expect(output.message._amount).toBe(price);

  expect(output).toMatchSnapshot('onTransferSuccess_success');
});

it('should emit error event on transfer success if not registry', () => {
  const message = {
    _tag: 'onTransferSuccess',
    _amount: '0',
    _sender: address,
    params: [
      {vname: 'owner', type: 'ByStr20', value: buyer},
      {vname: 'node', type: 'ByStr32', value: node},
    ],
  };

  const output = scillaRun({
    message,
    state: createState(),
  });

  expect(output._accepted).toBe('false');
  expect(output.message).toBeNull();
  expect(output.events.find(e => e._eventname === 'Error')).toBeTruthy();

  expect(output).toMatchSnapshot('onTransferSuccess_failure');
});

it('should refund on transfer fail', () => {
  const message = {
    _tag: 'onTransferFailure',
    _amount: '0',
    _sender: registry,
    params: [
      {vname: 'owner', type: 'ByStr20', value: buyer},
      {vname: 'node', type: 'ByStr32', value: node},
    ],
  };

  const output = scillaRun({
    message,
    state: createState({
      _balance: Number(price),
      funderTmp: address,
    }),
  });

  expect(output._accepted).toBe('false');
  expect(output.message._recipient).toBe(address);
  expect(output.message._amount).toBe(price);

  expect(output).toMatchSnapshot('onTransferFailure_success');
});

it('should emit error event on transfer fail if not registry', () => {
  const message = {
    _tag: 'onTransferFailure',
    _amount: '0',
    _sender: address,
    params: [
      {vname: 'owner', type: 'ByStr20', value: buyer},
      {vname: 'node', type: 'ByStr32', value: node},
    ],
  };

  const output = scillaRun({
    message,
    state: createState(),
  });

  expect(output._accepted).toBe('false');
  expect(output.message).toBeNull();
  expect(output.events.find(e => e._eventname === 'Error')).toBeTruthy();

  expect(output).toMatchSnapshot('onTransferFailure_success');
});
