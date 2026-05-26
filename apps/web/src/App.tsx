import { useEffect, useState } from "react";

import { fetchDbHealth, fetchHealth, getApiUrl } from "./lib/api";
import "./App.css";

type Status = "loading" | "ok" | "error";

export function App() {
  const [apiStatus, setApiStatus] = useState<Status>("loading");
  const [dbStatus, setDbStatus] = useState<Status>("loading");
  const [version, setVersion] = useState<string>("—");

  useEffect(() => {
    fetchHealth()
      .then((data) => {
        setApiStatus("ok");
        setVersion(data.version);
      })
      .catch(() => setApiStatus("error"));

    fetchDbHealth()
      .then(() => setDbStatus("ok"))
      .catch(() => setDbStatus("error"));
  }, []);

  return (
    <main className="shell">
      <header className="hero">
        <p className="eyebrow">Snippetfy v2</p>
        <h1>Biblioteca de snippets</h1>
        <p className="subtitle">
          Fase 0 — monorepo SPA + API. Legado permanece em{" "}
          <code>legacy-app/</code>, isolado.
        </p>
      </header>

      <section className="status-grid">
        <article className="status-card">
          <span className="label">API</span>
          <strong className={apiStatus}>{statusLabel(apiStatus)}</strong>
          <code>{getApiUrl()}/health</code>
        </article>

        <article className="status-card">
          <span className="label">PostgreSQL</span>
          <strong className={dbStatus}>{statusLabel(dbStatus)}</strong>
          <code>{getApiUrl()}/health/db</code>
        </article>

        <article className="status-card">
          <span className="label">Versão</span>
          <strong className="ok">{version}</strong>
          <code>@snippetfy/shared schemas prontos</code>
        </article>
      </section>

      <footer className="footer">
        Próximo passo: Fase 1 — autenticação (JWT + telas de login)
      </footer>
    </main>
  );
}

function statusLabel(status: Status) {
  if (status === "loading") return "Verificando…";
  if (status === "ok") return "Online";
  return "Offline";
}
