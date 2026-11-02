import { useEffect, useRef, useState } from "react";

// Anuncios de Adsterra. Cada anuncio va dentro de su propio iframe aislado (sandbox sin
// allow-same-origin): el codigo del anunciante no puede leer la sesion ni el resto de la pagina, y
// su document.write (que en una SPA ya cargada no funciona) escribe en su propio documento.
// Los clics se abren en otra pestana (allow-popups), nunca cambian la pagina del jugador.

const AD_HOST = "https://bicea.org";

export const BANNERS = {
  "728x90": { key: "bd51822346cd4b748a40dae49886ad7b", width: 728, height: 90 },
  "468x60": { key: "eb66cf2eac09229531643aef1b13dc38", width: 468, height: 60 },
  "320x50": { key: "47cb3a778f565e02899f95d8dcc596a0", width: 320, height: 50 },
  "300x250": { key: "14e887354f4774cda4e4c6ea1fdfae71", width: 300, height: 250 },
  "160x600": { key: "d015e336fa1265084eb2fd7653ad042d", width: 160, height: 600 },
  "160x300": { key: "e52393a6463198163d9843929b5175b0", width: 160, height: 300 },
};
const NATIVE_KEY = "e70a54965645f5b354edc7e47fcc359a";

const SANDBOX = "allow-scripts allow-popups allow-popups-to-escape-sandbox";
const BASE_STYLE = "<style>html,body{margin:0;padding:0;background:transparent;overflow:hidden}</style>";

function bannerDoc({ key, width, height }) {
  return `<!doctype html><html><head><meta charset="utf-8">${BASE_STYLE}</head><body>
<script>atOptions={'key':'${key}','format':'iframe','height':${height},'width':${width},'params':{}};</script>
<script src="${AD_HOST}/22/${key}"></script></body></html>`;
}

// El nativo no tiene alto fijo: el iframe le avisa su alto a la pagina para ajustarse.
function nativeDoc() {
  return `<!doctype html><html><head><meta charset="utf-8">${BASE_STYLE}</head><body>
<script async="async" data-cfasync="false" src="${AD_HOST}/21/${NATIVE_KEY}"></script>
<div id="container-${NATIVE_KEY}"></div>
<script>
  function report(){ parent.postMessage({ rgAdHeight: document.body.scrollHeight }, "*"); }
  new ResizeObserver(report).observe(document.body); setInterval(report, 2000);
</script></body></html>`;
}

/** Un banner de tamano fijo ("300x250", "728x90", ...). */
export function AdBanner({ size, className = "" }) {
  const unit = BANNERS[size];
  if (!unit) return null;
  return (
    <div className={`flex justify-center ${className}`}>
      <iframe
        title="Publicidad"
        sandbox={SANDBOX}
        srcDoc={bannerDoc(unit)}
        width={unit.width}
        height={unit.height}
        loading="lazy"
        scrolling="no"
        style={{ border: 0, maxWidth: "100%", display: "block" }}
      />
    </div>
  );
}

/** Franja horizontal que elige el tamano segun el ancho: 728x90 en PC, 468x60 en tablet, 320x50 en celular. */
export function AdLeaderboard({ className = "" }) {
  const [size, setSize] = useState(pickLeaderboard);
  useEffect(() => {
    const onResize = () => setSize(pickLeaderboard());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return <AdBanner key={size} size={size} className={className} />;
}

function pickLeaderboard() {
  const w = typeof window !== "undefined" ? window.innerWidth : 1024;
  if (w >= 1024) return "728x90";
  if (w >= 520) return "468x60";
  return "320x50";
}

/** Anuncio nativo (tarjetas con imagen y titulo que se integran al diseno). */
export function AdNative({ className = "" }) {
  const ref = useRef(null);
  const [height, setHeight] = useState(0);
  useEffect(() => {
    const onMessage = (e) => {
      if (e.source !== ref.current?.contentWindow) return;
      const h = Number(e.data?.rgAdHeight);
      if (Number.isFinite(h) && h > 0 && h < 2000) setHeight(h);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);
  return (
    <div className={className}>
      {height > 0 && <p className="text-[0.625rem] uppercase tracking-widest text-on-surface-variant/60 mb-1">Publicidad</p>}
      <iframe
        ref={ref}
        title="Publicidad"
        sandbox={SANDBOX}
        srcDoc={nativeDoc()}
        scrolling="no"
        style={{ border: 0, width: "100%", height: height || 1, display: "block" }}
      />
    </div>
  );
}
