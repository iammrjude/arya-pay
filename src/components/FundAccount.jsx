import { useState } from 'react';
import { fundWithFriendbot } from '../utils/stellar';
import styles from './FundAccount.module.css';

export default function FundAccount({ address, onFunded }) {
  const [status, setStatus] = useState(null) // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('')

  async function handleFund() {
    setStatus('loading')
    setMessage('')
    const result = await fundWithFriendbot(address)
    if (result.success) {
      setStatus('success')
      setMessage('Account funded! You received 10,000 XLM on testnet.')
      if (onFunded) onFunded()
    } else {
      setStatus('error')
      setMessage(result.error || 'Friendbot funding failed.')
    }
  }

  return (
    <div className={styles.banner}>
      <div className={styles.bannerLeft}>
        <span className={styles.bannerIcon}>🚰</span>
        <div>
          <div className={styles.bannerTitle}>Fund Testnet Account</div>
          <div className={styles.bannerDesc}>
            Use Friendbot to receive 10,000 XLM for testing
          </div>
        </div>
      </div>
      <button
        className={styles.fundBtn}
        onClick={handleFund}
        disabled={status === 'loading' || status === 'success'}
      >
        {status === 'loading' ? (
          <span className={styles.spinner} />
        ) : status === 'success' ? (
          '✓ Funded'
        ) : (
          'Fund Account'
        )}
      </button>

      {message && (
        <div className={`${styles.msg} ${status === 'success' ? styles.successMsg : styles.errorMsg}`}>
          {message}
        </div>
      )}
    </div>
  );
}
