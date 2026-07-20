export interface Usuario {
  id: number;
  foto?: string | null;
  nombres: string;
  apellidos: string;
  dni: string;
  fechaNacimiento?: string | null;
  sexo?: string | null;
  direccion?: string | null;
  telefono?: string | null;
  email: string;
  cargo: string;
  turno?: string | null;
  fechaIngreso?: string | null;
  estadoLaboral: string;
  
  nombreUsuario: string;
  rol: string;
  estadoCuenta: string;
  ultimoAcceso?: string | null;
  
  activo?: boolean;
  createdAt?: string;
  updatedAt?: string;
}