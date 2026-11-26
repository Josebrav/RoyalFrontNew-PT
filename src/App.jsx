import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { Container } from '@chakra-ui/react';
import { useLocation, useNavigate, Route, Routes, Navigate } from 'react-router-dom';
import { LOCALE } from './i18n/locale';
import Nav from './components/Nav/nav';
import Sidebar from './components/Sidebar/sidebar';
import Footer from './components/footer/footer';
import Home from './components/Home/home';
import { AuthProvider } from './context/oauthContext';
import MissionsTour from './components/Missions/missionsTour';
import RankUpNotice from './components/RankUpNotice/rankUpNotice';
import OfferBanner from './components/OfferBanner/offerBanner';
import FeaturedNews from './components/FeaturedNews/featuredNews';
import regaloBienvenida from '../src/assets/regalobienvenida.png';
import { useSelector, useDispatch } from 'react-redux';
import { fetchSiteContent, getUserByEmail } from './redux/actions';
import { HUB_ORIGINS } from './data/slotHub';
import axios from 'axios';
import API_URL from './api/rutaApi';
import Swal from 'sweetalert2';
import { tokenStore } from './api/tokenStore';
import { capturePromoFromUrl, getPendingPromo, clearPendingPromo } from './utils/promoLink';
import useSeo from './utils/useSeo';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import RequireAuth from './components/ProtectedRoute/RequireAuth';
import GameDetail from './components/Juegos/GameDetail/gameDetail';
import GlobalChat from './components/GlobalChat/globalChat';

