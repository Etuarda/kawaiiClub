import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import logo from '../../assets/logo-kawaii.png';
import { DEMO_ACCOUNTS } from '../../infrastructure/demo-auth.ts';
import { ThemeButton } from '../../app/ThemeContext.tsx';
import { Avatar, errorMessage } from '../../components/Shared.tsx';
import { useToast } from '../../components/Toast.tsx';
import { homeFor, useSession } from './AuthContext.tsx';
/** Traço botânico fino: só no login e em estados vazios. */
function Sprig() {
  return <svg viewBox="0 0 140 120" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" aria-hidden="true"><path d="M20 112C48 84 70 56 118 10" /><path d="M44 86c-14-2-22 4-26 12 10 2 20-2 26-12Z" /><path d="M58 70c2-13-4-22-12-27-3 10 1 20 12 27Z" /><path d="M76 52c13 0 21-7 24-16-10-1-19 4-24 16Z" /><path d="M88 38c0-12-6-20-14-23-2 10 3 19 14 23Z" /><circle cx="118" cy="10" r="2.5" /></svg>;
}
const EMAIL = /\S+@\S+\.\S+/;
export function LoginPage() {
  const { session, login } = useSession(); const navigate = useNavigate(); const toast = useToast();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [show, setShow] = useState(false);
  const [regName, setRegName] = useState(''); const [regBiz, setRegBiz] = useState('');
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string; biz?: string }>({});
  const [message, setMessage] = useState<{ kind: 'err' | 'ok'; text: string } | null>(null); const [busy, setBusy] = useState(false);
  if (session) return <Navigate to={homeFor(session)} replace />;
  const enter = async (e: string, p: string) => {
    const next = { email: EMAIL.test(e) ? undefined : 'Informe um email válido.', password: p ? undefined : 'Informe a sua senha.' };
    setErrors(next); setMessage(null); if (next.email || next.password) return;
    setBusy(true);
    try { const s = await login(e, p); toast(s.role === 'ADMIN' ? 'Painel da equipe aberto · Ellen Kois' : `Olá, ${s.name.split(' ')[0]}`); navigate(homeFor(s)); }
    catch (err) { setMessage({ kind: 'err', text: errorMessage(err, 'Não foi possível entrar.') }); setBusy(false); }
  };
  const submit = (e: FormEvent) => { e.preventDefault(); void enter(email, password); };
  const submitRegister = async (e: FormEvent) => {
    e.preventDefault();
    const next = {
      name: regName.trim() ? undefined : 'Informe seu nome.',
      biz: regBiz.trim() ? undefined : 'Informe o nome do negócio.',
      email: EMAIL.test(email) ? undefined : 'Informe um email válido.',
      password: password.length >= 6 ? undefined : 'Pelo menos 6 caracteres.'
    };
    setErrors(next); setMessage(null);
    if (next.name || next.biz || next.email || next.password) return;
    setBusy(true);
    const demoMember = DEMO_ACCOUNTS[0];
    try {
      const s = await login(demoMember.email, demoMember.password);
      toast(`Conta demonstrativa ativada. Bem-vinda, ${regName.trim().split(' ')[0]}!`);
      navigate(homeFor(s));
    } catch (err) {
      setMessage({ kind: 'err', text: errorMessage(err, 'Não foi possível criar a conta.') });
      setBusy(false);
    }
  };
  return <div className="auth">
    <ThemeButton className="icon-btn auth-theme" />
    <section className="auth-art" aria-hidden="true">
      <div className="orb o1" /><div className="orb o2" /><div className="orb o3" />
      <div className="auth-brand"><span className="k-mark"><img src={logo} alt="Logo Kawaii Clube" /></span><span><b>KAWAII CLUBE</b><small>Clube de Conexões · Parcerias para Mulheres</small></span></div>
      <div className="auth-illu"><Sprig /></div>
      <div className="auth-copy"><span className="auth-pill">Ecossistema de parcerias</span><p className="auth-title">Parcerias que viram negócio.</p>
        <p className="auth-sub">Descubra quem completa o seu trabalho, entenda por que a conexão faz sentido e transforme a oportunidade em proposta.</p></div>
      <p className="auth-foot">Educação, comunidade e tecnologia para o desenvolvimento econômico feminino.</p>
    </section>
    <section className="auth-form" aria-labelledby="auth-h">
      <div className="auth-inner kw-rise">
        {mode === 'login' ? <>
          <p className="overline">Portal de acesso</p>
          <h1 id="auth-h" className="auth-h">Bem-vinda de volta</h1>
          <p className="lead">Entre para ver suas oportunidades ou, se você é da equipe, o painel do Clube.</p>
          <form className="auth-fields" noValidate onSubmit={submit}>
            <div className={`field ${errors.email ? 'bad' : ''}`}><label htmlFor="email"><Mail size={14} />Email profissional</label>
              <input id="email" type="email" autoComplete="email" placeholder="voce@seunegocio.com.br" value={email} onChange={e => setEmail(e.target.value)} aria-invalid={!!errors.email} aria-describedby={errors.email ? 'e-email' : undefined} />
              {errors.email && <div className="errmsg" id="e-email">{errors.email}</div>}</div>
            <div className={`field ${errors.password ? 'bad' : ''}`}><label htmlFor="password"><Lock size={14} />Senha</label>
              <div className="pw"><input id="password" type={show ? 'text' : 'password'} autoComplete="current-password" placeholder="Sua senha" value={password} onChange={e => setPassword(e.target.value)} aria-invalid={!!errors.password} aria-describedby={errors.password ? 'e-password' : undefined} />
                <button type="button" className="icon-btn pw-toggle" aria-label={show ? 'Ocultar senha' : 'Mostrar senha'} aria-pressed={show} onClick={() => setShow(s => !s)}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
              {errors.password && <div className="errmsg" id="e-password">{errors.password}</div>}</div>
            <div className="auth-row">
              <label className="check-line"><input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} /> Lembrar de mim</label>
              <button type="button" className="btn-link" onClick={() => setMessage({ kind: 'ok', text: 'Na demonstração não há recuperação de senha. Use uma das contas abaixo.' })}>Esqueci a senha</button>
            </div>
            <div aria-live="polite">{message && <div className={`alert ${message.kind}`} role={message.kind === 'err' ? 'alert' : undefined}>{message.text}</div>}</div>
            <button className="btn btn-primary full" type="submit" disabled={busy}>{busy ? <><span className="spin-dot" aria-hidden="true" />Entrando</> : <>Entrar <ArrowRight size={15} className="arrow" /></>}</button>
          </form>
          <div className="divider"><span>ou entre com uma conta de demonstração</span></div>
          <div className="demo-accounts">{DEMO_ACCOUNTS.map(a =>
            <button key={a.email} type="button" className="acc" disabled={busy} onClick={() => { setEmail(a.email); setPassword(a.password); void enter(a.email, a.password); }}>
              <Avatar initials={a.initials} company={a.role === 'ADMIN'} /><span><b>{a.label}</b><small>{a.hint}</small></span></button>)}</div>
          <p className="auth-switch">Ainda não faz parte? <button type="button" className="btn-link" onClick={() => { setMode('register'); setErrors({}); setMessage(null); }}>Criar conta</button></p>
        </> : <>
          <p className="overline">Nova integrante</p>
          <h1 id="auth-h" className="auth-h">Crie sua conta</h1>
          <p className="lead">Cadastre o seu negócio para começar a receber recomendações de parceria.</p>
          <form className="auth-fields" noValidate onSubmit={e => void submitRegister(e)}>
            <div className="cols">
              <div className={`field ${errors.name ? 'bad' : ''}`}><label htmlFor="reg-name">Seu nome</label>
                <input id="reg-name" value={regName} onChange={e => setRegName(e.target.value)} placeholder="Ex.: Mariana Costa" />
                {errors.name && <div className="errmsg">{errors.name}</div>}</div>
              <div className={`field ${errors.biz ? 'bad' : ''}`}><label htmlFor="reg-biz">Nome do negócio</label>
                <input id="reg-biz" value={regBiz} onChange={e => setRegBiz(e.target.value)} placeholder="Ex.: Estúdio Coral" />
                {errors.biz && <div className="errmsg">{errors.biz}</div>}</div>
            </div>
            <div className={`field ${errors.email ? 'bad' : ''}`}><label htmlFor="reg-email"><Mail size={14} />Email profissional</label>
              <input id="reg-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="voce@seunegocio.com.br" />
              {errors.email && <div className="errmsg">{errors.email}</div>}</div>
            <div className={`field ${errors.password ? 'bad' : ''}`}><label htmlFor="reg-pw"><Lock size={14} />Senha</label>
              <div className="pw"><input id="reg-pw" type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" />
                <button type="button" className="icon-btn pw-toggle" aria-label={show ? 'Ocultar senha' : 'Mostrar senha'} aria-pressed={show} onClick={() => setShow(s => !s)}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
              {errors.password && <div className="errmsg">{errors.password}</div>}</div>
            <div aria-live="polite">{message && <div className={`alert ${message.kind}`} role={message.kind === 'err' ? 'alert' : undefined}>{message.text}</div>}</div>
            <button className="btn btn-primary full" type="submit" disabled={busy}>Criar conta e acessar <ArrowRight size={15} className="arrow" /></button>
          </form>
          <p className="auth-switch">Já tem conta? <button type="button" className="btn-link" onClick={() => { setMode('login'); setErrors({}); setMessage(null); }}>Entrar</button></p>
        </>}
        <p className="note auth-legal">Ao continuar, você concorda com os Termos de Uso e a Política de Privacidade. Contas e dados são demonstrativos.</p>
      </div>
    </section>
  </div>;
}
