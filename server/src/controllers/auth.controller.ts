import { Request, Response } from 'express';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { z } from 'zod';
import { prisma } from '../database/prisma.js';
import { generarTemplateOTP } from '../utils/emailTemplate.js';
import { logger } from '../utils/logger.js';

const otpMinutes = 10;

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    logger.error('FATAL ERROR: La variable de entorno JWT_SECRET no está configurada.');
    throw new Error(
      'FATAL ERROR: La variable de entorno JWT_SECRET no está definida en el servidor.',
    );
  }
  return secret;
};

const JWT_SECRET = getJwtSecret();

const loginSchema = z.object({
  usuario: z.string().trim().min(1, 'Ingresa tu usuario o correo.'),
  password: z.string().min(1, 'Ingresa tu contraseña.'),
});

const verifyOtpSchema = z.object({
  usuario: z.string().trim().min(1, 'El nombre de usuario es obligatorio.'),
  codigo: z.string().regex(/^\d{6}$/, 'El código debe tener 6 dígitos.'),
});

const enviarCodigoOtp = async (destinatario: string, codigo: string) => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    if (process.env.NODE_ENV !== 'production') {
      logger.warn(`Fallback (Desarrollo): El código OTP para ${destinatario} es ${codigo}`);
      return;
    }
    throw new Error('Servicio de correo no configurado.');
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: emailUser, pass: emailPass },
  });

  await transporter.sendMail({
    from: `"TemploGym" <${emailUser}>`,
    to: destinatario,
    subject: 'Tu código de seguridad',
    text: `Tu código de acceso es ${codigo}. Vence en ${otpMinutes} minutos.`,
    html: generarTemplateOTP(codigo),
  });
};

const generarTokensSesion = async (usuario: { id: number; rol: string; nombreUsuario: string }) => {
  const accessToken = jwt.sign(
    { sub: usuario.id, rol: usuario.rol, nombreUsuario: usuario.nombreUsuario, type: 'access' },
    JWT_SECRET,
    { expiresIn: '15m' },
  );

  const refreshToken = jwt.sign({ sub: usuario.id, type: 'refresh' }, JWT_SECRET, {
    expiresIn: '7d',
  });

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      usuarioId: usuario.id,
      expiresAt,
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

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    logger.info(
      `Inicio de sesión exitoso y verificado por OTP: ${usuario.nombreUsuario} [Rol: ${usuario.rol}]`,
    );

    return res.json({
      token: accessToken,
      usuario: {
        id: usuario.id,
        nombreUsuario: usuario.nombreUsuario,
        email: usuario.email,
        rol: usuario.rol,
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

    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: tokenCookie },
      include: { usuario: true },
    });

    if (!tokenRecord || new Date() > new Date(tokenRecord.expiresAt)) {
      return res.status(403).json({ mensaje: 'Sesión expirada. Inicie sesión nuevamente.' });
    }

    const usuario = tokenRecord.usuario;
    if (!usuario.activo) {
      return res.status(403).json({ mensaje: 'Cuenta inactiva.' });
    }

    const nuevoAccessToken = jwt.sign(
      { sub: usuario.id, rol: usuario.rol, nombreUsuario: usuario.nombreUsuario, type: 'access' },
      JWT_SECRET,
      { expiresIn: '15m' },
    );

    return res.json({ token: nuevoAccessToken });
  } catch (error) {
    logger.error(`Error al renovar el token: ${error}`);
    return res.status(500).json({ mensaje: 'Error interno al procesar el token.' });
  }
};

export const logout = async (req: Request, res: Response): Promise<any> => {
  try {
    const tokenCookie = req.cookies?.refreshToken;
    if (tokenCookie) {
      await prisma.refreshToken.deleteMany({ where: { token: tokenCookie } });
    }
    res.clearCookie('refreshToken');
    return res.json({ mensaje: 'Sesión finalizada exitosamente.' });
  } catch (error) {
    logger.error(`Error en logout: ${error}`);
    return res.status(500).json({ mensaje: 'Error al cerrar sesión.' });
  }
};
