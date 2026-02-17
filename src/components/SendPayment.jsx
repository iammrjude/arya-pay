import React, { useState } from 'react'
import { sendPayment, explorerUrl } from '../utils/stellar'
import styles from './SendPayment.module.css'

const INITIAL_FORM = { destination: '', amount: '', memo: '' }

export default function SendPayment({ fromAddress, signTransaction, onSuccess }) {
  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState(null) // 'sending' | 'success' | 'error'
  const [txResult, setTxResult] = useState(null)

  function handleChange(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    setErrors(errs => ({ ...errs, [name]: null }))
  }

  function validate() {
    const newErrors = {}
    if (!form.destination.trim()) {
      newErrors.destination = 'Destination address is required.'
    } else if (form.destination.trim() === fromAddress) {
      newErrors.destination = 'Cannot send to your own address.'
    }
    if (!form.amount.trim()) {
      newErrors.amount = 'Amount is required.'
    } else if (isNaN(parseFloat(form.amount)) || parseFloat(form.amount) <= 0) {
      newErrors.amount = 'Enter a valid positive amount.'
    }
    return newErrors
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    setStatus('sending')
    setTxResult(null)

    const result = await sendPayment({
      fromAddress,
      toAddress: form.destination.trim(),
      amount: form.amount.trim(),
      memo: form.memo.trim(),
      signTransaction,
    })

    if (result.success) {
      setStatus('success')
      setTxResult(result)
      setForm(INITIAL_FORM)
      if (onSuccess) onSuccess()
    } else {
      setStatus('error')
      setTxResult(result)
    }
  }

  function handleReset() {
    setStatus(null)
    setTxResult(null)
    setErrors({})
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.title}>Send XLM</h2>
        <span className={styles.network}>TESTNET</span>
      </div>

      {/* Success State */}
      {status === 'success' && txResult && (
        <div className={`${styles.resultBox} ${styles.successBox}`}>
          <div className={styles.resultIcon}>✓</div>
          <div className={styles.resultContent}>
            <div className={styles.resultTitle}>
              Transaction Confirmed
              {txResult.createdAccount && (
                <span className={styles.tag}>Account Created</span>
              )}
            </div>
            <div className={styles.hashRow}>
              <span className={styles.hashLabel}>TX Hash</span>
              <span className={styles.hash}>{txResult.hash}</span>
            </div>
            {txResult.ledger && (
              <div className={styles.hashRow}>
                <span className={styles.hashLabel}>Ledger</span>
                <span className={styles.hashValue}>#{txResult.ledger}</span>
              </div>
            )}
            <div className={styles.resultActions}>
              <a
                href={explorerUrl(txResult.hash)}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.explorerLink}
              >
                View on Stellar.Expert ↗
              </a>
              <button className={styles.sendAgainBtn} onClick={handleReset}>
                Send Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {status === 'error' && txResult && (
        <div className={`${styles.resultBox} ${styles.errorBox}`}>
          <div className={styles.resultIcon}>✕</div>
          <div className={styles.resultContent}>
            <div className={styles.resultTitle}>Transaction Failed</div>
            <div className={styles.errorMessage}>{txResult.error}</div>
            <button className={styles.retryBtn} onClick={handleReset}>
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Form */}
      {status !== 'success' && (
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="destination">
              Destination Address
            </label>
            <div className={`${styles.inputWrap} ${errors.destination ? styles.hasError : ''}`}>
              <input
                id="destination"
                name="destination"
                type="text"
                className={styles.input}
                placeholder="G..."
                value={form.destination}
                onChange={handleChange}
                disabled={status === 'sending'}
                autoComplete="off"
                spellCheck={false}
              />
              {form.destination && !errors.destination && (
                <span className={styles.inputCheck}>✓</span>
              )}
            </div>
            {errors.destination && (
              <span className={styles.fieldError}>{errors.destination}</span>
            )}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="amount">
              Amount
            </label>
            <div className={`${styles.inputWrap} ${errors.amount ? styles.hasError : ''}`}>
              <input
                id="amount"
                name="amount"
                type="number"
                className={`${styles.input} ${styles.amountInput}`}
                placeholder="0.0000000"
                value={form.amount}
                onChange={handleChange}
                disabled={status === 'sending'}
                min="0"
                step="any"
              />
              <span className={styles.inputSuffix}>XLM</span>
            </div>
            {errors.amount && (
              <span className={styles.fieldError}>{errors.amount}</span>
            )}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="memo">
              Memo <span className={styles.optional}>(optional, max 28 chars)</span>
            </label>
            <input
              id="memo"
              name="memo"
              type="text"
              className={styles.input}
              placeholder="What's this for?"
              value={form.memo}
              onChange={handleChange}
              disabled={status === 'sending'}
              maxLength={28}
            />
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={status === 'sending'}
          >
            {status === 'sending' ? (
              <>
                <span className={styles.spinner} />
                Sending...
              </>
            ) : (
              <>
                <span>Send XLM</span>
                <span className={styles.btnArrow}>→</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* Warning */}
      <p className={styles.warning}>
        ⚠ This sends real testnet transactions. Always verify addresses before sending.
      </p>
    </div>
  )
}
