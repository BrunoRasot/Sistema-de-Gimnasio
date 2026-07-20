import { prisma } from '../database/prisma.js';
import { Prisma } from '@prisma/client';

export const usuarioRepository = {
  async findAll(skip: number, take: number, where: Prisma.UsuarioWhereInput, orderBy: any) {
    return prisma.$transaction([
      prisma.usuario.findMany({
        where,
        skip,
        take,
        orderBy,
        select: { id: true, nombreUsuario: true, email: true, rol: true, activo: true, createdAt: true }
      }),
      prisma.usuario.count({ where })
    ]);
  },

  async findById(id: number) {
    return prisma.usuario.findUnique({
      where: { id },
      select: { id: true, nombreUsuario: true, email: true, rol: true, activo: true }
    });
  },

  async findByEmailOrUsername(email: string, nombreUsuario: string, excludeId?: number) {
    return prisma.usuario.findFirst({
      where: {
        OR: [{ email }, { nombreUsuario }],
        ...(excludeId ? { NOT: { id: excludeId } } : {})
      }
    });
  },

  async create(data: Prisma.UsuarioCreateInput) {
    return prisma.usuario.create({
      data,
      select: { id: true, nombreUsuario: true, email: true, rol: true }
    });
  },

  async update(id: number, data: Prisma.UsuarioUpdateInput) {
    return prisma.usuario.update({
      where: { id },
      data
    });
  },

  async delete(id: number) {
    return prisma.usuario.delete({
      where: { id }
    });
  }
};