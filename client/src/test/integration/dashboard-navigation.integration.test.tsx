import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import DashboardPage from '../../modules/dashboard/DashboardPage';

vi.mock('../../services/usuarios.service', () => ({
  obtenerUsuarios: vi.fn().mockResolvedValue({
    usuarios: [{ id: 1, nombreUsuario: 'Bruno', nombres: 'Bruno', apellidos: 'Ramos', rol: 'ADMIN', createdAt: '2026-08-25' }],
  }),
}));
vi.mock('../../services/membresias.service', () => ({
  obtenerMembresias: vi.fn().mockResolvedValue({ membresias: [] }),
}));
vi.mock('../../services/productos.service', () => ({
  obtenerProductos: vi.fn().mockResolvedValue([
    { id: 1, nombre: 'Proteína', estado: 'Activo', stock: 1, stockMinimo: 5 },
  ]),
}));
vi.mock('../../services/reportes.service', () => ({
  reportesService: {
    obtenerReporteVentas: vi.fn().mockResolvedValue({ chartData: [] }),
    obtenerReporteAsistencias: vi.fn().mockResolvedValue({ chartData: [] }),
    obtenerReporteMembresias: vi.fn().mockResolvedValue({ chartData: [] }),
  },
}));
vi.mock('../../services/ventas.service', () => ({
  ventasService: { obtenerVentas: vi.fn().mockResolvedValue([]) },
}));

const destinos = [
  { nombre: /ingresos \(mes\)/i, ruta: '/reportes/ventas' },
  { nombre: /membresías activas/i, ruta: '/membresias/activos' },
  { nombre: /personal registrado/i, ruta: '/usuarios/lista' },
  { nombre: /alertas de stock/i, ruta: '/productos/alertas' },
  { nombre: /abrir reporte de ventas/i, ruta: '/reportes/ventas' },
  { nombre: /abrir resumen de asistencias/i, ruta: '/asistencias/resumen' },
  { nombre: /abrir reporte de membresías/i, ruta: '/reportes/membresias' },
];

const RutaActual = () => <output data-testid="ruta">{useLocation().pathname}</output>;

describe('Navegación del dashboard', () => {
  beforeEach(() => vi.clearAllMocks());

  it.each(destinos)('abre $ruta al pulsar su indicador o gráfico', async ({ nombre, ruta }) => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="*" element={<RutaActual />} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(await screen.findByRole('button', { name: nombre }));

    expect(screen.getByTestId('ruta')).toHaveTextContent(ruta);
  });

  it.each([
    { nombre: /abrir usuario bruno/i, ruta: '/usuarios/lista' },
    { nombre: /abrir alerta de stock de proteína/i, ruta: '/productos/alertas' },
  ])('abre $ruta al pulsar una fila', async ({ nombre, ruta }) => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="*" element={<RutaActual />} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(await screen.findByRole('link', { name: nombre }));

    expect(screen.getByTestId('ruta')).toHaveTextContent(ruta);
  });
});
