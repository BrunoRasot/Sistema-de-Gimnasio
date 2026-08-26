import { Request, Response } from 'express';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { z } from 'zod';
import { prisma } from '../../database/prisma.js';
import { generarTemplateOTP, generarTemplateRecuperacion } from '../../utils/emailTemplate.js';
import { passwordSeguraSchema } from '../../schemas/index.js';
import { logger } from '../../utils/logger.js';
import { env } from '../../config/env.js';
import {
  clearRefreshCookieOptions,
  refreshCookieOptions,
  refreshTokenExpiresAt,
} from './auth-cookie.js';

const otpMinutes = 10;
const recoveryMinutes = 10;

const hashRefreshToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

const crearAccessToken = (usuario: { id: number; rol: string; nombreUsuario: string }) =>
  jwt.sign(
    { sub: usuario.id, rol: usuario.rol, nombreUsuario: usuario.nombreUsuario, type: 'access' },
    env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' },
  );

const crearRefreshToken = (usuarioId: number) =>
  jwt.sign({ sub: usuarioId, type: 'refresh' }, env.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
    jwtid: crypto.randomUUID(),
  });

const obtenerPermisosUsuario = async (usuario: { rol: string; cargo: string }) => {
  if (usuario.rol === 'ADMIN') return {};
  const permisos = await prisma.permiso.findMany({ where: { cargo: usuario.cargo } });
  return Object.fromEntries(
    permisos.map((permiso) => [
      permiso.modulo,
      {
        ver: permiso.ver,
        crear: permiso.crear,
        editar: permiso.editar,
        eliminar: permiso.eliminar,
      },
    ]),
  );
};

const loginSchema = z.object({
  usuario: z.string().trim().min(1, 'Ingresa tu usuario o correo.'),
  password: z.string().min(1, 'Ingresa tu contraseña.'),
});

const verifyOtpSchema = z.object({
  usuario: z.string().trim().min(1, 'El nombre de usuario es obligatorio.'),
  codigo: z.string().regex(/^\d{6}$/, 'El código debe tener 6 dígitos.'),
});

const recoveryRequestSchema = z.object({
  identificador: z.string().trim().min(1).max(160),
});

const resetPasswordSchema = z.object({
  identificador: z.string().trim().min(1).max(160),
  codigo: z.string().regex(/^\d{6}$/, 'El código debe tener 6 dígitos.'),
  nuevaPassword: passwordSeguraSchema,
});

const hashRecoveryCode = (usuarioId: number, codigo: string) =>
  crypto.createHmac('sha256', env.JWT_ACCESS_SECRET).update(`${usuarioId}:${codigo}`).digest('hex');

const enviarCodigoOtp = async (destinatario: string, codigo: string) => {
  if (env.NODE_ENV === 'test') {
    logger.warn(`Fallback (Test): OTP generado para ${destinatario}`);
    return;
  }

  const emailUser = env.EMAIL_USER;
  const emailPass = env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    if (env.NODE_ENV !== 'production') {
      logger.warn(`Fallback (Desarrollo): El código OTP para ${destinatario} es ${codigo}`);
      return;
    }
    throw new Error('Servicio de correo no configurado.');
  }

  const transporter = nodemailer.createTransport(env.SMTP_HOST ? {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: { user: emailUser, pass: emailPass },
  } : { service: 'gmail', auth: { user: emailUser, pass: emailPass } });

  await transporter.sendMail({
    from: `"TemploGym" <${env.EMAIL_FROM || emailUser}>`,
    to: destinatario,
    subject: `${codigo} es tu código de acceso a TemploGym`,
    text: `Tu código de acceso es ${codigo}. Vence en ${otpMinutes} minutos.`,
    html: generarTemplateOTP(codigo),
  });
};

