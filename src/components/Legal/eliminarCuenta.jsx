import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import API_URL from "../../api/rutaApi";
import { LOCALE } from "../../i18n/locale";
import { useAuth } from "../../context/oauthContext";
import { logout } from "../../redux/actions";
import Login from "../Login/login";
import { swalThemeConfig } from "../../utils/formatters";

// Página pública que pide Google Play: nombre de la app, pasos para borrar la cuenta y qué datos se
// borran o se conservan (y por cuánto tiempo). Con la sesión iniciada, la cuenta se borra desde acá.
const SUPPORT_EMAIL = "royalgames2025@gmail.com";

const TEXT = {
  es: {
    title: "Eliminar tu cuenta de RoyalJuegos",
    intro:
      "Desde esta página podés eliminar tu cuenta de RoyalJuegos, la app y el sitio de juegos sociales de Royal Juegos (royaljuegos.com). Es la misma cuenta en la app de Android y en la web: al eliminarla desde cualquiera de los dos, se elimina en ambos.",
    stepsTitle: "Cómo eliminar tu cuenta",
    steps: [
      "Iniciá sesión en royaljuegos.com con la cuenta que querés eliminar (la misma que usás en la app).",
      "Volvé a esta página: royaljuegos.com/eliminar-cuenta (también está en el pie de página, \"Eliminar cuenta\").",
      "Escribí tu contraseña (si entrás con Google, dejala vacía) y la palabra ELIMINAR para confirmar.",
      "Tocá \"Eliminar mi cuenta\". La cuenta se elimina en el momento y se cierra tu sesión en todos los dispositivos.",
    ],
    altTitle: "¿No podés iniciar sesión?",
    alt: `Escribinos a ${SUPPORT_EMAIL} desde el correo de tu cuenta, con el asunto "Eliminar cuenta" y tu nick. La eliminamos dentro de los 7 días y te avisamos por correo.`,
    deletedTitle: "Qué se borra",
    deleted: [
      "Tu nick, correo electrónico, contraseña y la vinculación con Google.",
      "Tu avatar, foto, descripción, edad, país y sexo del perfil.",
      "Tu saldo de fichas y tus bonos (se pierden y no se pueden recuperar).",
      "Tus amigos, bloqueos y mensajes privados.",
      "Tus mensajes en los chats de los juegos y tus tickets de soporte.",
      "Tus sesiones abiertas en la app y en la web.",
    ],
    keptTitle: "Qué se conserva y por cuánto tiempo",
    kept: [
      "Registros de compras y pagos (monto, fecha y medio de pago): 10 años, porque la ley nos obliga a guardar los registros contables. Quedan sin tu nick ni tu correo.",
      "Historial de partidas y apuestas con fichas: se conserva de forma anónima, sin ningún dato que te identifique, solo para estadísticas de los juegos.",
      "Denuncias de moderación en las que participaste: hasta 2 años, sin tus datos personales, para prevenir fraudes y abusos.",
      "Copias de seguridad del servidor: se renuevan solas y tus datos desaparecen de ellas en un máximo de 30 días.",
    ],
    formTitle: "Eliminar mi cuenta",
    warning: "Esto no se puede deshacer: vas a perder tus fichas, tu rango y tu historial. Si más adelante querés volver a jugar, vas a tener que crear una cuenta nueva.",
    loggedAs: "Sesión iniciada como",
    password: "Contraseña",
    passwordHint: "Si entrás con Google, dejala vacía.",
    confirmLabel: "Escribí ELIMINAR para confirmar",
    word: "ELIMINAR",
    submit: "Eliminar mi cuenta",
    sending: "Eliminando…",
    loginFirst: "Para eliminar tu cuenta desde acá, primero iniciá sesión.",
    login: "Iniciar sesión",
    askTitle: "¿Seguro que querés eliminar tu cuenta?",
    askText: "Se borran tus datos y tus fichas. No se puede deshacer.",
    askYes: "Sí, eliminarla",
    askNo: "Cancelar",
    doneTitle: "Tu cuenta fue eliminada",
    doneText: "Gracias por haber jugado en RoyalJuegos.",
    errorTitle: "No se pudo eliminar la cuenta",
    errorText: "Revisá la contraseña e intentá de nuevo.",
    privacy: "Más detalles en la Política de Privacidad.",
  },
  en: {
    title: "Delete your RoyalJuegos account",
    intro:
      "On this page you can delete your RoyalJuegos account, the social games app and website by Royal Juegos (royaljuegos.com). It is the same account on the Android app and on the web: deleting it from either one deletes it on both.",
    stepsTitle: "How to delete your account",
    steps: [
      "Log in at royaljuegos.com with the account you want to delete (the same one you use in the app).",
      "Come back to this page: royaljuegos.com/eliminar-cuenta (it is also in the footer, \"Delete account\").",
      "Type your password (leave it empty if you sign in with Google) and the word DELETE to confirm.",
      "Tap \"Delete my account\". The account is deleted right away and you are logged out on every device.",
    ],
    altTitle: "Can't log in?",
    alt: `Email us at ${SUPPORT_EMAIL} from your account's email address, with the subject "Delete account" and your nickname. We delete it within 7 days and let you know by email.`,
    deletedTitle: "What is deleted",
    deleted: [
      "Your nickname, email address, password and Google link.",
      "Your avatar, photo, description, age, country and gender on your profile.",
      "Your chip balance and bonuses (they are lost and cannot be recovered).",
      "Your friends, blocks and private messages.",
      "Your messages in the game chats and your support tickets.",
      "Your open sessions in the app and on the web.",
    ],
    keptTitle: "What is kept and for how long",
    kept: [
      "Purchase and payment records (amount, date and payment method): 10 years, because the law requires us to keep accounting records. They no longer include your nickname or email.",
      "Game and chip bet history: kept anonymously, with nothing that identifies you, only for game statistics.",
      "Moderation reports you were involved in: up to 2 years, without your personal data, to prevent fraud and abuse.",
      "Server backups: they renew automatically and your data is gone from them within 30 days at most.",
    ],
    formTitle: "Delete my account",
    warning: "This cannot be undone: you will lose your chips, your rank and your history. If you want to play again later, you will need to create a new account.",
    loggedAs: "Logged in as",
    password: "Password",
    passwordHint: "Leave it empty if you sign in with Google.",
    confirmLabel: "Type DELETE to confirm",
    word: "DELETE",
    submit: "Delete my account",
    sending: "Deleting…",
    loginFirst: "To delete your account here, log in first.",
    login: "Log in",
    askTitle: "Are you sure you want to delete your account?",
    askText: "Your data and chips will be deleted. This cannot be undone.",
    askYes: "Yes, delete it",
    askNo: "Cancel",
    doneTitle: "Your account was deleted",
    doneText: "Thank you for playing RoyalJuegos.",
    errorTitle: "The account could not be deleted",
    errorText: "Check your password and try again.",
    privacy: "More details in the Privacy Policy.",
  },
  pt: {
    title: "Excluir sua conta do RoyalJuegos",
    intro:
      "Nesta página você pode excluir sua conta do RoyalJuegos, o app e o site de jogos sociais da Royal Juegos (royaljuegos.com). É a mesma conta no app para Android e na web: ao excluí-la em qualquer um dos dois, ela é excluída nos dois.",
    stepsTitle: "Como excluir sua conta",
    steps: [
      "Entre em royaljuegos.com com a conta que você quer excluir (a mesma que você usa no app).",
      "Volte a esta página: royaljuegos.com/eliminar-cuenta (ela também está no rodapé, \"Excluir conta\").",
      "Digite sua senha (se você entra com o Google, deixe em branco) e a palavra EXCLUIR para confirmar.",
      "Toque em \"Excluir minha conta\". A conta é excluída na hora e sua sessão é encerrada em todos os dispositivos.",
    ],
    altTitle: "Não consegue entrar?",
    alt: `Escreva para ${SUPPORT_EMAIL} a partir do e-mail da sua conta, com o assunto "Excluir conta" e seu apelido. Nós a excluímos em até 7 dias e avisamos por e-mail.`,
    deletedTitle: "O que é apagado",
    deleted: [
      "Seu apelido, e-mail, senha e o vínculo com o Google.",
      "Seu avatar, foto, descrição, idade, país e sexo do perfil.",
      "Seu saldo de fichas e seus bônus (eles são perdidos e não podem ser recuperados).",
      "Seus amigos, bloqueios e mensagens privadas.",
      "Suas mensagens nos chats dos jogos e seus tickets de suporte.",
      "Suas sessões abertas no app e na web.",
    ],
    keptTitle: "O que é mantido e por quanto tempo",
    kept: [
      "Registros de compras e pagamentos (valor, data e meio de pagamento): 10 anos, porque a lei nos obriga a guardar os registros contábeis. Eles ficam sem seu apelido e seu e-mail.",
      "Histórico de partidas e apostas com fichas: mantido de forma anônima, sem nenhum dado que identifique você, só para estatísticas dos jogos.",
      "Denúncias de moderação das quais você participou: até 2 anos, sem seus dados pessoais, para evitar fraudes e abusos.",
      "Cópias de segurança do servidor: são renovadas sozinhas e seus dados somem delas em no máximo 30 dias.",
    ],
    formTitle: "Excluir minha conta",
    warning: "Isso não pode ser desfeito: você vai perder suas fichas, seu rank e seu histórico. Se quiser voltar a jogar depois, vai ter que criar uma conta nova.",
    loggedAs: "Sessão iniciada como",
    password: "Senha",
    passwordHint: "Se você entra com o Google, deixe em branco.",
    confirmLabel: "Digite EXCLUIR para confirmar",
    word: "EXCLUIR",
    submit: "Excluir minha conta",
    sending: "Excluindo…",
    loginFirst: "Para excluir sua conta por aqui, primeiro entre na sua conta.",
    login: "Entrar",
    askTitle: "Tem certeza de que quer excluir sua conta?",
    askText: "Seus dados e suas fichas serão apagados. Não pode ser desfeito.",
    askYes: "Sim, excluir",
    askNo: "Cancelar",
    doneTitle: "Sua conta foi excluída",
    doneText: "Obrigado por ter jogado no RoyalJuegos.",
    errorTitle: "Não foi possível excluir a conta",
    errorText: "Confira a senha e tente de novo.",
    privacy: "Mais detalhes na Política de Privacidade.",
  },
};

