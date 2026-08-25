import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../../database/prisma.js';
import { serializarUsuario } from '../../utils/serializer.js';
import { logger } from '../../utils/logger.js';
import { passwordSeguraSchema } from '../../schemas/index.js';

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
  turno: z.string().optional(),
  fechaIngreso: z.string().optional(),
  estadoLaboral: z.string().default('Activo'),
  nombreUsuario: z.string().min(4, 'Mínimo 4 caracteres'),
  password: passwordSeguraSchema.optional(),
  rol: z.string().default('USER'),
  cargo: z.string().default('Recepcionista'),
  estadoCuenta: z.string().default('Activa'),
});

const actualizarUsuarioSchema = usuarioSchema
  .omit({ dni: true, password: true })
  .partial()
  .extend({
    rol: z.enum(['ADMIN', 'USER']).optional(),
    estadoLaboral: z.enum(['Activo', 'Inactivo']).optional(),
    activo: z.boolean().optional(),
  });

export const obtenerUsuarios = async (req: Request, res: Response): Promise<any> => {
  try {
    const { buscar, estado, rol, pagina = 1, limite = 10 } = req.query;
    const page = Number(pagina);
    const limit = Number(limite);
    const skip = (page - 1) * limit;

    const where: any = { activo: true };
    if (rol) where.rol = String(rol);
    if (estado) where.estadoCuenta = String(estado);

    if (buscar) {
      where.OR = [
        { nombres: { contains: String(buscar), mode: 'insensitive' } },
        { apellidos: { contains: String(buscar), mode: 'insensitive' } },
        { dni: { contains: String(buscar) } },
        { nombreUsuario: { contains: String(buscar), mode: 'insensitive' } },
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
          nombreUsuario: true,
          email: true,
          telefono: true,
          estadoCuenta: true,
          rol: true,
          cargo: true,
          turno: true,
          estadoLaboral: true,
          fechaIngreso: true,
          fechaNacimiento: true,
          activo: true,
          createdAt: true,
        },
      }),
      prisma.usuario.count({ where }),
    ]);

    return res.json({
      data: usuarios,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    logger.error('Error al obtener usuarios: ' + error);
    return res.status(500).json({ mensaje: 'Error al obtener usuarios.' });
  }
};

export const obtenerUsuarioPorId = async (req: Request, res: Response): Promise<any> => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(req.params.id) },
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
    const parsed = usuarioSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ mensaje: parsed.error.issues[0]?.message });
    }

    const { nombres, apellidos, dni, email, password, telefono, rol, cargo, nombreUsuario } =
      parsed.data;

    const existeComoTrabajador = await prisma.usuario.findUnique({ where: { dni } });
    if (existeComoTrabajador) {
      return res
        .status(400)
        .json({ mensaje: 'Este DNI ya está registrado como TRABAJADOR en el sistema.' });
    }

    const existeComoCliente = await prisma.miembro.findUnique({ where: { dni } });
    if (existeComoCliente) {
      return res.status(400).json({
        mensaje:
          'Este DNI pertenece a un CLIENTE del gimnasio. No puede registrarse como trabajador.',
      });
    }

    if (!password) {
      return res
        .status(400)
        .json({ mensaje: 'La contraseña es obligatoria para nuevos usuarios.' });
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
        rol: (rol as any) || 'USER',
        cargo: cargo || 'Recepcionista',
        nombreUsuario: nombreUsuario || dni,
      },
    });

    return res.status(201).json(serializarUsuario(nuevoUsuario));
  } catch (error) {
    logger.error('Error al actualizar trabajador: ' + error);
    return res.status(500).json({ mensaje: 'Error al actualizar trabajador.' });
  }
};

export const actualizarUsuario = async (req: Request, res: Response): Promise<any> => {
  try {
    const parsed = actualizarUsuarioSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ mensaje: parsed.error.issues[0]?.message });
    }
    const { id } = req.params;
    const usuarioSesionId = (req as any).usuario?.id;
    const {
      nombres,
      apellidos,
      fechaNacimiento,
      sexo,
      direccion,
      telefono,
      email,
      turno,
      fechaIngreso,
      estadoLaboral,
      nombreUsuario,
      rol,
      cargo,
      activo,
    } = parsed.data;

    if (Number(id) === Number(usuarioSesionId)) {
      if (rol === 'USER') {
        return res.status(400).json({
          mensaje: 'Por seguridad, no puedes quitarte el rol de ADMINISTRADOR a ti mismo.',
        });
      }
      if (activo === false || estadoLaboral === 'Inactivo') {
        return res.status(400).json({
          mensaje: 'Por seguridad, no puedes desactivar tu propia cuenta.',
        });
      }
    }

    await prisma.usuario.update({
      where: { id: Number(id) },
      data: {
        nombres,
        apellidos,
        sexo,
        direccion,
        telefono,
        email,
        turno,
        estadoLaboral,
        nombreUsuario,
        rol,
        cargo,
        activo,
        fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : undefined,
        fechaIngreso: fechaIngreso ? new Date(fechaIngreso) : undefined,
      },
    });
    return res.json({ mensaje: 'Información actualizada correctamente.' });
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al actualizar trabajador.' });
  }
};

export const eliminarUsuario = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const usuarioSesionId = (req as any).usuario?.id;

    if (Number(id) === Number(usuarioSesionId)) {
      return res.status(400).json({
        mensaje: 'Acción bloqueada: No puedes eliminar tu propio usuario.',
      });
    }

    await prisma.usuario.update({
      where: { id: Number(id) },
      data: {
        activo: false,
        estadoLaboral: 'Inactivo',
      },
    });

    return res.json({ mensaje: 'Trabajador desactivado del sistema de forma segura.' });
  } catch (error) {
    return res.status(500).json({ mensaje: 'No se pudo desactivar al trabajador.' });
  }
};

export const cambiarEstadoCuenta = async (req: Request, res: Response): Promise<any> => {
  try {
    const { estado } = req.body;
    const usuarioSesionId = (req as any).usuario?.id;
    if (Number(req.params.id) === Number(usuarioSesionId) && estado === 'Bloqueada') {
      return res.status(400).json({ mensaje: 'No puedes bloquear tu propia cuenta.' });
    }
    if (!['Activa', 'Bloqueada'].includes(estado)) {
      return res
        .status(400)
        .json({ mensaje: 'Estado inválido. Solo se permite Activa o Bloqueada.' });
    }

    await prisma.usuario.update({
      where: { id: Number(req.params.id) },
      data: {
        estadoCuenta: estado,
        activo: estado === 'Activa',
      },
    });
    return res.json({ mensaje: `Cuenta ${estado.toLowerCase()} exitosamente.` });
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al cambiar estado de la cuenta.' });
  }
};

export const restablecerPassword = async (req: Request, res: Response): Promise<any> => {
  try {
    const { nuevaPassword } = req.body;
    const passwordValida = passwordSeguraSchema.safeParse(nuevaPassword);
    if (!passwordValida.success) {
      return res.status(400).json({ mensaje: passwordValida.error.issues[0]?.message });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(passwordValida.data, salt);

    const usuarioId = Number(req.params.id);
    await prisma.$transaction([
      prisma.usuario.update({
        where: { id: usuarioId },
        data: { password: hashedPassword },
      }),
      prisma.refreshToken.deleteMany({ where: { usuarioId } }),
    ]);

    return res.json({ mensaje: 'Contraseña restablecida exitosamente.' });
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al restablecer la contraseña.' });
  }
};

