import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProveedoresPage from '../modules/productos/ProveedoresPage';
import * as proveedoresService from '../services/proveedores.service';

vi.mock('../services/proveedores.service');

describe('Pruebas de ProveedoresPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Debería mostrar el mensaje de tabla vacía si el API no devuelve datos', async () => {
    vi.mocked(proveedoresService.obtenerProveedores).mockResolvedValue([]);

    render(<ProveedoresPage />);

    expect(screen.getByText(/Cargando.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/No hay proveedores registrados./i)).toBeInTheDocument();
    });
  });

  it('Debería cargar y mostrar la lista de proveedores del API', async () => {
    const mockProveedores = [
      {
        id: 1,
        nombre: 'Optimum Nutrition',
        contacto: 'Juan Perez',
        telefono: '999888777',
        email: 'juan@on.com',
        direccion: 'Lima Central',
        estado: true,
      },
      {
        id: 2,
        nombre: 'Equipos Gym SA',
        contacto: '',
        telefono: '',
        email: '',
        direccion: '',
        estado: false,
      },
    ];

    vi.mocked(proveedoresService.obtenerProveedores).mockResolvedValue(mockProveedores);

    render(<ProveedoresPage />);

    await waitFor(() => {
      expect(screen.getByText('Optimum Nutrition')).toBeInTheDocument();
    });

    expect(screen.getByText('Lima Central')).toBeInTheDocument();
    expect(screen.getByText('Juan Perez')).toBeInTheDocument();
    expect(screen.getByText('999888777')).toBeInTheDocument();
    expect(screen.getByText('juan@on.com')).toBeInTheDocument();
    expect(screen.getByText('Activo')).toBeInTheDocument();
    expect(screen.getByText('Equipos Gym SA')).toBeInTheDocument();
    expect(screen.getByText('Sin dirección')).toBeInTheDocument();
    expect(screen.getByText('Inactivo')).toBeInTheDocument();
  });

  it('Debería filtrar la tabla cuando se escribe en el buscador', async () => {
    const user = userEvent.setup();
    const mockProveedores = [
      {
        id: 1,
        nombre: 'Optimum Nutrition',
        contacto: 'Juan Perez',
        telefono: '',
        email: '',
        direccion: '',
        estado: true,
      },
      {
        id: 2,
        nombre: 'Gimnasio Supplies',
        contacto: 'Maria Gomez',
        telefono: '',
        email: '',
        direccion: '',
        estado: true,
      },
    ];

    vi.mocked(proveedoresService.obtenerProveedores).mockResolvedValue(mockProveedores);

    render(<ProveedoresPage />);

    await waitFor(() => {
      expect(screen.getByText('Optimum Nutrition')).toBeInTheDocument();
      expect(screen.getByText('Gimnasio Supplies')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Buscar por empresa o contacto...');
    await user.type(searchInput, 'Maria');

    expect(screen.getByText('Gimnasio Supplies')).toBeInTheDocument();
    expect(screen.queryByText('Optimum Nutrition')).not.toBeInTheDocument();
  });

  it('Debería abrir el modal al hacer clic en Nuevo Proveedor', async () => {
    const user = userEvent.setup();
    vi.mocked(proveedoresService.obtenerProveedores).mockResolvedValue([]);

    render(<ProveedoresPage />);

    const btnNuevo = screen.getByRole('button', { name: /Nuevo Proveedor/i });
    await user.click(btnNuevo);

    expect(screen.getByText('Nuevo Proveedor', { selector: 'h2' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ej. Optimum Nutrition')).toBeInTheDocument();
  });

  it('Debería llamar a crearProveedor y cerrar el modal al guardar un proveedor nuevo', async () => {
    const user = userEvent.setup();
    vi.mocked(proveedoresService.obtenerProveedores).mockResolvedValue([]);
    vi.mocked(proveedoresService.crearProveedor).mockResolvedValue({
      id: 3,
      nombre: 'Nike Global',
      contacto: '',
      telefono: '',
      email: '',
      direccion: '',
      estado: true,
    });

    render(<ProveedoresPage />);

    const btnNuevo = screen.getByRole('button', { name: /Nuevo Proveedor/i });
    await user.click(btnNuevo);

    const inputNombre = screen.getByPlaceholderText('Ej. Optimum Nutrition');
    await user.type(inputNombre, 'Nike Global');

    const btnGuardar = screen.getByRole('button', { name: /Guardar/i });
    await user.click(btnGuardar);

    expect(proveedoresService.crearProveedor).toHaveBeenCalledWith({
      nombre: 'Nike Global',
      contacto: '',
      telefono: '',
      email: '',
      direccion: '',
      estado: true,
    });

    await waitFor(() => {
      expect(screen.queryByText('Nuevo Proveedor', { selector: 'h2' })).not.toBeInTheDocument();
    });
  });
});
