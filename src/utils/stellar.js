import * as StellarSdk from '@stellar/stellar-sdk'

const TESTNET_URL = 'https://horizon-testnet.stellar.org'
const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET

export const server = new StellarSdk.Horizon.Server(TESTNET_URL)

/**
 * Fetch the XLM balance for a given Stellar address
 */
export async function fetchBalance(address) {
  try {
    const account = await server.loadAccount(address)
    const nativeBalance = account.balances.find(b => b.asset_type === 'native')
    return {
      balance: nativeBalance ? parseFloat(nativeBalance.balance).toFixed(7) : '0.0000000',
      error: null,
    }
  } catch (err) {
    if (err.response?.status === 404) {
      return { balance: null, error: 'Account not found on testnet. Fund it at friendbot first.' }
    }
    return { balance: null, error: err.message }
  }
}

/**
 * Build, sign, and submit an XLM payment transaction
 */
export async function sendPayment({ fromAddress, toAddress, amount, signTransaction, memo }) {
  try {
    // Validate destination
    if (!StellarSdk.StrKey.isValidEd25519PublicKey(toAddress)) {
      throw new Error('Invalid destination address.')
    }

    // Validate amount
    const parsedAmount = parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      throw new Error('Amount must be a positive number.')
    }

    // Check if destination account exists; if not, use createAccount
    let destinationExists = true
    try {
      await server.loadAccount(toAddress)
    } catch (e) {
      if (e.response?.status === 404) {
        destinationExists = false
      } else {
        throw e
      }
    }

    // If destination doesn't exist, minimum is 1 XLM (to meet base reserve)
    if (!destinationExists && parsedAmount < 1) {
      throw new Error('Destination account does not exist. Minimum 1 XLM required to create it.')
    }

    // Load sender account
    const sourceAccount = await server.loadAccount(fromAddress)

    // Build transaction
    const txBuilder = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    }).setTimeout(180)

    if (destinationExists) {
      txBuilder.addOperation(
        StellarSdk.Operation.payment({
          destination: toAddress,
          asset: StellarSdk.Asset.native(),
          amount: parsedAmount.toFixed(7),
        })
      )
    } else {
      txBuilder.addOperation(
        StellarSdk.Operation.createAccount({
          destination: toAddress,
          startingBalance: parsedAmount.toFixed(7),
        })
      )
    }

    // Optional memo
    if (memo && memo.trim()) {
      txBuilder.addMemo(StellarSdk.Memo.text(memo.trim().slice(0, 28)))
    }

    const transaction = txBuilder.build()
    const xdr = transaction.toXDR()

    // Sign via Freighter
    const { signedTxXdr, error: signError } = await signTransaction(xdr, {
      networkPassphrase: NETWORK_PASSPHRASE,
    })

    if (signError) {
      throw new Error(signError)
    }

    // Submit
    const signedTx = StellarSdk.TransactionBuilder.fromXDR(signedTxXdr, NETWORK_PASSPHRASE)
    const result = await server.submitTransaction(signedTx)

    return {
      success: true,
      hash: result.hash,
      ledger: result.ledger,
      createdAccount: !destinationExists,
      error: null,
    }
  } catch (err) {
    // Parse Horizon error extras
    let message = err.message || 'Transaction failed.'
    if (err.response?.data?.extras?.result_codes) {
      const codes = err.response.data.extras.result_codes
      message = formatResultCode(codes)
    }
    return { success: false, hash: null, error: message }
  }
}

function formatResultCode(codes) {
  const map = {
    'tx_insufficient_balance': 'Insufficient balance for this transaction (including fees).',
    'op_underfunded': 'Insufficient balance.',
    'op_no_destination': 'Destination account does not exist.',
    'op_low_reserve': 'Destination account needs at least 1 XLM to be created.',
    'tx_bad_seq': 'Sequence number mismatch. Please retry.',
    'tx_failed': 'Transaction failed.',
  }
  const opCode = codes?.operations?.[0] || codes?.transaction
  return map[opCode] || `Transaction error: ${opCode || JSON.stringify(codes)}`
}

export function explorerUrl(hash) {
  return `https://stellar.expert/explorer/testnet/tx/${hash}`
}

export function friendbotUrl(address) {
  return `https://friendbot.stellar.org?addr=${encodeURIComponent(address)}`
}

export async function fundWithFriendbot(address) {
  try {
    const res = await fetch(friendbotUrl(address))
    if (!res.ok) {
      const body = await res.json()
      if (body?.detail?.includes('createAccountAlreadyExist')) {
        return { success: false, error: 'Account already funded.' }
      }
      throw new Error(body?.detail || 'Friendbot request failed')
    }
    return { success: true, error: null }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

export function truncateAddress(addr, start = 6, end = 6) {
  if (!addr) return ''
  return `${addr.slice(0, start)}...${addr.slice(-end)}`
}
