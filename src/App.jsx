import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Container } from '@chakra-ui/react';
import { useLocation, Route, Routes } from 'react-router-dom';
import Nav from './components/Nav/nav';
import Sidebar from './components/Sidebar/sidebar';
import Footer from './components/footer/footer';
import Home from './components/Home/home';
import { AuthProvider } from './context/oauthContext';
import Perfil from './components/Perfil/perfil';
import BuyChips from './components/Buychips/buyChips';
import LogOut from './components/Logout/logout';
import GameGrid from './components/Juegos/juegos';
import News from './components/News/news';
import RankSystem from './components/RankSystem/rankSystem';
import RankUpNotice from './components/RankUpNotice/rankUpNotice';
import OfferBanner from './components/OfferBanner/offerBanner';
import AdminOffers from './components/AdminPanel/Offers/offers';
import regaloBienvenida from '../src/assets/regalobienvenida.png';
import { useSelector, useDispatch } from 'react-redux';
import { fetchSiteContent, getUserByEmail } from './redux/actions';
import TermsAndConditions from './components/termsyConds/terminosYCondiciones';
import axios from 'axios';
import Diamantes from './components/Juegos/Diamantes/diamantes';
import RoyalJoker from './components/Juegos/RoyalJoker/royaljoker';
import RoyalPachinka from './components/Juegos/royalpachinka/royalpachinka';
import Bingo from './components/Juegos/Bingo/bingo';
import SantaWilds from './components/Juegos/SantaWilds/santawilds';
import RoyalSlots from './components/Juegos/RoyalSlots/royalslots';
import SugarCalavera from './components/Juegos/SugarCalavera/sugarcalavera';
import FuriaOlimpo from './components/Juegos/FuriaOlimpo/furiaolimpo';
import GildedCobra from './components/Juegos/GildedCobra/gildedcobra';
import Domino from './components/Juegos/Domino/domino';
import Parchis from './components/Juegos/Parchis/parchis';
import GemaOfGold from './components/Juegos/GemaOfGold/gemaofgold';
import RoyalRuleta from './components/Juegos/RoyalRuleta/royalruleta';
import API_URL from './api/rutaApi';
import Swal from 'sweetalert2';
import { tokenStore } from './api/tokenStore';
import { capturePromoFromUrl, getPendingPromo, clearPendingPromo } from './utils/promoLink';
import AboutUs from './components/AboutUs/aboutUs';
import UserManagement from './components/AdminPanel/UserManagement/userManagement';
import AdminDashboard from './components/AdminPanel/AdminDashboard/adminDashboard';
import AdminPresence from './components/AdminPanel/Presence/presence';
import useSeo from './utils/useSeo';
import SupportTicketsAdmin from './components/AdminPanel/SupportTickets/supportTickets';
import AdminDeposits from './components/AdminPanel/Deposits/deposits';
import AdminPrizes from './components/AdminPanel/Prizes/prizes';
import AdminReferrals from './components/AdminPanel/Referrals/referrals';
import AdminGameStats from './components/AdminPanel/GameStats/gameStats';
import AdminPromos from './components/AdminPanel/Promos/promos';
import BingoBots from './components/AdminPanel/BingoBots/bingoBots';
import MinesBots from './components/AdminPanel/MinesBots/minesBots';
import DominoBots from './components/AdminPanel/DominoBots/dominoBots';
import ParchisBots from './components/AdminPanel/ParchisBots/parchisBots';
import UnityBots from './components/AdminPanel/UnityBots/unityBots';
import Trophies from './components/AdminPanel/Trophies/trophies';
import GameImages from './components/AdminPanel/GameImages/gameImages';
import ResetPassword from './components/ResetPassword/resetPassword';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import RequireAuth from './components/ProtectedRoute/RequireAuth';
import PaymentSuccess from './components/PaymentStatus/PaymentSuccess';
import PaymentFailure from './components/PaymentStatus/PaymentFailure';
import PaymentPending from './components/PaymentStatus/PaymentPending';
import RoyalStore from './components/RoyalStore/royalStore';
import Friends from './components/Friends/friends';
import Messages from './components/Messages/messages';
import GameDetail from './components/Juegos/GameDetail/gameDetail';
import Support from './components/Support/support';
import Contact from './components/Contact/contact';
import Faq from './components/Faq/faq';
import Privacidad from './components/Legal/privacidad';
import Cumplimiento from './components/Legal/cumplimiento';
import Careers from './components/Careers/careers';

function App() {
  const [showWelcomeGift, setShowWelcomeGift] = useState(false);
  const { currentUser } = useSelector((state) => state);
  const location = useLocation();
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
  useEffect(() => {
    const isGameOrRoyalStore = location.pathname.includes('/game') || location.pathname === '/royalstore';
    if (!currentUser?.email || !isGameOrRoyalStore) return;
    const interval = setInterval(() => {
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
          {(location.pathname !== "/" || currentUser?.id || location.search.includes('vista=invitado')) && <Nav />}
          <Sidebar />
          <div
            className={`transition-all duration-300 flex flex-col flex-1 ${
              currentUser?.id && !location.pathname.includes('/game') ? 'md:pl-16 lg:pl-56' : ''
            }`}
          >
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
            <Route path="/admin/prizes" element={<ProtectedRoute><AdminPrizes /></ProtectedRoute>} />
            <Route path="/admin/referrals" element={<ProtectedRoute><AdminReferrals /></ProtectedRoute>} />
            <Route path="/admin/game-stats" element={<ProtectedRoute><AdminGameStats /></ProtectedRoute>} />
            <Route path="/admin/promos" element={<ProtectedRoute><AdminPromos /></ProtectedRoute>} />
            <Route path="/admin/ofertas" element={<ProtectedRoute><AdminOffers /></ProtectedRoute>} />
            <Route path="/admin/bingo-bots" element={<ProtectedRoute><BingoBots /></ProtectedRoute>} />
            <Route path="/admin/mines-bots" element={<ProtectedRoute><MinesBots /></ProtectedRoute>} />
            <Route path="/admin/domino-bots" element={<ProtectedRoute><DominoBots /></ProtectedRoute>} />
            <Route path="/admin/parchis-bots" element={<ProtectedRoute><ParchisBots /></ProtectedRoute>} />
            <Route path="/admin/unity-bots" element={<ProtectedRoute><UnityBots /></ProtectedRoute>} />
            <Route path="/admin/trophies" element={<ProtectedRoute><Trophies /></ProtectedRoute>} />
            <Route path="/admin/game-images" element={<ProtectedRoute><GameImages /></ProtectedRoute>} />
            <Route path="/noticias" element={<News />} />
            <Route path="/rangos" element={<RankSystem />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/terminos-y-condiciones" element={<TermsAndConditions />} />
            <Route path="/privacidad" element={<Privacidad />} />
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
            <Route path="/game/gildedcobra" element={<RequireAuth><GildedCobra /></RequireAuth>} />
            <Route path="/game/domino" element={<RequireAuth><Domino /></RequireAuth>} />
            <Route path="/game/parchis" element={<RequireAuth><Parchis /></RequireAuth>} />
            <Route path="/game/gemaofgold" element={<RequireAuth><GemaOfGold /></RequireAuth>} />
            <Route path="/game/royalruleta" element={<RequireAuth><RoyalRuleta /></RequireAuth>} />
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
          {!location.pathname.includes('/game') && <Footer />}
          </div>
        </div>
        <RankUpNotice />
        <OfferBanner />
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
                  Has ganado 100.000 fichas por ser uno de los primeros 100 usuarios.
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