// Paginas que se descargan recien cuando alguien las abre (admin, juegos, compra, perfil...): la
// primera pantalla carga mucho menos JavaScript. Inicio y la ficha de cada juego quedan en el paquete principal.
const Perfil = lazy(() => import('./components/Perfil/perfil'));
const BuyChips = lazy(() => import('./components/Buychips/buyChips'));
const LogOut = lazy(() => import('./components/Logout/logout'));
const GameGrid = lazy(() => import('./components/Juegos/juegos'));
const News = lazy(() => import('./components/News/news'));
const RankSystem = lazy(() => import('./components/RankSystem/rankSystem'));
const Missions = lazy(() => import('./components/Missions/missions'));
const AdminOffers = lazy(() => import('./components/AdminPanel/Offers/offers'));
const TermsAndConditions = lazy(() => import('./components/termsyConds/terminosYCondiciones'));
const Diamantes = lazy(() => import('./components/Juegos/Diamantes/diamantes'));
const RoyalJoker = lazy(() => import('./components/Juegos/RoyalJoker/royaljoker'));
const RoyalPachinka = lazy(() => import('./components/Juegos/royalpachinka/royalpachinka'));
const Bingo = lazy(() => import('./components/Juegos/Bingo/bingo'));
const SantaWilds = lazy(() => import('./components/Juegos/SantaWilds/santawilds'));
const RoyalSlots = lazy(() => import('./components/Juegos/RoyalSlots/royalslots'));
const SugarCalavera = lazy(() => import('./components/Juegos/SugarCalavera/sugarcalavera'));
const FuriaOlimpo = lazy(() => import('./components/Juegos/FuriaOlimpo/furiaolimpo'));
const Bicho = lazy(() => import('./components/Juegos/Bicho/bicho'));
const GildedCobra = lazy(() => import('./components/Juegos/GildedCobra/gildedcobra'));
const JokerWilds = lazy(() => import('./components/Juegos/JokerWilds/jokerwilds'));
const SweetTreats = lazy(() => import('./components/Juegos/SweetTreats/sweettreats'));
const Gomitas = lazy(() => import('./components/Juegos/Gomitas/gomitas'));
const OceanRiches = lazy(() => import('./components/Juegos/OceanRiches/oceanriches'));
const GamerZone = lazy(() => import('./components/Juegos/GamerZone/gamerzone'));
const RoyalCats = lazy(() => import('./components/Juegos/RoyalCats/royalcats'));
const SweetFuturist = lazy(() => import('./components/Juegos/SweetFuturist/sweetfuturist'));
const Domino = lazy(() => import('./components/Juegos/Domino/domino'));
const Parchis = lazy(() => import('./components/Juegos/Parchis/parchis'));
const Buraco = lazy(() => import('./components/Juegos/Buraco/buraco'));
const Trivia = lazy(() => import('./components/Juegos/Trivia/trivia'));
const Chinchon = lazy(() => import('./components/Juegos/Chinchon/chinchon'));
const GemaOfGold = lazy(() => import('./components/Juegos/GemaOfGold/gemaofgold'));
const RoyalRuleta = lazy(() => import('./components/Juegos/RoyalRuleta/royalruleta'));
const Blackjack = lazy(() => import('./components/Juegos/Blackjack/blackjack'));
const Poker = lazy(() => import('./components/Juegos/Poker/poker'));
const AboutUs = lazy(() => import('./components/AboutUs/aboutUs'));
const UserManagement = lazy(() => import('./components/AdminPanel/UserManagement/userManagement'));
const AdminDashboard = lazy(() => import('./components/AdminPanel/AdminDashboard/adminDashboard'));
const AdminPresence = lazy(() => import('./components/AdminPanel/Presence/presence'));
const SupportTicketsAdmin = lazy(() => import('./components/AdminPanel/SupportTickets/supportTickets'));
const AdminDeposits = lazy(() => import('./components/AdminPanel/Deposits/deposits'));
const AdminPrizes = lazy(() => import('./components/AdminPanel/Prizes/prizes'));
const AdminReferrals = lazy(() => import('./components/AdminPanel/Referrals/referrals'));
const AdminGameStats = lazy(() => import('./components/AdminPanel/GameStats/gameStats'));
const AdminPromos = lazy(() => import('./components/AdminPanel/Promos/promos'));
const AdminStaffChips = lazy(() => import('./components/AdminPanel/StaffChips/staffChips'));
const RtpAdmin = lazy(() => import('./components/AdminPanel/Rtp/rtpAdmin'));
const AdminReports = lazy(() => import('./components/AdminPanel/Reports/reports'));
const BingoBots = lazy(() => import('./components/AdminPanel/BingoBots/bingoBots'));
const MinesBots = lazy(() => import('./components/AdminPanel/MinesBots/minesBots'));
const DominoBots = lazy(() => import('./components/AdminPanel/DominoBots/dominoBots'));
const ParchisBots = lazy(() => import('./components/AdminPanel/ParchisBots/parchisBots'));
const BuracoBots = lazy(() => import('./components/AdminPanel/BuracoBots/buracoBots'));
const ChinchonBots = lazy(() => import('./components/AdminPanel/ChinchonBots/chinchonBots'));
const UnityBots = lazy(() => import('./components/AdminPanel/UnityBots/unityBots'));
const Trophies = lazy(() => import('./components/AdminPanel/Trophies/trophies'));
const GameImages = lazy(() => import('./components/AdminPanel/GameImages/gameImages'));
const ResetPassword = lazy(() => import('./components/ResetPassword/resetPassword'));
const PaymentSuccess = lazy(() => import('./components/PaymentStatus/PaymentSuccess'));
const PaymentFailure = lazy(() => import('./components/PaymentStatus/PaymentFailure'));
const PaymentPending = lazy(() => import('./components/PaymentStatus/PaymentPending'));
const RoyalStore = lazy(() => import('./components/RoyalStore/royalStore'));
const Friends = lazy(() => import('./components/Friends/friends'));
const Messages = lazy(() => import('./components/Messages/messages'));
const Support = lazy(() => import('./components/Support/support'));
const Contact = lazy(() => import('./components/Contact/contact'));
const Faq = lazy(() => import('./components/Faq/faq'));
const Privacidad = lazy(() => import('./components/Legal/privacidad'));
const EliminarCuenta = lazy(() => import('./components/Legal/eliminarCuenta'));
const Cumplimiento = lazy(() => import('./components/Legal/cumplimiento'));
const Careers = lazy(() => import('./components/Careers/careers'));

