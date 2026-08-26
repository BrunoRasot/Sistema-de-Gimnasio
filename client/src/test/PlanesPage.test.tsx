import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PlanesPage from '../modules/membresias/PlanesPage';
import * as planesService from '../services/planes.service';

vi.mock('../services/planes.service');

describe('Pruebas de PlanesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('usuario', JSON.stringify({ rol: 'ADMIN' }));
  });

  it('Debería mostrar el mensaje de tabla vacía si el API no devuelve datos', async () => {
    vi.mocked(planesService.obtenerPlanes).mockResolvedValue([]);

    render(<PlanesPage />);

    expect(screen.queryByText(/Aún no hay planes registrados/i)).not.toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Aún no hay planes registrados/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Crea tu primer plan de membresía para empezar./i),
      ).toBeInTheDocument();
    });
  });

  it('Debería cargar y mostrar la lista de planes del API', async () => {
    const mockPlanes = [
      {
        id: 1,
        nombre: 'Mensual Básico',
        descripcion: 'Acceso a máquinas',
        precio: 100,
        duracionDias: 30,
        estado: 'Activo',
      },
      {
        id: 2,
        nombre: 'Anual VIP',
        descripcion: 'Acceso total y piscina',
        precio: 1000,
        duracionDias: 365,
        estado: 'Inactivo',
      },
    ];

    vi.mocked(planesService.obtenerPlanes).mockResolvedValue(mockPlanes);

    render(<PlanesPage />);

    await waitFor(() => {
      expect(screen.getByText('Mensual Básico')).toBeInTheDocument();
    });

    expect(screen.getByText('Acceso a máquinas')).toBeInTheDocument();
    expect(screen.getByText('30 días')).toBeInTheDocument();
    expect(screen.getByText('S/ 100.00')).toBeInTheDocument();
    expect(screen.getByText('Activo')).toBeInTheDocument();

    expect(screen.getByText('Anual VIP')).toBeInTheDocument();
    expect(screen.getByText('365 días')).toBeInTheDocument();
    expect(screen.getByText('S/ 1000.00')).toBeInTheDocument();
    expect(screen.getByText('Inactivo')).toBeInTheDocument();
  });

  it('Debería abrir el modal al hacer clic en Nuevo Plan', async () => {
    const user = userEvent.setup();
    vi.mocked(planesService.obtenerPlanes).mockResolvedValue([]);

    render(<PlanesPage />);

    const btnNuevo = await screen.findByRole('button', { name: /Nuevo Plan/i });
    await user.click(btnNuevo);

    expect(screen.getByText('Nuevo Plan', { selector: 'h3' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ej. Plan Mensual Básico')).toBeInTheDocument();
  });

  it('Debería llamar a crearPlan y cerrar el modal al guardar un plan nuevo', async () => {
    const user = userEvent.setup();
    vi.mocked(planesService.obtenerPlanes).mockResolvedValue([]);
    vi.mocked(planesService.crearPlan).mockResolvedValue({
      id: 3,
      nombre: 'Semanal',
      descripcion: 'Prueba',
      precio: 35,
      duracionDias: 7,
      estado: 'Activo',
    });

    render(<PlanesPage />);

    const btnNuevo = await screen.findByRole('button', { name: /Nuevo Plan/i });
    await user.click(btnNuevo);

    const inputNombre = screen.getByPlaceholderText('Ej. Plan Mensual Básico');
    await user.type(inputNombre, 'Semanal');

    // SOLUCIÓN: Eliminamos el getByDisplayValue y usamos getAllByRole directamente
    const inputsNumber = screen.getAllByRole('spinbutton');
    const inputPrecioReal = inputsNumber[0];
    const inputDuracionReal = inputsNumber[1];

    await user.type(inputPrecioReal, '35');
    await user.type(inputDuracionReal, '7');

    const inputDescripcion = screen.getByPlaceholderText('Detalles del plan...');
    await user.type(inputDescripcion, 'Plan de prueba');

    const btnGuardar = screen.getByRole('button', { name: /Crear Plan/i });
    await user.click(btnGuardar);

    expect(planesService.crearPlan).toHaveBeenCalledWith({
      nombre: 'Semanal',
      descripcion: 'Plan de prueba',
      precio: 35,
      duracionDias: 7,
      estado: 'Activo',
    });

    await waitFor(() => {
      expect(screen.queryByText('Nuevo Plan', { selector: 'h3' })).not.toBeInTheDocument();
    });
  });
});
