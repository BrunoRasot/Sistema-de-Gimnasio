import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../modules/auth/LoginPage';

vi.mock('../services/api', () => ({
  api: { post: vi.fn() },
}));

describe('Pruebas del Componente de Login', () => {
  const renderLogin = () => {
    return render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>,
    );
  };

  it('Debería renderizar el formulario correctamente', () => {
    renderLogin();
    expect(screen.getByPlaceholderText(/correo/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión|ingresar/i })).toBeInTheDocument();
  });

  it('Debería permitir escribir en los campos de texto', async () => {
    const user = userEvent.setup();
    renderLogin();

    const inputUsuario = screen.getByPlaceholderText(/correo/i);
    const inputPassword = screen.getByPlaceholderText('••••••••');

    await user.type(inputUsuario, 'admin');
    await user.type(inputPassword, 'password123');

    expect(inputUsuario).toHaveValue('admin');
    expect(inputPassword).toHaveValue('password123');
  });

  it('Los campos de texto deben ser obligatorios (required)', () => {
    renderLogin();

    expect(screen.getByPlaceholderText(/correo/i)).toBeRequired();
    expect(screen.getByPlaceholderText('••••••••')).toBeRequired();
  });
});
