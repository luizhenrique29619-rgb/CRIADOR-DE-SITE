/* =========================================================
   DADOS DE EXEMPLO — Ecossistema Comercial (Record)
   ---------------------------------------------------------
   Usados quando o Supabase ainda não está configurado, só para
   o sistema funcionar como protótipo. Os nomes de empresas são
   FICTÍCIOS. Quando ligar o Supabase, estes dados são ignorados.
   ========================================================= */

window.DADOS = {

  /* ---- Clientes / Anunciantes ---- */
  clientes: [
    { id: 1, nome: 'Supermercados Boa Praça', segmento: 'Varejo',        contato: 'Marina Alves',   telefone: '(82) 99999-1001', status: 'Ativo',       responsavel: 'Carla Mendes',   valor_mes: 48000 },
    { id: 2, nome: 'Construtora Horizonte',    segmento: 'Construção',    contato: 'Rafael Nunes',   telefone: '(82) 99999-1002', status: 'Ativo',       responsavel: 'Diego Rocha',    valor_mes: 72000 },
    { id: 3, nome: 'Faculdade União',          segmento: 'Educação',      contato: 'Prof. Helena',   telefone: '(82) 99999-1003', status: 'Negociação',  responsavel: 'Carla Mendes',   valor_mes: 25000 },
    { id: 4, nome: 'Rede Farma Saúde',         segmento: 'Farmácia',      contato: 'João Batista',   telefone: '(82) 99999-1004', status: 'Ativo',       responsavel: 'Bruno Lima',     valor_mes: 56000 },
    { id: 5, nome: 'Auto Peças Veloz',         segmento: 'Automotivo',    contato: 'Sérgio Dias',    telefone: '(82) 99999-1005', status: 'Lead',        responsavel: 'Diego Rocha',    valor_mes: 0 },
    { id: 6, nome: 'Restaurante Sabor do Mar', segmento: 'Alimentação',   contato: 'Patrícia Melo',  telefone: '(82) 99999-1006', status: 'Inativo',     responsavel: 'Bruno Lima',     valor_mes: 0 },
    { id: 7, nome: 'Banco Regional Nordeste',  segmento: 'Financeiro',    contato: 'Antônio Freire', telefone: '(82) 99999-1007', status: 'Ativo',       responsavel: 'Carla Mendes',   valor_mes: 120000 },
    { id: 8, nome: 'Shopping Costa Verde',     segmento: 'Varejo',        contato: 'Luísa Campos',   telefone: '(82) 99999-1008', status: 'Negociação',  responsavel: 'Bruno Lima',     valor_mes: 64000 },
    { id: 9, nome: 'Clínica Vida Plena',       segmento: 'Saúde',         contato: 'Dr. Marcos',     telefone: '(82) 99999-1009', status: 'Lead',        responsavel: 'Diego Rocha',    valor_mes: 0 },
    { id: 10, nome: 'Distribuidora Atlântico', segmento: 'Atacado',       contato: 'Fernanda Sá',    telefone: '(82) 99999-1010', status: 'Ativo',       responsavel: 'Carla Mendes',   valor_mes: 38000 },
  ],

  /* ---- Oportunidades (funil de vendas) ---- */
  oportunidades: [
    { id: 1, cliente: 'Auto Peças Veloz',       valor: 32000,  estagio: 'Prospecção',  vendedor: 'Diego Rocha',  probabilidade: 20, fechamento: '2026-11-15' },
    { id: 2, cliente: 'Clínica Vida Plena',     valor: 28000,  estagio: 'Prospecção',  vendedor: 'Diego Rocha',  probabilidade: 20, fechamento: '2026-11-20' },
    { id: 3, cliente: 'Faculdade União',        valor: 45000,  estagio: 'Qualificação',vendedor: 'Carla Mendes', probabilidade: 40, fechamento: '2026-10-28' },
    { id: 4, cliente: 'Academia Corpo & Ação',  valor: 18000,  estagio: 'Qualificação',vendedor: 'Bruno Lima',   probabilidade: 40, fechamento: '2026-11-05' },
    { id: 5, cliente: 'Shopping Costa Verde',   valor: 96000,  estagio: 'Proposta',    vendedor: 'Bruno Lima',   probabilidade: 65, fechamento: '2026-10-18' },
    { id: 6, cliente: 'Imobiliária Premium',    valor: 54000,  estagio: 'Proposta',    vendedor: 'Carla Mendes', probabilidade: 60, fechamento: '2026-10-22' },
    { id: 7, cliente: 'Banco Regional Nordeste',valor: 240000, estagio: 'Negociação',  vendedor: 'Carla Mendes', probabilidade: 80, fechamento: '2026-10-12' },
    { id: 8, cliente: 'Rede Farma Saúde',       valor: 112000, estagio: 'Negociação',  vendedor: 'Bruno Lima',   probabilidade: 75, fechamento: '2026-10-15' },
    { id: 9, cliente: 'Construtora Horizonte',  valor: 144000, estagio: 'Fechado',     vendedor: 'Diego Rocha',  probabilidade: 100, fechamento: '2026-10-01' },
    { id: 10, cliente: 'Supermercados Boa Praça',valor: 96000, estagio: 'Fechado',     vendedor: 'Carla Mendes', probabilidade: 100, fechamento: '2026-09-28' },
  ],

  /* ---- Propostas ---- */
  propostas: [
    { id: 1, numero: 'PROP-2026-041', cliente: 'Banco Regional Nordeste', valor: 240000, status: 'Em negociação', vendedor: 'Carla Mendes', data: '2026-10-01', validade: '2026-10-31' },
    { id: 2, numero: 'PROP-2026-040', cliente: 'Shopping Costa Verde',    valor: 96000,  status: 'Enviada',       vendedor: 'Bruno Lima',   data: '2026-09-30', validade: '2026-10-30' },
    { id: 3, numero: 'PROP-2026-039', cliente: 'Rede Farma Saúde',        valor: 112000, status: 'Em negociação', vendedor: 'Bruno Lima',   data: '2026-09-28', validade: '2026-10-28' },
    { id: 4, numero: 'PROP-2026-038', cliente: 'Construtora Horizonte',   valor: 144000, status: 'Aprovada',      vendedor: 'Diego Rocha',  data: '2026-09-20', validade: '2026-10-20' },
    { id: 5, numero: 'PROP-2026-037', cliente: 'Imobiliária Premium',     valor: 54000,  status: 'Enviada',       vendedor: 'Carla Mendes', data: '2026-09-25', validade: '2026-10-25' },
    { id: 6, numero: 'PROP-2026-036', cliente: 'Faculdade União',         valor: 45000,  status: 'Rascunho',      vendedor: 'Carla Mendes', data: '2026-10-02', validade: '2026-11-01' },
    { id: 7, numero: 'PROP-2026-035', cliente: 'Auto Peças Veloz',        valor: 32000,  status: 'Recusada',      vendedor: 'Diego Rocha',  data: '2026-09-10', validade: '2026-10-10' },
  ],

  /* ---- Catálogo de produtos de mídia ---- */
  produtos: [
    { id: 1, nome: 'Spot 30" — Jornal da Record', tipo: 'Spot',          faixa: 'Prime time',  preco: 4500, descricao: 'Inserção de 30 segundos no principal telejornal da casa.' },
    { id: 2, nome: 'Spot 15" — Programação diurna',tipo: 'Spot',          faixa: 'Diurno',      preco: 1800, descricao: 'Inserção de 15 segundos na faixa da tarde.' },
    { id: 3, nome: 'Patrocínio — Quadro Esportivo',tipo: 'Patrocínio',    faixa: 'Prime time',  preco: 22000,descricao: 'Patrocínio mensal com citação e vinheta de abertura.' },
    { id: 4, nome: 'Merchandising ao vivo',        tipo: 'Merchandising', faixa: 'Variável',    preco: 8500, descricao: 'Ação ao vivo de até 2 minutos dentro do programa.' },
    { id: 5, nome: 'Pacote Prime Time (mensal)',   tipo: 'Pacote',        faixa: 'Prime time',  preco: 60000,descricao: '20 inserções/mês na faixa nobre, com desconto de volume.' },
    { id: 6, nome: 'Testeira / Selo de patrocínio',tipo: 'Patrocínio',    faixa: 'Variável',    preco: 12000,descricao: 'Selo de patrocinador exibido durante o bloco.' },
    { id: 7, nome: 'Pacote Digital + TV',          tipo: 'Pacote',        faixa: 'Multiplataforma', preco: 35000, descricao: 'Combinação de inserções na TV com mídia no portal e redes.' },
    { id: 8, nome: 'Ação especial de datas',       tipo: 'Projeto',       faixa: 'Sazonal',     preco: 45000,descricao: 'Projeto comercial para datas comemorativas (Natal, Dia das Mães).' },
  ],

  /* ---- Equipe de vendas (metas) ---- */
  vendedores: [
    { id: 1, nome: 'Carla Mendes', cargo: 'Executiva Sênior', meta: 300000, realizado: 288000, negocios: 14 },
    { id: 2, nome: 'Bruno Lima',   cargo: 'Executivo Pleno',  meta: 250000, realizado: 214000, negocios: 11 },
    { id: 3, nome: 'Diego Rocha',  cargo: 'Executivo Pleno',  meta: 250000, realizado: 176000, negocios: 9 },
    { id: 4, nome: 'Letícia Souza',cargo: 'Executiva Júnior', meta: 150000, realizado: 132000, negocios: 8 },
  ],

  /* ---- Agenda comercial ---- */
  compromissos: [
    { id: 1, titulo: 'Reunião — Banco Regional Nordeste', tipo: 'Reunião',    data: '2026-10-03', hora: '10:00', responsavel: 'Carla Mendes' },
    { id: 2, titulo: 'Apresentação de proposta — Shopping Costa Verde', tipo: 'Apresentação', data: '2026-10-03', hora: '15:00', responsavel: 'Bruno Lima' },
    { id: 3, titulo: 'Fechamento — Construtora Horizonte', tipo: 'Fechamento', data: '2026-10-06', hora: '09:30', responsavel: 'Diego Rocha' },
    { id: 4, titulo: 'Prospecção — Clínica Vida Plena',    tipo: 'Prospecção', data: '2026-10-07', hora: '14:00', responsavel: 'Diego Rocha' },
    { id: 5, titulo: 'Planejamento campanha de Natal',     tipo: 'Interno',    data: '2026-10-09', hora: '11:00', responsavel: 'Equipe' },
    { id: 6, titulo: 'Follow-up — Faculdade União',        tipo: 'Follow-up',  data: '2026-10-10', hora: '16:00', responsavel: 'Carla Mendes' },
  ],

  /* ---- Vendas mensais (para o gráfico do dashboard) ---- */
  vendas_mensais: [
    { mes: 'Mai', valor: 540000 },
    { mes: 'Jun', valor: 610000 },
    { mes: 'Jul', valor: 580000 },
    { mes: 'Ago', valor: 690000 },
    { mes: 'Set', valor: 720000 },
    { mes: 'Out', valor: 810000 },
  ],

  /* ---- Indicadores de mercado (inteligência) ---- */
  indicadores: [
    { nome: 'IPCA (mês)',            valor: '0,44%',    variacao: 'alta',  obs: 'Inflação acima do mês anterior.' },
    { nome: 'IPCA (12 meses)',       valor: '4,2%',     variacao: 'estavel',obs: 'Dentro da meta do Banco Central.' },
    { nome: 'PIB Nordeste (ano)',    valor: '+2,8%',    variacao: 'alta',  obs: 'Crescimento acima da média nacional.' },
    { nome: 'Confiança do consumidor',valor: '98,5 pts', variacao: 'alta',  obs: 'Tendência de recuperação do varejo.' },
    { nome: 'Investimento pub. TV',  valor: '+6,1%',    variacao: 'alta',  obs: 'Mídia televisiva segue em alta na região.' },
  ],
};
