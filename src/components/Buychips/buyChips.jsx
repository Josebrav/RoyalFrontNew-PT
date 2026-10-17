import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import API_URL from '../../api/rutaApi';
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import Swal from "sweetalert2";
import { useNavigate, useSearchParams } from "react-router-dom";
import RankBadge from "../ui/RankBadge/rankBadge";
import { getNextRank } from "../../utils/rank";

// Import local image assets representing chip packages
import quinientosmil from "../../assets/500000.jpg";
import millon from "../../assets/millon.jpg";
import cincomillones from "../../assets/5millones.jpg";
import quincemillones from "../../assets/15millones.jpg";
import cincuentamillones from "../../assets/50millones.jpg";
import doscincuenta from "../../assets/250millones.jpg";
import billon from "../../assets/1billon.jpg";
import veinticeisb from "../../assets/26billones.jpg";
import { useAuth } from "../../context/oauthContext";
import { PayPalLogo, MercadoPagoLogo } from "../ui/PaymentLogos";

// País desde el que se paga (elegible en la página, no hace falta tenerlo en el perfil). Mercado
// Pago tiene una cuenta vendedora por país y cada una solo cobra en su moneda; PayPal cobra en EUR
// en España y en USD en el resto. Las tasas son las mismas que MERCADOPAGO_COUNTRY_CONFIG en el
// backend (payments.service.ts), que es quien decide el precio real: si cambiás una, cambiá la otra.
const PAYMENT_REGIONS = {
  ar: { label: "Argentina", mercadoPago: { country: "ar", currency: "ARS", rate: 1000, symbol: "$" }, paypalCurrency: "USD" },
  co: { label: "Colombia", mercadoPago: { country: "co", currency: "COP", rate: 5200, symbol: "$" }, paypalCurrency: "USD" },
  mx: { label: "México", mercadoPago: { country: "mx", currency: "MXN", rate: 20, symbol: "$" }, paypalCurrency: "USD" },
  es: { label: "España", mercadoPago: null, paypalCurrency: "EUR" },
  other: { label: "Otro país", mercadoPago: null, paypalCurrency: "USD" },
};
const REGION_ORDER = ["ar", "co", "mx", "es", "other"];

const PAYPAL_SYMBOLS = { USD: "US$", EUR: "€" };

// "Fichas base" de la promo: lo que da la tasa de siempre (500.000 fichas por dólar o euro, 500 por
// peso). Cada paquete muestra su bonus (+X%) y el total que recibe, que es lo que se acredita.
const BASE_CHIPS_PER_UNIT = { USD: 500_000, EUR: 500_000, ARS: 500 };

const MEXICO_TIMEZONES = new Set([
  "America/Mexico_City", "America/Cancun", "America/Merida", "America/Monterrey", "America/Matamoros",
  "America/Chihuahua", "America/Ciudad_Juarez", "America/Ojinaga", "America/Mazatlan",
  "America/Bahia_Banderas", "America/Hermosillo", "America/Tijuana",
]);

// Desde dónde se conecta el usuario, por la zona horaria del dispositivo: no manda la IP a ningún
// servicio externo y distingue bien los países que nos importan (cada uno tiene zonas propias).
function detectRegionFromConnection() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if (tz.startsWith("America/Argentina/") || tz === "America/Buenos_Aires") return "ar";
    if (tz === "America/Bogota") return "co";
    if (MEXICO_TIMEZONES.has(tz)) return "mx";
    if (tz === "Europe/Madrid" || tz === "Atlantic/Canary" || tz === "Africa/Ceuta") return "es";
  } catch {
    // Sin Intl: se cae al país del perfil.
  }
  return null;
}

function regionFromProfileCountry(country) {
  const normalized = (country || "").trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  return { argentina: "ar", colombia: "co", mexico: "mx", espana: "es", spain: "es" }[normalized] || null;
}

// Client id de PayPal: tiene que ser del mismo entorno (sandbox o live) que PAYPAL_MODE
// en el backend. Sin él no se muestra PayPal, en vez de caer a un id fijo de otro entorno.
const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;

// Paquetes de fichas por moneda, solo para mostrar. El backend tiene el catálogo real
// (RoyalGamesBackend/src/modules/payments/chip-packages.ts) y decide fichas y precio a partir del
// `id`: si cambiás algo acá, cambialo también allá. USD: PayPal en dólares y Mercado Pago
// Colombia/México (convertido a su moneda). EUR: PayPal España. ARS: Mercado Pago Argentina.
// Cada imagen trae dibujada su cantidad de fichas: se muestra solo en el paquete cuyas fichas base
// coinciden exacto con ese número. Los demás quedan sin imagen hasta que haya una con su número.
const IMAGE_BY_BASE_CHIPS = {
  500_000: quinientosmil,
  1_000_000: millon,
  5_000_000: cincomillones,
  15_000_000: quincemillones,
  50_000_000: cincuentamillones,
  250_000_000: doscincuenta,
  1_000_000_000: billon,
  2_600_000_000: veinticeisb,
};
const tiers = (currency, firstId, rows) =>
  rows.map(([price, chips], i) => ({ id: firstId + i, currency, price, chips }));
