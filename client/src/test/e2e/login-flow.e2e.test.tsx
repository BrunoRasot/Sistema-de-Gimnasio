import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import LoginPage from '../../modules/auth/LoginPage';
import { loginService, verifyOtpService } from '../../services/auth.service';

vi.mock('../../services/auth.service', () => ({
  loginService: vi.fn(),
  verifyOtpService: vi.fn(),
}));

const renderFlow = () => render(
  <MemoryRouter initialEntries={['/']}>
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/dashboard" element={<div>Dashboard autenticado</div>} />
    </Routes>
  </MemoryRouter>,
);

describe('E2E jsdom: flujo visual de login y OTP', () => {
  beforeEach(() => vi.clearAllMocks());

  it('completa credenciales, OTP y navegación al dashboard', async () => {
    const user = userEvent.setup();
    vi.mocked(loginService).mockResolvedValue({ mensaje: 'OTP enviado' });
    vi.mocked(verifyOtpService).mockResolvedValue({ token: 'token' });
    renderFlow();

    await user.type(screen.getByPlaceholderText(/correo/i), 'admin');
    await user.type(screen.getByPlaceholderText('••••••••'), 'Password-123!');
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));
    expect(await screen.findByText('Código de 6 dígitos')).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('000000'), '123456');
    await user.click(screen.getByRole('button', { name: /verificar código/i }));
    await waitFor(() => expect(screen.getByText('Dashboard autenticado')).toBeInTheDocument());
    expect(loginService).toHaveBeenCalledWith('admin', 'Password-123!');
    expect(verifyOtpService).toHaveBeenCalledWith('admin', '123456');
  });

  it('muestra el error de credenciales y conserva el primer paso', async () => {
    const user = userEvent.setup();
    vi.mocked(loginService).mockRejectedValue(new Error('Credenciales incorrectas'));
    renderFlow();
    await user.type(screen.getByPlaceholderText(/correo/i), 'admin');
    await user.type(screen.getByPlaceholderText('••••••••'), 'mala');
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));
    expect(await screen.findByText('Credenciales incorrectas')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });
});
