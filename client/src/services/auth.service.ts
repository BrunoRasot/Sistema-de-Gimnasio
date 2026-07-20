const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/auth';

export const loginService = async (usuario: string, password: string) => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuario, password }),
  });

  if (!response.ok) throw new Error('Credenciales incorrectas');

  const data = await response.json();

  if (data.token) {
    localStorage.setItem('token', data.token);


    if (data.usuario) {
      localStorage.setItem('usuarioRol', data.usuario.rol || 'USER');
      localStorage.setItem('usuarioCargo', data.usuario.cargo || '');
    }
  }

  return data;
};

export const verifyOtpService = async (usuario: string, codigo: string) => {
  const response = await fetch(`${API_URL}/verificar-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuario, codigo }),
  });

  if (!response.ok) throw new Error('Código inválido o expirado');

  const data = await response.json();

  if (data.token) {
    localStorage.setItem('token', data.token);

    if (data.usuario) {
      localStorage.setItem('usuarioRol', data.usuario.rol || 'USER');
      localStorage.setItem('usuarioCargo', data.usuario.cargo || '');
    }
  }

  return data;
};

export const logoutService = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('usuarioRol');
  localStorage.removeItem('usuarioCargo');
};