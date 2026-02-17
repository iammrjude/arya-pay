import { useState, useEffect, useCallback } from 'react'
import {
  isConnected,
  isAllowed,
  requestAccess,
  getAddress,
  getNetwork,
  signTransaction,
} from '@stellar/freighter-api'

export function useFreighter() {
  const [walletState, setWalletState] = useState({
    installed: false,
    connected: false,
    address: null,
    network: null,
    loading: true,
    error: null,
  })

  const checkWallet = useCallback(async () => {
    try {
      const installed = await isConnected()
      if (!installed?.isConnected) {
        setWalletState(s => ({ ...s, installed: false, loading: false }))
        return
      }

      const allowed = await isAllowed()
      if (!allowed?.isAllowed) {
        setWalletState(s => ({ ...s, installed: true, connected: false, loading: false }))
        return
      }

      const addressResult = await getAddress()
      const networkResult = await getNetwork()

      setWalletState({
        installed: true,
        connected: !!addressResult?.address,
        address: addressResult?.address || null,
        network: networkResult?.network || null,
        loading: false,
        error: null,
      })
    } catch (err) {
      setWalletState(s => ({ ...s, loading: false, error: err.message }))
    }
  }, [])

  useEffect(() => {
    checkWallet()
  }, [checkWallet])

  const connect = useCallback(async () => {
    setWalletState(s => ({ ...s, loading: true, error: null }))
    try {
      const installed = await isConnected()
      if (!installed?.isConnected) {
        throw new Error('Freighter wallet is not installed. Please install it from freighter.app')
      }

      await requestAccess()
      await checkWallet()
    } catch (err) {
      setWalletState(s => ({
        ...s,
        loading: false,
        error: err.message || 'Failed to connect wallet',
      }))
    }
  }, [checkWallet])

  const disconnect = useCallback(() => {
    setWalletState(s => ({
      ...s,
      connected: false,
      address: null,
      network: null,
      error: null,
    }))
  }, [])

  return {
    ...walletState,
    connect,
    disconnect,
    signTransaction,
    refresh: checkWallet,
  }
}
