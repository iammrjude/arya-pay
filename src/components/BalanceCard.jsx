import { useEffect, useState, useCallback } from 'react';
import { fetchBalance, truncateAddress } from '../utils/stellar';
import styles from './BalanceCard.module.css';
import { IoCopyOutline } from "react-icons/io5";
import { IoCheckmarkOutline } from "react-icons/io5";
import { LuRefreshCcw } from "react-icons/lu";

export default function BalanceCard({ address, onRefreshRequest }) {
  const [balance, setBalance] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastRefresh, setLastRefresh] = useState(null)
  const [copied, setCopied] = useState(false)

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadBalance = useCallback(async () => {
    if (!address) return
    setLoading(true)
    setError(null)
    const result = await fetchBalance(address)
    if (result.error) {
      setError(result.error)
      setBalance(null)
    } else {
      setBalance(result.balance)
    }
    setLoading(false)
    setLastRefresh(new Date())
  }, [address])

  useEffect(() => {
    loadBalance()
  }, [loadBalance])

  // Expose refresh to parent via callback
  useEffect(() => {
    if (onRefreshRequest) {
      onRefreshRequest(loadBalance)
    }
  }, [loadBalance, onRefreshRequest])

  const [whole, decimal] = balance ? balance.split('.') : ['-', '0000000']

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.label}>XLM Balance</div>
        <button
          className={styles.refreshBtn}
          onClick={loadBalance}
          disabled={loading}
          title="Refresh balance"
        >
          <span className={`${styles.refreshIcon} ${loading ? styles.spinning : ''}`}>
            <LuRefreshCcw size={12} />
          </span>
        </button>
      </div>

      <div className={styles.balanceRow}>
        {loading ? (
          <div className={styles.skeleton} />
        ) : error ? (
          <div className={styles.error}>{error}</div>
        ) : (
          <div className={styles.balance}>
            <span className={styles.whole}>{whole}</span>
            <span className={styles.decimal}>.{decimal}</span>
            <span className={styles.currency}>XLM</span>
          </div>
        )}
      </div>

      <div className={styles.cardFooter}>
        <span className={styles.addressLabel}>Address</span>
        <span className={styles.address} title={address}>
          {truncateAddress(address, 8, 8)}
        </span>
        <button
          className={styles.copyBtn}
          onClick={copyAddress}
          title="Copy address"
        >
          {copied ? (
            <IoCheckmarkOutline />
          ) : (
            <IoCopyOutline />
          )}
        </button>
      </div>

      {lastRefresh && (
        <div className={styles.timestamp}>
          Updated {lastRefresh.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}
