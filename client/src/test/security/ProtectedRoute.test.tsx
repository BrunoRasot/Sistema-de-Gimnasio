import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '../../routes/ProtectedRoute';
import { tokenService } from '../../services/token.service';

const renderRoute = (path: string) => render(
  <MemoryRouter initialEntries={[path]}>
    <Routes>
      <Route path="/" element={<div>Login</div>} />
      <Route path="/dashboard" element={<div>Dashboard</div>} />
      <Route element={<ProtectedRoute />}>
        <Route path="/ventas" element={<div>Ventas protegidas</div>} />
      </Route>
    </Routes>
  </MemoryRouter>,
);

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear();
    tokenService.clearAccessToken();
  });

  it('redirige al login cuando falta el token', () => {
    renderRoute('/ventas');
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('elimina el token y redirige si el usuario almacenado está corrupto', () => {
    tokenService.setAccessToken('token');
    localStorage.setItem('usuario', '{invalido');
    renderRoute('/ventas');
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(tokenService.getAccessToken()).toBeNull();
  });

  it('permite cualquier módulo a un administrador', () => {
    tokenService.setAccessToken('token');
    localStorage.setItem('usuario', JSON.stringify({ rol: 'ADMIN' }));
    renderRoute('/ventas');
    expect(screen.getByText('Ventas protegidas')).toBeInTheDocument();
  });

  it('permite a USER cuando tiene permiso ver', () => {
    tokenService.setAccessToken('token');
    localStorage.setItem('usuario', JSON.stringify({ rol: 'USER', permisos: { ventas: { ver: true } } }));
    renderRoute('/ventas');
    expect(screen.getByText('Ventas protegidas')).toBeInTheDocument();
  });

  it('redirige al dashboard cuando USER no tiene permiso', () => {
    tokenService.setAccessToken('token');
    localStorage.setItem('usuario', JSON.stringify({ rol: 'USER', permisos: {} }));
    renderRoute('/ventas');
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});
