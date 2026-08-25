import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, KeyRound, Loader2 } from 'lucide-react';
import { loginService, verifyOtpService } from '../../services/auth.service';
import bgImage from '../../assets/logos/fondo.png';
import logoImage from '../../assets/logos/logo.png';

const LoginPage = () => {
  const navigate = useNavigate();
  const [paso, setPaso] = useState<1 | 2>(1);
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [codigoOtp, setCodigoOtp] = useState('');
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
            {paso === 1 ? 'Bienvenido' : 'Verificación'}
          </h2>
          <p className="mt-1.5 text-xs text-gray-400">
            {paso === 1
              ? 'Ingresa tus credenciales para continuar'
              : `Hemos enviado un código a tu correo.`}
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded border border-red-500/50 bg-red-500/10 p-3 text-center text-xs text-red-400 transition-all">
            {error}
          </div>
        )}
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
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-md bg-transparent border border-gray-800 py-3.5 pl-11 pr-4 text-sm text-white placeholder-gray-600 focus:border-[#FFC107] focus:outline-none focus:ring-1 focus:ring-[#FFC107] transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="mt-2 flex w-full items-center justify-center rounded-md bg-[#e6b010] py-4 text-[13px] font-bold text-black transition-all hover:bg-[#FFC107] active:scale-[0.98] disabled:opacity-70"
            >
              {cargando ? <Loader2 className="h-5 w-5 animate-spin" /> : 'INICIAR SESIÓN'}
            </button>
          </form>
        ) : (
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
        )}
      </div>
    </div>
  );
};

export default LoginPage;
