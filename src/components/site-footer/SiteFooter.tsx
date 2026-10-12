import styles from "./SiteFooter.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer} id="site-footer">
      <div className={styles.inner}>
        <div className={styles.brand}>
          <div className={styles.brandRow}>
            <span className={styles.logoDot} aria-hidden="true" />
            <span className={styles.brandName}>Futemax</span>
          </div>
          <p className={styles.tagline}>
            Acompanhe futebol ao vivo do Flamengo, Palmeiras e dos principais
            campeonatos do Brasil e do mundo — em um só lugar, com horários,
            estádios e canais de TV atualizados.
          </p>
        </div>
        
      </div>
      <div className={styles.bottom}>
        <p className={styles.copyright}>
          © 2026 Futemax — Todos os direitos reservados.
        </p>
        <p className={styles.disclaimer}>
          Conteúdo informativo. Não hospedamos transmissões.
        </p>
      </div>
    </footer>
  );
}
