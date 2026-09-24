/**
 * Dr. Paulo — Sistema de Acompanhamento de Publicações OAB
 * Módulo de Dados, Armazenamento e Configurações (Seed & Storage)
 */

const DEFAULT_USERS = [
  {
    id: "usr_admin",
    nome: "Administrador (Gestor)",
    email: "admin@drpaulo.adv.br",
    senha: "admin",
    papel: "admin", // admin ou membro
    status: "ativo",
    avatar: "AG",
    criadoEm: "2026-01-15T10:00:00Z",
    ultimoAcesso: "Hoje, às 09:30"
  },
  {
    id: "usr_paulo",
    nome: "Dr. Paulo",
    email: "paulo@drpaulo.adv.br",
    senha: "123",
    papel: "membro",
    status: "ativo",
    avatar: "DP",
    criadoEm: "2026-01-15T10:00:00Z",
    ultimoAcesso: "Hoje, às 08:45"
  }
];

const DEFAULT_CONFIG = {
  // Configuração global de aparência
  temaPadrao: "dark", // dark ou light
  corPrimariaGlobal: "#FF7A00", // Laranja característico Dr. Paulo
  
  // Cores de urgência padrão (global)
  coresUrgenciaGlobal: {
    urgente: "#EF4444",     // Vermelho
    prazo_fatal: "#F97316", // Laranja vivo
    normal: "#3B82F6",      // Azul
    informativo: "#10B981"  // Verde Esmeralda
  },

  // Configuração de dados
  tipoGraficoPadrao: "donut", // donut, bar, timeline
  planilhaId: "1aGbAYJeH0IrpPG05McjU13CPR93wRuZGypLwhXKsfTU",
  n8nWebhookUrl: "http://n8n-financas.duckdns.org/webhook/api/publicacoes"
};

