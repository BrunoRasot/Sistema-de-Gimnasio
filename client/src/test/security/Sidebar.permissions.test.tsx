import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import { obtenerMisPermisos } from '../../services/permisos.service';

vi.mock('../../services/permisos.service', () => ({
  obtenerMisPermisos: vi.fn(),
}));

const renderSidebar = () => render(
  <MemoryRouter>
    <Sidebar isOpen closeSidebar={vi.fn()} />
  </MemoryRouter>,
);

describe('Visibilidad del menú por permisos', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

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

  it('sincroniza los permisos visuales al recuperar el foco', async () => {
    localStorage.setItem('usuario', JSON.stringify({ id: 8, rol: 'USER', permisos: {} }));
    vi.mocked(obtenerMisPermisos).mockResolvedValue({
      cargo: 'CAJERO',
      permisos: { ventas: { ver: true } },
    });
    renderSidebar();

    fireEvent.focus(window);

    await waitFor(() => expect(screen.getByText('Ventas')).toBeInTheDocument());
    expect(JSON.parse(localStorage.getItem('usuario')!)).toMatchObject({
      cargo: 'CAJERO',
      permisos: { ventas: { ver: true } },
    });
  });
});
