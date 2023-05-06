import Web3 from "web3";
import { useState, useEffect } from 'react';



import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import { defillamaReferrerAddress } from '../constants';
import { sendTx } from '../utils/sendTx';
import GNSAbi from "../contractABI/GNSPriceABI";

export const chainToId = {
	ethereum: 'https://api.0x.org/',
	bsc: 'https://bsc.api.0x.org/',
	polygon: 'https://polygon.api.0x.org/',
	optimism: 'https://optimism.api.0x.org/',
	arbitrum: 'https://arbitrum.api.0x.org/',
	avax: 'https://avalanche.api.0x.org/',
	fantom: 'https://fantom.api.0x.org/',
	celo: 'https://celo.api.0x.org/'
};

export const name = 'GNS';


export function approvalAddress() {
	// https://docs.0x.org/0x-api-swap/guides/swap-tokens-with-0x-api
	return '0xdef1c0ded9bec7f1a1670819833240f027b25eff';
}

const nativeToken = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';


const assetPairAddress = [
    {
      contractAddress: '0xc907E116054Ad103354f2D350FD2514433D57F6f',  
      asset: 'BTC/USD'
    },
    {
     contractAddress: '0xF9680D99D6C9589e2a93a78A04A279e509205945',
     asset: 'ETH/USD'
   },
   {
     contractAddress: '0xF9680D99D6C9589e2a93a78A04A279e509205945',
     asset: 'LINK/USD'
   },
   {
     contractAddress: '0xdf0Fb4e4F928d2dCB76f438575fDD8682386e13C',
     asset: 'UNI/USD'
   }
 ]

 const useReadDataFromContract = async () => {
        if (window.ethereum) {
          const web3 = new Web3((window as any).ethereum);
          const contract = new web3.eth.Contract(GNSAbi, assetPairAddress[0].contractAddress);
          // Change accounts[0] to the desired address from which you want to call the read-only function
          const accounts = await web3.eth.getAccounts();
          const result = await contract.methods.getData().call({ from: accounts[0] });
          return JSON.parse(result);
		}
  };

  export async function getQuote(chain: string, from: string, to: string, amount: string, extra) {
	// amount should include decimals

	const data = await useReadDataFromContract().then((r) => r.json());


	return {
		amountReturned: data || 0,
		estimatedGas: 0,
		tokenApprovalAddress: 0,
		rawQuote: 0,
		logo: 'https://www.gitbook.com/cdn-cgi/image/width=40,height=40,fit=contain,dpr=2,format=auto/https%3A%2F%2F1690203644-files.gitbook.io%2F~%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FKX9pG8rH3DbKDOvV7di7%252Ficon%252F1nKfBhLbPxd2KuXchHET%252F0x%2520logo.png%3Falt%3Dmedia%26token%3D25a85a3e-7f72-47ea-a8b2-e28c0d24074b'
	};
}



// 1. match getQuote and then return data price in amountReturned 
// 2. sent data of which pair to fetch
// 3. make sure data display is correct