function App() {
  const [showWelcomeGift, setShowWelcomeGift] = useState(false);
  const { currentUser } = useSelector((state) => state);
  const location = useLocation();
  const navigate = useNavigate();
  useSeo();
  const dispatch = useDispatch();

  // Site-wide editable text/image overrides (Inicio, Nosotros, etc.) — public, needed even
  // for guests, fetched once on app load.
  useEffect(() => {
    dispatch(fetchSiteContent());
  }, [dispatch]);

  // Antes dependía del objeto currentUser entero, que se re-pide (nueva referencia) en CADA
  // cambio de ruta (ver el efecto de getUserByEmail más abajo) — así que mientras firstChips
  // siguiera en false (ej. un usuario que ya no es elegible, para quien nunca se pone en true)
  // este efecto se volvía a disparar en cada navegación, mostrando el cartel una y otra vez.
  // Además el cartel se mostraba con un timer fijo SIN importar si el PUT realmente tuvo éxito,
  // así que hasta un reclamo rechazado (400) terminaba mostrando "¡Felicidades, ganaste...!".
  // welcomeGiftCheckedRef asegura que el intento se haga una sola vez por usuario, y el cartel
  // ahora solo se muestra si el PUT efectivamente confirma el bono.
  const welcomeGiftCheckedRef = useRef(false);
  useEffect(() => {
    if (!currentUser?.id || currentUser.firstChips || welcomeGiftCheckedRef.current) return;
    welcomeGiftCheckedRef.current = true;

    axios.put(`${API_URL}/firstchips/${currentUser.id}`)
      .then(() => {
        setTimeout(() => setShowWelcomeGift(true), 2500);
      })
      .catch(() => {});
  }, [currentUser?.id, currentUser?.firstChips]);

  // Enlace promocional (ej. ?promo=FACEBOOK en un posteo): se guarda al entrar; a quien todavia no
  // tiene sesion se le avisa cuantas fichas recibe al registrarse.
  useEffect(() => {
    const code = capturePromoFromUrl();
    if (!code || tokenStore.get()) return;
    axios.get(`${API_URL}/promo-codes/info/${encodeURIComponent(code)}`)
      .then(({ data }) => {
        Swal.fire({
          icon: 'success',
          title: `¡${new Intl.NumberFormat('es-ES').format(data.amount)} fichas de regalo!`,
          text: data.newAccountsOnly
            ? 'Creá tu cuenta y las fichas se acreditan solas apenas te registrás.'
            : 'Iniciá sesión o creá tu cuenta y las fichas se acreditan solas.',
          confirmButtonText: '¡Genial!',
          confirmButtonColor: '#c9a84c',
          background: '#1a1a1a',
          color: '#fff',
        });
      })
      .catch(() => clearPendingPromo());
  }, []);

  // Con sesion y un codigo pendiente: se cobra una sola vez (el servidor decide si corresponde).
  const promoTriedRef = useRef(false);
  useEffect(() => {
    const code = getPendingPromo();
    if (!currentUser?.id || !code || promoTriedRef.current) return;
    promoTriedRef.current = true;
    axios.post(`${API_URL}/promo-codes/redeem`, { code })
      .then(({ data }) => {
        clearPendingPromo();
        if (currentUser.email) dispatch(getUserByEmail(currentUser.email)).catch(() => {});
        Swal.fire({
          icon: 'success',
          title: '¡Bienvenido a RoyalGames!',
          text: `Recibiste ${new Intl.NumberFormat('es-ES').format(data.amount)} fichas de regalo.`,
          confirmButtonText: '¡A jugar!',
          confirmButtonColor: '#c9a84c',
          background: '#1a1a1a',
          color: '#fff',
        });
      })
      .catch((err) => {
        // 4xx = no corresponde (cuenta vieja, ya cobrado, misma conexion...): se descarta y se avisa.
        // Error de red/servidor: queda guardado para intentar en la proxima carga.
        const status = err.response?.status;
        if (status && status < 500 && status !== 429) {
          clearPendingPromo();
          const message = err.response?.data?.message;
          if (message) Swal.fire({ icon: 'info', title: 'Promoción', text: Array.isArray(message) ? message[0] : message, background: '#1a1a1a', color: '#fff', confirmButtonColor: '#c9a84c' });
        }
      });
  }, [currentUser?.id]);

  // Lightweight presence signal: lets the admin panel + "jugadores conectados" widget
  // approximate "online now" (and what page/game someone is on) by marking lastSeen
  // every couple of minutes while the app is open, and immediately on navigation.
  useEffect(() => {
    if (!currentUser?.id) return;
    const sendHeartbeat = () => {
      axios.put(`${API_URL}/users/heartbeat`, { currentPath: location.pathname }).catch(() => {});
    };
    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [currentUser?.id, location.pathname]);

  // Chips, avatar, etc. can change from OUTSIDE this app's own Redux flow — the external
  // games settle bets directly against the backend with no JWT, and the RoyalStore (avatar editor)
  // is its own separate app — so this tab's cached currentUser silently goes stale. Re-fetching
  // on every route change (not on a timer) means you always see fresh data by the time you land
  // on a new page, without forcing a full page reload just to bust the client-side cache.
  useEffect(() => {
    if (!currentUser?.email) return;
    dispatch(getUserByEmail(currentUser.email)).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // El refresh de arriba solo dispara al cambiar de ruta - si te quedás quieto DENTRO de un
  // juego o del RoyalStore (mismos iframes de Unity que le pegan al backend directo, ver
  // comentario de arriba), nunca se entera de que las fichas cambiaron. Sondeamos cada pocos
  // segundos nada más que en esas rutas para que la nav siga el saldo casi en vivo mientras se
  // juega/compra.
  // Las slots acreditan el premio (incluido el de todas las tiradas gratis) en el momento del giro,
  // así que el sondeo mostraba el premio en la nav antes de que terminara de animarse. El juego
  // avisa "royalgames:chips-hold" al girar y "royalgames:chips-release" cuando ya mostró el saldo
  // final: mientras tanto la nav no se actualiza (con un tope por si el juego se cierra a la mitad).
  const chipsHoldUntil = useRef(0);
  useEffect(() => {
    const MAX_HOLD_MS = 4 * 60 * 1000;
    const onMessage = (event) => {
      if (!HUB_ORIGINS.has(event.origin)) return;
      const type = event.data && typeof event.data === 'object' ? event.data.type : null;
      if (type === 'royalgames:chips-hold') {
        chipsHoldUntil.current = Date.now() + MAX_HOLD_MS;
      } else if (type === 'royalgames:chips-release') {
        chipsHoldUntil.current = 0;
        if (currentUser?.email) dispatch(getUserByEmail(currentUser.email)).catch(() => {});
      } else if (type === 'royalgames:buy-chips') {
        // Boton "COMPRAR FICHAS" del cartel de fichas insuficientes de la slot.
        navigate('/chips');
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.email]);

  useEffect(() => {
    chipsHoldUntil.current = 0; // al cambiar de página se suelta cualquier congelamiento
    const isGameOrRoyalStore = location.pathname.includes('/game') || location.pathname === '/royalstore';
    if (!currentUser?.email || !isGameOrRoyalStore) return;
    const interval = setInterval(() => {
      if (Date.now() < chipsHoldUntil.current) return; // hay una tirada animándose
      dispatch(getUserByEmail(currentUser.email)).catch(() => {});
    }, 3000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, currentUser?.email]);

  const handleCloseGift = () => {
    setShowWelcomeGift(false);
  };

  return (
    <Container
      bg="#303030"
      color="#e9e1d7"
      className="bg-background text-on-background"
      maxW="100%"
      w="100%"
      mt={0}
      p={0}
      display="flex"
      flexDirection="column"
      minH="100vh"
    >
      <AuthProvider>
        <div className="flex flex-col flex-1">
          <Nav />
          <Sidebar />
          <div
            className={`transition-all duration-300 flex flex-col flex-1 ${
              currentUser?.id && !location.pathname.includes('/game') ? 'md:pl-16 lg:pl-56' : ''
            }`}
          >
          <Suspense fallback={<div style={{ minHeight: '60vh' }} />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/perfil/:userNick" element={<Perfil isPublic={true} />} />
            <Route path="/juegos" element={<RequireAuth><GameGrid /></RequireAuth>} />
            <Route path="/juegos/:slug" element={<GameDetail />} />
            <Route path="/chips" element={<BuyChips />} />
            <Route path="/logout" element={<LogOut />} />
            <Route path="/admin/users" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
            <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/online" element={<ProtectedRoute><AdminPresence /></ProtectedRoute>} />
            <Route path="/admin/tickets" element={<ProtectedRoute><SupportTicketsAdmin /></ProtectedRoute>} />
            <Route path="/admin/deposits" element={<ProtectedRoute><AdminDeposits /></ProtectedRoute>} />
            <Route path="/admin/staff-chips" element={<ProtectedRoute><AdminStaffChips /></ProtectedRoute>} />
            <Route path="/admin/rtp" element={<ProtectedRoute><RtpAdmin /></ProtectedRoute>} />
            <Route path="/admin/denuncias" element={<ProtectedRoute><AdminReports /></ProtectedRoute>} />
            <Route path="/admin/prizes" element={<ProtectedRoute><AdminPrizes /></ProtectedRoute>} />
            <Route path="/admin/referrals" element={<ProtectedRoute><AdminReferrals /></ProtectedRoute>} />
            <Route path="/admin/game-stats" element={<ProtectedRoute><AdminGameStats /></ProtectedRoute>} />
            <Route path="/admin/promos" element={<ProtectedRoute><AdminPromos /></ProtectedRoute>} />
            <Route path="/admin/ofertas" element={<ProtectedRoute><AdminOffers /></ProtectedRoute>} />
            <Route path="/admin/bingo-bots" element={<ProtectedRoute><BingoBots /></ProtectedRoute>} />
            <Route path="/admin/mines-bots" element={<ProtectedRoute><MinesBots /></ProtectedRoute>} />
            <Route path="/admin/domino-bots" element={<ProtectedRoute><DominoBots /></ProtectedRoute>} />
            <Route path="/admin/parchis-bots" element={<ProtectedRoute><ParchisBots /></ProtectedRoute>} />
            <Route path="/admin/buraco-bots" element={<ProtectedRoute><BuracoBots /></ProtectedRoute>} />
            <Route path="/admin/chinchon-bots" element={<ProtectedRoute><ChinchonBots /></ProtectedRoute>} />
            <Route path="/admin/unity-bots" element={<ProtectedRoute><UnityBots /></ProtectedRoute>} />
            <Route path="/admin/trophies" element={<ProtectedRoute><Trophies /></ProtectedRoute>} />
            <Route path="/admin/game-images" element={<ProtectedRoute><GameImages /></ProtectedRoute>} />
            <Route path="/noticias" element={<News />} />
            <Route path="/rangos" element={<RankSystem />} />
            <Route path="/misiones" element={<RequireAuth><Missions /></RequireAuth>} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/terminos-y-condiciones" element={<TermsAndConditions />} />
            <Route path="/privacidad" element={<Privacidad />} />
            <Route path="/eliminar-cuenta" element={<EliminarCuenta />} />
            <Route path="/cumplimiento" element={<Cumplimiento />} />
            <Route path="/trabaja-con-nosotros" element={<Careers />} />
            <Route path="/game/minas" element={<RequireAuth><Diamantes /></RequireAuth>} />
            <Route path="/game/royaljoker" element={<RequireAuth><RoyalJoker /></RequireAuth>} />
            <Route path="/game/royalpachinka" element={<RequireAuth><RoyalPachinka /></RequireAuth>} />
            <Route path="/game/bingo" element={<RequireAuth><Bingo /></RequireAuth>} />
            <Route path="/game/santawilds" element={<RequireAuth><SantaWilds /></RequireAuth>} />
            <Route path="/game/royalslots" element={<RequireAuth><RoyalSlots /></RequireAuth>} />
            <Route path="/game/sugarcalavera" element={<RequireAuth><SugarCalavera /></RequireAuth>} />
            <Route path="/game/furiaolimpo" element={<RequireAuth><FuriaOlimpo /></RequireAuth>} />
            <Route path="/game/bicho" element={<RequireAuth><Bicho /></RequireAuth>} />
            <Route path="/game/gildedcobra" element={<RequireAuth><GildedCobra /></RequireAuth>} />
            <Route path="/game/jokerwilds" element={<RequireAuth><JokerWilds /></RequireAuth>} />
            <Route path="/game/sweettreats" element={<RequireAuth><SweetTreats /></RequireAuth>} />
            <Route path="/game/gomitas" element={<RequireAuth><Gomitas /></RequireAuth>} />
            <Route path="/game/oceanriches" element={<RequireAuth><OceanRiches /></RequireAuth>} />
            <Route path="/game/gamerzone" element={<RequireAuth><GamerZone /></RequireAuth>} />
            <Route path="/game/royalcats" element={<RequireAuth><RoyalCats /></RequireAuth>} />
            <Route path="/game/sweetfuturist" element={<RequireAuth><SweetFuturist /></RequireAuth>} />
            <Route path="/game/domino" element={<RequireAuth><Domino /></RequireAuth>} />
            <Route path="/game/parchis" element={<RequireAuth><Parchis /></RequireAuth>} />
            <Route path="/game/buraco" element={<RequireAuth><Buraco /></RequireAuth>} />
            <Route path="/game/trivia" element={<RequireAuth><Trivia /></RequireAuth>} />
            <Route path="/game/chinchon" element={<RequireAuth><Chinchon /></RequireAuth>} />
            <Route path="/game/gemaofgold" element={<RequireAuth><GemaOfGold /></RequireAuth>} />
            {/* En portugues la ruleta va en /game/royalroleta; la direccion vieja lleva a la nueva */}
            <Route path="/game/royalruleta" element={LOCALE === "pt" ? <Navigate to="/game/royalroleta" replace /> : <RequireAuth><RoyalRuleta /></RequireAuth>} />
            <Route path="/game/royalroleta" element={<RequireAuth><RoyalRuleta /></RequireAuth>} />
            <Route path="/game/blackjack" element={<RequireAuth><Blackjack /></RequireAuth>} />
            {/* Poker: en prueba, solo admin y mod */}
            <Route path="/game/poker" element={<RequireAuth><Poker /></RequireAuth>} />
            <Route path="/royalstore" element={<RoyalStore />} />
            <Route path="/amigos" element={<Friends />} />
            <Route path="/mensajes" element={<Messages />} />
            <Route path="/mensajes/:nick" element={<Messages />} />
            <Route path="/ayuda" element={<Support />} />
            <Route path="/ayuda/:ticketId" element={<Support />} />
            <Route path="/contacto" element={<Contact />} />
            <Route path="/preguntas-frecuentes" element={<Faq />} />
            <Route path="/restablecer-contrasena" element={<ResetPassword />} />
            <Route path="/mercadopago/success" element={<PaymentSuccess />} />
            <Route path="/mercadopago/failure" element={<PaymentFailure />} />
            <Route path="/mercadopago/pending" element={<PaymentPending />} />
          </Routes>
          </Suspense>
          {!location.pathname.includes('/game') && <Footer />}
          </div>
        </div>
        <GlobalChat />
        <MissionsTour />
        <RankUpNotice />
        <OfferBanner />
        <FeaturedNews />
        {showWelcomeGift && currentUser?.id && createPortal(
          <div
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
            onClick={handleCloseGift}
          >
            <div
              className="glass-card rounded-xl p-8 shadow-2xl relative max-w-sm w-full text-center space-y-6 border border-[#1A1A26] select-none"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Atmospheric background spot */}
              <div className="bg-glow-spot -top-20 -left-20 pointer-events-none"></div>

              <img
                src={regaloBienvenida}
                alt="Regalo de bienvenida"
                className="w-48 h-auto mx-auto object-contain drop-shadow-[0_0_20px_rgba(201,168,76,0.35)]"
              />

              <div className="space-y-2 relative z-10">
                <h2 className="font-headline-md text-headline-md text-white">¡Felicidades!</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Has ganado 100.000 fichas de regalo de bienvenida.
                </p>
              </div>

              <button
                onClick={handleCloseGift}
                className="gold-gradient gold-glow gold-glow-hover w-full py-3.5 px-4 rounded-lg font-headline-sm text-headline-sm text-[#0A0A0F] uppercase tracking-wider transition-all duration-300 transform active:scale-[0.98] cursor-pointer relative z-10"
              >
                ¡Gracias!
              </button>
            </div>
          </div>,
          document.body
        )}
      </AuthProvider>
    </Container>
  );
}

export default App;