const enviarCodigoRecuperacion = async (destinatario: string, codigo: string) => {
  if (env.NODE_ENV === 'test') return;
  if (!env.EMAIL_USER || !env.EMAIL_PASS) {
    if (env.NODE_ENV !== 'production') {
      logger.warn(`Fallback (Desarrollo): código de recuperación para ${destinatario}: ${codigo}`);
      return;
    }
    throw new Error('Servicio de correo no configurado.');
  }
  const transporter = nodemailer.createTransport(env.SMTP_HOST ? {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: { user: env.EMAIL_USER, pass: env.EMAIL_PASS },
  } : { service: 'gmail', auth: { user: env.EMAIL_USER, pass: env.EMAIL_PASS } });
  await transporter.sendMail({
    from: `"TemploGym" <${env.EMAIL_FROM || env.EMAIL_USER}>`,
    to: destinatario,
    subject: 'Código para recuperar tu contraseña de TemploGym',
    text: `Tu código de recuperación es ${codigo}. Vence en ${recoveryMinutes} minutos.`,
    html: generarTemplateRecuperacion(codigo),
  });
};

export const solicitarRecuperacionPassword = async (req: Request, res: Response): Promise<any> => {
  const parsed = recoveryRequestSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ mensaje: 'Ingresa un usuario o correo válido.' });
  const mensaje = 'Si la cuenta existe y está activa, recibirás un código de recuperación.';
  try {
    const identificador = parsed.data.identificador;
    const usuario = await prisma.usuario.findFirst({
      where: { OR: [{ nombreUsuario: identificador }, { email: identificador.toLowerCase() }] },
    });
    if (!usuario || !usuario.activo || usuario.estadoLaboral !== 'Activo') return res.json({ mensaje });

    const codigo = crypto.randomInt(100000, 1000000).toString();
    await prisma.$transaction(async (tx) => {
      await tx.passwordResetToken.deleteMany({ where: { usuarioId: usuario.id } });
      await tx.passwordResetToken.create({
        data: {
          usuarioId: usuario.id,
          token: hashRecoveryCode(usuario.id, codigo),
          expiresAt: new Date(Date.now() + recoveryMinutes * 60_000),
        },
      });
    });
    try {
      await enviarCodigoRecuperacion(usuario.email, codigo);
    } catch (error) {
      await prisma.passwordResetToken.deleteMany({ where: { usuarioId: usuario.id } });
      throw error;
    }
    return res.json({ mensaje });
  } catch (error) {
    logger.error(`Error al solicitar recuperación de contraseña: ${error}`);
    return res.status(500).json({ mensaje: 'No pudimos procesar la solicitud en este momento.' });
  }
};

