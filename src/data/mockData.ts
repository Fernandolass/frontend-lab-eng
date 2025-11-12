export interface MaterialItem {
  id: string;
  nome: string;
  tipo: string;
  ambiente: string[];
}

export interface ProjetoDetalhes {
  id: number;
  nome: string;
  tipoProjeto: string;
  dataCriacao: string;
  responsavel: string;
  status: "aprovado" | "reprovado" | "pendente";
  ambientes: Ambiente[];
  descricao_marcas: Array<{ id: number; material: string; marcas: string; projeto: number }>;
  observacoes_gerais: string;
}

export interface Ambiente {
  id: number;
  nome: string;
  materiais: Material[];
  categoria?: string;
  tipo?: number | null;
  guia_de_cores?: string;
}

export interface Material {
  id: string;
  nome: string;
  tipo: string;
  status: 'aprovado' | 'reprovado' | 'pendente';
  motivo?: string;
  observacoes?: string;
  dataAprovacao?: string; 
  aprovador?: string; 
}

export interface ModeloDetalhes {
  id: number;
  nome: string;
  tipoModelo: string;
  dataCriacao: string;
  responsavel: string;
  descricao: string;
  observacoes_gerais: string;
  projeto_origem_id: number; 
  ambientes: Ambiente[];
}

export interface Secao {
  id: number;
  nome: string;
  itens: ItemModelo[];
  categoria?: string;
  tipo?: number | null;
  guia_de_cores?: string;
}

export interface ItemModelo {
  id: string;
  nome: string;
  tipo: string;
  descricao?: string;
  observacoes?: string;
}