// Paquete de prueba para verificar pagos reales sin gastar casi nada: solo PayPal (el backend lo
// rechaza en Mercado Pago).
const testPackage = (id, currency) => ({ id, currency, price: 0.1, chips: 29, testOnly: true });

const CHIP_CATALOG = {
  USD: [
    ...tiers("USD", 101, [[1, 2_500_000], [5, 15_000_000], [10, 40_000_000], [50, 250_000_000],
      [100, 600_000_000], [200, 1_500_000_000], [500, 7_500_000_000], [1000, 20_000_000_000]]),
    testPackage(901, "USD"),
  ],
  EUR: [
    ...tiers("EUR", 201, [[1, 3_000_000], [5, 20_000_000], [10, 50_000_000], [50, 300_000_000],
      [100, 750_000_000], [200, 2_000_000_000], [500, 10_000_000_000], [1000, 25_000_000_000]]),
    testPackage(902, "EUR"),
  ],
  ARS: tiers("ARS", 301, [[100, 100_000], [500, 750_000], [1_000, 2_500_000], [5_000, 15_000_000],
    [10_000, 50_000_000], [100_000, 750_000_000], [500_000, 5_000_000_000], [1_000_000, 15_000_000_000]]),
};

// Porcentaje de bonus: cuánto más que las fichas base da el paquete.
const baseChipsOf = (chip) => chip.price * BASE_CHIPS_PER_UNIT[chip.currency];
const promoPercentOf = (chip) => Math.round((chip.chips / baseChipsOf(chip) - 1) * 100);

// Mismos tipos que puede devolver ChipsService.getHistory (backend) — usado tanto para las
// opciones del filtro como (junto con el signo de item.chips) para el ícono/color de cada fila.
const HISTORY_TYPE_LABELS = {
  deposit: "Depósito",
  welcome: "Bono de Bienvenida",
  admin_adjustment: "Ajuste Administrativo",
  referral: "Bono de Referido",
  prize: "Premio",
  gift_sent: "Regalo Enviado",
  gift_received: "Regalo Recibido",
};

