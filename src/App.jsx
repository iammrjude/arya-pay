import React, { useRef, useCallback } from 'react'
import { useFreighter } from './hooks/useFreighter'
import Header from './components/Header'
import ConnectPrompt from './components/ConnectPrompt'
import BalanceCard from './components/BalanceCard'
import SendPayment from './components/SendPayment'
import FundAccount from './components/FundAccount'
import styles from './App.module.css'

export default function App() {
  const { installed, connected, address, network, loading, error, connect, disconnect, signTransaction } = useFreighter()

  // Ref to trigger a balance refresh from the outside
  const refreshBalanceFn = useRef(null)

  const handleRefreshRequest = useCallback((fn) => {
    refreshBalanceFn.current = fn
  }, [])

  function triggerBalanceRefresh() {
    if (refreshBalanceFn.current) {
      refreshBalanceFn.current()
    }
  }

  return (
    <div className={styles.app}>
      <Header
        connected={connected}
        address={address}
        network={network}
        onConnect={connect}
        onDisconnect={disconnect}
        loading={loading}
      />

      <main className={styles.main}>
        {!connected ? (
          <ConnectPrompt
            onConnect={connect}
            loading={loading}
            error={error}
            installed={installed}
          />
        ) : (
          <div className={styles.dashboard}>
            <div className={styles.dashboardHeader}>
              <h2 className={styles.dashboardTitle}>Dashboard</h2>
              <span className={styles.dashboardNote}>
                All transactions are on Stellar Testnet
              </span>
            </div>

            <div className={styles.grid}>
              {/* Left column */}
              <div className={styles.leftCol}>
                <BalanceCard
                  address={address}
                  onRefreshRequest={handleRefreshRequest}
                />
                <FundAccount
                  address={address}
                  onFunded={triggerBalanceRefresh}
                />
              </div>

              {/* Right column */}
              <div className={styles.rightCol}>
                <SendPayment
                  fromAddress={address}
                  signTransaction={signTransaction}
                  onSuccess={triggerBalanceRefresh}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className={styles.footer}>
        <span>AryaPay</span>
        <span className={styles.footerDot}>·</span>
        <span>Built on Stellar Testnet</span>
        <span className={styles.footerDot}>·</span>
        <a
          href="https://stellar.org"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.footerLink}
        >
          stellar.org ↗
        </a>
      </footer>
    </div>
  )
}
