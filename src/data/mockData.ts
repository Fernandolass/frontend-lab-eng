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
  status: 'aprovado' | 'reprovado' | 'pendente';
  ambientes: Ambiente[];
}

export interface Ambiente {
  id: number;
  nome: string; 
  materiais: Material[];
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


export const areas = {
  'Un. Privativas': [
    'Sala de Estar/Jantar',
    'Circulação',
    'Quarto e Suíte',
    'Sanitário/Lavabo',
    'Cozinha/Área de Serviço',
    'Área Técnica',
    'Varanda',
    'Garden'
  ],
  'Área Comum': [
    'Guarita',
    'Gourmets',
    'Quiosques',
    'Copa Funcionários',
    'Petplay',
    'Parque Infantil',
    'Brinquedoteca',
    'Salão de Festas',
    'Bicicletário',
    'Salão de Jogos',
    'Academia',
    'Administração',
    'Quadra Esportiva',
    'Quadra de Areia',
    'Piscina',
    'Gerador',
    'Casa de Lixo',
    'Vestiário',
    'Escadaria',
    'Depósito',
    'Muro de Fechamento',
    'Hall\'s',
    'Instalações Gerais',
    'Vias Internas',
    'Jardins',
    'Passeio Externo',
    'Portão de Veículos'
  ]
};

export const ambientes = [
  ...areas['Un. Privativas'],
  ...areas['Área Comum']
];

export const getAreaByAmbiente = (ambiente: string): string => {
  if (areas['Un. Privativas'].includes(ambiente)) {
    return 'UNIDADES PRIVATIVAS';
  }
  if (areas['Área Comum'].includes(ambiente)) {
    return 'Área Comum';
  }
  return 'Outra Área';
};

export const materiais: MaterialItem[] = [
  // Sala de Estar/Jantar
  { id: 'piso_sala', nome: 'Piso', tipo: '', ambiente: ['Sala de Estar/Jantar'] },
  { id: 'parede_sala', nome: 'Parede', tipo: '', ambiente: ['Sala de Estar/Jantar'] },
  { id: 'teto_sala', nome: 'Teto', tipo: '', ambiente: ['Sala de Estar/Jantar'] },
  { id: 'rodape_sala', nome: 'Rodapé', tipo: '', ambiente: ['Sala de Estar/Jantar'] },
  { id: 'soleira_sala', nome: 'Soleira', tipo: '', ambiente: ['Sala de Estar/Jantar'] },
  { id: 'peitoril_sala', nome: 'Peitoril', tipo: '', ambiente: ['Sala de Estar/Jantar'] },
  { id: 'esquadria_sala', nome: 'Esquadria', tipo: '', ambiente: ['Sala de Estar/Jantar'] },
  { id: 'vidro_sala', nome: 'Vidro', tipo: '', ambiente: ['Sala de Estar/Jantar'] },
  { id: 'porta_sala', nome: 'Porta', tipo: '', ambiente: ['Sala de Estar/Jantar'] },
  { id: 'ferragem_sala', nome: 'Ferragem', tipo: '', ambiente: ['Sala de Estar/Jantar'] },
  { id: 'inst_eletrica_sala', nome: 'Inst. Elétrica', tipo: '', ambiente: ['Sala de Estar/Jantar'] },
  { id: 'inst_comunic_sala', nome: 'Inst. Comunic.', tipo: '', ambiente: ['Sala de Estar/Jantar'] },

  // Circulação
  { id: 'piso_circ', nome: 'Piso', tipo: '', ambiente: ['Circulação'] },
  { id: 'parede_circ', nome: 'Parede', tipo: '', ambiente: ['Circulação'] },
  { id: 'teto_circ', nome: 'Teto', tipo: '', ambiente: ['Circulação'] },
  { id: 'rodape_circ', nome: 'Rodapé', tipo: '', ambiente: ['Circulação'] },
  { id: 'inst_eletrica_circ', nome: 'Inst. Elétrica', tipo: '', ambiente: ['Circulação'] },

  // Quarto e Suíte
  { id: 'piso_quarto', nome: 'Piso', tipo: '', ambiente: ['Quarto e Suíte'] },
  { id: 'parede_quarto', nome: 'Parede', tipo: '', ambiente: ['Quarto e Suíte'] },
  { id: 'teto_quarto', nome: 'Teto', tipo: '', ambiente: ['Quarto e Suíte'] },
  { id: 'rodape_quarto', nome: 'Rodapé', tipo: '', ambiente: ['Quarto e Suíte'] },
  { id: 'soleira_quarto', nome: 'Soleira', tipo: '', ambiente: ['Quarto e Suíte'] },
  { id: 'peitoril_quarto', nome: 'Peitoril', tipo: '', ambiente: ['Quarto e Suíte'] },
  { id: 'esquadria_quarto', nome: 'Esquadria', tipo: '', ambiente: ['Quarto e Suíte'] },
  { id: 'vidro_quarto', nome: 'Vidro', tipo: '', ambiente: ['Quarto e Suíte'] },
  { id: 'porta_quarto', nome: 'Porta', tipo: '', ambiente: ['Quarto e Suíte'] },
  { id: 'ferragem_quarto', nome: 'Ferragem', tipo: '', ambiente: ['Quarto e Suíte'] },
  { id: 'inst_eletrica_quarto', nome: 'Inst. Elétrica', tipo: '', ambiente: ['Quarto e Suíte'] },
  { id: 'inst_comunic_quarto', nome: 'Inst. Comunic.', tipo: '', ambiente: ['Quarto e Suíte'] },
  { id: 'ar_condicionado', nome: 'Ar Condicionado', tipo: '', ambiente: ['Quarto e Suíte'] },

  // Sanitário/Lavabo
  { id: 'piso_sanitario', nome: 'Piso', tipo: '', ambiente: ['Sanitário/Lavabo'] },
  { id: 'parede_sanitario', nome: 'Parede', tipo: '', ambiente: ['Sanitário/Lavabo'] },
  { id: 'teto_sanitario', nome: 'Teto', tipo: '', ambiente: ['Sanitário/Lavabo'] },
  { id: 'filete', nome: 'Filete', tipo: '', ambiente: ['Sanitário/Lavabo'] },
  { id: 'cordao_box', nome: 'Cordão de Box', tipo: '', ambiente: ['Sanitário/Lavabo'] },
  { id: 'bancada_sanitario', nome: 'Bancada', tipo: '', ambiente: ['Sanitário/Lavabo'] },
  { id: 'porta_sanitario', nome: 'Porta', tipo: '', ambiente: ['Sanitário/Lavabo'] },
  { id: 'peitoril_sanitario', nome: 'Peitoril', tipo: '', ambiente: ['Sanitário/Lavabo'] },
  { id: 'ferragem_sanitario', nome: 'Ferragem', tipo: '', ambiente: ['Sanitário/Lavabo'] },
  { id: 'esquadria_sanitario', nome: 'Esquadria', tipo: '', ambiente: ['Sanitário/Lavabo'] },
  { id: 'vidro_sanitario', nome: 'Vidro', tipo: '', ambiente: ['Sanitário/Lavabo'] },
  { id: 'metal_sanitario', nome: 'Metal Sanitário', tipo: '', ambiente: ['Sanitário/Lavabo'] },
  { id: 'loucas', nome: 'Louças', tipo: '', ambiente: ['Sanitário/Lavabo'] },
  { id: 'inst_eletrica_sanitario', nome: 'Inst. Elétrica', tipo: '', ambiente: ['Sanitário/Lavabo'] },
  { id: 'inst_hidraulica_sanitario', nome: 'Inst. Hidráulica', tipo: '', ambiente: ['Sanitário/Lavabo'] },

  // Cozinha/Área de Serviço
  { id: 'piso_cozinha', nome: 'Piso', tipo: '', ambiente: ['Cozinha/Área de Serviço'] },
  { id: 'parede_cozinha', nome: 'Parede', tipo: '', ambiente: ['Cozinha/Área de Serviço'] },
  { id: 'teto_cozinha', nome: 'Teto', tipo: '', ambiente: ['Cozinha/Área de Serviço'] },
  { id: 'filete_cozinha', nome: 'Filete', tipo: '', ambiente: ['Cozinha/Área de Serviço'] },
  { id: 'bancada_cozinha', nome: 'Bancada', tipo: '', ambiente: ['Cozinha/Área de Serviço'] },
  { id: 'cuba_cozinha', nome: 'Cuba', tipo: '', ambiente: ['Cozinha/Área de Serviço'] },
  { id: 'peitoril_cozinha', nome: 'Peitoril', tipo: '', ambiente: ['Cozinha/Área de Serviço'] },
  { id: 'tanque', nome: 'Tanque', tipo: '', ambiente: ['Cozinha/Área de Serviço'] },
  { id: 'esquadrias_cozinha', nome: 'Esquadrias', tipo: '', ambiente: ['Cozinha/Área de Serviço'] },
  { id: 'metais_cozinha', nome: 'Metais', tipo: '', ambiente: ['Cozinha/Área de Serviço'] },
  { id: 'inst_eletricas_cozinha', nome: 'Inst. Elétricas', tipo: '', ambiente: ['Cozinha/Área de Serviço'] },
  { id: 'inst_hidraulica_cozinha', nome: 'Inst. Hidráulica', tipo: '', ambiente: ['Cozinha/Área de Serviço'] },
  { id: 'inst_comunicacao', nome: 'Inst. Comunicação', tipo: '', ambiente: ['Cozinha/Área de Serviço'] },

  // Área Técnica
  { id: 'piso_tecnica', nome: 'Piso', tipo: '', ambiente: ['Área Técnica'] },
  { id: 'parede_tecnica', nome: 'Parede', tipo: '', ambiente: ['Área Técnica'] },
  { id: 'teto_tecnica', nome: 'Teto', tipo: '', ambiente: ['Área Técnica'] },
  { id: 'gradil_tecnica', nome: 'Gradil', tipo: '', ambiente: ['Área Técnica'] },

  // Varanda
  { id: 'piso_varanda', nome: 'Piso', tipo: '', ambiente: ['Varanda'] },
  { id: 'parede_varanda', nome: 'Parede', tipo: '', ambiente: ['Varanda'] },
  { id: 'teto_varanda', nome: 'Teto', tipo: '', ambiente: ['Varanda'] },
  { id: 'rodape_varanda', nome: 'Rodapé', tipo: '', ambiente: ['Varanda'] },
  { id: 'porta_varanda', nome: 'Porta', tipo: '', ambiente: ['Varanda'] },
  { id: 'inst_eletrica_varanda', nome: 'Inst. Elétrica', tipo: '', ambiente: ['Varanda'] },
  { id: 'guarda_corpo', nome: 'Guarda Corpo', tipo: '', ambiente: ['Varanda'] },

  // Garden
  { id: 'piso_garden', nome: 'Piso', tipo: '', ambiente: ['Garden'] },
  { id: 'gradil_garden', nome: 'Gradil', tipo: '', ambiente: ['Garden'] },

  // Guarita
  { id: 'piso_guarita', nome: 'Piso', tipo: '', ambiente: ['Guarita'] },
  { id: 'parede_interna_guarita', nome: 'Parede Interna', tipo: '', ambiente: ['Guarita'] },
  { id: 'teto_guarita', nome: 'Teto', tipo: '', ambiente: ['Guarita'] },
  { id: 'parede_externa_guarita', nome: 'Parede Externa', tipo: '', ambiente: ['Guarita'] },
  { id: 'rodape_guarita', nome: 'Rodapé', tipo: '', ambiente: ['Guarita'] },
  { id: 'soleira_guarita', nome: 'Soleira', tipo: '', ambiente: ['Guarita'] },
  { id: 'peitoril_guarita', nome: 'Peitoril', tipo: '', ambiente: ['Guarita'] },
  { id: 'ferragens_guarita', nome: 'Ferragens', tipo: '', ambiente: ['Guarita'] },
  { id: 'porta_externa_guarita', nome: 'Porta Externa', tipo: '', ambiente: ['Guarita'] },
  { id: 'esquadrias_guarita', nome: 'Esquadrias', tipo: '', ambiente: ['Guarita'] },
  { id: 'vidro_guarita', nome: 'Vidro', tipo: '', ambiente: ['Guarita'] },
  { id: 'inst_eletricas_guarita', nome: 'Inst. Elétricas', tipo: '', ambiente: ['Guarita'] },
  { id: 'inst_comunic_guarita', nome: 'Inst. Comunic.', tipo: '', ambiente: ['Guarita'] },

  // Gourmets
  { id: 'piso_gourmets', nome: 'Piso', tipo: '', ambiente: ['Gourmets'] },
  { id: 'parede_interna_gourmets', nome: 'Parede Interna', tipo: '', ambiente: ['Gourmets'] },
  { id: 'teto_gourmets', nome: 'Teto', tipo: '', ambiente: ['Gourmets'] },
  { id: 'rodape_gourmets', nome: 'Rodapé', tipo: '', ambiente: ['Gourmets'] },
  { id: 'tabeira_gourmets', nome: 'Tabeira', tipo: '', ambiente: ['Gourmets'] },
  { id: 'bancada_gourmets', nome: 'Bancada', tipo: '', ambiente: ['Gourmets'] },
  { id: 'cuba_gourmets', nome: 'Cuba', tipo: '', ambiente: ['Gourmets'] },
  { id: 'metais_gourmets', nome: 'Metais', tipo: '', ambiente: ['Gourmets'] },
  { id: 'tampo_balcao_gourmets', nome: 'Tampo do Balcão', tipo: '', ambiente: ['Gourmets'] },
  { id: 'churrasqueira_gourmets', nome: 'Churrasqueira', tipo: '', ambiente: ['Gourmets'] },
  { id: 'inst_eletricas_gourmets', nome: 'Inst. Elétricas', tipo: '', ambiente: ['Gourmets'] },
  { id: 'inst_hidraulica_gourmets', nome: 'Inst. Hidráulica', tipo: '', ambiente: ['Gourmets'] },
  { id: 'inst_comunic_gourmets', nome: 'Inst. Comunic.', tipo: '', ambiente: ['Gourmets'] },

  // Quiosques
  { id: 'piso_quiosques', nome: 'Piso', tipo: '', ambiente: ['Quiosques'] },
  { id: 'parede_interna_quiosques', nome: 'Parede Interna', tipo: '', ambiente: ['Quiosques'] },
  { id: 'teto_quiosques', nome: 'Teto', tipo: '', ambiente: ['Quiosques'] },
  { id: 'rodape_quiosques', nome: 'Rodapé', tipo: '', ambiente: ['Quiosques'] },
  { id: 'tabeira_quiosques', nome: 'Tabeira', tipo: '', ambiente: ['Quiosques'] },
  { id: 'bancada_quiosques', nome: 'Bancada', tipo: '', ambiente: ['Quiosques'] },
  { id: 'cuba_quiosques', nome: 'Cuba', tipo: '', ambiente: ['Quiosques'] },
  { id: 'metais_quiosques', nome: 'Metais', tipo: '', ambiente: ['Quiosques'] },
  { id: 'tampo_balcao_quiosques', nome: 'Tampo do Balcão', tipo: '', ambiente: ['Quiosques'] },
  { id: 'churrasqueira_quiosques', nome: 'Churrasqueira', tipo: '', ambiente: ['Quiosques'] },
  { id: 'inst_eletricas_quiosques', nome: 'Inst. Elétricas', tipo: '', ambiente: ['Quiosques'] },
  { id: 'inst_hidraulica_quiosques', nome: 'Inst. Hidráulica', tipo: '', ambiente: ['Quiosques'] },
  { id: 'inst_comunic_quiosques', nome: 'Inst. Comunic.', tipo: '', ambiente: ['Quiosques'] },

  // Copa Funcionários
  { id: 'piso_copa', nome: 'Piso', tipo: '', ambiente: ['Copa Funcionários'] },
  { id: 'parede_interna_copa', nome: 'Parede Interna', tipo: '', ambiente: ['Copa Funcionários'] },
  { id: 'teto_copa', nome: 'Teto', tipo: '', ambiente: ['Copa Funcionários'] },
  { id: 'rodape_copa', nome: 'Rodapé', tipo: '', ambiente: ['Copa Funcionários'] },
  { id: 'porta_copa', nome: 'Porta', tipo: '', ambiente: ['Copa Funcionários'] },
  { id: 'esquadria_copa', nome: 'Esquadria', tipo: '', ambiente: ['Copa Funcionários'] },
  { id: 'vidro_copa', nome: 'Vidro', tipo: '', ambiente: ['Copa Funcionários'] },
  { id: 'soleira_copa', nome: 'Soleira', tipo: '', ambiente: ['Copa Funcionários'] },
  { id: 'peitoril_copa', nome: 'Peitoril', tipo: '', ambiente: ['Copa Funcionários'] },
  { id: 'bancada_copa', nome: 'Bancada', tipo: '', ambiente: ['Copa Funcionários'] },
  { id: 'cuba_copa', nome: 'Cuba', tipo: '', ambiente: ['Copa Funcionários'] },
  { id: 'metais_copa', nome: 'Metais', tipo: '', ambiente: ['Copa Funcionários'] },
  { id: 'inst_eletricas_copa', nome: 'Inst. Elétricas', tipo: '', ambiente: ['Copa Funcionários'] },
  { id: 'inst_hidraulica_copa', nome: 'Inst. Hidráulica', tipo: '', ambiente: ['Copa Funcionários'] },
  { id: 'inst_comunic_copa', nome: 'Inst. Comunic.', tipo: '', ambiente: ['Copa Funcionários'] },

  // Petplay
  { id: 'piso_petplay', nome: 'Piso', tipo: '', ambiente: ['Petplay'] },
  { id: 'fechamento_petplay', nome: 'Fechamento', tipo: '', ambiente: ['Petplay'] },
  { id: 'equipamentos_petplay', nome: 'Equipamentos', tipo: '', ambiente: ['Petplay'] },

  // Parque Infantil
  { id: 'piso_parque', nome: 'Piso', tipo: '', ambiente: ['Parque Infantil'] },
  { id: 'brinquedos_parque', nome: 'Brinquedos', tipo: '', ambiente: ['Parque Infantil'] },

  // Brinquedoteca
  { id: 'piso_brinquedoteca', nome: 'Piso', tipo: '', ambiente: ['Brinquedoteca'] },
  { id: 'parede_brinquedoteca', nome: 'Parede', tipo: '', ambiente: ['Brinquedoteca'] },
  { id: 'teto_brinquedoteca', nome: 'Teto', tipo: '', ambiente: ['Brinquedoteca'] },
  { id: 'rodape_brinquedoteca', nome: 'Rodapé', tipo: '', ambiente: ['Brinquedoteca'] },
  { id: 'soleira_brinquedoteca', nome: 'Soleira', tipo: '', ambiente: ['Brinquedoteca'] },
  { id: 'peitoril_brinquedoteca', nome: 'Peitoril', tipo: '', ambiente: ['Brinquedoteca'] },
  { id: 'ferragens_brinquedoteca', nome: 'Ferragens', tipo: '', ambiente: ['Brinquedoteca'] },
  { id: 'esquadrias_brinquedoteca', nome: 'Esquadrias', tipo: '', ambiente: ['Brinquedoteca'] },
  { id: 'vidro_brinquedoteca', nome: 'Vidro', tipo: '', ambiente: ['Brinquedoteca'] },
  { id: 'inst_eletricas_brinquedoteca', nome: 'Inst. Elétricas', tipo: '', ambiente: ['Brinquedoteca'] },

  // Salão de Festas
  { id: 'piso_salao', nome: 'Piso', tipo: '', ambiente: ['Salão de Festas'] },
  { id: 'parede_salao', nome: 'Parede', tipo: '', ambiente: ['Salão de Festas'] },
  { id: 'teto_salao', nome: 'Teto', tipo: '', ambiente: ['Salão de Festas'] },
  { id: 'rodape_salao', nome: 'Rodapé', tipo: '', ambiente: ['Salão de Festas'] },
  { id: 'porta_salao', nome: 'Porta', tipo: '', ambiente: ['Salão de Festas'] },
  { id: 'esquadria_salao', nome: 'Esquadria', tipo: '', ambiente: ['Salão de Festas'] },
  { id: 'vidro_salao', nome: 'Vidro', tipo: '', ambiente: ['Salão de Festas'] },
  { id: 'soleira_salao', nome: 'Soleira', tipo: '', ambiente: ['Salão de Festas'] },
  { id: 'peitoril_salao', nome: 'Peitoril', tipo: '', ambiente: ['Salão de Festas'] },
  { id: 'bancada_salao', nome: 'Bancada', tipo: '', ambiente: ['Salão de Festas'] },
  { id: 'cuba_salao', nome: 'Cuba', tipo: '', ambiente: ['Salão de Festas'] },
  { id: 'metais_salao', nome: 'Metais', tipo: '', ambiente: ['Salão de Festas'] },
  { id: 'tampo_balcao_salao', nome: 'Tampo do Balcão', tipo: '', ambiente: ['Salão de Festas'] },
  { id: 'inst_eletricas_salao', nome: 'Inst. Elétricas', tipo: '', ambiente: ['Salão de Festas'] },
  { id: 'inst_hidraulica_salao', nome: 'Inst. Hidráulica', tipo: '', ambiente: ['Salão de Festas'] },
  { id: 'inst_comunic_salao', nome: 'Inst. Comunic.', tipo: '', ambiente: ['Salão de Festas'] },

  // Bicicletário
  { id: 'piso_bicicletario', nome: 'Piso', tipo: '', ambiente: ['Bicicletário'] },
  { id: 'parede_bicicletario', nome: 'Parede', tipo: '', ambiente: ['Bicicletário'] },
  { id: 'teto_bicicletario', nome: 'Teto', tipo: '', ambiente: ['Bicicletário'] },

  // Salão de Jogos
  { id: 'piso_jogos', nome: 'Piso', tipo: '', ambiente: ['Salão de Jogos'] },
  { id: 'parede_jogos', nome: 'Parede', tipo: '', ambiente: ['Salão de Jogos'] },
  { id: 'teto_jogos', nome: 'Teto', tipo: '', ambiente: ['Salão de Jogos'] },
  { id: 'rodape_jogos', nome: 'Rodapé', tipo: '', ambiente: ['Salão de Jogos'] },
  { id: 'soleira_jogos', nome: 'Soleira', tipo: '', ambiente: ['Salão de Jogos'] },
  { id: 'peitoril_jogos', nome: 'Peitoril', tipo: '', ambiente: ['Salão de Jogos'] },
  { id: 'esquadrias_jogos', nome: 'Esquadrias', tipo: '', ambiente: ['Salão de Jogos'] },
  { id: 'vidro_jogos', nome: 'Vidro', tipo: '', ambiente: ['Salão de Jogos'] },
  { id: 'inst_eletricas_jogos', nome: 'Inst. Elétricas', tipo: '', ambiente: ['Salão de Jogos'] },

  // Academia
  { id: 'piso_academia', nome: 'Piso', tipo: '', ambiente: ['Academia'] },
  { id: 'parede_academia', nome: 'Parede', tipo: '', ambiente: ['Academia'] },
  { id: 'teto_academia', nome: 'Teto', tipo: '', ambiente: ['Academia'] },
  { id: 'rodape_academia', nome: 'Rodapé', tipo: '', ambiente: ['Academia'] },
  { id: 'soleira_academia', nome: 'Soleira', tipo: '', ambiente: ['Academia'] },
  { id: 'peitoril_academia', nome: 'Peitoril', tipo: '', ambiente: ['Academia'] },
  { id: 'ferragens_academia', nome: 'Ferragens', tipo: '', ambiente: ['Academia'] },
  { id: 'esquadrias_academia', nome: 'Esquadrias', tipo: '', ambiente: ['Academia'] },
  { id: 'vidro_academia', nome: 'Vidro', tipo: '', ambiente: ['Academia'] },
  { id: 'inst_eletricas_academia', nome: 'Inst. Elétricas', tipo: '', ambiente: ['Academia'] },

  // Administração
  { id: 'piso_admin', nome: 'Piso', tipo: '', ambiente: ['Administração'] },
  { id: 'parede_admin', nome: 'Parede', tipo: '', ambiente: ['Administração'] },
  { id: 'teto_admin', nome: 'Teto', tipo: '', ambiente: ['Administração'] },
  { id: 'rodape_admin', nome: 'Rodapé', tipo: '', ambiente: ['Administração'] },
  { id: 'soleira_admin', nome: 'Soleira', tipo: '', ambiente: ['Administração'] },
  { id: 'peitoril_admin', nome: 'Peitoril', tipo: '', ambiente: ['Administração'] },
  { id: 'esquadrias_admin', nome: 'Esquadrias', tipo: '', ambiente: ['Administração'] },
  { id: 'vidro_admin', nome: 'Vidro', tipo: '', ambiente: ['Administração'] },
  { id: 'inst_eletricas_admin', nome: 'Inst. Elétricas', tipo: '', ambiente: ['Administração'] },

  // Quadra Esportiva
  { id: 'piso_quadra', nome: 'Piso', tipo: '', ambiente: ['Quadra Esportiva'] },
  { id: 'parede_quadra', nome: 'Parede', tipo: '', ambiente: ['Quadra Esportiva'] },
  { id: 'equipamentos_quadra', nome: 'Equipamentos', tipo: '', ambiente: ['Quadra Esportiva'] },

  // Quadra de Areia
  { id: 'piso_quadra_areia', nome: 'Piso', tipo: '', ambiente: ['Quadra de Areia'] },
  { id: 'parede_quadra_areia', nome: 'Parede', tipo: '', ambiente: ['Quadra de Areia'] },
  { id: 'equipamentos_quadra_areia', nome: 'Equipamentos', tipo: '', ambiente: ['Quadra de Areia'] },

  // Piscina
  { id: 'piso_piscina', nome: 'Piso (Piscina)', tipo: '', ambiente: ['Piscina'] },
  { id: 'parede_piscina', nome: 'Parede (Piscina)', tipo: '', ambiente: ['Piscina'] },
  { id: 'piso_deck', nome: 'Piso Deck', tipo: '', ambiente: ['Piscina'] },
  { id: 'borda', nome: 'Borda', tipo: '', ambiente: ['Piscina'] },
  { id: 'equipamentos_piscina', nome: 'Equipamentos', tipo: '', ambiente: ['Piscina'] },

  // Gerador
  { id: 'piso_gerador', nome: 'Piso', tipo: '', ambiente: ['Gerador'] },
  { id: 'parede_interna_gerador', nome: 'Parede Interna', tipo: '', ambiente: ['Gerador'] },
  { id: 'parede_externa_gerador', nome: 'Parede Externa', tipo: '', ambiente: ['Gerador'] },
  { id: 'teto_gerador', nome: 'Teto', tipo: '', ambiente: ['Gerador'] },
  { id: 'soleira_gerador', nome: 'Soleira', tipo: '', ambiente: ['Gerador'] },
  { id: 'cobogo', nome: 'Cobogó', tipo: '', ambiente: ['Gerador'] },
  { id: 'portao_gerador', nome: 'Portão', tipo: '', ambiente: ['Gerador'] },
  { id: 'inst_eletricas_gerador', nome: 'Inst. Elétricas', tipo: '', ambiente: ['Gerador'] },

  // Casa de Lixo
  { id: 'piso_lixo', nome: 'Piso', tipo: '', ambiente: ['Casa de Lixo'] },
  { id: 'parede_interna_lixo', nome: 'Parede Interna', tipo: '', ambiente: ['Casa de Lixo'] },
  { id: 'parede_externa_lixo', nome: 'Parede Externa', tipo: '', ambiente: ['Casa de Lixo'] },
  { id: 'teto_lixo', nome: 'Teto', tipo: '', ambiente: ['Casa de Lixo'] },
  { id: 'soleira_lixo', nome: 'Soleira', tipo: '', ambiente: ['Casa de Lixo'] },
  { id: 'portao_lixo', nome: 'Portão', tipo: '', ambiente: ['Casa de Lixo'] },
  { id: 'inst_eletricas_lixo', nome: 'Inst. Elétricas', tipo: '', ambiente: ['Casa de Lixo'] },
  { id: 'inst_hidraulico_lixo', nome: 'Inst. Hidráulico', tipo: '', ambiente: ['Casa de Lixo'] },

  // Vestiário
  { id: 'piso_vestiario', nome: 'Piso', tipo: '', ambiente: ['Vestiário'] },
  { id: 'parede_vestiario', nome: 'Parede', tipo: '', ambiente: ['Vestiário'] },
  { id: 'teto_vestiario', nome: 'Teto', tipo: '', ambiente: ['Vestiário'] },
  { id: 'soleira_vestiario', nome: 'Soleira', tipo: '', ambiente: ['Vestiário'] },
  { id: 'porta_vestiario', nome: 'Porta', tipo: '', ambiente: ['Vestiário'] },
  { id: 'ferragens_vestiario', nome: 'Ferragens', tipo: '', ambiente: ['Vestiário'] },
  { id: 'inst_eletricas_vestiario', nome: 'Inst. Elétricas', tipo: '', ambiente: ['Vestiário'] },

  // Escadaria
  { id: 'piso_escadaria', nome: 'Piso', tipo: '', ambiente: ['Escadaria'] },
  { id: 'parede_escadaria', nome: 'Parede', tipo: '', ambiente: ['Escadaria'] },
  { id: 'teto_escadaria', nome: 'Teto', tipo: '', ambiente: ['Escadaria'] },

  // Depósito
  { id: 'piso_deposito', nome: 'Piso', tipo: '', ambiente: ['Depósito'] },
  { id: 'parede_deposito', nome: 'Parede', tipo: '', ambiente: ['Depósito'] },
  { id: 'teto_deposito', nome: 'Teto', tipo: '', ambiente: ['Depósito'] },
  { id: 'rodape_deposito', nome: 'Rodapé', tipo: '', ambiente: ['Depósito'] },
  { id: 'porta_deposito', nome: 'Porta', tipo: '', ambiente: ['Depósito'] },
  { id: 'ferragens_deposito', nome: 'Ferragens', tipo: '', ambiente: ['Depósito'] },
  { id: 'inst_eletricas_deposito', nome: 'Inst. Elétricas', tipo: '', ambiente: ['Depósito'] },

  // Muro de Fechamento
  { id: 'acabamento_interno_muro', nome: 'Acabamento Interno', tipo: '', ambiente: ['Muro de Fechamento'] },
  { id: 'acabamento_externo_muro', nome: 'Acabamento Externo', tipo: '', ambiente: ['Muro de Fechamento'] },

  // Hall's
  { id: 'piso_hall', nome: 'Piso', tipo: '', ambiente: ['Hall\'s'] },
  { id: 'parede_hall', nome: 'Parede', tipo: '', ambiente: ['Hall\'s'] },
  { id: 'teto_hall', nome: 'Teto', tipo: '', ambiente: ['Hall\'s'] },
  { id: 'rodape_hall', nome: 'Rodapé', tipo: '', ambiente: ['Hall\'s'] },
  { id: 'inst_eletricas_hall', nome: 'Inst. Elétricas', tipo: '', ambiente: ['Hall\'s'] },

  // Instalações Gerais
  { id: 'rede_eletrica', nome: 'Rede Elétrica', tipo: '', ambiente: ['Instalações Gerais'] },
  { id: 'rede_comunicacao', nome: 'Rede de Comunicação', tipo: '', ambiente: ['Instalações Gerais'] },
  { id: 'iluminacao_ruas', nome: 'Iluminação das Ruas', tipo: '', ambiente: ['Instalações Gerais'] },
  { id: 'drenagem_pluviais', nome: 'Drenag./Pluviais', tipo: '', ambiente: ['Instalações Gerais'] },
  { id: 'esgoto_sanitario', nome: 'Esgot. Sanitário', tipo: '', ambiente: ['Instalações Gerais'] },
  { id: 'rede_agua', nome: 'Rede de Água', tipo: '', ambiente: ['Instalações Gerais'] },

  // Vias Internas
  { id: 'pavimentacao', nome: 'Pavimentação', tipo: '', ambiente: ['Vias Internas'] },

  // Jardins
  { id: 'jardins', nome: 'Jardins', tipo: '', ambiente: ['Jardins'] },

  // Passeio Externo
  { id: 'passeio', nome: 'Passeio', tipo: '', ambiente: ['Passeio Externo'] },

  // Portão de Veículos
  { id: 'portao_veiculos', nome: 'Portão', tipo: '', ambiente: ['Portão de Veículos'] },
  { id: 'inst_eletrica_portao', nome: 'Inst. Elétrica', tipo: '', ambiente: ['Portão de Veículos'] }
];

export const materialExamples: { [key: string]: string } = {
};

export const projetosDetalhes: ProjetoDetalhes[] = [
  // PROJETOS APROVADOS 
  {
    id: 1,
    nome: 'Condomínio A - Torre A',
    tipoProjeto: 'Residencial',
    dataCriacao: '15/03/2024',
    responsavel: 'Fernando Nascimento',
    status: 'aprovado',
    ambientes: [
      {
        id: 1,
        nome: 'Sala de Estar/Jantar',
        materiais: materiais
          .filter(m => m.ambiente.includes('Sala de Estar/Jantar'))
          .map(m => ({
            ...m,
            status: 'aprovado' as const,
            motivo: '',
            tipo: m.nome === 'Piso' ? 'Porcelanato' :
                  m.nome === 'Parede' ? 'Pintura PVA látex branco sobre gesso ou massa de regularização PVA' :
                  m.nome === 'Teto' ? 'Pintura PVA látex branco sobre gesso ou massa de regularização PVA' :
                  m.nome === 'Rodapé' ? 'Porcelanato, h= 5cm' :
                  m.nome === 'Soleira' ? 'Mármore' :
                  m.nome === 'Peitoril' ? 'Metálico' :
                  m.nome === 'Esquadria' ? 'Alumínio pintado de branco' :
                  m.nome === 'Vidro' ? 'Liso incolor' :
                  m.nome === 'Porta' ? 'Porta semi-ôca comum pintada c/ esmalte sintético' :
                  m.nome === 'Ferragem' ? 'Acabamento cromado' :
                  m.nome === 'Inst. Elétrica' ? 'Pontos de luz no teto, tomadas de corrente e interruptores' :
                  m.nome === 'Inst. Comunic.' ? 'Pontos secos de comunicação e de antena de TV' : m.tipo
          }))
      },
      {
        id: 2,
        nome: 'Quarto e Suíte',
        materiais: materiais
          .filter(m => m.ambiente.includes('Quarto e Suíte'))
          .map(m => ({
            ...m,
            status: 'aprovado' as const,
            motivo: '',
            tipo: m.nome === 'Piso' ? 'Porcelanato' :
                  m.nome === 'Parede' ? 'Pintura PVA látex branco sobre gesso ou massa de regularização PVA' :
                  m.nome === 'Teto' ? 'Pintura PVA látex branco sobre gesso ou massa de regularização PVA' :
                  m.nome === 'Rodapé' ? 'Porcelanato, h= 5cm' :
                  m.nome === 'Soleira' ? 'Mármore' :
                  m.nome === 'Peitoril' ? 'Metálico' :
                  m.nome === 'Esquadria' ? 'Alumínio pintado de branco' :
                  m.nome === 'Vidro' ? 'Liso incolor' :
                  m.nome === 'Porta' ? 'Porta semi-ôca comum pintada c/ esmalte sintético' :
                  m.nome === 'Ferragem' ? 'Acabamento cromado' :
                  m.nome === 'Inst. Elétrica' ? 'Pontos de luz no teto, tomadas de corrente e interruptores' :
                  m.nome === 'Inst. Comunic.' ? 'Pontos secos de comunicação e de antena de TV' :
                  m.nome === 'Ar Condicionado' ? 'Infraestrutura para high wall com condensadora axial' : m.tipo
          }))
      },
      {
        id: 3,
        nome: 'Sanitário/Lavabo',
        materiais: materiais
          .filter(m => m.ambiente.includes('Sanitário/Lavabo'))
          .map(m => ({
            ...m,
            status: 'aprovado' as const,
            motivo: '',
            tipo: m.nome === 'Piso' ? 'Cerâmica' :
                  m.nome === 'Parede' ? 'Cerâmica até o teto' :
                  m.nome === 'Teto' ? 'Forro de gesso' :
                  m.nome === 'Filete' ? 'Mármore ou granito L=3,5cm' :
                  m.nome === 'Cordão de Box' ? 'Mármore ou granito' :
                  m.nome === 'Bancada' ? 'Em mármore ou granito com cuba em louça cor branca' :
                  m.nome === 'Porta' ? 'Porta semi-ôca comum pintura c/ esmalte sintético' :
                  m.nome === 'Peitoril' ? 'Metálico' :
                  m.nome === 'Ferragem' ? 'Acabamento cromado' :
                  m.nome === 'Esquadria' ? 'Alumínio pintado de branco' :
                  m.nome === 'Vidro' ? 'Pontilhado Incolor' :
                  m.nome === 'Metal Sanitário' ? 'Torneira para Lavatório, registro de gaveta e registro de pressão com acabamento cromado' :
                  m.nome === 'Louças' ? 'Vaso Sanitário com Caixa Acoplada em louça cor branca' :
                  m.nome === 'Inst. Elétrica' ? 'Pontos de luz no teto, tomada de corrente e interruptor da Prime, Alumbra, Cemar ou Fame na cor branco' :
                  m.nome === 'Inst. Hidráulica' ? 'Sifão em PVC, esgoto em PVC, rede de água fria e ducha higiênica em PEX' : m.tipo
          }))
      },
      {
        id: 4,
        nome: 'Cozinha/Área de Serviço',
        materiais: materiais
          .filter(m => m.ambiente.includes('Cozinha/Área de Serviço'))
          .map(m => ({
            ...m,
            status: 'aprovado' as const,
            motivo: '',
            tipo: m.nome === 'Piso' ? 'Cerâmica' :
                  m.nome === 'Parede' ? 'Cerâmica até o teto' :
                  m.nome === 'Teto' ? 'Pintura látex PVA sobre gesso ou argamassa de regularização PVA' :
                  m.nome === 'Filete' ? 'Mármore ou granito L=3,5cm' :
                  m.nome === 'Bancada' ? 'Em mármore ou granito' :
                  m.nome === 'Cuba' ? 'Inox' :
                  m.nome === 'Peitoril' ? 'Metálico' :
                  m.nome === 'Tanque' ? 'Louça cor branca' :
                  m.nome === 'Esquadrias' ? 'Alumínio pintado de branco' :
                  m.nome === 'Metais' ? 'Torneiras e registro de gaveta com acabamento cromado' :
                  m.nome === 'Inst. Elétricas' ? 'Ponto de luz no teto, tomadas de corrente e interruptores' :
                  m.nome === 'Inst. Hidráulica' ? 'Rede de água fria em PEX e esgoto em PVC' :
                  m.nome === 'Inst. Comunicação' ? 'Tubulação seca' : m.tipo
          }))
      },
      {
        id: 5,
        nome: 'Varanda',
        materiais: materiais
          .filter(m => m.ambiente.includes('Varanda'))
          .map(m => ({
            ...m,
            status: 'aprovado' as const,
            motivo: '',
            tipo: m.nome === 'Piso' ? 'Porcelanato' :
                  m.nome === 'Parede' ? 'Textura Acrílica ou Pastilha Cerâmica, conforme definido em projeto arquitetônico' :
                  m.nome === 'Teto' ? 'Pintura PVA látex branco sobre gesso ou massa de regularização PVA ou Forro de gesso' :
                  m.nome === 'Rodapé' ? 'Porcelanato ou Laminado, h=5cm' :
                  m.nome === 'Porta' ? 'Alumínio pintado de branco com vidro liso' :
                  m.nome === 'Inst. Elétrica' ? 'Ponto de luz no teto' :
                  m.nome === 'Guarda Corpo' ? 'Em perfil metálico pintado de branco' : m.tipo
          }))
      }
    ]
  },
  {
    id: 2,
    nome: 'Condomínio A - Área Comum',
    tipoProjeto: 'Comercial',
    dataCriacao: '20/03/2024',
    responsavel: 'Kayky Cavalcanti',
    status: 'aprovado',
    ambientes: [
      {
        id: 1,
        nome: 'Academia',
        materiais: materiais
          .filter(m => m.ambiente.includes('Academia'))
          .map(m => ({
            ...m,
            status: 'aprovado' as const,
            motivo: '',
            tipo: m.nome === 'Piso' ? 'Vinílico' :
                  m.nome === 'Parede' ? 'Pintura PVA látex branco sobre gesso ou massa de regularização PVA' :
                  m.nome === 'Teto' ? 'Pintura PVA látex branco sobre gesso ou massa de regularização PVA ou Forro em gesso' :
                  m.nome === 'Rodapé' ? 'Vinílico, mármore, granito ou madeira, h=5cm' :
                  m.nome === 'Soleira' ? 'Mármore ou granito' :
                  m.nome === 'Peitoril' ? 'Metálico ou granito' :
                  m.nome === 'Ferragens' ? 'Acabamento cromado' :
                  m.nome === 'Esquadrias' ? 'Alumínio pintado de branco' :
                  m.nome === 'Vidro' ? 'Liso incolor' :
                  m.nome === 'Inst. Elétricas' ? 'Ponto de luz no teto com luminária, tomada de corrente e interruptor na cor branco' : m.tipo
          }))
      },
      {
        id: 2,
        nome: 'Salão de Festas',
        materiais: materiais
          .filter(m => m.ambiente.includes('Salão de Festas'))
          .map(m => ({
            ...m,
            status: 'aprovado' as const,
            motivo: '',
            tipo: m.nome === 'Piso' ? 'Porcelanato' :
                  m.nome === 'Parede' ? 'Pintura PVA látex branco sobre gesso ou massa de regularização PVA. Acima das bancadas será aplicado revestimento cerâmico. Nas demais paredes textura acrílica ou pintura acrílica' :
                  m.nome === 'Teto' ? 'Pintura PVA látex branco sobre gesso ou massa de regularização PVA' :
                  m.nome === 'Rodapé' ? 'Porcelanato, h=5 cm' :
                  m.nome === 'Porta' ? 'Alumínio pintado de branco' :
                  m.nome === 'Esquadria' ? 'Alumínio printado de branco' :
                  m.nome === 'Vidro' ? 'Liso incolor' :
                  m.nome === 'Soleira' ? 'Mármore ou granito' :
                  m.nome === 'Peitoril' ? 'Metálico ou granito' :
                  m.nome === 'Bancada' ? 'Mármore ou granito' :
                  m.nome === 'Cuba' ? 'Inox' :
                  m.nome === 'Metais' ? 'Torneira para pia com acabamento cromado' :
                  m.nome === 'Tampo do Balcão' ? 'Mármore ou granito' :
                  m.nome === 'Inst. Elétricas' ? 'Ponto de luz no teto com luminária, tomada de corrente e interruptor na cor branco' :
                  m.nome === 'Inst. Hidráulica' ? 'Engate, sifão, rede de água fria e esgoto em PVC' :
                  m.nome === 'Inst. Comunic.' ? 'Tubulação seca' : m.tipo
          }))
      },
      {
        id: 3,
        nome: 'Piscina',
        materiais: materiais
          .filter(m => m.ambiente.includes('Piscina'))
          .map(m => ({
            ...m,
            status: 'aprovado' as const,
            motivo: '',
            tipo: m.nome === 'Piso (Piscina)' ? 'Pastilha cerâmica' :
                  m.nome === 'Parede (Piscina)' ? 'Pastilha cerâmica' :
                  m.nome === 'Piso Deck' ? 'Porcelanato Incesa, Lef, Incefra, Portobello ou Cecafi, ou pedra natural' :
                  m.nome === 'Borda' ? 'Mármore ou granito' :
                  m.nome === 'Equipamentos' ? 'Bomba e filtro da Jacuzzi, Mark Peerles ou similar, e dispositivos em aço inox ou PVC' : m.tipo
          }))
      },
      {
        id: 4,
        nome: 'Quadra Esportiva',
        materiais: materiais
          .filter(m => m.ambiente.includes('Quadra Esportiva'))
          .map(m => ({
            ...m,
            status: 'aprovado' as const,
            motivo: '',
            tipo: m.nome === 'Piso' ? 'Poliuretano' :
                  m.nome === 'Parede' ? 'Fechamento em tela de nylon ou alambrado' :
                  m.nome === 'Equipamentos' ? 'Tabelas de basquete' : m.tipo
          }))
      },
      {
        id: 5,
        nome: 'Administração',
        materiais: materiais
          .filter(m => m.ambiente.includes('Administração'))
          .map(m => ({
            ...m,
            status: 'aprovado' as const,
            motivo: '',
            tipo: m.nome === 'Piso' ? 'Carpete comercial' :
                  m.nome === 'Parede' ? 'Pintura PVA látex branco sobre gesso ou massa de regularização PVA' :
                  m.nome === 'Teto' ? 'Pintura PVA látex branco sobre gesso ou massa de regularização PVA' :
                  m.nome === 'Rodapé' ? 'Cerâmica, h=5 cm' :
                  m.nome === 'Soleira' ? 'Mármore ou granito' :
                  m.nome === 'Peitoril' ? 'Metálico ou granito' :
                  m.nome === 'Esquadrias' ? 'Alumínio pintado de branco' :
                  m.nome === 'Vidro' ? 'Liso incolor' :
                  m.nome === 'Inst. Elétricas' ? 'Ponto de luz no teto com luminária, tomada de corrente e interruptor na cor branco' : m.tipo
          }))
      }
    ]
  },

  // PROJETOS REPROVADOS 
  {
    id: 3,
    nome: 'Residencial B',
    tipoProjeto: 'Residencial',
    dataCriacao: '10/03/2024',
    responsavel: 'Carlos Santos',
    status: 'reprovado',
    ambientes: [
      {
        id: 1,
        nome: 'Quarto e Suíte',
        materiais: materiais
          .filter(m => m.ambiente.includes('Quarto e Suíte'))
          .map(m => ({
            ...m,
            status: m.nome === 'Piso' ? 'reprovado' as const : 'aprovado' as const,
            motivo: m.nome === 'Piso' ? 'Material não aprovado pelo cliente' : '',
            tipo: m.nome === 'Piso' ? 'Mármore importado' :
                  m.nome === 'Parede' ? 'Pintura PVA látex branco sobre gesso ou massa de regularização PVA' :
                  m.nome === 'Teto' ? 'Pintura PVA látex branco sobre gesso ou massa de regularização PVA' :
                  m.nome === 'Rodapé' ? 'Porcelanato, h= 5cm' :
                  m.nome === 'Soleira' ? 'Mármore' :
                  m.nome === 'Peitoril' ? 'Metálico' :
                  m.nome === 'Esquadria' ? 'Alumínio pintado de branco' :
                  m.nome === 'Vidro' ? 'Liso incolor' :
                  m.nome === 'Porta' ? 'Porta semi-ôca comum pintada c/ esmalte sintético' :
                  m.nome === 'Ferragem' ? 'Acabamento cromado' :
                  m.nome === 'Inst. Elétrica' ? 'Pontos de luz no teto, tomadas de corrente e interruptores' :
                  m.nome === 'Inst. Comunic.' ? 'Pontos secos de comunicação e de antena de TV' :
                  m.nome === 'Ar Condicionado' ? 'Infraestrutura para high wall com condensadora axial' : m.tipo
          }))
      },
      {
        id: 2,
        nome: 'Cozinha/Área de Serviço',
        materiais: materiais
          .filter(m => m.ambiente.includes('Cozinha/Área de Serviço'))
          .map(m => ({
            ...m,
            status: 'reprovado' as const,
            motivo: 'Especificações não atendem aos requisitos mínimos',
            tipo: m.nome === 'Piso' ? 'Cerâmica' :
                  m.nome === 'Parede' ? 'Cerâmica até o teto' :
                  m.nome === 'Teto' ? 'Pintura látex PVA sobre gesso ou argamassa de regularização PVA' :
                  m.nome === 'Filete' ? 'Mármore ou granito L=3,5cm' :
                  m.nome === 'Bancada' ? 'Mármore importado' :
                  m.nome === 'Cuba' ? 'Inox' :
                  m.nome === 'Peitoril' ? 'Metálico' :
                  m.nome === 'Tanque' ? 'Louça cor branca' :
                  m.nome === 'Esquadrias' ? 'Alumínio pintado de branco' :
                  m.nome === 'Metais' ? 'Acabamento cromado premium' :
                  m.nome === 'Inst. Elétricas' ? 'Ponto de luz no teto, tomadas de corrente e interruptores' :
                  m.nome === 'Inst. Hidráulica' ? 'Rede de água fria em PEX e esgoto em PVC' :
                  m.nome === 'Inst. Comunicação' ? 'Tubulação seca' : m.tipo
          }))
      }
    ]
  },

  // PROJETOS PENDENTES
  {
    id: 4,
    nome: 'Edifício Commercial',
    tipoProjeto: 'Comercial',
    dataCriacao: '25/03/2024',
    responsavel: 'Carlos Diego',
    status: 'pendente',
    ambientes: [
      {
        id: 1,
        nome: 'Hall\'s',
        materiais: materiais
          .filter(m => m.ambiente.includes('Hall\'s'))
          .map(m => ({
            ...m,
            status: 'pendente' as const,
            motivo: 'Aguardando aprovação',
            tipo: m.nome === 'Piso' ? 'Porcelanato premium' :
                  m.nome === 'Parede' ? 'Pintura PVA látex branco sobre gesso ou massa de regularização PVA' :
                  m.nome === 'Teto' ? 'Pintura PVA látex branco sobre gesso ou massa de regularização PVA ou forro de gesso' :
                  m.nome === 'Rodapé' ? 'Porcelanato, h=5cm' :
                  m.nome === 'Inst. Elétricas' ? 'Sistema inteligente' : m.tipo
          }))
      },
      {
        id: 2,
        nome: 'Administração',
        materiais: materiais
          .filter(m => m.ambiente.includes('Administração'))
          .map(m => ({
            ...m,
            status: 'pendente' as const,
            motivo: 'Aguardando aprovação',
            tipo: m.nome === 'Piso' ? 'Carpete comercial' :
                  m.nome === 'Parede' ? 'Pintura PVA látex branco sobre gesso ou massa de regularização PVA' :
                  m.nome === 'Teto' ? 'Pintura PVA látex branco sobre gesso ou massa de regularização PVA' :
                  m.nome === 'Rodapé' ? 'Cerâmica, h=5 cm' :
                  m.nome === 'Soleira' ? 'Mármore ou granito' :
                  m.nome === 'Peitoril' ? 'Metálico ou granito' :
                  m.nome === 'Esquadrias' ? 'Vidro fumê' :
                  m.nome === 'Vidro' ? 'Liso incolor' :
                  m.nome === 'Inst. Elétricas' ? 'Ponto de luz no teto com luminária, tomada de corrente e interruptor na cor branco' : m.tipo
          }))
      },
      {
        id: 3,
        nome: 'Guarita',
        materiais: materiais
          .filter(m => m.ambiente.includes('Guarita'))
          .map(m => ({
            ...m,
            status: 'pendente' as const,
            motivo: 'Aguardando especificação técnica',
            tipo: m.nome === 'Piso' ? 'Porcelanato antiderrapante' :
                  m.nome === 'Parede Interna' ? 'Pintura PVA látex branco sobre gesso ou massa de regularização PVA' :
                  m.nome === 'Teto' ? 'Forro de gesso' :
                  m.nome === 'Parede Externa' ? 'Acabamento em textura acrílica' :
                  m.nome === 'Rodapé' ? 'Cerâmica, h=5 cm' :
                  m.nome === 'Soleira' ? 'Mármore ou granito' :
                  m.nome === 'Peitoril' ? 'Metálico ou granito' :
                  m.nome === 'Ferragens' ? 'Acabamento cromado' :
                  m.nome === 'Porta Externa' ? 'Alumínio pintado na cor branca com vidro liso' :
                  m.nome === 'Esquadrias' ? 'Alumínio pintado de branco' :
                  m.nome === 'Vidro' ? 'Liso incolor' :
                  m.nome === 'Inst. Elétricas' ? 'Sistema de CFTV' :
                  m.nome === 'Inst. Comunic.' ? 'Tubulação seca' : m.tipo
          }))
      }
    ]
  },
  {
    id: 5,
    nome: 'Condomínio Residencial Premium',
    tipoProjeto: 'Residencial',
    dataCriacao: '28/03/2024',
    responsavel: 'Fabiano Vidal',
    status: 'pendente',
    ambientes: [
      {
        id: 1,
        nome: 'Sala de Estar/Jantar',
        materiais: materiais
          .filter(m => m.ambiente.includes('Sala de Estar/Jantar'))
          .map(m => ({
            ...m,
            status: 'pendente' as const,
            motivo: 'Aguardando aprovação',
            tipo: m.nome === 'Piso' ? 'Porcelanato' :
                  m.nome === 'Parede' ? 'Pintura PVA látex branco sobre gesso ou massa de regularização PVA' :
                  m.nome === 'Teto' ? 'Gesso acartonado com iluminação embutida' :
                  m.nome === 'Rodapé' ? 'Porcelanato, h= 5cm' :
                  m.nome === 'Soleira' ? 'Mármore' :
                  m.nome === 'Peitoril' ? 'Metálico' :
                  m.nome === 'Esquadria' ? 'Alumínio pintado de branco' :
                  m.nome === 'Vidro' ? 'Liso incolor' :
                  m.nome === 'Porta' ? 'Porta semi-ôca comum pintada c/ esmalte sintético' :
                  m.nome === 'Ferragem' ? 'Acabamento cromado' :
                  m.nome === 'Inst. Elétrica' ? 'Pontos de luz no teto, tomadas de corrente e interruptores' :
                  m.nome === 'Inst. Comunic.' ? 'Pontos secos de comunicação e de antena de TV' : m.tipo
          }))
      },
      {
        id: 2,
        nome: 'Quarto e Suíte',
        materiais: materiais
          .filter(m => m.ambiente.includes('Quarto e Suíte'))
          .map(m => ({
            ...m,
            status: 'pendente' as const,
            motivo: m.nome === 'Piso' ? 'Aguardando aprovação do fornecedor' :
                    m.nome === 'Parede' ? 'Aguardando escolha do padrão' :
                    m.nome === 'Ar Condicionado' ? 'Aguardando aprovação da marca' :
                    m.nome === 'Porta' ? 'Aguardando orçamento' : 'Aguardando aprovação',
            tipo: m.nome === 'Piso' ? 'Piso laminado' :
                  m.nome === 'Parede' ? 'Pintura PVA látex branco sobre gesso ou massa de regularização PVA' :
                  m.nome === 'Teto' ? 'Pintura PVA látex branco sobre gesso ou massa de regularização PVA' :
                  m.nome === 'Rodapé' ? 'Porcelanato, h= 5cm' :
                  m.nome === 'Soleira' ? 'Mármore' :
                  m.nome === 'Peitoril' ? 'Metálico' :
                  m.nome === 'Esquadria' ? 'Alumínio pintado de branco' :
                  m.nome === 'Vidro' ? 'Liso incolor' :
                  m.nome === 'Porta' ? 'Porta semi-ôca comum pintada c/ esmalte sintético' :
                  m.nome === 'Ferragem' ? 'Acabamento cromado' :
                  m.nome === 'Inst. Elétrica' ? 'Pontos de luz no teto, tomadas de corrente e interruptores' :
                  m.nome === 'Inst. Comunic.' ? 'Pontos secos de comunicação e de antena de TV' :
                  m.nome === 'Ar Condicionado' ? 'Infraestrutura para high wall com condensadora axial' : m.tipo
          }))
      },
      {
        id: 3,
        nome: 'Cozinha/Área de Serviço',
        materiais: materiais
          .filter(m => m.ambiente.includes('Cozinha/Área de Serviço'))
          .map(m => ({
            ...m,
            status: 'pendente' as const,
            motivo: 'Aguardando definição de orçamento',
            tipo: m.nome === 'Piso' ? 'Cerâmica' :
                  m.nome === 'Parede' ? 'Cerâmica até o teto' :
                  m.nome === 'Teto' ? 'Pintura látex PVA sobre gesso ou argamassa de regularização PVA' :
                  m.nome === 'Filete' ? 'Mármore ou granito L=3,5cm' :
                  m.nome === 'Bancada' ? 'Granito nacional' :
                  m.nome === 'Cuba' ? 'Inox' :
                  m.nome === 'Peitoril' ? 'Metálico' :
                  m.nome === 'Tanque' ? 'Louça cor branca' :
                  m.nome === 'Esquadrias' ? 'Alumínio pintado de branco' :
                  m.nome === 'Metais' ? 'Acabamento cromado' :
                  m.nome === 'Inst. Elétricas' ? 'Ponto de luz no teto, tomadas de corrente e interruptores' :
                  m.nome === 'Inst. Hidráulica' ? 'Rede de água fria em PEX e esgoto em PVC' :
                  m.nome === 'Inst. Comunicação' ? 'Tubulação seca' : m.tipo
          }))
      },
      {
        id: 4,
        nome: 'Sanitário/Lavabo',
        materiais: materiais
          .filter(m => m.ambiente.includes('Sanitário/Lavabo'))
          .map(m => ({
            ...m,
            status: 'pendente' as const,
            motivo: 'Aguardando seleção de materiais',
            tipo: m.nome === 'Piso' ? 'Cerâmica antiderrapante' :
                  m.nome === 'Parede' ? 'Cerâmica até o teto' :
                  m.nome === 'Teto' ? 'Forro de gesso' :
                  m.nome === 'Filete' ? 'Mármore ou granito L=3,5cm' :
                  m.nome === 'Cordão de Box' ? 'Mármore ou granito' :
                  m.nome === 'Bancada' ? 'Em mármore ou granito com cuba em louça cor branca' :
                  m.nome === 'Porta' ? 'Porta semi-ôca comum pintura c/ esmalte sintético' :
                  m.nome === 'Peitoril' ? 'Metálico' :
                  m.nome === 'Ferragem' ? 'Acabamento cromado' :
                  m.nome === 'Esquadria' ? 'Alumínio pintado de branco' :
                  m.nome === 'Vidro' ? 'Pontilhado Incolor' :
                  m.nome === 'Metal Sanitário' ? 'Torneira para Lavatório, registro de gaveta e registro de pressão com acabamento cromado' :
                  m.nome === 'Louças' ? 'Linha econômica' :
                  m.nome === 'Inst. Elétrica' ? 'Pontos de luz no teto, tomada de corrente e interruptor da Prime, Alumbra, Cemar ou Fame na cor branco' :
                  m.nome === 'Inst. Hidráulica' ? 'Sifão em PVC, esgoto em PVC, rede de água fria e ducha higiênica em PEX' : m.tipo
          }))
      }
    ]
  },
  {
    id: 6,
    nome: 'Complexo Esportivo',
    tipoProjeto: 'Comercial',
    dataCriacao: '01/04/2024',
    responsavel: 'Maria Silva',
    status: 'pendente',
    ambientes: [
      {
        id: 1,
        nome: 'Academia',
        materiais: materiais
          .filter(m => m.ambiente.includes('Academia'))
          .map(m => ({
            ...m,
            status: 'pendente' as const,
            motivo: 'Aguardando aprovação de equipamentos',
            tipo: m.nome === 'Piso' ? 'Borracha 15mm' :
                  m.nome === 'Parede' ? 'Pintura PVA látex branco sobre gesso ou massa de regularização PVA' :
                  m.nome === 'Teto' ? 'Pintura PVA látex branco sobre gesso ou massa de regularização PVA ou Forro em gesso' :
                  m.nome === 'Rodapé' ? 'Vinílico, mármore, granito ou madeira, h=5cm' :
                  m.nome === 'Soleira' ? 'Mármore ou granito' :
                  m.nome === 'Peitoril' ? 'Metálico ou granito' :
                  m.nome === 'Ferragens' ? 'Acabamento cromado' :
                  m.nome === 'Esquadrias' ? 'Alumínio pintado de branco' :
                  m.nome === 'Vidro' ? 'Liso incolor' :
                  m.nome === 'Inst. Elétricas' ? 'Circuitos para equipamentos de cardio' : m.tipo
          }))
      },
      {
        id: 2,
        nome: 'Quadra Esportiva',
        materiais: materiais
          .filter(m => m.ambiente.includes('Quadra Esportiva'))
          .map(m => ({
            ...m,
            status: 'pendente' as const,
            motivo: 'Aguardando laudo de impacto',
            tipo: m.nome === 'Piso' ? 'Poliuretano 8mm' :
                  m.nome === 'Parede' ? 'Fechamento em tela de nylon ou alambrado' :
                  m.nome === 'Equipamentos' ? 'Tabelas de basquete reguláveis' : m.tipo
          }))
      },
      {
        id: 3,
        nome: 'Vestiário',
        materiais: materiais
          .filter(m => m.ambiente.includes('Vestiário'))
          .map(m => ({
            ...m,
            status: 'pendente' as const,
            motivo: 'Aguardando projeto de instalações',
            tipo: m.nome === 'Piso' ? 'Cerâmica antiderrapante' :
                  m.nome === 'Parede' ? 'Cerâmica' :
                  m.nome === 'Teto' ? 'Forro de gesso' :
                  m.nome === 'Soleira' ? 'Mármore ou granito' :
                  m.nome === 'Porta' ? 'Alumínio pintado de branco' :
                  m.nome === 'Ferragens' ? 'Com acabamento cromado' :
                  m.nome === 'Inst. Elétricas' ? 'Iluminação à prova d\'água' : m.tipo
          }))
      }
    ]
  }
];

export const getMaterialExamples = (materialId: string): string => {
  return materialExamples[materialId] || '';
};