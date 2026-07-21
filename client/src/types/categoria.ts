export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string | null;
  estado: boolean;
  _count?: {
    productos: number;
  };
}

export interface CategoriaInput {
  nombre: string;
  descripcion?: string;
  estado?: boolean;
}