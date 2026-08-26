import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CategoriasPage from '../modules/productos/CategoriasPage';
import * as categoriasService from '../services/categorias.service';

vi.mock('../services/categorias.service');

describe('Pruebas de CategoriasPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('usuario', JSON.stringify({ rol: 'ADMIN' }));
  });

  it('Debería mostrar el mensaje de tabla vacía si el API no devuelve datos', async () => {
    vi.mocked(categoriasService.obtenerCategorias).mockResolvedValue([]);

    render(<CategoriasPage />);

    expect(screen.getByText(/Cargando.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/No hay categorías registradas./i)).toBeInTheDocument();
    });
  });

  it('Debería cargar y mostrar la lista de categorías del API', async () => {
    const mockCategorias = [
      {
        id: 1,
        nombre: 'Suplementos',
        descripcion: 'Proteínas y creatina',
        estado: true,
        _count: { productos: 15 },
      },
      {
        id: 2,
        nombre: 'Accesorios',
        descripcion: 'Guantes y correas',
        estado: false,
        _count: { productos: 0 },
      },
    ];

    vi.mocked(categoriasService.obtenerCategorias).mockResolvedValue(mockCategorias);

    render(<CategoriasPage />);

    await waitFor(() => {
      expect(screen.getByText('Suplementos')).toBeInTheDocument();
    });

    expect(screen.getByText('Proteínas y creatina')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();

    expect(screen.getByText('Accesorios')).toBeInTheDocument();
    expect(screen.getByText('Inactivo')).toBeInTheDocument();
  });

  it('Debería filtrar la tabla cuando se escribe en el buscador', async () => {
    const user = userEvent.setup();
    const mockCategorias = [
      { id: 1, nombre: 'Suplementos', descripcion: '', estado: true, _count: { productos: 0 } },
      { id: 2, nombre: 'Ropa Deportiva', descripcion: '', estado: true, _count: { productos: 0 } },
    ];

    vi.mocked(categoriasService.obtenerCategorias).mockResolvedValue(mockCategorias);

    render(<CategoriasPage />);

    await waitFor(() => {
      expect(screen.getByText('Suplementos')).toBeInTheDocument();
      expect(screen.getByText('Ropa Deportiva')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Buscar categoría...');
    await user.type(searchInput, 'Ropa');

    expect(screen.getByText('Ropa Deportiva')).toBeInTheDocument();
    expect(screen.queryByText('Suplementos')).not.toBeInTheDocument();
  });

  it('Debería abrir el modal al hacer clic en Nueva Categoría', async () => {
    const user = userEvent.setup();
    vi.mocked(categoriasService.obtenerCategorias).mockResolvedValue([]);

    render(<CategoriasPage />);

    const btnNueva = screen.getByRole('button', { name: /Nueva Categoría/i });
    await user.click(btnNueva);

    expect(screen.getByText('Nueva Categoría', { selector: 'h2' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ej. Suplementos')).toBeInTheDocument();
  });

  it('Debería llamar a crearCategoria y cerrar el modal al guardar', async () => {
    const user = userEvent.setup();
    vi.mocked(categoriasService.obtenerCategorias).mockResolvedValue([]);
    vi.mocked(categoriasService.crearCategoria).mockResolvedValue({
      id: 3,
      nombre: 'Equipamiento',
      estado: true,
    });

    render(<CategoriasPage />);

    const btnNueva = screen.getByRole('button', { name: /Nueva Categoría/i });
    await user.click(btnNueva);

    const inputNombre = screen.getByPlaceholderText('Ej. Suplementos');
    await user.type(inputNombre, 'Equipamiento');

    const inputDescripcion = screen.getByPlaceholderText('Detalles opcionales...');
    await user.type(inputDescripcion, 'Mancuernas y pesas');

    const btnGuardar = screen.getByRole('button', { name: /Guardar/i });
    await user.click(btnGuardar);

    expect(categoriasService.crearCategoria).toHaveBeenCalledWith({
      nombre: 'Equipamiento',
      descripcion: 'Mancuernas y pesas',
      estado: true,
    });

    await waitFor(() => {
      expect(screen.queryByText('Nueva Categoría', { selector: 'h2' })).not.toBeInTheDocument();
    });
  });
});
