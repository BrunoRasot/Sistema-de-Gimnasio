import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';

const renderSidebar = () => render(
  <MemoryRouter>
    <Sidebar isOpen closeSidebar={vi.fn()} />
  </MemoryRouter>,
);

describe('Visibilidad del menú por permisos', () => {
  beforeEach(() => localStorage.clear());

  it('muestra todos los módulos al administrador', () => {
    localStorage.setItem('usuario', JSON.stringify({ rol: 'ADMIN' }));
    renderSidebar();
    for (const label of ['Dashboard', 'Membresías', 'Usuarios', 'Productos', 'Ventas', 'Pagos', 'Asistencias', 'Reportes', 'Configuración']) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it('solo muestra dashboard y módulos autorizados a USER', () => {
    localStorage.setItem('usuario', JSON.stringify({
      rol: 'USER',
      permisos: { ventas: { ver: true }, asistencias: { ver: true } },
    }));
    renderSidebar();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Ventas')).toBeInTheDocument();
    expect(screen.getByText('Asistencias')).toBeInTheDocument();
    expect(screen.queryByText('Usuarios')).not.toBeInTheDocument();
    expect(screen.queryByText('Configuración')).not.toBeInTheDocument();
  });

  it('no rompe la interfaz con usuario corrupto', () => {
    localStorage.setItem('usuario', '{inválido');
    renderSidebar();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.queryByText('Ventas')).not.toBeInTheDocument();
  });
});
