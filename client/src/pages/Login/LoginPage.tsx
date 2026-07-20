import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, KeyRound, Loader2 } from 'lucide-react';

// Rutas a tus imágenes (asegúrate de que los nombres coincidan con tus archivos)
import bgImage from '../../assets/logos/fondo.png';
import logoImage from '../../assets/logos/logo.png';

const LoginPage = () => {
  const navigate = useNavigate();

  // Estados del formulario
  const [paso, setPaso] = useState<1 | 2>(1);
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [codigoOtp, setCodigoOtp] = useState('');

  // Estados de carga y error
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  // URL del backend (Variables de entorno)
  const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

  // Paso 1: Validar credenciales y pedir OTP
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setError('');

    try {
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.mensaje || 'Error al iniciar sesión');

      // Si es exitoso, pasamos al paso 2
      setPaso(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexión');
    } finally {
      setCargando(false);
    }
  };

  // Paso 2: Verificar el código que llegó al correo
  const handleVerificarOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!usuario.trim()) {
      setError('Error: El nombre de usuario no es válido.');
      return;
    }

    setCargando(true);
    setError('');

    try {
      const res = await fetch(`${apiUrl}/auth/verificar-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario: usuario.trim(),
          codigo: codigoOtp.trim()
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.mensaje || 'Código inválido');
      }

      // Guardado exitoso
      localStorage.setItem('token', data.token);
      if (data.usuario) {
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
      }

      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al verificar código');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div
      className="relative flex min-h-screen w-full items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Capa oscura (Overlay) para resaltar la caja central */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Contenedor principal del formulario */}
      <div className="relative z-10 mt-12 w-full max-w-[420px] rounded-xl bg-[#0a0a0a] p-8 pt-12 shadow-[0_0_50px_rgba(0,0,0,0.7)]">

        {/* Logo flotante (Mitad afuera, mitad adentro) */}
        <div className="absolute -top-10 left-1/2 flex h-20 w-20 -translate-x-1/2 items-center justify-center rounded-full bg-[#0a0a0a] p-1.5 shadow-xl">
          <img src={logoImage} alt="Logo" className="h-full w-full rounded-full object-cover" />
        </div>

        {/* Textos de Bienvenida */}
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

        {/* Mostrar mensaje de error si existe */}
        {error && (
          <div className="mb-4 rounded border border-red-500/50 bg-red-500/10 p-3 text-center text-xs text-red-400 transition-all">
            {error}
          </div>
        )}

        {/* Formularios Dinámicos */}
        {paso === 1 ? (
          /* ----- FORMULARIO PASO 1 (CREDENCIALES) ----- */
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
                  placeholder="correo"
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
          /* ----- FORMULARIO PASO 2 (CÓDIGO OTP) ----- */
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