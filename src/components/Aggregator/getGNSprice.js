const Web3 = require('web3');

// Replace with your own Ethereum node's URL or use a service like Infura (https://infura.io/)
const providerUrl = 'https://polygon-mainnet.g.alchemy.com/v2/IQrTmmPJ7fpfEmZHxd6r-kFOCc0iQFun';
const web3 = new Web3(new Web3.providers.HttpProvider(providerUrl));

async function readFromContract(contractAddress, contractABI) {
  
  const contract = new web3.eth.Contract(contractABI, contractAddress);

  try {
    const result = await contract.methods.latestAnswer().call();
    return result;
  } catch (error) {
    console.error(`Error reading from contract: ${error.message}`);
    return null;
  }
}

export default readFromContract;
