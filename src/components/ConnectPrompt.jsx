import styles from './ConnectPrompt.module.css';

export default function ConnectPrompt({ onConnect, loading, error, installed }) {
  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <div className={styles.orb} />
        <div className={styles.orbOuter} />

        <div className={styles.icon}>◈</div>
        <h1 className={styles.title}>AryaPay</h1>
        <p className={styles.subtitle}>
          Send XLM instantly on the Stellar testnet.
          <br />
          Connect your Freighter wallet to get started.
        </p>

        {!installed && (
          <div className={styles.installNote}>
            <span className={styles.installIcon}>⬡</span>
            Freighter wallet not detected.{' '}
            <a
              href="https://www.freighter.app"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.installLink}
            >
              Install Freighter ↗
            </a>
          </div>
        )}

        <button
          className={styles.connectBtn}
          onClick={onConnect}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className={styles.spinner} />
              Connecting...
            </>
          ) : (
            <>
              Connect Freighter Wallet
              <span className={styles.btnArrow}>→</span>
            </>
          )}
        </button>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.features}>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>◈</span>
            <span>Connect wallet</span>
          </div>
          <div className={styles.featureDivider}>—</div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>◎</span>
            <span>View balance</span>
          </div>
          <div className={styles.featureDivider}>—</div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>⟶</span>
            <span>Send XLM</span>
          </div>
        </div>
      </div>
    </div>
  );
}
