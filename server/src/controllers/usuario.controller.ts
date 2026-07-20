import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../database/prisma.js';

const usuarioSchema = z.object({
  foto: z.string().optional(),
  nombres: z.string().min(1, 'Nombres son obligatorios'),
  apellidos: z.string().min(1, 'Apellidos son obligatorios'),
  dni: z.string().min(8, 'DNI inválido').max(15),
  fechaNacimiento: z.string().optional(),
  sexo: z.string().optional(),
  direccion: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email('Correo inválido'),
  cargo: z.string().min(1, 'Cargo es obligatorio'),
  turno: z.string().optional(),
  fechaIngreso: z.string().optional(),
  estadoLaboral: z.string().default('Activo'),
  nombreUsuario: z.string().min(4, 'Mínimo 4 caracteres'),
  password: z.string().min(8, 'La contraseña debe tener mínimo 8 caracteres').optional(),
  rol: z.string().default('USER'),
  estadoCuenta: z.string().default('Activa')
});

export const obtenerUsuarios = async (req: Request, res: Response): Promise<any> => {
  try {
    const { buscar, cargo, estado, pagina = 1, limite = 10 } = req.query;
    const page = Number(pagina);
    const limit = Number(limite);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (cargo) where.cargo = String(cargo);
    if (estado) where.estadoCuenta = String(estado);
    if (buscar) {
      where.OR = [
        { nombres: { contains: String(buscar), mode: 'insensitive' } },
        { apellidos: { contains: String(buscar), mode: 'insensitive' } },
        { dni: { contains: String(buscar) } },
        { nombreUsuario: { contains: String(buscar), mode: 'insensitive' } }
      ];
    }

    const [usuarios, total] = await prisma.$transaction([
      prisma.usuario.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          foto: true,
          nombres: true,
          apellidos: true,
          dni: true,
          cargo: true,
          nombreUsuario: true,
          email: true,
          telefono: true,
          estadoCuenta: true,
          ultimoAcceso: true,
          rol: true,
          turno: true,
          estadoLaboral: true,
          fechaIngreso: true,
          fechaNacimiento: true,
          activo: true
        }
      }),
      prisma.usuario.count({ where })
    ]);

    return res.json({
      data: usuarios,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al obtener usuarios.' });
  }
};

export const obtenerUsuarioPorId = async (req: Request, res: Response): Promise<any> => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(req.params.id) }
    });
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    const { password, ...usuarioSinPassword } = usuario;
    return res.json(usuarioSinPassword);
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
};

export const crearUsuario = async (req: Request, res: Response): Promise<any> => {
  try {
    const { nombres, apellidos, dni, email, password, telefono, rol, cargo, nombreUsuario } = req.body;
    const existeComoTrabajador = await prisma.usuario.findUnique({ where: { dni } });
    if (existeComoTrabajador) {
      return res.status(400).json({ mensaje: 'Este DNI ya está registrado como TRABAJADOR en el sistema.' });
    }

    const existeComoCliente = await prisma.miembro.findUnique({ where: { dni } });
    if (existeComoCliente) {
      return res.status(400).json({ mensaje: 'Este DNI pertenece a un CLIENTE del gimnasio. No puede registrarse como trabajador.' });
    }
    
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const nuevoUsuario = await prisma.usuario.create({
      data: {
        nombres,
        apellidos,
        dni,
        email,
        password: hashedPassword,
        telefono,
        rol: rol || 'USER',
        cargo: cargo || 'Staff',
        nombreUsuario: nombreUsuario || dni
      }
    });

    return res.status(201).json(nuevoUsuario);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: 'Error interno al registrar al usuario.' });
  }
};

export const actualizarUsuario = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const datosUpdate = { ...req.body };
    delete datosUpdate.password;
    delete datosUpdate.dni;

    await prisma.usuario.update({
      where: { id: Number(id) },
      data: {
        ...datosUpdate,
        fechaNacimiento: datosUpdate.fechaNacimiento ? new Date(datosUpdate.fechaNacimiento) : undefined,
        fechaIngreso: datosUpdate.fechaIngreso ? new Date(datosUpdate.fechaIngreso) : undefined,
      }
    });

    return res.json({ mensaje: 'Información actualizada correctamente.' });
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al actualizar trabajador.' });
  }
};

export const eliminarUsuario = async (req: Request, res: Response): Promise<any> => {
  try {
    await prisma.usuario.delete({ where: { id: Number(req.params.id) } });
    return res.json({ mensaje: 'Trabajador eliminado del sistema.' });
  } catch (error) {
    return res.status(500).json({ mensaje: 'No se pudo eliminar al trabajador.' });
  }
};

export const cambiarEstadoCuenta = async (req: Request, res: Response): Promise<any> => {
  try {
    const { estado } = req.body;
    if (!['Activa', 'Bloqueada', 'Suspendida'].includes(estado)) {
      return res.status(400).json({ mensaje: 'Estado inválido.' });
    }

    await prisma.usuario.update({
      where: { id: Number(req.params.id) },
      data: {
        estadoCuenta: estado,
        activo: estado === 'Activa'
      }
    });

    return res.json({ mensaje: `Cuenta ${estado.toLowerCase()} exitosamente.` });
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al cambiar estado de la cuenta.' });
  }
};

export const restablecerPassword = async (req: Request, res: Response): Promise<any> => {
  try {
    const { nuevaPassword } = req.body;
    if (!nuevaPassword || nuevaPassword.length < 8) {
      return res.status(400).json({ mensaje: 'La contraseña debe tener mínimo 8 caracteres.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(nuevaPassword, salt);

    await prisma.usuario.update({
      where: { id: Number(req.params.id) },
      data: { password: hashedPassword }
    });

    return res.json({ mensaje: 'Contraseña restablecida exitosamente.' });
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al restablecer la contraseña.' });
  }
};