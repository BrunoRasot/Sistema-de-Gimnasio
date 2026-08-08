import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MetodosPagoPage from '../modules/pagos/MetodosPagoPage';
import { pagosService } from '../services/pagos.service';

vi.mock('../services/pagos.service', () => ({
  pagosService: {
    obtenerMetodos: vi.fn(),
    crearMetodo: vi.fn(),
    actualizarMetodo: vi.fn(),
  },
}));

describe('Pruebas de MetodosPagoPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Debería mostrar la tabla vacía si el API no devuelve métodos', async () => {
    vi.mocked(pagosService.obtenerMetodos).mockResolvedValue([]);

    render(<MetodosPagoPage />);

    await waitFor(() => {
      expect(screen.getByText('No hay métodos registrados.')).toBeInTheDocument();
    });

    expect(screen.getByText('Nuevo Método', { selector: 'h2' })).toBeInTheDocument();
  });

  it('Debería cargar y mostrar la lista de métodos de pago', async () => {
    const mockMetodos = [
      { id: 1, nombre: 'Yape', descripcion: 'Pago móvil BCP', activo: true },
      { id: 2, nombre: 'Transferencia', descripcion: 'Interbancaria', activo: false },
    ];

    vi.mocked(pagosService.obtenerMetodos).mockResolvedValue(mockMetodos);

    render(<MetodosPagoPage />);

    await waitFor(() => {
      expect(screen.getByText('Yape')).toBeInTheDocument();
    });

    expect(screen.getByText('Pago móvil BCP')).toBeInTheDocument();
    expect(screen.getByText('Activo')).toBeInTheDocument();

    expect(screen.getByText('Transferencia')).toBeInTheDocument();
    expect(screen.getByText('Interbancaria')).toBeInTheDocument();
    expect(screen.getByText('Inactivo')).toBeInTheDocument();
  });

  it('Debería llamar a crearMetodo al enviar el formulario nuevo', async () => {
    const user = userEvent.setup();
    vi.mocked(pagosService.obtenerMetodos).mockResolvedValue([]);
    vi.mocked(pagosService.crearMetodo).mockResolvedValue({ id: 3, nombre: 'Plin', activo: true });

    render(<MetodosPagoPage />);

    const inputNombre = await screen.findByPlaceholderText('Ej. Yape, Plin, Efectivo');
    await user.type(inputNombre, 'Plin');

    const inputDescripcion = screen.getByPlaceholderText('Instrucciones o detalles opcionales');
    await user.type(inputDescripcion, 'Pago móvil Scotiabank');

    const btnGuardar = screen.getByRole('button', { name: /Guardar/i });
    await user.click(btnGuardar);

    expect(pagosService.crearMetodo).toHaveBeenCalledWith({
      id: 0,
      nombre: 'Plin',
      descripcion: 'Pago móvil Scotiabank',
      activo: true,
    });
  });

  it('Debería cargar los datos en el formulario al presionar Editar y luego actualizar', async () => {
    const user = userEvent.setup();
    const mockMetodos = [{ id: 1, nombre: 'Yape', descripcion: 'Pago BCP', activo: true }];
    vi.mocked(pagosService.obtenerMetodos).mockResolvedValue(mockMetodos);
    vi.mocked(pagosService.actualizarMetodo).mockResolvedValue({});

    render(<MetodosPagoPage />);

    const btnEditar = await screen.findByRole('button', { name: /Editar/i });
    await user.click(btnEditar);
    expect(screen.getByText('Editar Método')).toBeInTheDocument();
    const inputNombre = screen.getByDisplayValue('Yape');
    expect(inputNombre).toBeInTheDocument();
    await user.clear(inputNombre);
    await user.type(inputNombre, 'Yape Empresa');

    const btnGuardar = screen.getByRole('button', { name: /Guardar/i });
    await user.click(btnGuardar);

    expect(pagosService.actualizarMetodo).toHaveBeenCalledWith(1, {
      id: 1,
      nombre: 'Yape Empresa',
      descripcion: 'Pago BCP',
      activo: true,
    });
  });

  it('Debería cambiar el estado (activar/desactivar) directamente desde la tabla', async () => {
    const user = userEvent.setup();
    const mockMetodos = [{ id: 1, nombre: 'Efectivo', descripcion: '', activo: true }];
    vi.mocked(pagosService.obtenerMetodos).mockResolvedValue(mockMetodos);
    vi.mocked(pagosService.actualizarMetodo).mockResolvedValue({});

    render(<MetodosPagoPage />);

    const btnDesactivar = await screen.findByTitle('Desactivar');
    await user.click(btnDesactivar);
    expect(pagosService.actualizarMetodo).toHaveBeenCalledWith(1, {
      id: 1,
      nombre: 'Efectivo',
      descripcion: '',
      activo: false,
    });
  });
});
