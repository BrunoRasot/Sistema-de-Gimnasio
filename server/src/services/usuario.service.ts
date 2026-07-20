import { usuarioRepository } from '../repositories/usuario.repository.js';
import bcrypt from 'bcryptjs';

export const usuarioService = {
  async obtenerUsuarios(query: any) {
    const { page = 1, limit = 10, search = '', rol, activo, sortField = 'createdAt', sortOrder = 'desc' } = query;
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const where: any = {
      OR: [
        { nombreUsuario: { contains: String(search), mode: 'insensitive' } },
        { email: { contains: String(search), mode: 'insensitive' } }
      ]
    };

    if (rol) where.rol = String(rol);
    if (activo !== undefined && activo !== '') where.activo = activo === 'true';

    const [usuarios, total] = await usuarioRepository.findAll(skip, limitNumber, where, { [String(sortField)]: sortOrder });
    
    return { usuarios, total, pages: Math.ceil(total / limitNumber) };
  },

  async obtenerUsuarioPorId(id: number) {
    const usuario = await usuarioRepository.findById(id);
    if (!usuario) throw new Error('Usuario no encontrado');
    return usuario;
  },

  async crearUsuario(data: any) {
    const existe = await usuarioRepository.findByEmailOrUsername(data.email, data.nombreUsuario);
    if (existe) throw new Error('El usuario o correo ya está en uso');

    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    return usuarioRepository.create({
      ...data,
      password: hashedPassword
    });
  },

  async actualizarUsuario(id: number, data: any) {
    const existe = await usuarioRepository.findByEmailOrUsername(data.email, data.nombreUsuario, id);
    if (existe) throw new Error('El usuario o correo ya está en uso por otro registro');

    const updateData: any = { 
      nombreUsuario: data.nombreUsuario, 
      email: data.email, 
      rol: data.rol, 
      activo: data.activo 
    };

    if (data.password && data.password.trim() !== '') {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    return usuarioRepository.update(id, updateData);
  },

  async eliminarUsuario(id: number) {
    return usuarioRepository.delete(id);
  }
};