# Dr. Paulo Advocacia - Gestão de Publicações & Prazos Judiciais

Sistema inteligente e completo para gestão de publicações oficiais, intimações, controle de prazos processuais e integração automatizada com WhatsApp e Google Workspace (Calendar / Sheets).

## 🚀 Funcionalidades Principais

- **Autenticação & Controle de Acesso:**
  - Login seguro e cadastro de membros da equipe.
  - Conexão direta com Google OAuth em 1 clique.
  - Recuperação e redefinição de senha de acesso.
  - Gestão de permissões de Administrador vs Membro.
- **Agenda & Calendário Jurídico:**
  - Visualização em tabela detalhada e calendário mensal interativo.
  - Classificação visual de prazos: *Urgente*, *Prazo Fatal*, *Normal* e *Informativo*.
  - Arrastar e soltar (drag & drop) para reagendamento ágil de prazos entre dias.
  - Filtros rápidos por número do processo, tribunal, partes e tags.
- **Central de Intimações & Leitura de E-mails:**
  - Visualização no padrão oficial de Certidão de Publicação Judicial (PDF).
  - Resumos executivos e ações práticas recomendadas pela IA.
  - Marcação de status de leitura e confirmação.
- **Métricas & Dashboard Jurídico:**
  - Indicadores em tempo real de publicações recebidas, prazos críticos e notificações.
  - Gráficos analíticos de distribuição por vara, tribunal e nível de urgência.
- **Automação N8N & WhatsApp:**
  - Fluxos em JSON inclusos para automação de mensagens e agendamentos via WhatsApp.

## 🛠️ Tecnologias Utilizadas

- **Frontend:** HTML5, CSS3 moderno (design responsivo, suporte a tema claro e escuro, glassmorphism), Vanilla JavaScript ES6+.
- **Gráficos:** Chart.js com temas dinâmicos e paletas customizadas.
- **Automação:** N8N Workflows (Google Sheets, Google Calendar e WhatsApp API).

## 📂 Estrutura de Arquivos

```
├── assets/                       # Ícones, favicons e recursos gráficos
├── css/
│   └── style.css                 # Estilos globais e componentes da aplicação
├── js/
│   ├── app.js                    # Controlador principal da aplicação e rotas
│   ├── charts.js                 # Configuração e renderização dos gráficos
│   └── data.js                   # Camada de persistência local (DataStore) e dados semente
├── index.html                    # Interface principal do sistema
├── Agendamento_de_mensagens.json # Workflow N8N para agendamento
├── Confirmacao_Whatsapp.json     # Workflow N8N para confirmação de prazos
└── README.md
```

## 💻 Como Executar

Basta abrir o arquivo `index.html` em qualquer navegador web moderno, ou servir através de uma extensão local (como Live Server no VS Code).