function renderList(items, ordered) {
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag className={`${ordered ? "list-decimal" : "list-disc"} pl-6 space-y-2 text-body-md text-on-surface leading-relaxed`}>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </Tag>
  );
}

export default function EliminarCuenta() {
  const tx = TEXT[LOCALE] ?? TEXT.es;
  const dispatch = useDispatch();
  const auth = useAuth();
  const user = useSelector((state) => state.currentUser);
  const loggedIn = Boolean(user?.id);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [sending, setSending] = useState(false);

  const canSubmit = loggedIn && confirm.trim().toUpperCase() === tx.word && !sending;

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    const answer = await Swal.fire({
      title: tx.askTitle,
      text: tx.askText,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: tx.askYes,
      cancelButtonText: tx.askNo,
      confirmButtonColor: "#b3261e",
      ...swalThemeConfig,
    });
    if (!answer.isConfirmed) return;

    setSending(true);
    try {
      await axios.post(`${API_URL}/users/me/delete-account`, {
        password: password || undefined,
        confirm: tx.word,
      });
      try {
        await auth.logOut();
      } catch {
        // la cuenta ya no existe: el cierre de sesión en el servidor puede fallar, no importa
      }
      dispatch(logout());
      await Swal.fire({ title: tx.doneTitle, text: tx.doneText, icon: "success", ...swalThemeConfig });
      window.location.href = "/";
    } catch (error) {
      Swal.fire({
        title: tx.errorTitle,
        text: error.response?.data?.message || tx.errorText,
        icon: "error",
        ...swalThemeConfig,
      });
    } finally {
      setSending(false);
    }
  };

  const card = "bg-surface-container rounded-xl border border-outline-variant/20 p-6 md:p-8";
  const heading = "font-headline-sm text-headline-sm text-primary mb-4";
  const input =
    "w-full bg-surface-container-high border border-outline-variant/40 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary";

  return (
    <div className="bg-background text-on-background min-h-screen pt-8 pb-24 md:pb-12 px-4 md:px-margin-desktop">
      <div className="max-w-container-max mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-display-lg font-headline-lg text-primary mb-3">{tx.title}</h1>
        </div>

        <section className={card}>
          <p className="text-body-lg text-on-surface leading-relaxed">{tx.intro}</p>
        </section>

        <section className={card}>
          <h2 className={heading}>{tx.stepsTitle}</h2>
          {renderList(tx.steps, true)}
          <h3 className="font-label-lg text-on-surface mt-6 mb-2">{tx.altTitle}</h3>
          <p className="text-body-md text-on-surface-variant leading-relaxed">{tx.alt}</p>
        </section>

        <div className="grid gap-6 md:grid-cols-2">
          <section className={card}>
            <h2 className={heading}>{tx.deletedTitle}</h2>
            {renderList(tx.deleted)}
          </section>
          <section className={card}>
            <h2 className={heading}>{tx.keptTitle}</h2>
            {renderList(tx.kept)}
          </section>
        </div>

        <section className={`${card} border-error/40`}>
          <h2 className={heading}>{tx.formTitle}</h2>
          <p className="text-body-md text-on-surface-variant leading-relaxed mb-6">{tx.warning}</p>
          {loggedIn ? (
            <form onSubmit={handleDelete} className="space-y-4 max-w-md">
              <p className="text-body-md text-on-surface">
                {tx.loggedAs} <strong>{user.nick}</strong>
              </p>
              <div>
                <label htmlFor="delete-password" className="block font-label-lg text-on-surface mb-1">
                  {tx.password}
                </label>
                <input
                  id="delete-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={input}
                />
                <p className="text-body-sm text-on-surface-variant mt-1">{tx.passwordHint}</p>
              </div>
              <div>
                <label htmlFor="delete-confirm" className="block font-label-lg text-on-surface mb-1">
                  {tx.confirmLabel}
                </label>
                <input
                  id="delete-confirm"
                  type="text"
                  autoComplete="off"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className={input}
                />
              </div>
              <button
                type="submit"
                disabled={!canSubmit}
                className="bg-error text-on-error font-label-lg px-8 py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {sending ? tx.sending : tx.submit}
              </button>
            </form>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <p className="text-body-md text-on-surface">{tx.loginFirst}</p>
              <Login className="bg-primary text-on-primary font-label-lg px-8 py-3 rounded-xl hover:opacity-90 transition-opacity text-center border-0 cursor-pointer">
                {tx.login}
              </Login>
            </div>
          )}
        </section>

        <p className="text-center text-body-md text-on-surface-variant">
          <Link to="/privacidad" className="text-primary hover:underline">
            {tx.privacy}
          </Link>
        </p>
      </div>
    </div>
  );
}
