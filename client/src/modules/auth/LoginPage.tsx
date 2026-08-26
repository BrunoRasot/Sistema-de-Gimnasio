import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, KeyRound, Loader2, Eye, EyeOff } from 'lucide-react';
import { loginService, verifyOtpService, solicitarRecuperacionService, restablecerPasswordService } from '../../services/auth.service';
import bgImage from '../../assets/logos/fondo.png';
import logoImage from '../../assets/logos/logo.png';

const LoginPage = () => {
  const navigate = useNavigate();
  const [paso, setPaso] = useState<1 | 2 | 3 | 4>(1);
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [codigoOtp, setCodigoOtp] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setError('');

    try {
      await loginService(usuario, password);
      setPaso(2);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setCargando(false);
    }
  };

  const handleVerificarOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!usuario.trim()) {
      setError('Error: El nombre de usuario no es válido.');
      return;
    }

    setCargando(true);
    setError('');

    try {
      await verifyOtpService(usuario.trim(), codigoOtp.trim());

      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Error al verificar código');
    } finally {
      setCargando(false);
    }
  };

  const handleSolicitarRecuperacion = async (e: React.FormEvent) => {
    e.preventDefault(); setCargando(true); setError(''); setMensaje('');
    try {
      const data = await solicitarRecuperacionService(usuario.trim());
      setMensaje(data.mensaje);
      setPaso(4);
    } catch (err: any) { setError(err.message || 'No se pudo solicitar la recuperación.'); }
    finally { setCargando(false); }
  };

  const handleRestablecer = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setMensaje('');
    if (nuevaPassword !== confirmarPassword) { setError('Las contraseñas no coinciden.'); return; }
    setCargando(true);
    try {
      const data = await restablecerPasswordService(usuario.trim(), codigoOtp.trim(), nuevaPassword);
      setPaso(1); setCodigoOtp(''); setNuevaPassword(''); setConfirmarPassword(''); setPassword('');
      setMensaje(data.mensaje);
    } catch (err: any) { setError(err.message || 'No se pudo cambiar la contraseña.'); }
    finally { setCargando(false); }
  };

  return (
    <div
      className="relative flex min-h-screen w-full items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-black/60"></div>
      <div className="relative z-10 mt-12 w-full max-w-[420px] rounded-xl bg-[#0a0a0a] p-8 pt-12 shadow-[0_0_50px_rgba(0,0,0,0.7)]">
        <div className="absolute -top-10 left-1/2 flex h-20 w-20 -translate-x-1/2 items-center justify-center rounded-full bg-[#0a0a0a] p-1.5 shadow-xl">
          <img src={logoImage} alt="Logo" className="h-full w-full rounded-full object-cover" />
        </div>
        <div className="mb-8 mt-2 text-center">
          <h2 className="text-[26px] font-bold tracking-wide text-white">
            {paso === 1 ? 'Bienvenido' : paso === 2 ? 'Verificación' : paso === 3 ? 'Recuperar acceso' : 'Nueva contraseña'}
          </h2>
          <p className="mt-1.5 text-xs text-gray-400">
            {paso === 1 ? 'Ingresa tus credenciales para continuar' : paso === 2 ? 'Hemos enviado un código a tu correo.' : paso === 3 ? 'Solicita un código de recuperación' : 'Ingresa el código recibido y tu nueva clave'}
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded border border-red-500/50 bg-red-500/10 p-3 text-center text-xs text-red-400 transition-all">
            {error}
          </div>
        )}
        {mensaje && <div className="mb-4 rounded border border-[#FFC107]/40 bg-[#FFC107]/10 p-3 text-center text-xs text-[#f4c430]">{mensaje}</div>}
        {paso === 1 ? (
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Usuario / Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                  <User className="h-[18px] w-[18px] text-gray-500" strokeWidth={2} />
                </div>
                <input
                  type="text"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  placeholder="correo o usuario"
                  required
                  className="w-full rounded-md bg-transparent border border-gray-800 py-3.5 pl-11 pr-4 text-sm text-white placeholder-gray-600 focus:border-[#FFC107] focus:outline-none focus:ring-1 focus:ring-[#FFC107] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                  <Lock className="h-[18px] w-[18px] text-gray-500" strokeWidth={2} />
                </div>
                <input
                  type={mostrarPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-md bg-transparent border border-gray-800 py-3.5 pl-11 pr-12 text-sm text-white placeholder-gray-600 focus:border-[#FFC107] focus:outline-none focus:ring-1 focus:ring-[#FFC107] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword((actual) => !actual)}
                  aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  aria-pressed={mostrarPassword}
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-gray-500 transition-colors hover:text-[#FFC107] focus:outline-none focus:text-[#FFC107]"
                >
                  {mostrarPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="mt-2 flex w-full items-center justify-center rounded-md bg-[#e6b010] py-4 text-[13px] font-bold text-black transition-all hover:bg-[#FFC107] active:scale-[0.98] disabled:opacity-70"
            >
              {cargando ? <Loader2 className="h-5 w-5 animate-spin" /> : 'INICIAR SESIÓN'}
            </button>
            <button type="button" onClick={() => { setPaso(3); setError(''); setMensaje(''); }} className="w-full text-center text-xs text-gray-400 transition-colors hover:text-[#FFC107]">
              ¿Olvidaste tu contraseña?
            </button>
          </form>
        ) : paso === 2 ? (
          <form onSubmit={handleVerificarOtp} className="space-y-6">
            <div>
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Código de 6 dígitos
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                  <KeyRound className="h-[18px] w-[18px] text-gray-500" strokeWidth={2} />
                </div>
                <input
                  type="text"
                  value={codigoOtp}
                  onChange={(e) => setCodigoOtp(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                  required
                  className="w-full rounded-md bg-transparent border border-gray-800 py-3.5 pl-11 pr-4 text-center text-xl tracking-widest text-white placeholder-gray-600 focus:border-[#FFC107] focus:outline-none focus:ring-1 focus:ring-[#FFC107] transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="mt-2 flex w-full items-center justify-center rounded-md bg-[#e6b010] py-4 text-[13px] font-bold text-black transition-all hover:bg-[#FFC107] active:scale-[0.98] disabled:opacity-70"
            >
              {cargando ? <Loader2 className="h-5 w-5 animate-spin" /> : 'VERIFICAR CÓDIGO'}
            </button>

            <button
              type="button"
              onClick={() => {
                setPaso(1);
                setCodigoOtp('');
                setError('');
              }}
              className="w-full text-center text-xs text-gray-400 hover:text-white mt-2 transition-colors"
            >
              Volver atrás
            </button>
          </form>
        ) : paso === 3 ? (
          <form onSubmit={handleSolicitarRecuperacion} className="space-y-6">
            <div>
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-gray-400">Usuario / Email</label>
              <div className="relative"><User className="absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
                <input type="text" value={usuario} onChange={(e) => setUsuario(e.target.value)} required placeholder="correo o usuario" className="w-full rounded-md border border-gray-800 bg-transparent py-3.5 pl-11 pr-4 text-sm text-white focus:border-[#FFC107] focus:outline-none" />
              </div>
            </div>
            <button type="submit" disabled={cargando} className="flex w-full items-center justify-center rounded-md bg-[#e6b010] py-4 text-[13px] font-bold text-black hover:bg-[#FFC107] disabled:opacity-70">{cargando ? <Loader2 className="h-5 w-5 animate-spin" /> : 'ENVIAR CÓDIGO'}</button>
            <button type="button" onClick={() => setPaso(1)} className="w-full text-center text-xs text-gray-400 hover:text-white">Volver al inicio</button>
          </form>
        ) : (
          <form onSubmit={handleRestablecer} className="space-y-4">
            <input type="text" inputMode="numeric" value={codigoOtp} onChange={(e) => setCodigoOtp(e.target.value.replace(/\D/g, ''))} required maxLength={6} placeholder="Código de 6 dígitos" className="w-full rounded-md border border-gray-800 bg-transparent px-4 py-3.5 text-center text-lg tracking-widest text-white focus:border-[#FFC107] focus:outline-none" />
            <input type={mostrarPassword ? 'text' : 'password'} value={nuevaPassword} onChange={(e) => setNuevaPassword(e.target.value)} required placeholder="Nueva contraseña" className="w-full rounded-md border border-gray-800 bg-transparent px-4 py-3.5 text-sm text-white focus:border-[#FFC107] focus:outline-none" />
            <input type={mostrarPassword ? 'text' : 'password'} value={confirmarPassword} onChange={(e) => setConfirmarPassword(e.target.value)} required placeholder="Confirmar contraseña" className="w-full rounded-md border border-gray-800 bg-transparent px-4 py-3.5 text-sm text-white focus:border-[#FFC107] focus:outline-none" />
            <button type="button" onClick={() => setMostrarPassword((actual) => !actual)} className="flex items-center gap-2 text-xs text-gray-400 hover:text-[#FFC107]">{mostrarPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}{mostrarPassword ? 'Ocultar contraseñas' : 'Mostrar contraseñas'}</button>
            <p className="text-[10px] leading-4 text-gray-500">Mínimo 12 caracteres, con mayúscula, minúscula, número y símbolo.</p>
            <button type="submit" disabled={cargando} className="flex w-full items-center justify-center rounded-md bg-[#e6b010] py-4 text-[13px] font-bold text-black hover:bg-[#FFC107] disabled:opacity-70">{cargando ? <Loader2 className="h-5 w-5 animate-spin" /> : 'CAMBIAR CONTRASEÑA'}</button>
            <button type="button" onClick={() => setPaso(3)} className="w-full text-center text-xs text-gray-400 hover:text-white">Solicitar otro código</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