export const restablecerPassword = async (req: Request, res: Response): Promise<any> => {
  const parsed = resetPasswordSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ mensaje: parsed.error.issues[0]?.message || 'Datos inválidos.' });
  try {
    const { identificador, codigo, nuevaPassword } = parsed.data;
    const usuario = await prisma.usuario.findFirst({
      where: { OR: [{ nombreUsuario: identificador }, { email: identificador.toLowerCase() }] },
    });
    if (!usuario || !usuario.activo) return res.status(400).json({ mensaje: 'El código es inválido o ha vencido.' });

    const token = await prisma.passwordResetToken.findFirst({
      where: { usuarioId: usuario.id, usedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    const tokenValido = token && token.expiresAt > new Date() && token.intentos < 5 &&
      token.token === hashRecoveryCode(usuario.id, codigo);
    if (!tokenValido || !token) {
      if (token && token.usedAt === null) {
        await prisma.passwordResetToken.update({
          where: { id: token.id },
          data: { intentos: { increment: 1 }, ...(token.intentos + 1 >= 5 ? { usedAt: new Date() } : {}) },
        });
      }
      return res.status(400).json({ mensaje: 'El código es inválido o ha vencido.' });
    }

    const password = await bcrypt.hash(nuevaPassword, 12);
    await prisma.$transaction(async (tx) => {
      const consumido = await tx.passwordResetToken.updateMany({ where: { id: token.id, usedAt: null }, data: { usedAt: new Date() } });
      if (consumido.count !== 1) throw new Error('RESET_TOKEN_REUSED');
      await tx.usuario.update({
        where: { id: usuario.id },
        data: { password, intentosFallidos: 0, bloqueoHasta: null, estadoCuenta: 'Activa', codigoOtp: null, expiracionOtp: null },
      });
      await tx.refreshToken.deleteMany({ where: { usuarioId: usuario.id } });
      await tx.passwordResetToken.updateMany({ where: { usuarioId: usuario.id, usedAt: null }, data: { usedAt: new Date() } });
    });
    return res.json({ mensaje: 'Contraseña actualizada. Ya puedes iniciar sesión.' });
  } catch (error) {
    if (error instanceof Error && error.message === 'RESET_TOKEN_REUSED') return res.status(400).json({ mensaje: 'El código ya fue utilizado.' });
    logger.error(`Error al restablecer contraseña: ${error}`);
    return res.status(500).json({ mensaje: 'No pudimos restablecer la contraseña.' });
  }
};

const generarTokensSesion = async (usuario: { id: number; rol: string; nombreUsuario: string }) => {
  const accessToken = crearAccessToken(usuario);
  const refreshToken = crearRefreshToken(usuario.id);
  await prisma.refreshToken.create({
    data: {
      token: hashRefreshToken(refreshToken),
      usuarioId: usuario.id,
      expiresAt: refreshTokenExpiresAt(),
    },
  });

  return { accessToken, refreshToken };
};

export const login = async (req: Request, res: Response): Promise<any> => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ mensaje: parsed.error.issues[0]?.message });

  try {
    const { usuario: identificador, password } = parsed.data;

    const usuario = await prisma.usuario.findFirst({
      where: { OR: [{ nombreUsuario: identificador }, { email: identificador.toLowerCase() }] },
    });

    if (!usuario) {
      logger.warn(`Intento de login fallido: Usuario no encontrado (${identificador})`);
      return res.status(401).json({ mensaje: 'Usuario o contraseña incorrectos.' });
    }

    if (!usuario.activo) {
      logger.warn(`Intento de acceso a cuenta inactiva: ${usuario.nombreUsuario}`);
      return res
        .status(401)
        .json({ mensaje: 'Esta cuenta está desactivada por el administrador.' });
    }

    if (usuario.bloqueoHasta && new Date() < new Date(usuario.bloqueoHasta)) {
      const minutosRestantes = Math.ceil(
        (new Date(usuario.bloqueoHasta).getTime() - new Date().getTime()) / 60000,
      );
      logger.warn(`Intento de acceso a cuenta bloqueada temporalmente: ${usuario.nombreUsuario}`);
      return res.status(403).json({
        mensaje: `Cuenta bloqueada por seguridad. Intenta de nuevo en ${minutosRestantes} minuto(s).`,
      });
    }

    const passwordCorrecta = await bcrypt.compare(password, usuario.password);
    if (!passwordCorrecta) {
      const nuevosIntentos = (usuario.intentosFallidos || 0) + 1;
      let bloqueoHasta = null;
      let estadoCuenta = usuario.estadoCuenta;

      if (nuevosIntentos >= 3) {
        bloqueoHasta = new Date(Date.now() + 15 * 60 * 1000);
        estadoCuenta = 'Bloqueada';
        logger.error(
          `Seguridad: Cuenta bloqueada por exceso de intentos fallidos -> ${usuario.nombreUsuario}`,
        );
      }

      await prisma.usuario.update({
        where: { id: usuario.id },
        data: { intentosFallidos: nuevosIntentos, bloqueoHasta, estadoCuenta },
      });

      if (nuevosIntentos >= 3) {
        return res.status(403).json({
          mensaje: 'Demasiados intentos fallidos. Tu cuenta ha sido bloqueada temporalmente.',
        });
      }

      return res.status(401).json({ mensaje: 'Usuario o contraseña incorrectos.' });
    }

    const codigo = crypto.randomInt(100000, 1000000).toString();
    logger.info(`Código OTP generado para el usuario ID ${usuario.id} (${usuario.email})`);

    const expiracionOtp = new Date(Date.now() + otpMinutes * 60 * 1000);

    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(codigo, salt);

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        codigoOtp: hashedOtp,
        expiracionOtp,
        intentosFallidos: 0,
        bloqueoHasta: null,
        estadoCuenta: usuario.estadoCuenta === 'Bloqueada' ? 'Activa' : usuario.estadoCuenta,
      },
    });

    await enviarCodigoOtp(usuario.email, codigo);

    return res.json({
      mensaje: 'Te enviamos un código a tu correo.',
      usuario: usuario.nombreUsuario,
    });
  } catch (error) {
    logger.error(`Error crítico en el controlador de login: ${error}`);
    return res.status(500).json({ mensaje: 'No pudimos procesar la solicitud.' });
  }
};