export default function BuyChips() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [searchParams] = useSearchParams();
  const { currentUser } = useSelector((state) => state);
  const userCountry = currentUser?.country || null;
  const totalChipsDeposited = Number(currentUser?.totalChipsDeposited || 0);
  const nextRank = getNextRank(currentUser?.rank);
  const rankProgressPercentage = nextRank
    ? Math.min(Math.round((totalChipsDeposited / nextRank.threshold) * 100), 100)
    : 100;
  const [selectedChip, setSelectedChip] = useState(CHIP_CATALOG.USD[0]);
  
  // Navigation tabs state: "deposit", "history"
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") === "history" ? "history" : "deposit");
  
  // Active payment method: "paypal" o "mercadopago". Tarjeta y cripto se sacaron porque
  // eran simuladas (no cobraban nada); vuelven cuando haya una pasarela real detrás.
  const [paymentMethod, setPaymentMethod] = useState("paypal");

  // Real payment history from database
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyTypeFilter, setHistoryTypeFilter] = useState("all");

  // País de pago: el que elija el usuario en la página; si no eligió, desde dónde se conecta; si no
  // se puede detectar, el de su perfil; y si tampoco hay, "Otro país" (PayPal en dólares).
  const [detectedRegion] = useState(detectRegionFromConnection);
  const [chosenRegion, setChosenRegion] = useState(null);
  const region = chosenRegion || detectedRegion || regionFromProfileCountry(userCountry) || "other";
  const regionConfig = PAYMENT_REGIONS[region];
  const mercadoPago = regionConfig.mercadoPago;
  const paypalCurrency = regionConfig.paypalCurrency;

  // Medio de pago por defecto al cambiar de país: Mercado Pago donde existe, si no PayPal.
  useEffect(() => {
    setPaymentMethod(mercadoPago ? "mercadopago" : "paypal");
  }, [region, mercadoPago]);

  const availableMethods = [mercadoPago && "mercadopago", PAYPAL_CLIENT_ID && "paypal"].filter(Boolean);

  // Qué paquetes y en qué moneda: Mercado Pago Argentina vende los de pesos; Colombia/México los de
  // USD convertidos a su moneda; PayPal los de USD o EUR (España) con el precio tal cual.
  const payingWithMercadoPago = paymentMethod === "mercadopago" && !!mercadoPago;
  const catalogCurrency = payingWithMercadoPago ? (mercadoPago.currency === "ARS" ? "ARS" : "USD") : paypalCurrency;
  const displayRate = payingWithMercadoPago && catalogCurrency === "USD" ? mercadoPago.rate : 1;
  const currency = payingWithMercadoPago ? mercadoPago.currency : paypalCurrency;
  const symbol = payingWithMercadoPago ? mercadoPago.symbol : PAYPAL_SYMBOLS[paypalCurrency];
  const getDisplayPrice = (chip) => (chip.price * displayRate).toFixed(2);
  // Con centavos siempre 2 decimales ("0,10"); montos enteros sin decimales ("1.000").
  const formatPrice = (chip) => {
    const value = Number(getDisplayPrice(chip));
    const decimals = Number.isInteger(value) ? 0 : 2;
    return new Intl.NumberFormat("es-ES", { minimumFractionDigits: decimals, maximumFractionDigits: 2 }).format(value);
  };
  const formatChips = (amount) => new Intl.NumberFormat("es-ES").format(amount);

  // El paquete de prueba solo aparece con PayPal (Mercado Pago no lo acepta).
  const visibleChipOptions = CHIP_CATALOG[catalogCurrency].filter((chip) => !chip.testOnly || paymentMethod === "paypal");
  useEffect(() => {
    if (!visibleChipOptions.some((chip) => chip.id === selectedChip?.id)) setSelectedChip(visibleChipOptions[0]);
  }, [catalogCurrency, paymentMethod]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch real transaction history from backend
  useEffect(() => {
    const fetchHistory = async () => {
      if (activeTab === "history" && currentUser?.id) {
        setLoadingHistory(true);
        try {
          // Unified movement history: deposits + non-gameplay chip adjustments (already
          // sorted newest-first by the backend).
          const response = await axios.get(`${API_URL}/chips/history`);
          setPaymentHistory(response.data);
        } catch (error) {
        } finally {
          setLoadingHistory(false);
        }
      }
    };
    fetchHistory();
  }, [activeTab, currentUser]);

  const filteredHistory =
    historyTypeFilter === "all" ? paymentHistory : paymentHistory.filter((item) => item.type === historyTypeFilter);

  // Mercado Pago order checkout redirection
  const createOrder = async (method) => {
    if (!currentUser?.id) {
      Swal.fire({
        icon: "warning",
        title: "Sesión requerida",
        text: "Debes iniciar sesión para comprar fichas.",
        confirmButtonColor: "#C9A84C",
      });
      return;
    }

    if (!selectedChip) {
      Swal.fire({
        icon: "warning",
        title: "Paquete no seleccionado",
        text: "Por favor, selecciona un paquete de fichas primero.",
        confirmButtonColor: "#C9A84C",
      });
      return;
    }

    // Mercado Pago cobra siempre en la moneda real de la cuenta vendedora del país
    // (no hay una sola cuenta "multi-moneda") — por eso mandamos el país a una ruta
    // dedicada en vez del endpoint genérico, y el backend decide la moneda, no nosotros.
    if (!mercadoPago) {
      Swal.fire({
        icon: "warning",
        title: "Mercado Pago no disponible",
        text: `Mercado Pago no está disponible para ${regionConfig.label}. Probá con PayPal.`,
        confirmButtonColor: "#C9A84C",
      });
      return;
    }
    const mpCountry = mercadoPago.country;

    // Solo mandamos el paquete: fichas y precio los calcula el backend.
    const payload = {
      userId: currentUser.id,
      packageId: selectedChip.id,
    };

    try {
      Swal.fire({
        title: "Creando orden en Mercado Pago...",
        text: "Por favor espera mientras te redirigimos al portal seguro.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      const response = await axios.post(`${API_URL}/mepago/create-order/${mpCountry}`, payload);

      // Spec Requirement: redirect frontend user to initPoint
      if (response.data && response.data.initPoint) {
        window.location.href = response.data.initPoint;
      } else {
        throw new Error("No initPoint returned from backend");
      }
    } catch (error) {
      const backendMessage = error?.response?.data?.message;
      const isAccountNotReady = error?.response?.status === 400 && typeof backendMessage === "string" && backendMessage.includes("todavía no está configurada");

      Swal.fire({
        icon: isAccountNotReady ? "warning" : "error",
        title: isAccountNotReady ? "Mercado Pago no disponible" : "Error de Pasarela",
        text: isAccountNotReady
          ? `Mercado Pago todavía no está disponible para ${regionConfig.label}. Probá con PayPal mientras tanto.`
          : "Hubo un error al generar tu orden de pago. Inténtalo de nuevo.",
        confirmButtonColor: "#C9A84C",
      });
    }
  };

  // Helper formatting for platform name
  const formatPlatformName = (platform) => {
    if (!platform) return "Sistema";
    switch (platform.toLowerCase()) {
      case "paypal":
        return "PayPal Gateway";
      case "mepago":
        return "Mercado Pago (USD)";
      case "mepago_mx":
        return "Mercado Pago (MXN)";
      case "credit_card":
        return "Tarjeta de Crédito";
      default:
        return platform;
    }
  };

  // El SDK de PayPal solo lee sus opciones al montarse: el key lo recarga si cambia la
  // moneda (por ejemplo al elegir España en el selector de país).
  return (
    <PayPalScriptProvider
      key={paypalCurrency}
      options={{
        "client-id": PAYPAL_CLIENT_ID || "sb",
        currency: paypalCurrency,
      }}
    >
      <main className="flex-grow p-4 md:p-margin-desktop max-w-container-max mx-auto w-full select-none text-on-surface min-h-[85vh] pt-6 md:pt-8 relative">
        
        {/* Step 0: Authentication Shield Overlay if not logged in. Solo después de que terminó de
            restaurarse la sesión (auth.loading): al recargar, la sesión tarda un instante en volver
            y sin esto el cartel aparecía aunque el usuario sí estuviera logueado. */}
        {!auth.loading && !currentUser?.id && (
          <div className="absolute inset-0 z-50 bg-[#16130d]/80 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-8 text-center my-6">
            <div className="glass-card max-w-md w-full p-8 rounded-2xl border border-outline-variant/30 space-y-6 shadow-2xl relative">
              <span className="material-symbols-outlined text-[72px] text-primary animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>
                lock
              </span>
              <h2 className="font-headline-md text-headline-md text-white font-bold">Sesión Requerida</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Debes iniciar sesión con tu cuenta para acceder a la billetera y depositar fichas de forma segura.
              </p>
              <button
                onClick={() => navigate("/")}
                className="w-full royal-gold-gradient py-4 rounded-xl text-[#0A0A0F] font-bold text-md uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-lg royal-gold-glow cursor-pointer border-0"
              >
                Ir al Lobby / Iniciar Sesión
              </button>
            </div>
          </div>
        )}

        {/* Page Header */}
        <header className="mb-8">
          <h1 className="font-display-lg text-display-lg text-primary tracking-tight mb-2 flex items-center gap-3">
            <span className="material-symbols-outlined text-[40px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
              account_balance_wallet
            </span>
            Billetera Royal
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Administra tus fondos, adquiere fichas y gestiona tus transacciones seguras.
          </p>
        </header>

        {/* Interactive Workspace Panel */}
        <div className="glass-card rounded-2xl overflow-hidden mb-12 shadow-2xl">
          
          {/* Navigation Tabs */}
          <div className="flex border-b border-outline-variant/10 bg-[#12121A]/80">
            <button
              onClick={() => setActiveTab("deposit")}
              className={`flex-1 py-4 font-label-lg text-label-lg transition-all border-b-2 font-bold ${
                activeTab === "deposit"
                  ? "text-primary border-primary bg-primary/5"
                  : "text-on-surface-variant hover:text-on-surface border-transparent"
              }`}
            >
              Depositar Fondos
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex-1 py-4 font-label-lg text-label-lg transition-all border-b-2 font-bold ${
                activeTab === "history"
                  ? "text-primary border-primary bg-primary/5"
                  : "text-on-surface-variant hover:text-on-surface border-transparent"
              }`}
            >
              Historial de Transacciones
            </button>
          </div>

          <div className="p-6 md:p-10">
            
            {/* VIEW 1: DEPOSIT & CHEKOUT */}
            {activeTab === "deposit" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                
                {/* Left Side: Configuration & Grid (Col-Span 7) */}
                <div className="lg:col-span-7 space-y-8 text-left">
                  
                  {/* Step 1: Payment country (primero: los precios de los paquetes dependen de él) */}
                  <div>
                    <label className="font-label-lg text-label-lg text-primary mb-3 block uppercase tracking-wider">
                      1. País desde el que pagás
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {REGION_ORDER.map((key) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setChosenRegion(key)}
                          aria-pressed={region === key}
                          className={`glass-card px-2 py-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            region === key
                              ? "border-primary bg-primary/10 text-white shadow-md"
                              : "border-outline-variant/30 text-on-surface-variant hover:border-primary/45"
                          }`}
                        >
                          {PAYMENT_REGIONS[key].label}
                        </button>
                      ))}
                    </div>
                    {!chosenRegion && detectedRegion && (
                      <p className="mt-2 text-[11px] text-on-surface-variant">
                        Detectamos que te conectás desde {PAYMENT_REGIONS[detectedRegion].label}. Si no es así, elegí otro país.
                      </p>
                    )}
                  </div>

                  {/* Step 2: Payment method (antes de los paquetes: define la moneda de los precios) */}
                  <div>
                    <label className="font-label-lg text-label-lg text-primary mb-3 block uppercase tracking-wider">
                      2. Medio de Pago
                    </label>
                    {availableMethods.length === 0 && (
                      <p className="text-xs text-on-surface-variant">
                        Todavía no hay medios de pago disponibles para {regionConfig.label}.
                      </p>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {mercadoPago && (
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("mercadopago")}
                          aria-pressed={paymentMethod === "mercadopago"}
                          className={`glass-card p-4 rounded-xl flex items-center gap-3 text-left border-2 transition-all cursor-pointer ${
                            paymentMethod === "mercadopago"
                              ? "border-primary bg-primary/10 shadow-md"
                              : "border-outline-variant/30 hover:border-primary/45"
                          }`}
                        >
                          <span className="w-11 h-11 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                            <MercadoPagoLogo className="w-7 h-7" />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-bold text-white">Mercado Pago</span>
                            <span className="block text-[11px] text-on-surface-variant">Pagás en {mercadoPago.currency}</span>
                          </span>
                        </button>
                      )}
                      {PAYPAL_CLIENT_ID && (
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("paypal")}
                          aria-pressed={paymentMethod === "paypal"}
                          className={`glass-card p-4 rounded-xl flex items-center gap-3 text-left border-2 transition-all cursor-pointer ${
                            paymentMethod === "paypal"
                              ? "border-primary bg-primary/10 shadow-md"
                              : "border-outline-variant/30 hover:border-primary/45"
                          }`}
                        >
                          <span className="w-11 h-11 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                            <PayPalLogo className="w-6 h-6" />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-bold text-white">PayPal</span>
                            <span className="block text-[11px] text-on-surface-variant">Pagás en {paypalCurrency} · cuenta PayPal o tarjeta</span>
                          </span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Step 3: Select Chip Package */}
                  <div>
                    <label className="font-label-lg text-label-lg text-primary mb-3 block uppercase tracking-wider">
                      3. Selecciona un Paquete de Fichas
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {visibleChipOptions.map((chip) => {
                        const isSelected = selectedChip?.id === chip.id;
                        const baseChips = chip.testOnly ? chip.chips : baseChipsOf(chip);
                        const image = chip.testOnly ? null : IMAGE_BY_BASE_CHIPS[baseChips];
                        return (
                          <button
                            key={chip.id}
                            type="button"
                            onClick={() => setSelectedChip(chip)}
                            aria-pressed={isSelected}
                            className="flex flex-col gap-2 text-center cursor-pointer select-none group relative active:scale-95 transition-transform bg-transparent border-0 p-0"
                          >
                            <div
                              className={`relative w-full rounded-xl overflow-hidden border-2 transition-all ${
                                isSelected
                                  ? "border-primary shadow-[0_0_15px_rgba(201,168,76,0.35)]"
                                  : "border-outline-variant/20 group-hover:border-primary/50"
                              }`}
                            >
                              {chip.testOnly && (
                                <div className="absolute top-1.5 left-1.5 z-10 bg-yellow-400 text-[#0A0A0F] text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded">
                                  Prueba
                                </div>
                              )}
                              {isSelected && (
                                <div className="absolute top-1.5 right-1.5 z-10 bg-primary rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                                  <span className="material-symbols-outlined text-[12px] text-[#0A0A0F] font-bold">check</span>
                                </div>
                              )}
                              {image ? (
                                <img
                                  src={image}
                                  alt={`${formatChips(baseChips)} fichas`}
                                  className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              ) : (
                                <div className="w-full aspect-square bg-gradient-to-b from-surface-container-high to-surface-container-lowest flex items-start justify-center pt-4">
                                  <span className="text-white font-black text-base [text-shadow:0_2px_4px_rgba(0,0,0,0.9)] whitespace-nowrap">
                                    {formatChips(baseChips)}
                                  </span>
                                </div>
                              )}
                              <div className="bg-white py-1.5">
                                <span className="text-base font-black text-[#0A0A0F]">
                                  {symbol} {formatPrice(chip)}
                                </span>
                              </div>
                            </div>
                            {chip.testOnly ? (
                              <div className="w-full rounded-xl border-2 border-outline-variant/30 bg-surface-container-high px-1 py-2 leading-tight">
                                <p className="text-[10px] text-on-surface-variant">Recibís</p>
                                <p className="text-sm font-black text-white">{formatChips(chip.chips)} fichas</p>
                              </div>
                            ) : (
                              <div className="w-full rounded-xl border-2 border-yellow-400 bg-gradient-to-b from-yellow-100 to-yellow-200 px-1 py-2 leading-tight">
                                <p className="text-lg font-black text-yellow-700">+{promoPercentOf(chip)}%</p>
                                <p className="text-[11px] font-black text-yellow-700 uppercase tracking-wider">Bonus</p>
                                <p className="text-[10px] text-neutral-600 mt-1">Recibís</p>
                                <p className={`font-black text-neutral-900 whitespace-nowrap ${formatChips(chip.chips).length > 11 ? "text-[11px]" : "text-sm"}`}>
                                  {formatChips(chip.chips)}
                                </p>
                                <p className="text-[10px] text-neutral-600">fichas</p>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* Right Side: Checkout summary & Actions (Col-Span 5) */}
                <div className="lg:col-span-5 lg:sticky lg:top-24 self-start space-y-4">
                  {/* Balance y rango: al costado del depósito, no en una fila aparte arriba */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="glass-card p-4 rounded-xl text-left">
                      <p className="text-[10px] text-on-surface-variant mb-1 uppercase tracking-wider font-bold">Mi Balance</p>
                      <p className="text-lg font-bold text-white leading-tight break-all">
                        {new Intl.NumberFormat('es-ES').format(currentUser?.chips || 0)}
                        <span className="text-primary font-bold text-[10px] ml-1">CHIPS</span>
                      </p>
                      <p className="mt-2 flex items-center text-[10px] text-green-400">
                        <span className="material-symbols-outlined text-[12px] mr-1">check_circle</span>
                        Disponible para jugar
                      </p>
                    </div>
                    <div className="glass-card p-4 rounded-xl text-left">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Mi Rango</p>
                        <RankBadge tier={currentUser?.rank} size="sm" />
                      </div>
                      {nextRank ? (
                        <>
                          <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-full h-2 w-full overflow-hidden mt-3">
                            <div className="royal-gold-gradient h-full rounded-full" style={{ width: `${rankProgressPercentage}%` }}></div>
                          </div>
                          <p className="mt-2 text-[10px] text-on-surface-variant leading-snug">
                            {rankProgressPercentage}% hacia {nextRank.label}
                          </p>
                        </>
                      ) : (
                        <p className="mt-3 flex items-center text-[10px] text-primary">
                          <span className="material-symbols-outlined text-[12px] mr-1">workspace_premium</span>
                          Rango máximo alcanzado
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="glass-card p-6 rounded-2xl border border-outline-variant/20 relative overflow-hidden bg-[#12121A]/60 flex flex-col">
                    
                    {/* Atmospheric gold glow */}
                    <div className="absolute inset-0 royal-gold-gradient opacity-[0.02] blur-3xl pointer-events-none"></div>

                    <div className="space-y-6 text-left relative z-10">
                      <h3 className="font-headline-sm text-headline-sm text-white border-b border-outline-variant/10 pb-4">
                        Resumen del Depósito
                      </h3>

                      {/* Selected package detail */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-on-surface-variant">Paquete Seleccionado</span>
                          <span className="text-white font-bold">
                            {selectedChip ? formatChips(selectedChip.chips) : "0"} Fichas
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-on-surface-variant">Moneda / Divisa</span>
                          <span className="text-primary font-bold">{currency}</span>
                        </div>
                        <div className="flex justify-between items-end pt-2 border-t border-outline-variant/10">
                          <span className="font-label-lg text-label-lg text-white">Total a Pagar:</span>
                          <span className="font-headline-lg text-headline-lg text-primary">
                            {symbol} {selectedChip ? formatPrice(selectedChip) : "0"}
                          </span>
                        </div>
                      </div>

                    </div>

                    {/* GATEWAYS ACTIVE REGION */}
                    <div className="mt-8 pt-6 border-t border-outline-variant/10 relative z-10 space-y-4">
                      {availableMethods.includes(paymentMethod) && (
                        <p className="text-xs text-on-surface-variant leading-relaxed text-left">
                          {paymentMethod === "paypal" && `Pagás con PayPal en ${paypalCurrency}. Las fichas se acreditan apenas se confirma el pago.`}
                          {paymentMethod === "mercadopago" && mercadoPago && `Te llevamos a Mercado Pago para pagar en ${mercadoPago.currency} de forma segura. Las fichas se acreditan apenas se aprueba el pago.`}
                        </p>
                      )}
                      
                      {/* PAYPAL ACTIVE RENDER */}
                      {paymentMethod === "paypal" && PAYPAL_CLIENT_ID && (
                        // Fondo claro a propósito: PayPal dibuja sus botones y el formulario de tarjeta con
                        // texto oscuro, que sobre el fondo oscuro de la página no se leía.
                        <div className="w-full bg-white rounded-xl p-4 shadow-inner">
                          <PayPalButtons
                            style={{ layout: "vertical", shape: "pill", label: "pay" }}
                            createOrder={async (data, actions) => {
                              // Mandamos el paquete y la moneda del país elegido: el backend cobra el
                              // precio de su catálogo en esa moneda (EUR para España, USD para el resto).
                              try {
                                const response = await axios.post(`${API_URL}/paypal/create-order`, {
                                  userId: currentUser?.id,
                                  packageId: selectedChip.id,
                                  currency: paypalCurrency,
                                });
                                return response.data.orderId; // Return orderId to PayPal SDK
                              } catch (err) {
                                Swal.fire({
                                  icon: "error",
                                  title: "Error de PayPal",
                                  text: "No se pudo iniciar el pago en los servidores de PayPal.",
                                  confirmButtonColor: "#C9A84C",
                                });
                                throw err;
                              }
                            }}
                            onApprove={async (data, actions) => {
                              // Spec Requirement: Call /capture-paypal-order to close sale and credit chips

                              Swal.fire({
                                title: "Capturando Pago...",
                                text: "Confirmando tu depósito con los servidores de PayPal.",
                                allowOutsideClick: false,
                                didOpen: () => {
                                  Swal.showLoading();
                                }
                              });

                              try {
                                const response = await axios.post(`${API_URL}/capture-paypal-order`, {
                                  orderId: data.orderID,
                                  userId: currentUser?.id,
                                  packageId: selectedChip.id,
                                });

                                Swal.fire({
                                  icon: "success",
                                  title: "¡Depósito Exitoso!",
                                  text: `¡Pago completado! Se han acreditado ${formatChips(selectedChip.chips)} fichas en tu cuenta.`,
                                  confirmButtonColor: "#C9A84C",
                                }).then(() => {
                                  // Refresh browser state or redirect
                                  window.location.reload();
                                });
                              } catch (err) {
                                Swal.fire({
                                  icon: "error",
                                  title: "Error de Captura",
                                  text: "No se pudo completar la captura del pago. Por favor contacta al soporte técnico.",
                                  confirmButtonColor: "#C9A84C",
                                });
                              }
                            }}
                            onError={(err) => {
                              Swal.fire({
                                icon: "error",
                                  title: "Transacción Fallida",
                                  text: "Hubo un error con la pasarela de PayPal.",
                                  confirmButtonColor: "#C9A84C",
                              });
                            }}
                            onCancel={() => {
                              Swal.fire({
                                icon: "info",
                                title: "Pago cancelado",
                                text: "Cancelaste el pago en PayPal. No se realizó ningún cargo.",
                                confirmButtonColor: "#C9A84C",
                              });
                            }}
                          />
                        </div>
                      )}

                      {/* MERCADO PAGO ACTIVE RENDER */}
                      {paymentMethod === "mercadopago" && mercadoPago && (
                        <button
                          onClick={createOrder}
                          className="w-full royal-gold-gradient py-4 rounded-xl text-[#0A0A0F] font-bold text-md uppercase tracking-wider hover:brightness-110 active:scale-[0.98] transition-all shadow-lg royal-gold-glow flex items-center justify-center gap-2 cursor-pointer border-0"
                        >
                          <span className="material-symbols-outlined text-[20px] font-bold">qr_code_scanner</span>
                          Proceder con Mercado Pago
                        </button>
                      )}

                      {/* SSL Security badges */}
                      <div className="flex justify-center items-center gap-6 opacity-30 pt-2">
                        <span className="material-symbols-outlined text-[28px] text-white">shield_lock</span>
                        <span className="material-symbols-outlined text-[28px] text-white">verified_user</span>
                        <span className="material-symbols-outlined text-[28px] text-white">lock_reset</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* VIEW 2: TRANSACTION LOGS */}
            {activeTab === "history" && (
              <div className="space-y-6">
                
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-left">
                  <div>
                    <h3 className="font-headline-sm text-headline-sm text-white mb-1">Registro de Auditoría Financiera</h3>
                    <p className="text-body-sm text-on-surface-variant">Tus últimos depósitos y movimientos de fichas en el casino.</p>
                  </div>
                  <div className="sm:w-56">
                    <select
                      value={historyTypeFilter}
                      onChange={(e) => setHistoryTypeFilter(e.target.value)}
                      className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-4 py-2.5 text-body-sm focus:border-primary outline-none appearance-none text-on-surface"
                    >
                      <option value="all">Todos los movimientos</option>
                      {Object.entries(HISTORY_TYPE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="glass-card rounded-2xl overflow-hidden border border-outline-variant/10">
                  <div className="overflow-x-auto no-scrollbar">
                    {loadingHistory ? (
                      <div className="flex flex-col items-center justify-center p-12 gap-3 bg-[#12121A]">
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm text-on-surface-variant">Cargando transacciones reales...</span>
                      </div>
                    ) : filteredHistory.length > 0 ? (
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-surface-variant/20 border-b border-outline-variant/10">
                            <th className="px-6 py-4 font-label-lg text-label-lg text-on-surface-variant uppercase tracking-wider">Fecha / Hora</th>
                            <th className="px-6 py-4 font-label-lg text-label-lg text-on-surface-variant uppercase tracking-wider">Tipo</th>
                            <th className="px-6 py-4 font-label-lg text-label-lg text-on-surface-variant uppercase tracking-wider">Método</th>
                            <th className="px-6 py-4 font-label-lg text-label-lg text-on-surface-variant uppercase tracking-wider text-right">Monto</th>
                            <th className="px-6 py-4 font-label-lg text-label-lg text-on-surface-variant uppercase tracking-wider text-center">Estado</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/10 text-sm">
                          {filteredHistory.map((item) => {
                            // Fallback al final a propósito: ChipsService.getHistory puede devolver tipos que
                            // no estén listados acá todavía (nuevos `source` de ChipsAward) - sin esto, un tipo
                            // no contemplado tira "Cannot read properties of undefined (reading 'color')" y
                            // rompe toda la tabla en vez de solo esa fila.
                            const typeMeta = {
                              deposit: { icon: "south_west", color: "text-green-400" },
                              welcome: { icon: "redeem", color: "text-primary" },
                              admin_adjustment: {
                                icon: item.chips >= 0 ? "add_circle" : "remove_circle",
                                color: item.chips >= 0 ? "text-green-400" : "text-error",
                              },
                              referral: { icon: "diversity_3", color: "text-primary" },
                              prize: { icon: "emoji_events", color: "text-primary" },
                              gift_sent: { icon: "card_giftcard", color: "text-error" },
                              gift_received: { icon: "card_giftcard", color: "text-green-400" },
                            }[item.type] || {
                              icon: item.chips >= 0 ? "add_circle" : "remove_circle",
                              color: item.chips >= 0 ? "text-green-400" : "text-error",
                            };
                            const typeLabel = HISTORY_TYPE_LABELS[item.type] || "Movimiento";

                            const statusMeta = {
                              approved: { label: "Completado", className: "bg-green-500/10 text-green-400" },
                              pending: { label: "Pendiente", className: "bg-amber-500/10 text-amber-400" },
                              rejected: { label: "Rechazado", className: "bg-error/10 text-error" },
                              cancelled: { label: "Cancelado", className: "bg-gray-500/10 text-gray-400" },
                              refunded: { label: "Reembolsado", className: "bg-gray-500/10 text-gray-400" },
                            }[item.status] || { label: item.status, className: "bg-gray-500/10 text-gray-400" };

                            return (
                              <tr key={item.id} className="hover:bg-surface-variant/10 transition-colors">
                                <td className="px-6 py-4 text-on-surface">
                                  {new Date(item.date).toLocaleString('es-ES', {
                                    day: '2-digit', month: 'short', year: 'numeric',
                                    hour: '2-digit', minute: '2-digit'
                                  })}
                                </td>
                                <td className="px-6 py-4">
                                  <div className={`flex items-center gap-2 ${typeMeta.color}`}>
                                    <span className="material-symbols-outlined text-sm">{typeMeta.icon}</span>
                                    <span className="font-bold">{typeLabel}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-on-surface-variant">
                                  {formatPlatformName(item.paymentPlatform)}
                                </td>
                                <td className="px-6 py-4 text-right font-bold text-white">
                                  {item.type === "deposit" ? (
                                    <>
                                      + {symbol} {new Intl.NumberFormat('es-ES').format(parseFloat(item.price).toFixed(2))}
                                      <span className="block text-[11px] font-normal text-on-surface-variant">
                                        {new Intl.NumberFormat('es-ES').format(item.chips)} fichas
                                      </span>
                                    </>
                                  ) : (
                                    <span className={typeMeta.color}>
                                      {item.chips >= 0 ? "+" : ""}{new Intl.NumberFormat('es-ES').format(item.chips)} fichas
                                    </span>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusMeta.className}`}>
                                    {statusMeta.label}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    ) : (
                      <div className="p-12 text-center text-on-surface-variant bg-[#12121A]">
                        <span className="material-symbols-outlined text-[48px] text-outline mb-2">history</span>
                        {paymentHistory.length === 0 ? (
                          <>
                            <p className="font-body-md text-body-md">No tienes transacciones registradas aún.</p>
                            <p className="text-xs text-outline mt-1">Los depósitos aprobados se mostrarán en esta lista en tiempo real.</p>
                          </>
                        ) : (
                          <>
                            <p className="font-body-md text-body-md">
                              No tenés movimientos de tipo "{HISTORY_TYPE_LABELS[historyTypeFilter] || historyTypeFilter}".
                            </p>
                            <button
                              type="button"
                              onClick={() => setHistoryTypeFilter("all")}
                              className="text-xs text-primary hover:underline mt-1 bg-transparent border-0 cursor-pointer p-0"
                            >
                              Ver todos los movimientos
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>

      </main>
    </PayPalScriptProvider>
  );
}