const SEED_PUBLICACOES = [
  {
    id: "pub_1021533",
    documentoId: "SP-2026-881920",
    numeroProcesso: "1021533-58.2024.8.26.0001",
    tribunal: "TJSP",
    vara: "Foro Regional I - Santana - 3ª Vara da Família e Sucessões",
    comarca: "São Paulo/SP",
    tipoAto: "Decisão / Alvará",
    partes: "Espólio de C. S. (Requerente) x Interessados",
    dataDisponibilizacao: "23/09/2026",
    dataPublicacao: "24/09/2026",
    prazoDias: 30,
    dataLimite: "24/10/2026",
    nivelUrgencia: "urgente", // urgente, prazo_fatal, normal, informativo
    statusWhatsApp: "enviado", // enviado, pendente, erro
    statusLeitura: "lido",     // lido, nao_lido
    statusAprovacao: "aprovado", // aprovado, pendente, rejeitado
    resumo: "O juiz deferiu a expedição de alvará para venda do imóvel condicionado ao depósito judicial e determinou que a curadora preste contas em até 30 dias após a venda.",
    acaoNecessaria: "Providenciar alvará de venda, efetuar a venda e prestar contas em até 30 dias.",
    jornal: "Diário de Justiça Eletrônico do TJSP - Caderno Judicial",
    assuntoOriginal: "Recorte Digital OAB/SP - Intimação - 1021533-58.2024.8.26.0001",
    corpoOriginalEmail: `Tribunal de Justiça do Estado de São Paulo
Publicação: 1.
PROCESSO: 1021533-58.2024.8.26.0001
Vara: 3ª Vara da Família e Sucessões - Foro Regional I - Santana
Data de Disponibilização: 23/09/2026
Data de Publicação: 24/09/2026
Jornal: Diário da Justiça Eletrônico
Identificador do documento: SP-2026-881920
Tipo: Alvará Judicial - Lei 6858/80
Prazo: 30 dias

Teor do ato: Vistos. Defiro a expedição de alvará para a alienação do imóvel descrito às fls. 45/48, condicionando-se a lavratura da respectiva escritura pública à comprovação do depósito judicial da cota-parte cabente ao incapaz. Após a concretização da venda, deverá a curadora prestar as contas devidas no prazo impreterível de 30 (trinta) dias. Intime-se e cumpra-se.
- ADV: DR. PAULO BRANDÃO DE ARAUJO - OAB/SP 123.456`
  },
  {
    id: "pub_0045129",
    documentoId: "SP-2026-882041",
    numeroProcesso: "1004512-89.2025.8.26.0100",
    tribunal: "TJSP",
    vara: "14ª Vara Cível Central - Foro Central João Mendes Júnior",
    comarca: "São Paulo/SP",
    tipoAto: "Intimação / Prazo Fatal",
    partes: "Construtora Alfa Ltda x Roberto Mendes e Outros",
    dataDisponibilizacao: "22/09/2026",
    dataPublicacao: "23/09/2026",
    prazoDias: 15,
    dataLimite: "08/10/2026",
    nivelUrgencia: "prazo_fatal",
    statusWhatsApp: "enviado",
    statusLeitura: "lido",
    statusAprovacao: "aprovado",
    resumo: "Intimação para apresentação de Réplica à Contestação no prazo legal de 15 dias, sob pena de preclusão e julgamento antecipado da lide.",
    acaoNecessaria: "Elaborar e protocolar petição de Réplica rebatendo preliminares e documentos.",
    jornal: "Diário de Justiça Eletrônico",
    assuntoOriginal: "Recorte Digital OAB/SP - 1004512-89.2025.8.26.0100",
    corpoOriginalEmail: `Tribunal de Justiça do Estado de São Paulo
PROCESSO: 1004512-89.2025.8.26.0100
Vara: 14ª Vara Cível Central
Data de Publicação: 23/09/2026
Prazo: 15 dias

Teor: Manifeste-se o autor em réplica à contestação de fls. 112/140, no prazo de 15 (quinze) dias.
- ADV: DR. PAULO BRANDÃO DE ARAUJO - OAB/SP 123.456`
  },
  {
    id: "pub_1098234",
    documentoId: "SP-2026-882512",
    numeroProcesso: "1009823-14.2023.5.02.0042",
    tribunal: "TRT-2",
    vara: "42ª Vara do Trabalho de São Paulo",
    comarca: "São Paulo/SP",
    tipoAto: "Audiência de Instrução",
    partes: "Carlos Eduardo da Costa (Reclamante) x Logística Express S/A",
    dataDisponibilizacao: "24/09/2026",
    dataPublicacao: "25/09/2026",
    prazoDias: 5,
    dataLimite: "30/09/2026",
    nivelUrgencia: "urgente",
    statusWhatsApp: "enviado",
    statusLeitura: "nao_lido",
    statusAprovacao: "aprovado",
    resumo: "Designação de Audiência de Instrução e Julgamento telepresencial via Zoom para o dia 15/10/2026 às 14:30. Apresentar rol de testemunhas em 5 dias.",
    acaoNecessaria: "Contatar o cliente, confirmar testemunhas e juntar rol com endereços no prazo de 5 dias.",
    jornal: "DEJT - Diário Eletrônico da Justiça do Trabalho",
    assuntoOriginal: "Recorte Digital OAB/SP - Pauta de Audiência TRT2",
    corpoOriginalEmail: `Tribunal Regional do Trabalho da 2ª Região
PROCESSO: 1009823-14.2023.5.02.0042
Vara: 42ª Vara do Trabalho de São Paulo
Data de Publicação: 25/09/2026

Teor: Ficam as partes intimadas da redesignação da AUDIÊNCIA DE INSTRUÇÃO para 15/10/2026 às 14h30min, na modalidade telepresencial. Apresentação do rol de testemunhas no prazo preclusivo de 5 dias.`
  },
  {
    id: "pub_1054321",
    documentoId: "SP-2026-883011",
    numeroProcesso: "1054321-12.2024.8.26.0002",
    tribunal: "TJSP",
    vara: "2ª Vara Cível - Foro Regional de Santo Amaro",
    comarca: "São Paulo/SP",
    tipoAto: "Despacho / Manifestação",
    partes: "Banco S/A x Metalúrgica Progresso Eireli",
    dataDisponibilizacao: "24/09/2026",
    dataPublicacao: "25/09/2026",
    prazoDias: 5,
    dataLimite: "02/10/2026",
    nivelUrgencia: "normal",
    statusWhatsApp: "enviado",
    statusLeitura: "nao_lido",
    statusAprovacao: "pendente",
    resumo: "Juiz determinou manifestação do executado sobre a penhora online Sisbajud requerida pelo exequente.",
    acaoNecessaria: "Avaliar eventual impenhorabilidade ou proposta de acordo.",
    jornal: "Diário de Justiça Eletrônico",
    assuntoOriginal: "Recorte Digital OAB/SP - 1054321-12.2024.8.26.0002",
    corpoOriginalEmail: `PROCESSO: 1054321-12.2024.8.26.0002
Vara: 2ª Vara Cível de Santo Amaro
Manifeste-se o executado sobre o pedido de constrição patrimonial no prazo de 5 dias.`
  },
  {
    id: "pub_1087654",
    documentoId: "SP-2026-883144",
    numeroProcesso: "5002341-77.2025.4.03.6100",
    tribunal: "TRF-3",
    vara: "7ª Vara Cível Federal de São Paulo",
    comarca: "São Paulo/SP",
    tipoAto: "Sentença Favorável",
    partes: "M. A. da Silva x Instituto Nacional do Seguro Social - INSS",
    dataDisponibilizacao: "20/09/2026",
    dataPublicacao: "21/09/2026",
    prazoDias: null,
    dataLimite: "Sem prazo",
    nivelUrgencia: "informativo",
    statusWhatsApp: "enviado",
    statusLeitura: "lido",
    statusAprovacao: "aprovado",
    resumo: "Sentença procedente concedendo a revisão do benefício previdenciário com pagamento das parcelas pretéritas corrigidas.",
    acaoNecessaria: "Aguardar trânsito em julgado e preparar liquidação de sentença.",
    jornal: "Caderno Administrativo e Judicial TRF-3",
    assuntoOriginal: "Recorte Digital OAB/SP - Sentença Procedente",
    corpoOriginalEmail: `JUSTIÇA FEDERAL DA 3ª REGIÃO
PROCESSO: 5002341-77.2025.4.03.6100
Dispositivo: Posto isso, JULGO PROCEDENTE o pedido formulado na inicial para condenar o INSS a revisar o benefício da parte autora.`
  },
  {
    id: "pub_1099887",
    documentoId: "SP-2026-883590",
    numeroProcesso: "1099887-33.2026.8.26.0100",
    tribunal: "TJSP",
    vara: "35ª Vara Cível Central",
    comarca: "São Paulo/SP",
    tipoAto: "Intimação de Perícia",
    partes: "Condomínio Edifício Paulista x Seguradora Nacional",
    dataDisponibilizacao: "24/09/2026",
    dataPublicacao: "25/09/2026",
    prazoDias: 15,
    dataLimite: "10/10/2026",
    nivelUrgencia: "normal",
    statusWhatsApp: "pendente",
    statusLeitura: "nao_lido",
    statusAprovacao: "pendente",
    resumo: "O perito judicial agendou a vistoria técnica no imóvel para o dia 20/10/2026 às 10h. As partes têm 15 dias para indicar assistente técnico e formular quesitos complementares.",
    acaoNecessaria: "Providenciar quesitos da perícia e indicar assistente técnico de engenharia.",
    jornal: "Diário de Justiça Eletrônico",
    assuntoOriginal: "Recorte Digital OAB/SP - Agendamento Pericial",
    corpoOriginalEmail: `PROCESSO: 1099887-33.2026.8.26.0100
Vara: 35ª Vara Cível Central
Ficam as partes intimadas da data da perícia e para indicação de assistente técnico em 15 dias.`
  }
];