export const verificarOtp = async (req: Request, res: Response): Promise<any> => {
  const parsed = verifyOtpSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ mensaje: 'Datos inválidos.' });

  try {
    const { usuario: identificador, codigo } = parsed.data;

    const usuario = await prisma.usuario.findFirst({
      where: {
        OR: [{ nombreUsuario: identificador }, { email: identificador.toLowerCase() }],
      },
    });

    if (
      !usuario ||
      !usuario.activo ||
      !usuario.codigoOtp ||
      !usuario.expiracionOtp ||
      new Date() > new Date(usuario.expiracionOtp)
    ) {
      logger.warn(`Intento de verificación OTP fallido para el identificador: ${identificador}`);
      return res.status(401).json({ mensaje: 'El código es inválido o ha vencido.' });
    }

    if (usuario.bloqueoHasta && new Date() < new Date(usuario.bloqueoHasta)) {
      return res.status(403).json({ mensaje: 'Cuenta bloqueada temporalmente por seguridad.' });
    }

    const esValido = await bcrypt.compare(codigo, usuario.codigoOtp);

    if (!esValido) {
      const nuevosIntentos = (usuario.intentosFallidos || 0) + 1;
      let bloqueoHasta: Date | null = null;
      let codigoOtp: string | null = usuario.codigoOtp;
      let expiracionOtp: Date | null = usuario.expiracionOtp;

      if (nuevosIntentos >= 3) {
        bloqueoHasta = new Date(Date.now() + 15 * 60 * 1000);
        codigoOtp = null;
        expiracionOtp = null;
        logger.error(
          `Seguridad: Cuenta bloqueada por exceso de intentos de OTP -> ${usuario.nombreUsuario}`,
        );
      }

      await prisma.usuario.update({
        where: { id: usuario.id },
        data: { intentosFallidos: nuevosIntentos, bloqueoHasta, codigoOtp, expiracionOtp },
      });

      if (nuevosIntentos >= 3) {
        return res
          .status(403)
          .json({ mensaje: 'Demasiados intentos fallidos. Código anulado y cuenta bloqueada.' });
      }

      return res.status(401).json({ mensaje: 'El código es inválido o ha vencido.' });
    }

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { codigoOtp: null, expiracionOtp: null, intentosFallidos: 0, bloqueoHasta: null },
    });

    const { accessToken, refreshToken } = await generarTokensSesion({
      id: usuario.id,
      rol: usuario.rol,
      nombreUsuario: usuario.nombreUsuario,
    });

    res.cookie('refreshToken', refreshToken, refreshCookieOptions);

    logger.info(
      `Inicio de sesión exitoso y verificado por OTP: ${usuario.nombreUsuario} [Rol: ${usuario.rol}]`,
    );

    const permisos = await obtenerPermisosUsuario(usuario);

    return res.json({
      token: accessToken,
      usuario: {
        id: usuario.id,
        nombreUsuario: usuario.nombreUsuario,
        email: usuario.email,
        rol: usuario.rol,
        cargo: usuario.cargo,
        permisos,
      },
    });
  } catch (error) {
    logger.error(`Error crítico en verificarOtp: ${error}`);
    return res.status(500).json({ mensaje: 'Error al verificar el código.' });
  }
};

