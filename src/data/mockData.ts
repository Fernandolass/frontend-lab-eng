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