class DataStore {
  constructor() {
    this.STORAGE_KEYS = {
      USERS: "dr_paulo_users",
      CURRENT_USER: "dr_paulo_session",
      CONFIG: "dr_paulo_config",
      PUBLICACOES: "dr_paulo_publicacoes",
      USER_PREFERENCES: "dr_paulo_user_prefs_"
    };
    this.init();
  }

  init() {
    if (!localStorage.getItem(this.STORAGE_KEYS.USERS)) {
      localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
    }
    if (!localStorage.getItem(this.STORAGE_KEYS.CONFIG)) {
      localStorage.setItem(this.STORAGE_KEYS.CONFIG, JSON.stringify(DEFAULT_CONFIG));
    }
    if (!localStorage.getItem(this.STORAGE_KEYS.PUBLICACOES)) {
      localStorage.setItem(this.STORAGE_KEYS.PUBLICACOES, JSON.stringify(SEED_PUBLICACOES));
    }
  }

  // --- Usuários & Sessão ---
  getUsers() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.USERS)) || DEFAULT_USERS;
    } catch {
      return DEFAULT_USERS;
    }
  }

  saveUsers(users) {
    localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  addUser(userData) {
    const users = this.getUsers();
    if (users.find(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
      throw new Error("Já existe um usuário cadastrado com este e-mail.");
    }
    const newUser = {
      id: "usr_" + Date.now(),
      nome: userData.nome.trim(),
      email: userData.email.toLowerCase().trim(),
      senha: userData.senha || "123456",
      papel: userData.papel || "membro", // admin ou membro
      status: "ativo",
      avatar: userData.nome.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase(),
      criadoEm: new Date().toISOString(),
      ultimoAcesso: "Nunca"
    };
    users.push(newUser);
    this.saveUsers(users);
    return newUser;
  }

  updateUserRole(userId, newRole) {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      users[idx].papel = newRole;
      this.saveUsers(users);
      return users[idx];
    }
    return null;
  }

  deleteUser(userId) {
    let users = this.getUsers();
    const current = this.getCurrentUser();
    if (current && current.id === userId) {
      throw new Error("Você não pode excluir sua própria conta conectada.");
    }
    users = users.filter(u => u.id !== userId);
    this.saveUsers(users);
  }

  getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.CURRENT_USER));
    } catch {
      return null;
    }
  }

  setCurrentUser(user) {
    if (user) {
      localStorage.setItem(this.STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(this.STORAGE_KEYS.CURRENT_USER);
    }
  }

  login(email, senha) {
    const users = this.getUsers();
    const cleanEmail = email.toLowerCase().trim();
    const user = users.find(u => u.email.toLowerCase() === cleanEmail && u.senha === senha);
    if (!user) {
      throw new Error("E-mail ou senha incorretos.");
    }
    user.ultimoAcesso = "Agora mesmo";
    this.saveUsers(users);
    this.setCurrentUser(user);
    return user;
  }

  loginWithGoogle(googleUser) {
    let users = this.getUsers();
    const cleanEmail = googleUser.email.toLowerCase().trim();
    let user = users.find(u => u.email.toLowerCase() === cleanEmail || (u.googleEmail && u.googleEmail.toLowerCase() === cleanEmail));
    if (!user) {
      // Cria nova conta associada ao Google (papel padrão: membro)
      const nome = (googleUser.nome || "Usuário Google").trim();
      user = {
        id: "usr_" + Date.now().toString(36),
        nome: nome,
        email: cleanEmail,
        senha: "google_oauth_verified",
        papel: "membro", // Segurança: contas criadas via Google entram como membros
        status: "ativo",
        avatar: googleUser.avatar || nome.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase(),
        criadoEm: new Date().toISOString(),
        ultimoAcesso: "Agora mesmo",
        provider: "google",
        googleEmail: cleanEmail
      };
      users.push(user);
    } else {
      user.ultimoAcesso = "Agora mesmo";
      user.provider = "google";
      user.googleEmail = cleanEmail;
      if (googleUser.nome && (!user.nome || user.nome === "Usuário Google")) {
        user.nome = googleUser.nome;
      }
    }
    this.saveUsers(users);
    this.setCurrentUser(user);
    return user;
  }

  updateUserPassword(email, newPassword) {
    const users = this.getUsers();
    const cleanEmail = email.toLowerCase().trim();
    const user = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      throw new Error("Nenhum usuário encontrado com este e-mail.");
    }
    user.senha = newPassword;
    user.ultimoAcesso = "Agora mesmo";
    this.saveUsers(users);
    this.setCurrentUser(user);
    return user;
  }

  logout() {
    this.setCurrentUser(null);
  }

  // --- Configurações & Preferências Pessoais vs Globais ---
  getConfig() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.CONFIG)) || DEFAULT_CONFIG;
    } catch {
      return DEFAULT_CONFIG;
    }
  }

  saveGlobalConfig(newConfig) {
    const config = { ...this.getConfig(), ...newConfig };
    localStorage.setItem(this.STORAGE_KEYS.CONFIG, JSON.stringify(config));
    return config;
  }

  getUserPreferences(userId) {
    if (!userId) return {};
    try {
      const saved = localStorage.getItem(this.STORAGE_KEYS.USER_PREFERENCES + userId);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  }

  saveUserPreferences(userId, prefs) {
    if (!userId) return;
    const current = this.getUserPreferences(userId);
    const updated = { ...current, ...prefs };
    localStorage.setItem(this.STORAGE_KEYS.USER_PREFERENCES + userId, JSON.stringify(updated));
    return updated;
  }

  resetToDefaults(userId) {
    if (userId) {
      localStorage.removeItem(this.STORAGE_KEYS.USER_PREFERENCES + userId);
    }
    localStorage.setItem(this.STORAGE_KEYS.CONFIG, JSON.stringify(DEFAULT_CONFIG));
    return DEFAULT_CONFIG;
  }

  // Retorna os valores efetivos (Preferência pessoal do usuário com fallback para o padrão global)
  getEffectiveSettings() {
    const user = this.getCurrentUser();
    const globalConfig = this.getConfig();
    const userPrefs = user ? this.getUserPreferences(user.id) : {};

    return {
      tema: userPrefs.tema || globalConfig.temaPadrao || "dark",
      corPrimaria: userPrefs.corPrimaria || globalConfig.corPrimariaGlobal || "#FF7A00",
      tipoGrafico: userPrefs.tipoGrafico || globalConfig.tipoGraficoPadrao || "donut",
      coresUrgencia: {
        ...globalConfig.coresUrgenciaGlobal,
        ...(userPrefs.coresUrgencia || {})
      },
      planilhaId: globalConfig.planilhaId,
      n8nWebhookUrl: globalConfig.n8nWebhookUrl
    };
  }

  // --- Publicações / Dados Jurídicos ---
  getPublicacoes() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.PUBLICACOES)) || SEED_PUBLICACOES;
    } catch {
      return SEED_PUBLICACOES;
    }
  }

  savePublicacoes(publicacoes) {
    localStorage.setItem(this.STORAGE_KEYS.PUBLICACOES, JSON.stringify(publicacoes));
  }

  updatePublicacaoStatus(pubId, { statusLeitura, statusAprovacao }) {
    const pubs = this.getPublicacoes();
    const idx = pubs.findIndex(p => p.id === pubId);
    if (idx !== -1) {
      if (statusLeitura !== undefined) pubs[idx].statusLeitura = statusLeitura;
      if (statusAprovacao !== undefined) pubs[idx].statusAprovacao = statusAprovacao;
      this.savePublicacoes(pubs);
      return pubs[idx];
    }
    return null;
  }

  updatePublicacao(pubId, updates) {
    const pubs = this.getPublicacoes();
    const idx = pubs.findIndex(p => p.id === pubId);
    if (idx !== -1) {
      pubs[idx] = { ...pubs[idx], ...updates };
      this.savePublicacoes(pubs);
      return pubs[idx];
    }
    return null;
  }

  // Métricas para o Dashboard
  getMetrics() {
    const pubs = this.getPublicacoes();
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const urgentes = pubs.filter(p => p.nivelUrgencia === "urgente" || p.nivelUrgencia === "prazo_fatal").length;
    const pendentesWhatsApp = pubs.filter(p => p.statusWhatsApp === "pendente").length;
    const naoLidos = pubs.filter(p => p.statusLeitura === "nao_lido").length;
    
    // Contagem por tipo de ato
    const porTipo = {};
    pubs.forEach(p => {
      const tipo = p.tipoAto || "Outros";
      porTipo[tipo] = (porTipo[tipo] || 0) + 1;
    });

    // Contagem por nível de urgência
    const porUrgencia = {
      urgente: pubs.filter(p => p.nivelUrgencia === "urgente").length,
      prazo_fatal: pubs.filter(p => p.nivelUrgencia === "prazo_fatal").length,
      normal: pubs.filter(p => p.nivelUrgencia === "normal").length,
      informativo: pubs.filter(p => p.nivelUrgencia === "informativo").length
    };

    return {
      total: pubs.length,
      urgentes,
      pendentesWhatsApp,
      naoLidos,
      porTipo,
      porUrgencia
    };
  }
}

// Instância global disponível na aplicação
window.dataStore = new DataStore();