export const renovarToken = async (req: Request, res: Response): Promise<any> => {
  try {
    const tokenCookie = req.cookies?.refreshToken;
    if (!tokenCookie) {
      return res.status(401).json({ mensaje: 'No se encontró la sesión activa.' });
    }

    const payload = jwt.verify(tokenCookie, env.JWT_REFRESH_SECRET) as jwt.JwtPayload;
    if (payload.type !== 'refresh') {
      return res.status(403).json({ mensaje: 'Token de sesión inválido.' });
    }

    const tokenRecord = await prisma.refreshToken.findFirst({
      where: { token: { in: [hashRefreshToken(tokenCookie), tokenCookie] } },
      include: { usuario: true },
    });

    if (!tokenRecord) {
      const usuarioId = Number(payload.sub);
      if (Number.isInteger(usuarioId) && usuarioId > 0) {
        await prisma.refreshToken.deleteMany({ where: { usuarioId } });
      }
      res.clearCookie('refreshToken', clearRefreshCookieOptions);
      return res.status(403).json({ mensaje: 'Sesión revocada. Inicie sesión nuevamente.' });
    }

    if (new Date() > new Date(tokenRecord.expiresAt)) {
      await prisma.refreshToken.delete({ where: { id: tokenRecord.id } });
      res.clearCookie('refreshToken', clearRefreshCookieOptions);
      return res.status(403).json({ mensaje: 'Sesión expirada. Inicie sesión nuevamente.' });
    }

    const usuario = tokenRecord.usuario;
    if (!usuario.activo) {
      return res.status(403).json({ mensaje: 'Cuenta inactiva.' });
    }

    if (Number(payload.sub) !== usuario.id) {
      return res.status(403).json({ mensaje: 'Token de sesión inválido.' });
    }

    const nuevoAccessToken = crearAccessToken(usuario);
    const nuevoRefreshToken = crearRefreshToken(usuario.id);
    try {
      await prisma.$transaction(async (tx) => {
        const deleted = await tx.refreshToken.deleteMany({ where: { id: tokenRecord.id } });
        if (deleted.count !== 1) throw new Error('REFRESH_TOKEN_REUSED');
        await tx.refreshToken.create({
          data: {
            token: hashRefreshToken(nuevoRefreshToken),
            usuarioId: usuario.id,
            expiresAt: refreshTokenExpiresAt(),
          },
        });
      });
    } catch (rotationError) {
      if (rotationError instanceof Error && rotationError.message === 'REFRESH_TOKEN_REUSED') {
        await prisma.refreshToken.deleteMany({ where: { usuarioId: usuario.id } });
        res.clearCookie('refreshToken', clearRefreshCookieOptions);
        return res.status(403).json({ mensaje: 'Sesión revocada por seguridad.' });
      }
      throw rotationError;
    }
    res.cookie('refreshToken', nuevoRefreshToken, refreshCookieOptions);

    const permisos = await obtenerPermisosUsuario(usuario);
    return res.json({
      token: nuevoAccessToken,
      usuario: {
        id: usuario.id,
        nombreUsuario: usuario.nombreUsuario,
        email: usuario.email,
        rol: usuario.rol,
        cargo: usuario.cargo,
        permisos,
      },
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      res.clearCookie('refreshToken', clearRefreshCookieOptions);
      return res.status(403).json({ mensaje: 'Sesión inválida o expirada.' });
    }
    logger.error(`Error al renovar el token: ${error}`);
    return res.status(500).json({ mensaje: 'Error interno al procesar el token.' });
  }
};

export const logout = async (req: Request, res: Response): Promise<any> => {
  try {
    const tokenCookie = req.cookies?.refreshToken;
    if (tokenCookie) {
      await prisma.refreshToken.deleteMany({
        where: { token: { in: [hashRefreshToken(tokenCookie), tokenCookie] } },
      });
    }
    res.clearCookie('refreshToken', clearRefreshCookieOptions);
    return res.json({ mensaje: 'Sesión finalizada exitosamente.' });
  } catch (error) {
    logger.error(`Error en logout: ${error}`);
    return res.status(500).json({ mensaje: 'Error al cerrar sesión.' });
  }
};

