import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RolesPermisosPage from '../modules/usuarios/RolesPermisosPage';
import * as permisosService from '../services/permisos.service';

vi.mock('../services/permisos.service');

describe('Pruebas de RolesPermisosPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Debería mostrar el estado de carga y luego renderizar la matriz por defecto', async () => {
    vi.mocked(permisosService.obtenerPermisosBD).mockResolvedValue([]);

    render(<RolesPermisosPage />);

    expect(screen.getByText(/Cargando configuración.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Configura el nivel de acceso a los módulos/i)).toBeInTheDocument();
    });

    const cargoResaltado = screen
      .getAllByText('Supervisor')
      .find((el) => el.tagName.toLowerCase() === 'span');
    expect(cargoResaltado).toBeInTheDocument();
  });

  it('Debería cambiar de cargo al hacer clic en el menú lateral', async () => {
    const user = userEvent.setup();
    vi.mocked(permisosService.obtenerPermisosBD).mockResolvedValue([]);

    render(<RolesPermisosPage />);

    await waitFor(() => {
      expect(screen.getByText('Permisos para:')).toBeInTheDocument();
    });

    const btnRecepcionista = screen.getByRole('button', { name: /Recepcionista/i });
    await user.click(btnRecepcionista);

    const cargoResaltado = screen
      .getAllByText('Recepcionista')
      .find((el) => el.tagName.toLowerCase() === 'span');
    expect(cargoResaltado).toBeInTheDocument();
  });

  it('Debería bloquear la edición y el botón de guardar si el cargo es Administrador', async () => {
    const user = userEvent.setup();
    vi.mocked(permisosService.obtenerPermisosBD).mockResolvedValue([]);

    render(<RolesPermisosPage />);

    await waitFor(() => {
      expect(screen.getByText('Permisos para:')).toBeInTheDocument();
    });

    const btnAdmin = screen.getByRole('button', { name: /Administrador/i });
    await user.click(btnAdmin);

    expect(
      screen.getByText(/Este cargo tiene acceso total. Los permisos están bloqueados./i),
    ).toBeInTheDocument();

    const btnGuardar = screen.getByRole('button', { name: /Guardar Cambios/i });
    expect(btnGuardar).toBeDisabled();
  });

  it('Debería llamar al servicio guardarPermisosBD al hacer clic en Guardar Cambios', async () => {
    const user = userEvent.setup();
    vi.mocked(permisosService.obtenerPermisosBD).mockResolvedValue([]);
    vi.mocked(permisosService.guardarPermisosBD).mockResolvedValue({});

    render(<RolesPermisosPage />);

    await waitFor(() => {
      expect(screen.getByText('Permisos para:')).toBeInTheDocument();
    });

    const btnGuardar = screen.getByRole('button', { name: /Guardar Cambios/i });
    expect(btnGuardar).not.toBeDisabled();

    await user.click(btnGuardar);
    expect(permisosService.guardarPermisosBD).toHaveBeenCalledWith({
      cargo: 'Supervisor',
      permisos: expect.any(Object),
    });
  });
});
