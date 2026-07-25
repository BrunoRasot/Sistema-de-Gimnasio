import { Request, Response } from 'express';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { z } from 'zod';
import { prisma } from '../database/prisma.js';
import { generarTemplateOTP } from '../utils/emailTemplate.js';

const otpMinutes = 10;

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
  if (!emailUser || !emailPass) throw new Error('Servicio de correo no configurado.');

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

export const login = async (req: Request, res: Response): Promise<any> => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ mensaje: parsed.error.issues[0]?.message });

  try {
    const { usuario: identificador, password } = parsed.data;

    const usuario = await prisma.usuario.findFirst({
      where: { OR: [{ nombreUsuario: identificador }, { email: identificador.toLowerCase() }] },
    });

    if (!usuario) {
      return res.status(401).json({ mensaje: 'Usuario o contraseña incorrectos.' });
    }

    if (!usuario.activo) {
      return res.status(401).json({ mensaje: 'Esta cuenta está desactivada por el administrador.' });
    }

    if (usuario.bloqueoHasta && new Date() < new Date(usuario.bloqueoHasta)) {
      const minutosRestantes = Math.ceil((new Date(usuario.bloqueoHasta).getTime() - new Date().getTime()) / 60000);
      return res.status(403).json({
        mensaje: `Cuenta bloqueada por seguridad. Intenta de nuevo en ${minutosRestantes} minuto(s).`
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
      }

      await prisma.usuario.update({
        where: { id: usuario.id },
        data: { intentosFallidos: nuevosIntentos, bloqueoHasta, estadoCuenta }
      });

      if (nuevosIntentos >= 3) {
        return res.status(403).json({ mensaje: 'Demasiados intentos fallidos. Tu cuenta ha sido bloqueada temporalmente.' });
      }

      return res.status(401).json({ mensaje: `Contraseña incorrecta. Intento ${nuevosIntentos} de 3.` });
    }

    const codigo = crypto.randomInt(100000, 1000000).toString();
    
    console.log(`\n🔑 CÓDIGO OTP PARA ${usuario.email}: ${codigo}\n`);
    
    const expiracionOtp = new Date(Date.now() + otpMinutes * 60 * 1000);

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        codigoOtp: codigo,
        expiracionOtp,
        intentosFallidos: 0,
        bloqueoHasta: null,
        estadoCuenta: usuario.estadoCuenta === 'Bloqueada' ? 'Activa' : usuario.estadoCuenta
      },
    });

    await enviarCodigoOtp(usuario.email, codigo);

    return res.json({ mensaje: 'Te enviamos un código a tu correo.', usuario: usuario.nombreUsuario });
  } catch (error) {
    console.error("Error en el login:", error);
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
        OR: [
          { nombreUsuario: identificador },
          { email: identificador.toLowerCase() }
        ]
      }
    });

    const esValido = usuario &&
      usuario.activo &&
      usuario.codigoOtp === codigo &&
      usuario.expiracionOtp !== null &&
      new Date() < new Date(usuario.expiracionOtp);

    if (!esValido) {
      return res.status(401).json({ mensaje: 'El código es inválido o ha vencido.' });
    }

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { codigoOtp: null, expiracionOtp: null },
    });

    const token = jwt.sign(
      { sub: usuario.id, rol: usuario.rol, nombreUsuario: usuario.nombreUsuario },
      process.env.JWT_SECRET || 'secreto',
      { expiresIn: '8h' }
    );

    return res.json({
      token,
      usuario: { 
        id: usuario.id, 
        nombreUsuario: usuario.nombreUsuario, 
        email: usuario.email, 
        rol: usuario.rol,
        cargo: usuario.cargo 
      },
    });
  } catch (error) {
    console.error("Error en verificarOtp:", error);
    return res.status(500).json({ mensaje: 'Error al verificar el código.' });
  }
};