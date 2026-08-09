export const serializarUsuario = (usuario: any) => {
  if (!usuario) return null;
  const { password, codigoOtp, expiracionOtp, intentosFallidos, bloqueoHasta, ...usuarioSeguro } =
    usuario;
  return usuarioSeguro;
};
