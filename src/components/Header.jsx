import React from 'react'
import { truncateAddress } from '../utils/stellar'
import styles from './Header.module.css'

export default function Header({ connected, address, network, onConnect, onDisconnect, loading }) {
  const isTestnet = network === 'TESTNET'

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <span className={styles.logoIcon}>◈</span>
        <span className={styles.logoText}>AryaPay</span>
        {connected && (
          <span className={`${styles.networkBadge} ${isTestnet ? styles.testnet : styles.mainnet}`}>
            {network || 'TESTNET'}
          </span>
        )}
      </div>

      <div className={styles.right}>
        {connected && address ? (
          <div className={styles.walletInfo}>
            <div className={styles.connectedDot} />
            <span className={styles.address} title={address}>
              {truncateAddress(address)}
            </span>
            <button
              className={styles.disconnectBtn}
              onClick={onDisconnect}
              title="Disconnect wallet"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            className={styles.connectBtn}
            onClick={onConnect}
            disabled={loading}
          >
            {loading ? (
              <span className={styles.spinner} />
            ) : (
              <>
                <span className={styles.connectIcon}>⬡</span>
                Connect Wallet
              </>
            )}
          </button>
        )}
      </div>
    </header>
  )
}
