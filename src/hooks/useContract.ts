import { createWalletClient, custom, createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

declare let window: any;

export const walletClient = typeof window !== 'undefined' ? createWalletClient({
  chain: mainnet,
  transport:  custom(window.ethereum)
}) : null

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http()
})