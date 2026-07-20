import { useState, useEffect } from 'react';

export interface PermisosModulo {
  ver: boolean;
  crear: boolean;
  editar: boolean;
  eliminar: boolean;
}

export function usePermisos(modulo: string) {
  const [permisos, setPermisos] = useState<PermisosModulo>({
    ver: false,
    crear: false,
    editar: false,
    eliminar: false
  });
  const [cargandoPermisos, setCargandoPermisos] = useState(true);

  useEffect(() => {
    const evaluarPermisos = async () => {
      setCargandoPermisos(true);
      
      try {
        const usuarioString = localStorage.getItem('usuario'); 
        const usuario = usuarioString ? JSON.parse(usuarioString) : null;

        if (!usuario) {
          setPermisos({ ver: false, crear: false, editar: false, eliminar: false });
          return;
        }

        if (usuario.rol === 'ADMIN' || usuario.rol === 'SUPER_ADMIN') {
          setPermisos({
            ver: true,
            crear: true,
            editar: true,
            eliminar: true
          });
          return;
        }

        const permisosDelUsuario = usuario.permisos || {};
        const permisosDelModulo = permisosDelUsuario[modulo];

        if (permisosDelModulo) {
          setPermisos({
            ver: !!permisosDelModulo.ver,
            crear: !!permisosDelModulo.crear,
            editar: !!permisosDelModulo.editar,
            eliminar: !!permisosDelModulo.eliminar
          });
        } else {
          setPermisos({ ver: false, crear: false, editar: false, eliminar: false });
        }

      } catch (error) {
        console.error(`Error al evaluar permisos del módulo ${modulo}:`, error);
        setPermisos({ ver: false, crear: false, editar: false, eliminar: false });
      } finally {
        setCargandoPermisos(false);
      }
    };

    evaluarPermisos();
  }, [modulo]);

  return { permisos, cargandoPermisos };
}