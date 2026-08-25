import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegistroAsistenciaPage from '../../modules/asistencias/RegistroAsistenciaPage';
import SeguridadPage from '../../modules/configuracion/SeguridadPage';
import NuevaVentaPage from '../../modules/ventas/NuevaVentaPage';
import * as asistenciasService from '../../services/asistencias.service';
import { configuracionService } from '../../services/configuracion.service';
import { obtenerProductos } from '../../services/productos.service';
import { pagosService } from '../../services/pagos.service';
import { ventasService } from '../../services/ventas.service';
import toast from 'react-hot-toast';

vi.mock('../../services/asistencias.service');
vi.mock('../../services/configuracion.service', () => ({
  configuracionService: { cambiarPassword: vi.fn() },
}));
vi.mock('../../services/productos.service', () => ({ obtenerProductos: vi.fn() }));
vi.mock('../../services/pagos.service', () => ({
  pagosService: { obtenerMetodos: vi.fn() },
}));
vi.mock('../../services/ventas.service', () => ({
  ventasService: { crearVenta: vi.fn() },
}));
vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

describe('Integración de pantallas críticas', () => {
  beforeEach(() => vi.clearAllMocks());

  it('busca una membresía activa y registra la asistencia', async () => {
    const user = userEvent.setup();
    vi.mocked(asistenciasService.buscarPorDni).mockResolvedValue({
      id: 7,
      nombres: 'Ana',
      apellidos: 'Pérez',
      dni: '12345678',
      membresias: [{ fechaFin: '2030-01-01', plan: { nombre: 'Mensual' } }],
    });
    vi.mocked(asistenciasService.registrarAsistencia).mockResolvedValue({ id: 1 });
    render(<RegistroAsistenciaPage />);

    await user.type(screen.getByPlaceholderText(/Buscar por código/i), '12345678');
    await user.click(screen.getByRole('button', { name: 'Verificar' }));
    expect(await screen.findByText('Acceso Permitido')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Confirmar Ingreso' }));
    expect(asistenciasService.registrarAsistencia).toHaveBeenCalledWith({ miembroId: 7 });
    expect(toast.success).toHaveBeenCalledWith('Asistencia registrada correctamente');
  });

  it('impide cambiar la contraseña cuando la confirmación no coincide', async () => {
    const user = userEvent.setup();
    render(<SeguridadPage />);
    const inputs = screen.queryAllByRole('textbox');
    expect(inputs).toHaveLength(0);
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    await user.type(passwordInputs[0] as HTMLInputElement, 'Actual-123!');
    await user.type(passwordInputs[1] as HTMLInputElement, 'Nueva-123!');
    await user.type(passwordInputs[2] as HTMLInputElement, 'Distinta-123!');
    await user.click(screen.getByRole('button', { name: 'Actualizar Contraseña' }));
    expect(configuracionService.cambiarPassword).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith('La nueva contraseña y la confirmación no coinciden');
  });

  it('envía metodoId y productos al completar una venta', async () => {
    const user = userEvent.setup();
    const productos = [{ id: 11, nombre: 'Proteína', sku: 'PRO-1', precioVenta: 25, stock: 3, estado: 'Activo' }];
    vi.mocked(obtenerProductos).mockResolvedValue(productos);
    vi.mocked(pagosService.obtenerMetodos).mockResolvedValue([{ id: 4, nombre: 'Yape', activo: true }]);
    vi.mocked(ventasService.crearVenta).mockResolvedValue({ venta: { id: 1 } });
    render(<NuevaVentaPage />);

    await screen.findByText('Proteína');
    await user.click(screen.getByText('Proteína'));
    await user.type(screen.getByPlaceholderText('Público General'), 'Ana');
    await user.click(screen.getByRole('button', { name: 'Completar Venta' }));

    await waitFor(() => expect(ventasService.crearVenta).toHaveBeenCalledWith(expect.objectContaining({
      cliente: 'Ana',
      metodoId: 4,
      items: [{ productoId: 11, cantidad: 1, precioUnit: 25 }],
    })));
    expect(toast.success).toHaveBeenCalledWith('Venta completada exitosamente');
  });
});
