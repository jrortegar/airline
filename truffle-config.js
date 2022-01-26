const HDWalletProvider = require('truffle-hdwallet-provider');
const mnemonic = 'all dilemma dog together arch stand ketchup embark bike curtain vacuum work';

module.exports = {
  networks: {
    development: {
      host: 'localhost',
      port: 7545,
      network_id: '*',
      gas: 5000000
    },
    goerli: {
      networkCheckTimeout: 10000, 
      provider: () => {
        return new HDWalletProvider(mnemonic, 'https://goerli.infura.io/v3/a50ea141d93144f6bd6e06ad8bd3d7ea')
      },
      network_id: '5',
      gas: 5000000
    },
  }
};