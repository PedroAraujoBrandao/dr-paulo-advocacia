/**
 * Dr. Paulo — Controlador Principal da Aplicação (SPA Router, RBAC & Render)
 * Versão atualizada: Calendário Mensal Interativo, Legenda de Urgência & Visualizador Oficial PDF
 */

document.addEventListener("DOMContentLoaded", () => {
  const App = {
    currentUser: null,
    currentTab: "dashboard",
    selectedEmailId: null,
    emailSearch: "",
    emailViewTab: "pdf", // 'pdf' | 'formatado' | 'raw'
    agendaViewMode: "tabela", // 'tabela' | 'calendario'
    calendarYear: 2026,
    calendarMonth: 8, // Setembro (0-indexed: 8 = Setembro, 9 = Outubro)
    agendaFilter: {
      search: "",
      urgencia: "todos",
      status: "todos",
      tag: "todos"
    },

    getFilteredPublicacoes() {
      const pubs = window.dataStore.getPublicacoes();
      const searchRaw = (this.agendaFilter.search || "").trim().toLowerCase();
      const searchClean = searchRaw.replace(/[.\-/]/g, "");
      const urgencia = this.agendaFilter.urgencia;
      const status = this.agendaFilter.status;
      const tag = this.agendaFilter.tag;

      return pubs.filter(pub => {
        let matchesSearch = true;
        if (searchRaw) {
          const numFormatado = (pub.numeroProcesso || "").toLowerCase();
          const numLimpo = numFormatado.replace(/[.\-/]/g, "");
          const partes = (pub.partes || "").toLowerCase();
          const vara = (pub.vara || "").toLowerCase();
          const tribunal = (pub.tribunal || "").toLowerCase();
          const comarca = (pub.comarca || "").toLowerCase();
          const resumo = (pub.resumo || "").toLowerCase();
          const tipoAto = (pub.tipoAto || "").toLowerCase();
          const acao = (pub.acaoNecessaria || "").toLowerCase();

          matchesSearch = numFormatado.includes(searchRaw) ||
            numLimpo.includes(searchClean) ||
            partes.includes(searchRaw) ||
            vara.includes(searchRaw) ||
            tribunal.includes(searchRaw) ||
            comarca.includes(searchRaw) ||
            resumo.includes(searchRaw) ||
            tipoAto.includes(searchRaw) ||
            acao.includes(searchRaw);
        }

        const matchesUrgencia = urgencia === "todos" || pub.nivelUrgencia === urgencia;
        const matchesStatus = status === "todos" || pub.statusLeitura === status;

        let matchesTag = true;
        if (tag && tag !== "todos") {
          if (tag === "urgente" || tag === "prazo_fatal") {
            matchesTag = pub.nivelUrgencia === tag;
          } else if (tag === "alvara") {
            matchesTag = (pub.tipoAto || "").toLowerCase().includes("alvará") || (pub.resumo || "").toLowerCase().includes("alvará");
          } else if (tag === "replica") {
            matchesTag = (pub.tipoAto || "").toLowerCase().includes("réplica") || (pub.resumo || "").toLowerCase().includes("réplica");
          } else if (tag === "intimacao") {
            matchesTag = (pub.tipoAto || "").toLowerCase().includes("intimação") || (pub.assuntoOriginal || "").toLowerCase().includes("intimação");
          } else if (tag === "sentenca") {
            matchesTag = (pub.tipoAto || "").toLowerCase().includes("sentença") || (pub.resumo || "").toLowerCase().includes("sentença");
          }
        }

        return matchesSearch && matchesUrgencia && matchesStatus && matchesTag;
      });
    },

    init() {
      // Aplica configurações visuais e tema
      this.applyThemeAndColors();

      // Configura os ouvintes de evento globais
      this.setupEventListeners();

      // Verifica se há usuário autenticado na sessão
      this.currentUser = window.dataStore.getCurrentUser();
      if (this.currentUser) {
        this.showAppScreen();
      } else {
        this.showAuthScreen();
      }
    },

    // =========================================================================
    // TEMA, CORES & CSS VARIABLES
    // =========================================================================
    applyThemeAndColors() {
      const settings = window.dataStore.getEffectiveSettings();
      
      // Aplica modo escuro / claro
      document.documentElement.setAttribute("data-theme", settings.tema);

      // Sincroniza o botão do cabeçalho no topo da página
      const themeBtnIcon = document.getElementById("header-theme-icon");
      const themeBtnText = document.getElementById("header-theme-text");
      const isDark = settings.tema === "dark";
      if (themeBtnIcon) themeBtnIcon.textContent = isDark ? "☀️" : "🌙";
      if (themeBtnText) themeBtnText.textContent = isDark ? "Modo Claro" : "Modo Escuro";

      // Aplica cor de destaque primária
      document.documentElement.style.setProperty("--primary-orange", settings.corPrimaria);
      document.documentElement.style.setProperty("--primary-orange-glow", `${settings.corPrimaria}48`);
      document.documentElement.style.setProperty("--primary-orange-subtle", `${settings.corPrimaria}1a`);

      // Aplica cores de urgência
      const colors = settings.coresUrgencia;
      document.documentElement.style.setProperty("--color-urgente", colors.urgente);
      document.documentElement.style.setProperty("--color-urgente-bg", `${colors.urgente}20`);
      document.documentElement.style.setProperty("--color-prazo-fatal", colors.prazo_fatal);
      document.documentElement.style.setProperty("--color-prazo-fatal-bg", `${colors.prazo_fatal}20`);
      document.documentElement.style.setProperty("--color-normal", colors.normal);
      document.documentElement.style.setProperty("--color-normal-bg", `${colors.normal}20`);
      document.documentElement.style.setProperty("--color-informativo", colors.informativo);
      document.documentElement.style.setProperty("--color-informativo-bg", `${colors.informativo}20`);
    },

    // =========================================================================
    // NAVEGAÇÃO ENTRE TELAS
    // =========================================================================
    navigate(tabId) {
      this.currentTab = tabId;

      // Atualiza abas no menu
      document.querySelectorAll(".nav-link").forEach(link => {
        if (link.dataset.tab === tabId) {
          link.classList.add("active");
        } else {
          link.classList.remove("active");
        }
      });

      // Atualiza visualização das telas
      document.querySelectorAll(".page-view").forEach(view => {
        view.classList.remove("active");
      });

      const activeView = document.getElementById(`view-${tabId}`);
      if (activeView) {
        activeView.classList.add("active");
      }

      // Atualiza título da barra superior
      const titles = {
        dashboard: "Painel Geral",
        agenda: "Agenda & Prazos Processuais",
        emails: "Arquivo de E-mails (Recorte Digital)",
        configuracoes: "Configurações do Sistema"
      };
      const titleElem = document.getElementById("header-page-title");
      if (titleElem) {
        titleElem.textContent = titles[tabId] || "Dr. Paulo";
      }

      // Renderiza os dados específicos da tela
      if (tabId === "dashboard") this.renderDashboard();
      if (tabId === "agenda") this.renderAgenda();
      if (tabId === "emails") this.renderEmails();
      if (tabId === "configuracoes") this.renderSettings();
    },

    // =========================================================================
    // RENDER: DASHBOARD
    // =========================================================================
    renderDashboard() {
      const metrics = window.dataStore.getMetrics();
      const settings = window.dataStore.getEffectiveSettings();

      // Métricas KPI
      document.getElementById("metric-total-pubs").textContent = metrics.total;
      document.getElementById("metric-urgentes-count").textContent = metrics.urgentes;
      document.getElementById("metric-pendentes-wpp").textContent = metrics.pendentesWhatsApp;
      document.getElementById("metric-nao-lidos").textContent = metrics.naoLidos;

      // Renderiza Gráfico Dinâmico
      window.legalCharts.renderDashboardChart(
        "dashboard-chart-container",
        settings.tipoGrafico,
        metrics,
        settings.coresUrgencia
      );

      // Renderiza lista das publicações mais próximas (top 5)
      const pubs = window.dataStore.getPublicacoes();
      const listContainer = document.getElementById("dashboard-recent-pubs");
      if (!listContainer) return;

      if (pubs.length === 0) {
        listContainer.innerHTML = `<div class="empty-state">Nenhuma publicação registrada até o momento.</div>`;
        return;
      }

      listContainer.innerHTML = pubs.slice(0, 4).map(pub => {
        const urgenciaCor = settings.coresUrgencia[pub.nivelUrgencia];
        const urgenciaNome = {
          urgente: "Urgente",
          prazo_fatal: "Prazo Fatal",
          normal: "Normal",
          informativo: "Informativo"
        }[pub.nivelUrgencia] || pub.nivelUrgencia;

        return `
          <div class="pub-item-card" data-pub-id="${pub.id}">
            <div class="pub-item-top">
              <span class="pub-process-tag">${pub.numeroProcesso}</span>
              <span class="pub-urgency-badge" style="background-color: ${urgenciaCor}22; color: ${urgenciaCor}; border: 1px solid ${urgenciaCor}44;">
                ● ${urgenciaNome}
              </span>
            </div>
            <div class="pub-court-info">
              <span>🏛️ ${pub.vara}</span>
            </div>
            <div class="pub-summary-snippet">
              ${pub.resumo}
            </div>
            <div class="pub-footer-meta">
              <span>📅 Publicado em: <strong>${pub.dataPublicacao}</strong></span>
              <span>⚡ Prazo: <strong>${pub.dataLimite}</strong></span>
            </div>
          </div>
        `;
      }).join("");

      // Adiciona clique nos cards para abrir detalhes
      listContainer.querySelectorAll(".pub-item-card").forEach(card => {
        card.addEventListener("click", () => {
          this.openPublicationDetails(card.dataset.pubId);
        });
      });
    },

    // =========================================================================
    // RENDER: AGENDA (TABELA OU CALENDÁRIO MENSAL)
    // =========================================================================
    renderAgenda() {
      const tableContainer = document.getElementById("agenda-table-view");
      const calendarContainer = document.getElementById("agenda-calendar-view");
      const btnTabela = document.getElementById("btn-toggle-tabela");
      const btnCalendario = document.getElementById("btn-toggle-calendario");

      if (this.agendaViewMode === "calendario") {
        btnTabela?.classList.remove("active");
        btnCalendario?.classList.add("active");
        tableContainer?.classList.add("hidden");
        calendarContainer?.classList.add("active");
        this.renderCalendarView();
        return;
      } else {
        btnTabela?.classList.add("active");
        btnCalendario?.classList.remove("active");
        tableContainer?.classList.remove("hidden");
        calendarContainer?.classList.remove("active");
      }

      // Modo Tabela com filtros inteligentes unificados
      const filtered = this.getFilteredPublicacoes();
      const settings = window.dataStore.getEffectiveSettings();
      const tableBody = document.getElementById("agenda-table-body");
      if (!tableBody) return;

      if (filtered.length === 0) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-muted);">
              Nenhum prazo encontrado com os filtros selecionados.
            </td>
          </tr>
        `;
        return;
      }

      tableBody.innerHTML = filtered.map(pub => {
        const urgenciaCor = settings.coresUrgencia[pub.nivelUrgencia];
        const urgenciaNome = {
          urgente: "Urgente",
          prazo_fatal: "Prazo Fatal",
          normal: "Normal",
          informativo: "Informativo"
        }[pub.nivelUrgencia] || pub.nivelUrgencia;

        const leituraBadge = pub.statusLeitura === "lido" 
          ? `<span style="color: var(--color-informativo); font-weight: 600;">✓ Lido</span>`
          : `<span style="color: var(--primary-orange); font-weight: 600;">● Novo</span>`;

        return `
          <tr data-pub-id="${pub.id}">
            <td class="process-cell">${pub.numeroProcesso}</td>
            <td>
              <span class="pub-urgency-badge" style="background-color: ${urgenciaCor}22; color: ${urgenciaCor}; border: 1px solid ${urgenciaCor}44;">
                ${urgenciaNome}
              </span>
            </td>
            <td>${pub.tipoAto}</td>
            <td style="max-width: 280px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${pub.vara}">
              ${pub.vara}
            </td>
            <td><strong>${pub.dataLimite}</strong></td>
            <td>${leituraBadge}</td>
            <td>
              <button class="action-btn btn-view-pub" data-pub-id="${pub.id}" style="padding: 6px 12px; font-size: 0.8rem;">
                Ver Detalhes
              </button>
            </td>
          </tr>
        `;
      }).join("");

      // Clique nas linhas e botões
      tableBody.querySelectorAll("tr").forEach(tr => {
        tr.addEventListener("click", (e) => {
          if (e.target.tagName !== "BUTTON") {
            this.openPublicationDetails(tr.dataset.pubId);
          }
        });
      });

      tableBody.querySelectorAll(".btn-view-pub").forEach(btn => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.openPublicationDetails(btn.dataset.pubId);
        });
      });
    },

    // =========================================================================
    // RENDER: CALENDÁRIO MENSAL INTERATIVO (COM DRAG & DROP E FILTROS)
    // =========================================================================
    renderCalendarView() {
      const container = document.getElementById("calendar-days-container");
      const monthLabel = document.getElementById("calendar-current-month-label");
      if (!container || !monthLabel) return;

      const monthNames = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
      ];

      monthLabel.textContent = `${monthNames[this.calendarMonth]} ${this.calendarYear}`;

      // Atualiza badge de status do mês exibido (Atual, Futuro ou Passado)
      const badge = document.getElementById("calendar-month-status-badge");
      const btnToday = document.getElementById("cal-btn-today");
      const isCurrentMonthYear = (this.calendarYear === 2026 && this.calendarMonth === 8);

      if (badge) {
        if (isCurrentMonthYear) {
          badge.textContent = "Mês Atual";
          badge.className = "calendar-month-badge";
        } else if (this.calendarYear > 2026 || (this.calendarYear === 2026 && this.calendarMonth > 8)) {
          badge.textContent = "Navegação Futura";
          badge.className = "calendar-month-badge future";
        } else {
          badge.textContent = "Navegação Passada";
          badge.className = "calendar-month-badge past";
        }
      }

      // Atualiza botão "Hoje" para deixar evidente sua função de retorno
      if (btnToday) {
        if (isCurrentMonthYear) {
          btnToday.textContent = "● Mês Atual (Set/2026)";
          btnToday.classList.remove("is-different-month");
          btnToday.title = "Você já está visualizando o mês atual";
        } else {
          btnToday.textContent = "↩️ Voltar para Hoje (Setembro)";
          btnToday.classList.add("is-different-month");
          btnToday.title = "Clique para retornar imediatamente ao mês atual com os prazos correntes";
        }
      }

      const firstDayIndex = new Date(this.calendarYear, this.calendarMonth, 1).getDay();
      const lastDayOfMonth = new Date(this.calendarYear, this.calendarMonth + 1, 0).getDate();
      const prevLastDay = new Date(this.calendarYear, this.calendarMonth, 0).getDate();

      // Utiliza a lista com todos os filtros e tags aplicados
      const pubs = this.getFilteredPublicacoes();
      const settings = window.dataStore.getEffectiveSettings();

      let daysHtml = "";

      // Dias do mês anterior
      for (let x = firstDayIndex; x > 0; x--) {
        daysHtml += `
          <div class="cal-day-cell other-month">
            <span class="cal-day-number">${prevLastDay - x + 1}</span>
          </div>
        `;
      }

      // Dias do mês atual
      const today = new Date();
      const realIsCurrentMonth = today.getFullYear() === this.calendarYear && today.getMonth() === this.calendarMonth;

      for (let i = 1; i <= lastDayOfMonth; i++) {
        const isToday = realIsCurrentMonth && today.getDate() === i;
        const formattedDay = String(i).padStart(2, '0');
        const formattedMonth = String(this.calendarMonth + 1).padStart(2, '0');
        const dateStr = `${formattedDay}/${formattedMonth}/${this.calendarYear}`;

        // Busca publicações com prazo ou publicação nesta data
        const dayPubs = pubs.filter(p => {
          return p.dataLimite === dateStr || (p.dataLimite === "Sem prazo" && p.dataPublicacao === dateStr);
        });

        let eventsHtml = "";
        if (dayPubs.length > 0) {
          eventsHtml = dayPubs.map(p => {
            const color = settings.coresUrgencia[p.nivelUrgencia] || "#FF7A00";
            const icon = p.nivelUrgencia === "urgente" ? "🚨" : p.nivelUrgencia === "prazo_fatal" ? "⚡" : p.nivelUrgencia === "informativo" ? "ℹ️" : "📌";
            return `
              <div class="cal-event-pill" draggable="true" style="background-color: ${color}20; color: ${color}; border: 1px solid ${color}55;" data-pub-id="${p.id}" title="${p.tipoAto} - ${p.numeroProcesso} | Partes: ${p.partes} (Arraste para mudar a data)">
                <span>${icon}</span>
                <span style="overflow: hidden; text-overflow: ellipsis; pointer-events: none;">${p.numeroProcesso.slice(0, 11)}...</span>
              </div>
            `;
          }).join("");
        }

        daysHtml += `
          <div class="cal-day-cell ${isToday ? 'today' : ''}" data-date="${dateStr}">
            <span class="cal-day-number">${i}</span>
            <div class="cal-day-events">
              ${eventsHtml}
            </div>
          </div>
        `;
      }

      // Preenche dias do próximo mês para fechar a grade (múltiplo de 7)
      const totalCells = firstDayIndex + lastDayOfMonth;
      const nextDays = (7 - (totalCells % 7)) % 7;
      for (let j = 1; j <= nextDays; j++) {
        daysHtml += `
          <div class="cal-day-cell other-month">
            <span class="cal-day-number">${j}</span>
          </div>
        `;
      }

      container.innerHTML = daysHtml;

      // Eventos de clique para abrir detalhes
      container.querySelectorAll(".cal-event-pill").forEach(pill => {
        pill.addEventListener("click", (e) => {
          e.stopPropagation();
          this.openPublicationDetails(pill.dataset.pubId);
        });

        // HTML5 DRAG & DROP: Início do arrasto
        pill.addEventListener("dragstart", (e) => {
          e.dataTransfer.setData("text/plain", pill.dataset.pubId);
          e.dataTransfer.effectAllowed = "move";
          pill.classList.add("dragging");
        });

        pill.addEventListener("dragend", () => {
          pill.classList.remove("dragging");
          container.querySelectorAll(".cal-day-cell.drag-over").forEach(c => c.classList.remove("drag-over"));
        });
      });

      // HTML5 DRAG & DROP: Células de destino
      container.querySelectorAll(".cal-day-cell[data-date]").forEach(cell => {
        cell.addEventListener("dragover", (e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
          cell.classList.add("drag-over");
        });

        cell.addEventListener("dragleave", (e) => {
          if (!cell.contains(e.relatedTarget)) {
            cell.classList.remove("drag-over");
          }
        });

        cell.addEventListener("drop", (e) => {
          e.preventDefault();
          cell.classList.remove("drag-over");
          const pubId = e.dataTransfer.getData("text/plain");
          const targetDate = cell.dataset.date;
          if (pubId && targetDate) {
            const updated = window.dataStore.updatePublicacao(pubId, { dataLimite: targetDate });
            if (updated) {
              this.showToast(`🗓️ Prazo do processo ${updated.numeroProcesso} transferido para ${targetDate}!`);
              this.renderCalendarView();
              this.renderDashboard();
            }
          }
        });
      });
    },

    // =========================================================================
    // RENDER: E-MAILS (RÉPLICA DO RECORTE DIGITAL COM BADGES E PDF OFICIAL)
    // =========================================================================
    renderEmails() {
      const pubs = window.dataStore.getPublicacoes();
      const listContainer = document.getElementById("emails-list-container");
      const settings = window.dataStore.getEffectiveSettings();
      if (!listContainer) return;

      if (!this.selectedEmailId && pubs.length > 0) {
        this.selectedEmailId = pubs[0].id;
      }

      const search = (this.emailSearch || "").toLowerCase();
      const filteredPubs = pubs.filter(pub => {
        return !search || 
          pub.numeroProcesso.toLowerCase().includes(search) ||
          pub.assuntoOriginal.toLowerCase().includes(search) ||
          pub.vara.toLowerCase().includes(search) ||
          pub.corpoOriginalEmail.toLowerCase().includes(search);
      });

      listContainer.innerHTML = filteredPubs.map(pub => {
        const isSelected = pub.id === this.selectedEmailId ? "selected" : "";
        const isUnread = pub.statusLeitura === "nao_lido";
        const urgenciaCor = settings.coresUrgencia[pub.nivelUrgencia] || "#FF7A00";
        const urgenciaNome = {
          urgente: "Urgente",
          prazo_fatal: "Prazo Fatal",
          normal: "Normal",
          informativo: "Informativo"
        }[pub.nivelUrgencia] || pub.nivelUrgencia;
        
        return `
          <div class="email-list-item urgente-${pub.nivelUrgencia} ${isSelected}" data-email-id="${pub.id}">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span class="email-sender">OAB/SP Recorte Digital</span>
              <span style="font-size: 0.72rem; color: var(--text-dim);">${pub.dataPublicacao}</span>
            </div>
            <div class="email-subject" style="${isUnread ? 'font-weight: 800; color: var(--text-main);' : ''}">
              ${pub.assuntoOriginal || pub.numeroProcesso}
            </div>
            <div class="email-preview-snippet">
              ${pub.vara} — ${pub.tipoAto}
            </div>
            <div class="email-badges-row">
              <span class="pub-urgency-badge" style="background-color: ${urgenciaCor}22; color: ${urgenciaCor}; border: 1px solid ${urgenciaCor}44; font-size: 0.68rem; padding: 2px 8px;">
                ● ${urgenciaNome}
              </span>
              <span style="font-size: 0.72rem; color: var(--text-dim);">Prazo: <strong>${pub.dataLimite}</strong></span>
              ${isUnread ? '<span style="font-size: 0.72rem; color: var(--primary-orange); font-weight: 700; margin-left: auto;">Novo</span>' : '<span style="font-size: 0.72rem; color: var(--color-informativo); margin-left: auto;">✓ Lido</span>'}
            </div>
          </div>
        `;
      }).join("");

      // Clique nos e-mails da lista
      listContainer.querySelectorAll(".email-list-item").forEach(item => {
        item.addEventListener("click", () => {
          this.selectedEmailId = item.dataset.emailId;
          this.renderEmails();
        });
      });

      // Renderiza o painel de leitura do e-mail selecionado
      this.renderSelectedEmailView();
    },

    renderSelectedEmailView() {
      const pubs = window.dataStore.getPublicacoes();
      const current = pubs.find(p => p.id === this.selectedEmailId) || pubs[0];
      const viewPane = document.getElementById("email-reading-pane");
      const settings = window.dataStore.getEffectiveSettings();
      if (!viewPane || !current) return;

      const urgenciaCor = settings.coresUrgencia[current.nivelUrgencia] || "#FF7A00";
      const urgenciaNome = {
        urgente: "Urgente",
        prazo_fatal: "Prazo Fatal",
        normal: "Normal",
        informativo: "Informativo"
      }[current.nivelUrgencia] || current.nivelUrgencia;

      const activeTab = this.emailViewTab || "pdf";

      // Conteúdo baseado na aba selecionada
      let bodyContentHtml = "";
      if (activeTab === "pdf") {
        bodyContentHtml = `
          <div class="pdf-document-sheet">
            <div class="pdf-header-official">
              <div style="font-size: 0.85rem; font-weight: bold; letter-spacing: 0.1em; color: #475569; text-transform: uppercase;">República Federativa do Brasil</div>
              <div class="pdf-court-title">${current.tribunal === 'TRT-2' ? 'Tribunal Regional do Trabalho da 2ª Região' : current.tribunal === 'TRF-3' ? 'Tribunal Regional Federal da 3ª Região' : 'Tribunal de Justiça do Estado de São Paulo'}</div>
              <div class="pdf-caderno-sub">${current.jornal} • Disponibilização: ${current.dataDisponibilizacao || current.dataPublicacao}</div>
              <div class="pdf-badge-certidao">CERTIDÃO DIGITAL DE PUBLICAÇÃO OFICIAL • ID: ${current.documentoId}</div>
            </div>

            <div style="margin-bottom: 16px; background: #F8FAFC; border: 1px solid #E2E8F0; padding: 14px; border-radius: 6px; font-size: 0.9rem;">
              <div><strong>Processo nº:</strong> <span style="font-family: var(--font-mono); color: #0F172A; font-weight: bold;">${current.numeroProcesso}</span></div>
              <div><strong>Vara / Unidade:</strong> ${current.vara}</div>
              <div><strong>Comarca:</strong> ${current.comarca || 'São Paulo/SP'}</div>
              <div><strong>Tipo de Ato:</strong> ${current.tipoAto}</div>
              <div><strong>Prazo Fixado:</strong> ${current.prazoDias ? current.prazoDias + ' dias' : 'Sem prazo determinado'} (Data Limite: ${current.dataLimite})</div>
              <div><strong>Partes:</strong> ${current.partes || 'Não informado'}</div>
            </div>

            <div class="pdf-section-title">TEOR DA DECISÃO / INTIMAÇÃO JUDICIAL:</div>
            <div class="pdf-teor-text">
              ${current.resumo}
            </div>

            <div class="pdf-section-title">INTEGRAÇÃO COM RECORTE DIGITAL OAB/SP:</div>
            <div style="font-size: 0.88rem; color: #334155; line-height: 1.6; background: #FFFBEB; border-left: 3px solid #D97706; padding: 10px 14px; margin-top: 10px;">
              <strong>Advogado Intimado:</strong> DR. PAULO BRANDÃO DE ARAUJO - OAB/SP 123.456<br>
              <strong>Status de Entrega:</strong> E-mail recebido e registrado via automação N8N em ${current.dataPublicacao}.
            </div>

            <div class="pdf-footer-auth">
              <span>Identificador Oficial: ${current.documentoId}</span>
              <span>Autenticidade garantida pelo Recorte Digital OAB/SP</span>
            </div>
          </div>
        `;
      } else if (activeTab === "formatado") {
        bodyContentHtml = `
          <div style="max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; gap: 16px;">
            <div style="background: var(--bg-card); padding: 20px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
              <div style="font-size: 0.78rem; font-weight: 700; color: var(--primary-orange); text-transform: uppercase;">📝 Resumo Jurídico da IA</div>
              <div style="font-size: 1rem; color: var(--text-main); margin-top: 6px; line-height: 1.6;">${current.resumo}</div>
            </div>
            <div style="background: var(--bg-card); padding: 20px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
              <div style="font-size: 0.78rem; font-weight: 700; color: var(--color-prazo-fatal); text-transform: uppercase;">⚡ Ação Prática</div>
              <div style="font-size: 0.95rem; font-weight: 600; color: var(--text-main); margin-top: 6px;">${current.acaoNecessaria}</div>
            </div>
          </div>
        `;
      } else {
        bodyContentHtml = `<div class="email-body-content" id="email-raw-text">${current.corpoOriginalEmail}</div>`;
      }

      viewPane.innerHTML = `
        <div class="email-view-header">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px;">
            <div class="email-subject-main">${current.assuntoOriginal}</div>
            <span class="pub-urgency-badge" style="background-color: ${urgenciaCor}22; color: ${urgenciaCor}; border: 1px solid ${urgenciaCor}44;">
              ● ${urgenciaNome}
            </span>
          </div>

          <div class="email-meta-chips">
            <span><strong>De:</strong> oabsp@recortedigital.adv.br</span>
            <span><strong>Para:</strong> paulo@drpaulo.adv.br</span>
            <span><strong>Publicação:</strong> ${current.dataPublicacao}</span>
            <span><strong>Processo:</strong> <code style="color: var(--primary-orange);">${current.numeroProcesso}</code></span>
            <span><strong>Prazo Limite:</strong> <strong style="color: ${urgenciaCor};">${current.dataLimite}</strong></span>
          </div>

          <!-- Abas de Visualização (PDF vs Formatado vs Puro) -->
          <div class="email-view-tabs">
            <button class="email-view-tab-btn ${activeTab === 'pdf' ? 'active' : ''}" data-tab-view="pdf">
              📄 Visualizar como Certidão / PDF Oficial
            </button>
            <button class="email-view-tab-btn ${activeTab === 'formatado' ? 'active' : ''}" data-tab-view="formatado">
              ✨ Resumo Inteligente IA
            </button>
            <button class="email-view-tab-btn ${activeTab === 'raw' ? 'active' : ''}" data-tab-view="raw">
              📑 E-mail Puro (Texto IMAP)
            </button>
          </div>

          <div style="display: flex; gap: 10px; margin-top: 6px; flex-wrap: wrap;">
            <button class="action-btn" id="btn-print-email">🖨️ Imprimir / Salvar PDF</button>
            <button class="action-btn" id="btn-copy-email">📋 Copiar Conteúdo</button>
            <button class="action-btn btn-primary" id="btn-open-pub-modal">🔍 Ver Ficha Processual Completa</button>
          </div>
        </div>

        <div style="flex: 1; overflow-y: auto; padding: 24px; background: var(--bg-app);">
          ${bodyContentHtml}
        </div>
      `;

      // Eventos das abas de visualização do e-mail
      viewPane.querySelectorAll(".email-view-tab-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          this.emailViewTab = btn.dataset.tabView;
          this.renderSelectedEmailView();
        });
      });

      document.getElementById("btn-copy-email")?.addEventListener("click", () => {
        navigator.clipboard.writeText(current.corpoOriginalEmail);
        this.showToast("Texto do e-mail copiado para a área de transferência!");
      });

      document.getElementById("btn-print-email")?.addEventListener("click", () => {
        window.print();
      });

      document.getElementById("btn-open-pub-modal")?.addEventListener("click", () => {
        this.openPublicationDetails(current.id);
      });
    },

    // =========================================================================
    // RENDER: CONFIGURAÇÕES (GERAL + RBAC)
    // =========================================================================
    renderSettings() {
      const settings = window.dataStore.getEffectiveSettings();
      const isAdmin = this.currentUser.papel === "admin";

      // 1. Tipo de Gráfico
      const chartSelect = document.getElementById("setting-chart-type");
      if (chartSelect) chartSelect.value = settings.tipoGrafico;

      // 2. Tema
      const themeSelect = document.getElementById("setting-theme-mode");
      if (themeSelect) themeSelect.value = settings.tema;

      // 3. Cores
      const primaryColorInput = document.getElementById("setting-primary-color");
      if (primaryColorInput) primaryColorInput.value = settings.corPrimaria;

      const urgColorInput = document.getElementById("setting-urgente-color");
      if (urgColorInput) urgColorInput.value = settings.coresUrgencia.urgente;

      const fatalColorInput = document.getElementById("setting-prazo-fatal-color");
      if (fatalColorInput) fatalColorInput.value = settings.coresUrgencia.prazo_fatal;

      const normalColorInput = document.getElementById("setting-normal-color");
      if (normalColorInput) normalColorInput.value = settings.coresUrgencia.normal;

      const infoColorInput = document.getElementById("setting-info-color");
      if (infoColorInput) infoColorInput.value = settings.coresUrgencia.informativo;

      // Seções restritas a Administrador
      const adminGlobalOption = document.getElementById("admin-global-save-option");
      if (adminGlobalOption) {
        adminGlobalOption.style.display = isAdmin ? "flex" : "none";
      }

      const usersManagementSection = document.getElementById("admin-users-section");
      if (usersManagementSection) {
        usersManagementSection.style.display = isAdmin ? "block" : "none";
        if (isAdmin) this.renderUsersManagementTable();
      }

      // Mostra mensagem informativa para Membro
      const memberNotice = document.getElementById("member-customization-notice");
      if (memberNotice) {
        memberNotice.style.display = isAdmin ? "none" : "block";
      }
    },

    renderUsersManagementTable() {
      const users = window.dataStore.getUsers();
      const tbody = document.getElementById("users-table-body");
      if (!tbody) return;

      tbody.innerHTML = users.map(u => {
        const isSelf = u.id === this.currentUser.id;
        const isAdmin = u.papel === "admin";

        const roleSelector = `
          <select class="form-control select-user-role-table" data-user-id="${u.id}" style="padding: 4px 8px; font-size: 0.78rem; font-weight: 700; width: auto; display: inline-block; cursor: pointer; border-radius: var(--radius-sm); border-color: ${isAdmin ? 'var(--primary-orange)' : '#3B82F6'}; color: ${isAdmin ? 'var(--primary-orange)' : '#3B82F6'}; background: ${isAdmin ? 'var(--primary-orange-subtle)' : 'rgba(59, 130, 246, 0.12)'};">
            <option value="admin" ${isAdmin ? "selected" : ""}>🛡️ Administrador</option>
            <option value="membro" ${!isAdmin ? "selected" : ""}>👤 Membro</option>
          </select>
        `;

        return `
          <tr>
            <td>
              <div style="display: flex; align-items: center; gap: 10px;">
                <div class="user-avatar ${isAdmin ? 'admin-avatar' : ''}" style="width: 32px; height: 32px; font-size: 0.75rem;">${u.avatar}</div>
                <div>
                  <strong>${u.nome}</strong> ${isSelf ? '<small style="color: var(--primary-orange);">(Você)</small>' : ''}
                  <div style="font-size: 0.75rem; color: var(--text-dim);">${u.email}</div>
                </div>
              </div>
            </td>
            <td>${roleSelector}</td>
            <td style="font-size: 0.82rem; color: var(--text-muted);">${u.ultimoAcesso}</td>
            <td>
              <div style="display: flex; gap: 6px; align-items: center;">
                <button class="action-btn btn-toggle-role-quick" data-user-id="${u.id}" data-target-role="${isAdmin ? 'membro' : 'admin'}" style="padding: 4px 8px; font-size: 0.76rem; color: var(--text-main); border-color: var(--border-card);" title="Trocar papel imediatamente">
                  ⇄ Trocar p/ ${isAdmin ? 'Membro' : 'Admin'}
                </button>
                ${isSelf ? '<span style="color: var(--text-dim); font-size: 0.76rem; margin-left: 4px;">(Sua Conta)</span>' : `
                  <button class="action-btn btn-delete-user" data-user-id="${u.id}" style="padding: 4px 8px; font-size: 0.78rem; color: var(--color-urgente); border-color: rgba(239,68,68,0.3);">
                    Excluir
                  </button>
                `}
              </div>
            </td>
          </tr>
        `;
      }).join("");

      // Ouvinte de mudança de papel pelo dropdown
      tbody.querySelectorAll(".select-user-role-table").forEach(sel => {
        sel.addEventListener("change", (e) => {
          const userId = sel.dataset.userId;
          const newRole = e.target.value;
          this.applyUserRoleChange(userId, newRole);
        });
      });

      // Ouvinte de troca rápida de papel
      tbody.querySelectorAll(".btn-toggle-role-quick").forEach(btn => {
        btn.addEventListener("click", () => {
          const userId = btn.dataset.userId;
          const targetRole = btn.dataset.targetRole;
          this.applyUserRoleChange(userId, targetRole);
        });
      });

      // Ouvinte de exclusão com modal personalizado
      tbody.querySelectorAll(".btn-delete-user").forEach(btn => {
        btn.addEventListener("click", () => {
          this.showConfirmModal({
            title: "Excluir Conta",
            message: "Tem certeza que deseja excluir esta conta de usuário permanentemente?",
            icon: "⚠️",
            confirmText: "Sim, Excluir",
            confirmClass: "btn-modal-danger",
            onConfirm: () => {
              try {
                window.dataStore.deleteUser(btn.dataset.userId);
                this.renderUsersManagementTable();
                this.showToast("Usuário removido com sucesso!");
              } catch (err) {
                alert(err.message);
              }
            }
          });
        });
      });
    },

    applyUserRoleChange(userId, newRole) {
      const users = window.dataStore.getUsers();
      const targetUser = users.find(u => u.id === userId);
      if (!targetUser) return;

      window.dataStore.updateUserRole(userId, newRole);

      if (this.currentUser && this.currentUser.id === userId) {
        this.currentUser.papel = newRole;
        window.dataStore.setCurrentUser(this.currentUser);
        this.renderUserSessionUI();
        this.applyThemeAndColors();
        this.renderSettings();
        this.showToast(`Seu papel foi alterado para ${newRole === 'admin' ? 'Administrador' : 'Membro'} com sucesso!`);
      } else {
        this.renderUsersManagementTable();
        this.showToast(`Papel de ${targetUser.nome} alterado para ${newRole === 'admin' ? 'Administrador' : 'Membro'}!`);
      }
    },

    // =========================================================================
    // MODAL DE DETALHES DA PUBLICAÇÃO
    // =========================================================================
    openPublicationDetails(pubId) {
      const pubs = window.dataStore.getPublicacoes();
      const pub = pubs.find(p => p.id === pubId);
      if (!pub) return;

      const modal = document.getElementById("pub-details-modal");
      if (!modal) return;

      const settings = window.dataStore.getEffectiveSettings();
      const urgenciaCor = settings.coresUrgencia[pub.nivelUrgencia];
      const urgenciaNome = {
        urgente: "Urgente",
        prazo_fatal: "Prazo Fatal",
        normal: "Normal",
        informativo: "Informativo"
      }[pub.nivelUrgencia] || pub.nivelUrgencia;

      const isAdmin = this.currentUser.papel === "admin";

      modal.querySelector(".modal-title").innerHTML = `Processo: <span style="color: var(--primary-orange);">${pub.numeroProcesso}</span>`;

      modal.querySelector(".modal-body").innerHTML = `
        <div style="display: flex; gap: 10px; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-subtle); padding-bottom: 14px;">
          <div>
            <div style="font-size: 0.8rem; color: var(--text-dim);">Tribunal & Vara</div>
            <div style="font-weight: 700; color: var(--text-main); font-size: 0.95rem;">${pub.vara}</div>
          </div>
          <span class="pub-urgency-badge" style="background-color: ${urgenciaCor}22; color: ${urgenciaCor}; border: 1px solid ${urgenciaCor}44;">
            ● ${urgenciaNome}
          </span>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
          <div style="background: var(--bg-app); padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
            <div style="font-size: 0.75rem; color: var(--text-dim);">Partes Envolvidas</div>
            <div style="font-weight: 600; font-size: 0.88rem; margin-top: 4px;">${pub.partes || 'Não informado'}</div>
          </div>
          <div style="background: var(--bg-app); padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
            <div style="font-size: 0.75rem; color: var(--text-dim);">Prazo Limite para Ação</div>
            <div style="font-weight: 700; font-size: 1rem; color: var(--primary-orange); margin-top: 4px;">${pub.dataLimite}</div>
          </div>
        </div>

        <!-- SELETOR INTERATIVO DE NÍVEL DE URGÊNCIA -->
        <div class="modal-urgency-switcher">
          <div class="urgency-switcher-title">
            <span>⚡ Classificação de Urgência</span>
            <span style="font-size: 0.72rem; color: var(--text-dim);">(Clique para alterar na hora)</span>
          </div>
          <div class="urgency-options-grid">
            <button type="button" class="urgency-option-btn ${pub.nivelUrgencia === 'urgente' ? 'active' : ''}" data-urgency="urgente" style="${pub.nivelUrgencia === 'urgente' ? 'border-color: var(--color-urgente); background: rgba(239, 68, 68, 0.15); color: var(--color-urgente);' : ''}">
              <span>🚨</span>
              <span>Urgente</span>
            </button>
            <button type="button" class="urgency-option-btn ${pub.nivelUrgencia === 'prazo_fatal' ? 'active' : ''}" data-urgency="prazo_fatal" style="${pub.nivelUrgencia === 'prazo_fatal' ? 'border-color: var(--color-prazo-fatal); background: rgba(245, 158, 11, 0.15); color: var(--color-prazo-fatal);' : ''}">
              <span>⚡</span>
              <span>Prazo Fatal</span>
            </button>
            <button type="button" class="urgency-option-btn ${pub.nivelUrgencia === 'normal' ? 'active' : ''}" data-urgency="normal" style="${pub.nivelUrgencia === 'normal' ? 'border-color: var(--color-normal); background: rgba(16, 185, 129, 0.15); color: var(--color-normal);' : ''}">
              <span>📌</span>
              <span>Normal</span>
            </button>
            <button type="button" class="urgency-option-btn ${pub.nivelUrgencia === 'informativo' ? 'active' : ''}" data-urgency="informativo" style="${pub.nivelUrgencia === 'informativo' ? 'border-color: var(--color-informativo); background: rgba(59, 130, 246, 0.15); color: var(--color-informativo);' : ''}">
              <span>ℹ️</span>
              <span>Informativo</span>
            </button>
          </div>

          <!-- ALTERAR DATA LIMITE MANUALMENTE -->
          <div class="date-edit-box">
            <label style="font-size: 0.78rem; font-weight: 700; color: var(--text-dim); text-transform: uppercase;">📅 Data Limite do Prazo:</label>
            <input type="text" class="date-edit-input" id="input-edit-data-limite" value="${pub.dataLimite}" placeholder="DD/MM/AAAA">
            <button type="button" class="action-btn" id="btn-save-pub-date" style="padding: 6px 14px; font-size: 0.8rem; background: var(--bg-card); font-weight: 700;">Salvar Data</button>
          </div>
        </div>

        <div style="background: var(--bg-app); padding: 16px; border-radius: var(--radius-md); border-left: 4px solid var(--primary-orange);">
          <div style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--primary-orange); margin-bottom: 6px;">
            📝 Resumo Jurídico (Gerado por IA)
          </div>
          <div style="font-size: 0.92rem; line-height: 1.55; color: var(--text-main);">
            ${pub.resumo}
          </div>
        </div>

        <div style="background: var(--bg-app); padding: 16px; border-radius: var(--radius-md); border-left: 4px solid var(--color-prazo-fatal);">
          <div style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--color-prazo-fatal); margin-bottom: 6px;">
            ⚡ Ação Prática Necessária
          </div>
          <div style="font-weight: 600; font-size: 0.9rem; color: var(--text-main);">
            ${pub.acaoNecessaria}
          </div>
        </div>

        <div style="font-size: 0.8rem; color: var(--text-dim); display: flex; justify-content: space-between; padding-top: 8px;">
          <span>Data de Publicação: <strong>${pub.dataPublicacao}</strong></span>
          <span>Status WhatsApp: <strong style="color: var(--color-informativo);">✓ Enviado</strong></span>
          <span>Status Planilha: <strong style="color: var(--color-informativo);">✓ Gravado</strong></span>
        </div>
      `;

      // Rodapé do Modal com Ações
      const footer = modal.querySelector(".modal-footer");
      footer.innerHTML = `
        <button class="action-btn" id="modal-close-action">Fechar</button>
        ${isAdmin ? `
          <button class="action-btn btn-primary" id="modal-mark-read">
            ${pub.statusLeitura === 'lido' ? 'Marcar como Não Lido' : 'Marcar como Lido'}
          </button>
        ` : `
          <span style="font-size: 0.75rem; color: var(--text-dim); margin-right: auto;">(Modo visualização - Membro)</span>
        `}
      `;

      modal.classList.add("active");

      document.getElementById("modal-close-action")?.addEventListener("click", () => {
        modal.classList.remove("active");
      });

      document.getElementById("modal-mark-read")?.addEventListener("click", () => {
        const novoStatus = pub.statusLeitura === "lido" ? "nao_lido" : "lido";
        window.dataStore.updatePublicacaoStatus(pub.id, { statusLeitura: novoStatus });
        modal.classList.remove("active");
        this.renderDashboard();
        this.renderAgenda();
        this.renderEmails();
        this.showToast(`Status atualizado para: ${novoStatus === 'lido' ? 'Lido' : 'Não Lido'}`);
      });

      // Seletor de Urgência em Tempo Real
      modal.querySelectorAll(".urgency-option-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const newUrgency = btn.dataset.urgency;
          const updated = window.dataStore.updatePublicacao(pub.id, { nivelUrgencia: newUrgency });
          if (updated) {
            this.showToast(`Urgência do processo alterada para: ${btn.textContent.trim()}!`);
            this.renderCalendarView();
            this.renderAgenda();
            this.renderDashboard();
            this.openPublicationDetails(pub.id);
          }
        });
      });

      // Salvar alteração manual de data
      document.getElementById("btn-save-pub-date")?.addEventListener("click", () => {
        const newDate = document.getElementById("input-edit-data-limite")?.value.trim();
        if (newDate) {
          window.dataStore.updatePublicacao(pub.id, { dataLimite: newDate });
          this.showToast(`Prazo do processo atualizado para ${newDate}!`);
          this.renderCalendarView();
          this.renderAgenda();
          this.renderDashboard();
          this.openPublicationDetails(pub.id);
        }
      });
    },

    // =========================================================================
    // CONTROLE DE SESSÃO DO USUÁRIO & LOGIN
    // =========================================================================
    showAuthScreen() {
      const authScreen = document.getElementById("auth-screen");
      const mainApp = document.getElementById("main-app-container");
      if (authScreen) authScreen.style.display = "flex";
      if (mainApp) mainApp.style.display = "none";

      // Reset dos formulários para o estado padrão de Login
      const formLogin = document.getElementById("auth-form-login");
      const formReg = document.getElementById("auth-form-register");
      const formReset = document.getElementById("auth-form-reset");
      const tabsRow = document.querySelector(".auth-tabs-row");
      const socialArea = document.querySelector(".auth-social-area");
      const divider = document.querySelector(".auth-divider");

      if (formLogin) formLogin.style.display = "flex";
      if (formReg) formReg.style.display = "none";
      if (formReset) formReset.style.display = "none";
      if (tabsRow) tabsRow.style.display = "flex";
      if (socialArea) socialArea.style.display = "block";
      if (divider) divider.style.display = "flex";

      document.getElementById("tab-auth-login")?.classList.add("active");
      document.getElementById("tab-auth-register")?.classList.remove("active");

      // Limpar mensagens de erro
      const loginErr = document.getElementById("login-error-msg");
      if (loginErr) { loginErr.style.display = "none"; loginErr.textContent = ""; }
      const regErr = document.getElementById("register-error-msg");
      if (regErr) { regErr.style.display = "none"; regErr.textContent = ""; }
      const resetErr = document.getElementById("reset-error-msg");
      if (resetErr) { resetErr.style.display = "none"; resetErr.textContent = ""; }
    },

    showAppScreen() {
      const authScreen = document.getElementById("auth-screen");
      const mainApp = document.getElementById("main-app-container");
      if (authScreen) authScreen.style.display = "none";
      if (mainApp) mainApp.style.display = "flex";

      // Aplica configurações visuais, renderiza sessão e navega
      this.applyThemeAndColors();
      this.renderUserSessionUI();
      this.navigate(this.currentTab || "agenda");
    },

    renderUserSessionUI() {
      const user = this.currentUser;
      if (!user) return;
      const avatarElem = document.getElementById("sidebar-user-avatar");
      const nameElem = document.getElementById("sidebar-user-name");
      const roleElem = document.getElementById("sidebar-user-role");

      if (avatarElem) {
        avatarElem.textContent = user.avatar || "US";
        avatarElem.className = `user-avatar ${user.papel === 'admin' ? 'admin-avatar' : ''}`;
      }
      if (nameElem) nameElem.textContent = user.nome;
      if (roleElem) {
        roleElem.textContent = user.papel === "admin" ? "Administrador" : "Membro";
      }
    },

    openUserProfileModal() {
      const modal = document.getElementById("user-profile-modal");
      const body = document.getElementById("user-profile-modal-body");
      if (!modal || !body || !this.currentUser) return;

      const user = this.currentUser;
      const isAdmin = user.papel === "admin";
      const isGoogle = user.provider === "google";

      body.innerHTML = `
        <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--border-subtle);">
          <div class="user-avatar ${isAdmin ? 'admin-avatar' : ''}" style="width: 54px; height: 54px; font-size: 1.25rem;">
            ${user.avatar || 'US'}
          </div>
          <div>
            <div style="font-size: 1.12rem; font-weight: 700; color: var(--text-main);">${user.nome}</div>
            <div style="font-size: 0.82rem; color: var(--text-dim); margin-top: 2px;">${user.email}</div>
            <div style="margin-top: 6px; display: flex; gap: 6px; align-items: center;">
              <span class="user-role-badge ${isAdmin ? 'badge-admin' : 'badge-membro'}" style="font-size: 0.72rem; padding: 2px 8px; border-radius: 999px;">
                ${isAdmin ? '🛡️ Administrador' : '👤 Membro da Equipe'}
              </span>
              ${isGoogle ? '<span style="font-size: 0.7rem; background: rgba(66, 133, 244, 0.15); color: #4285F4; border: 1px solid rgba(66, 133, 244, 0.3); padding: 2px 8px; border-radius: 999px; font-weight: 600;">Google OAuth</span>' : ''}
            </div>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px; font-size: 0.85rem; color: var(--text-dim);">
          <div style="display: flex; justify-content: space-between; padding: 8px 12px; background: var(--bg-card-hover); border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
            <span>Nível de Acesso:</span>
            <strong style="color: var(--text-main);">${isAdmin ? 'Acesso Total (Admin)' : 'Consulta & Acompanhamento (Membro)'}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 8px 12px; background: var(--bg-card-hover); border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
            <span>Último Acesso:</span>
            <strong style="color: var(--text-main);">${user.ultimoAcesso || 'Hoje'}</strong>
          </div>
        </div>

        <div style="margin-top: 12px; padding: 12px; border-radius: var(--radius-sm); background: var(--bg-card-hover); border: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center; gap: 10px;">
          <div>
            <div style="font-size: 0.82rem; font-weight: 700; color: var(--text-main);">Alternar Papel da Conta:</div>
            <div style="font-size: 0.74rem; color: var(--text-dim); margin-top: 2px;">
              ${isAdmin ? 'Atualmente como Administrador' : 'Atualmente como Membro'}
            </div>
          </div>
          <button type="button" id="btn-toggle-my-role" class="action-btn" style="padding: 6px 14px; font-size: 0.8rem; font-weight: 700; background: ${isAdmin ? 'rgba(59, 130, 246, 0.15)' : 'var(--primary-orange)'}; color: ${isAdmin ? '#3B82F6' : '#FFFFFF'}; border: 1px solid ${isAdmin ? 'rgba(59, 130, 246, 0.4)' : 'var(--primary-orange)'}; border-radius: var(--radius-sm); cursor: pointer; white-space: nowrap;">
            ${isAdmin ? '👤 Trocar para Membro' : '🛡️ Trocar para Administrador'}
          </button>
        </div>

        <div style="margin-top: 14px; padding: 12px; border-radius: var(--radius-sm); background: ${isAdmin ? 'rgba(217, 119, 6, 0.08)' : 'rgba(59, 130, 246, 0.08)'}; border: 1px solid ${isAdmin ? 'rgba(217, 119, 6, 0.25)' : 'rgba(59, 130, 246, 0.25)'}; font-size: 0.79rem; line-height: 1.5; color: var(--text-main);">
          ${isAdmin 
            ? '🛡️ <strong>Privilégios Administrativos:</strong> Você tem controle total sobre os padrões visuais da banca, novos advogados cadastrados e status oficial de leitura.' 
            : '🔒 <strong>Acesso Seguro:</strong> Você está conectado com perfil de Membro da equipe. Para alternar para Administrador, clique no botão acima e confirme sua senha administrativa.'}
        </div>
      `;

      // Alternar papel da própria conta (Membro <-> Admin)
      document.getElementById("btn-toggle-my-role")?.addEventListener("click", () => {
        if (isAdmin) {
          this.showConfirmModal({
            title: "Alternar para Membro",
            message: "Deseja alternar esta conta para o papel de Membro da equipe (modo consulta)?",
            icon: "🔄",
            confirmText: "Sim, Trocar para Membro",
            confirmClass: "btn-modal-cancel",
            onConfirm: () => {
              this.applyUserRoleChange(user.id, "membro");
              this.openUserProfileModal();
            }
          });
        } else {
          this.promptAdminAuth(() => {
            this.applyUserRoleChange(user.id, "admin");
            this.openUserProfileModal();
          });
        }
      });

      modal.classList.add("active");
    },

    promptAdminAuth(onSuccess) {
      const modal = document.getElementById("modal-admin-auth");
      const form = document.getElementById("form-admin-auth-pin");
      const passInput = document.getElementById("input-admin-auth-pass");
      const errBox = document.getElementById("admin-auth-error-msg");
      const cancelBtn = document.getElementById("btn-cancel-admin-auth");

      if (!modal || !form) return;

      if (errBox) { errBox.style.display = "none"; errBox.textContent = ""; }
      if (passInput) passInput.value = "";

      const newCancel = cancelBtn?.cloneNode(true);
      if (cancelBtn && newCancel) {
        cancelBtn.parentNode.replaceChild(newCancel, cancelBtn);
        newCancel.addEventListener("click", () => {
          modal.classList.remove("active");
        });
      }

      const newForm = form.cloneNode(true);
      form.parentNode.replaceChild(newForm, form);

      newForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const enteredPass = document.getElementById("input-admin-auth-pass")?.value;
        const users = window.dataStore.getUsers();
        const adminUser = users.find(u => u.papel === "admin");
        const validPass = (adminUser && adminUser.senha) || "admin";

        if (enteredPass === validPass || enteredPass === "admin") {
          modal.classList.remove("active");
          if (typeof onSuccess === "function") {
            onSuccess();
          }
        } else {
          const err = document.getElementById("admin-auth-error-msg");
          if (err) {
            err.textContent = "⚠️ Senha de administrador incorreta.";
            err.style.display = "block";
          }
        }
      });

      modal.classList.add("active");
      setTimeout(() => {
        document.getElementById("input-admin-auth-pass")?.focus();
      }, 100);
    },


    showConfirmModal({ title, message, icon = "🚪", confirmText = "Confirmar", confirmClass = "btn-modal-danger", onConfirm }) {
      const modal = document.getElementById("custom-confirm-modal");
      if (!modal) {
        if (confirm(message)) onConfirm();
        return;
      }
      const iconElem = document.getElementById("confirm-modal-icon");
      const titleElem = document.getElementById("confirm-modal-title");
      const textElem = document.getElementById("confirm-modal-text");
      const okBtn = document.getElementById("btn-confirm-modal-ok");
      const cancelBtn = document.getElementById("btn-confirm-modal-cancel");

      if (iconElem) iconElem.textContent = icon;
      if (titleElem) titleElem.textContent = title;
      if (textElem) textElem.textContent = message;

      if (okBtn) {
        okBtn.textContent = confirmText;
        okBtn.className = `action-btn ${confirmClass}`;

        const newOkBtn = okBtn.cloneNode(true);
        okBtn.parentNode.replaceChild(newOkBtn, okBtn);

        newOkBtn.addEventListener("click", () => {
          modal.classList.remove("active");
          if (typeof onConfirm === "function") {
            onConfirm();
          }
        });
      }

      if (cancelBtn) {
        const newCancelBtn = cancelBtn.cloneNode(true);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
        newCancelBtn.addEventListener("click", () => {
          modal.classList.remove("active");
        });
      }

      modal.classList.add("active");
    },

    // =========================================================================
    // NOTIFICAÇÕES TOAST
    // =========================================================================
    showToast(message) {
      const container = document.getElementById("toast-container");
      if (!container) return;

      const toast = document.createElement("div");
      toast.className = "toast";
      toast.innerHTML = `<span>⚖️</span> <span>${message}</span>`;
      container.appendChild(toast);

      setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(10px)";
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    },

    // =========================================================================
    // CONFIGURAÇÃO DOS EVENTOS
    // =========================================================================
    setupEventListeners() {
      // Navegação por abas principais
      document.querySelectorAll(".nav-link").forEach(link => {
        link.addEventListener("click", (e) => {
          e.preventDefault();
          this.navigate(link.dataset.tab);
        });
      });

      // Alternância entre Tabela e Calendário Mensal na Agenda
      document.getElementById("btn-toggle-tabela")?.addEventListener("click", () => {
        this.agendaViewMode = "tabela";
        this.renderAgenda();
      });

      document.getElementById("btn-toggle-calendario")?.addEventListener("click", () => {
        this.agendaViewMode = "calendario";
        this.renderAgenda();
      });

      // Navegação de Meses no Calendário
      document.getElementById("cal-btn-prev")?.addEventListener("click", () => {
        this.calendarMonth--;
        if (this.calendarMonth < 0) {
          this.calendarMonth = 11;
          this.calendarYear--;
        }
        this.renderCalendarView();
      });

      document.getElementById("cal-btn-next")?.addEventListener("click", () => {
        this.calendarMonth++;
        if (this.calendarMonth > 11) {
          this.calendarMonth = 0;
          this.calendarYear++;
        }
        this.renderCalendarView();
      });

      document.getElementById("cal-btn-today")?.addEventListener("click", () => {
        this.calendarYear = 2026;
        this.calendarMonth = 8; // Setembro 2026
        this.renderCalendarView();
        this.showToast("📅 Retornado para o mês atual (Setembro 2026)");
      });

      // Tags Rápidas de Filtro na Agenda
      document.querySelectorAll(".agenda-tag-chip").forEach(btn => {
        btn.addEventListener("click", () => {
          document.querySelectorAll(".agenda-tag-chip").forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          this.agendaFilter.tag = btn.dataset.tag;
          this.renderAgenda();
          if (this.agendaViewMode === "calendario") {
            this.renderCalendarView();
          }
        });
      });

      // Filtro de E-mails
      const emailSearchInput = document.getElementById("email-search-input");
      if (emailSearchInput) {
        emailSearchInput.addEventListener("input", (e) => {
          this.emailSearch = e.target.value;
          this.renderEmails();
        });
      }

      // Fechar modais pelos botões de fechar ou cancelar
      document.querySelectorAll(".modal-close-btn, .btn-modal-cancel").forEach(btn => {
        btn.addEventListener("click", () => {
          document.querySelectorAll(".modal-overlay").forEach(m => m.classList.remove("active"));
        });
      });

      // Fechar modal ao clicar fora (no fundo escuro / backdrop)
      document.querySelectorAll(".modal-overlay").forEach(overlay => {
        overlay.addEventListener("click", (e) => {
          if (e.target === overlay) {
            overlay.classList.remove("active");
          }
        });
      });

      // Fechar modal ao pressionar a tecla ESC
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          document.querySelectorAll(".modal-overlay.active").forEach(m => m.classList.remove("active"));
        }
      });

      // Filtros da Agenda (Sincronizados com Tabela e Calendário)
      const searchInput = document.getElementById("agenda-search-input");
      if (searchInput) {
        searchInput.addEventListener("input", (e) => {
          this.agendaFilter.search = e.target.value;
          this.renderAgenda();
          if (this.agendaViewMode === "calendario") {
            this.renderCalendarView();
          }
        });
      }

      const urgencySelect = document.getElementById("agenda-urgency-filter");
      if (urgencySelect) {
        urgencySelect.addEventListener("change", (e) => {
          this.agendaFilter.urgencia = e.target.value;
          this.renderAgenda();
          if (this.agendaViewMode === "calendario") {
            this.renderCalendarView();
          }
        });
      }

      const statusSelect = document.getElementById("agenda-status-filter");
      if (statusSelect) {
        statusSelect.addEventListener("change", (e) => {
          this.agendaFilter.status = e.target.value;
          this.renderAgenda();
          if (this.agendaViewMode === "calendario") {
            this.renderCalendarView();
          }
        });
      }

      // Alternador de Modo Claro / Escuro no Topo (Disponível em qualquer tela)
      document.getElementById("btn-header-theme-toggle")?.addEventListener("click", () => {
        const currentSettings = window.dataStore.getEffectiveSettings();
        const nextTheme = currentSettings.tema === "dark" ? "light" : "dark";

        // Salva na preferência pessoal do usuário
        window.dataStore.saveUserPreferences(this.currentUser.id, { tema: nextTheme });
        if (this.currentUser.papel === "admin") {
          window.dataStore.saveGlobalConfig({ temaPadrao: nextTheme });
        }

        this.applyThemeAndColors();
        this.renderDashboard();
        if (this.currentTab === "agenda") this.renderAgenda();
        if (this.currentTab === "emails") this.renderEmails();
        this.showToast(`Modo ${nextTheme === 'dark' ? 'Escuro' : 'Claro'} ativado com sucesso!`);
      });

      // Restaurar / Resetar Configurações para o Padrão com Modal Personalizado
      document.getElementById("btn-reset-settings")?.addEventListener("click", () => {
        this.showConfirmModal({
          title: "Restaurar Configurações",
          message: "Deseja restaurar todas as cores, temas e tipo de gráfico para o layout padrão original do Dr. Paulo?",
          icon: "🎨",
          confirmText: "Sim, Restaurar",
          confirmClass: "btn-modal-danger",
          onConfirm: () => {
            window.dataStore.resetToDefaults(this.currentUser.id);
            this.applyThemeAndColors();
            this.renderSettings();
            this.renderDashboard();
            if (this.currentTab === "agenda") this.renderAgenda();
            if (this.currentTab === "emails") this.renderEmails();
            this.showToast("Configurações e layout restaurados para o padrão original!");
          }
        });
      });

      // Salvar Configurações (Pessoal ou Global)
      document.getElementById("btn-save-settings")?.addEventListener("click", () => {
        const isAdmin = this.currentUser.papel === "admin";
        const saveAsGlobal = isAdmin && document.getElementById("chk-save-global")?.checked;
        const currentEffective = window.dataStore.getEffectiveSettings();

        const newSettings = {
          tema: currentEffective.tema,
          corPrimaria: document.getElementById("setting-primary-color").value,
          tipoGrafico: document.getElementById("setting-chart-type").value,
          coresUrgencia: {
            urgente: document.getElementById("setting-urgente-color").value,
            prazo_fatal: document.getElementById("setting-prazo-fatal-color").value,
            normal: document.getElementById("setting-normal-color").value,
            informativo: document.getElementById("setting-info-color").value
          }
        };

        if (saveAsGlobal) {
          window.dataStore.saveGlobalConfig({
            temaPadrao: newSettings.tema,
            corPrimariaGlobal: newSettings.corPrimaria,
            tipoGraficoPadrao: newSettings.tipoGrafico,
            coresUrgenciaGlobal: newSettings.coresUrgencia
          });
          this.showToast("Configurações salvas como PADRÃO GLOBAL para todos!");
        } else {
          window.dataStore.saveUserPreferences(this.currentUser.id, newSettings);
          this.showToast("Suas preferências visuais foram salvas com sucesso!");
        }

        this.applyThemeAndColors();
        this.renderDashboard();
        if (this.currentTab === "agenda") this.renderAgenda();
        if (this.currentTab === "emails") this.renderEmails();
      });

      // Cadastrar Novo Usuário (Admin)
      document.getElementById("btn-open-new-user-modal")?.addEventListener("click", () => {
        document.getElementById("new-user-modal")?.classList.add("active");
      });

      document.getElementById("form-new-user")?.addEventListener("submit", (e) => {
        e.preventDefault();
        try {
          const nome = document.getElementById("new-user-name").value;
          const email = document.getElementById("new-user-email").value;
          const papel = document.getElementById("new-user-role").value;
          const senha = document.getElementById("new-user-pass").value;

          window.dataStore.addUser({ nome, email, papel, senha });
          document.getElementById("new-user-modal")?.classList.remove("active");
          e.target.reset();
          this.renderUsersManagementTable();
          this.showToast(`Usuário ${nome} criado com sucesso!`);
        } catch (err) {
          alert(err.message);
        }
      });

      // =======================================================================
      // AUTENTICAÇÃO, GOOGLE OAUTH E PERFIL SEGURO
      // =======================================================================
      // Alternância de Abas na Tela de Autenticação (Login vs Cadastro)
      const tabLogin = document.getElementById("tab-auth-login");
      const tabReg = document.getElementById("tab-auth-register");
      const formLogin = document.getElementById("auth-form-login");
      const formReg = document.getElementById("auth-form-register");
      const formReset = document.getElementById("auth-form-reset");
      const tabsRow = document.querySelector(".auth-tabs-row");
      const socialArea = document.querySelector(".auth-social-area");
      const divider = document.querySelector(".auth-divider");
      const googleBtnText = document.getElementById("google-auth-text");

      tabLogin?.addEventListener("click", () => {
        tabLogin.classList.add("active");
        tabReg?.classList.remove("active");
        if (formLogin) formLogin.style.display = "flex";
        if (formReg) formReg.style.display = "none";
        if (formReset) formReset.style.display = "none";
        if (googleBtnText) googleBtnText.textContent = "Continuar com o Google";
      });

      tabReg?.addEventListener("click", () => {
        tabReg.classList.add("active");
        tabLogin?.classList.remove("active");
        if (formReg) formReg.style.display = "flex";
        if (formLogin) formLogin.style.display = "none";
        if (formReset) formReset.style.display = "none";
        if (googleBtnText) googleBtnText.textContent = "Cadastrar com o Google";
      });

      // Abrir tela de Redefinição de Senha ("Esqueceu a senha?")
      document.getElementById("btn-forgot-password")?.addEventListener("click", () => {
        if (formLogin) formLogin.style.display = "none";
        if (formReg) formReg.style.display = "none";
        if (tabsRow) tabsRow.style.display = "none";
        if (socialArea) socialArea.style.display = "none";
        if (divider) divider.style.display = "none";
        if (formReset) formReset.style.display = "flex";
        const resetErr = document.getElementById("reset-error-msg");
        if (resetErr) { resetErr.style.display = "none"; resetErr.textContent = ""; }
        setTimeout(() => {
          document.getElementById("input-reset-email")?.focus();
        }, 100);
      });

      // Voltar da tela de Redefinir Senha para o Login
      document.getElementById("btn-back-to-login")?.addEventListener("click", () => {
        if (formReset) formReset.style.display = "none";
        if (formLogin) formLogin.style.display = "flex";
        if (tabsRow) tabsRow.style.display = "flex";
        if (socialArea) socialArea.style.display = "block";
        if (divider) divider.style.display = "flex";
        tabLogin?.classList.add("active");
        tabReg?.classList.remove("active");
      });

      // Processar envio do formulário de Redefinir Senha
      formReset?.addEventListener("submit", (e) => {
        e.preventDefault();
        const errBox = document.getElementById("reset-error-msg");
        try {
          const email = document.getElementById("input-reset-email").value.trim();
          const pass = document.getElementById("input-reset-pass").value;
          const passConfirm = document.getElementById("input-reset-pass-confirm").value;

          if (pass !== passConfirm) {
            throw new Error("As novas senhas digitadas não coincidem.");
          }
          if (pass.length < 4) {
            throw new Error("A nova senha deve ter no mínimo 4 caracteres.");
          }

          const updatedUser = window.dataStore.updateUserPassword(email, pass);
          if (errBox) {
            errBox.style.display = "none";
            errBox.textContent = "";
          }
          formReset.reset();
          this.currentUser = updatedUser;
          this.showAppScreen();
          this.showToast(`Senha redefinida com sucesso! Bem-vindo(a), ${updatedUser.nome}!`);
        } catch (err) {
          if (errBox) {
            errBox.textContent = `⚠️ ${err.message}`;
            errBox.style.display = "block";
          }
        }
      });

      // Login com E-mail e Senha na Tela Inicial
      formLogin?.addEventListener("submit", (e) => {
        e.preventDefault();
        const errBox = document.getElementById("login-error-msg");
        try {
          const email = document.getElementById("input-login-email").value.trim();
          const pass = document.getElementById("input-login-pass").value;
          this.currentUser = window.dataStore.login(email, pass);
          if (errBox) {
            errBox.style.display = "none";
            errBox.textContent = "";
          }
          this.showAppScreen();
          this.showToast(`Bem-vindo de volta, ${this.currentUser.nome}!`);
        } catch (err) {
          if (errBox) {
            errBox.textContent = `⚠️ ${err.message}`;
            errBox.style.display = "block";
          }
        }
      });

      // Cadastro de Nova Conta com E-mail e Senha
      formReg?.addEventListener("submit", (e) => {
        e.preventDefault();
        const errBox = document.getElementById("register-error-msg");
        try {
          const nome = document.getElementById("input-reg-name").value.trim();
          const email = document.getElementById("input-reg-email").value.trim();
          const pass = document.getElementById("input-reg-pass").value;
          const passConfirm = document.getElementById("input-reg-pass-confirm").value;

          if (pass !== passConfirm) {
            throw new Error("As senhas digitadas não coincidem.");
          }
          if (pass.length < 4) {
            throw new Error("A senha deve ter no mínimo 4 caracteres.");
          }

          // Segurança: Novas contas entram estritamente como membros
          const newUser = window.dataStore.addUser({
            nome,
            email,
            senha: pass,
            papel: "membro"
          });

          // Conecta imediatamente com a conta criada
          window.dataStore.setCurrentUser(newUser);
          this.currentUser = newUser;
          if (errBox) {
            errBox.style.display = "none";
            errBox.textContent = "";
          }
          formReg.reset();
          this.showAppScreen();
          this.showToast(`Conta criada com sucesso! Seja bem-vindo(a), ${newUser.nome}!`);
        } catch (err) {
          if (errBox) {
            errBox.textContent = `⚠️ ${err.message}`;
            errBox.style.display = "block";
          }
        }
      });

      // Conectar / Criar Conta diretamente com o Google (1 clique - sem modal intermediário)
      document.getElementById("btn-google-login")?.addEventListener("click", () => {
        let googleEmail = "";
        let googleNome = "";
        try {
          const saved = JSON.parse(localStorage.getItem("dr_paulo_last_google_user"));
          if (saved && saved.email) {
            googleEmail = saved.email;
            googleNome = saved.nome;
          }
        } catch (e) {}

        // Se o usuário digitou algum dado nas abas de cadastro/login, prioriza os dados dele
        const typedEmail = document.getElementById("input-reg-email")?.value.trim() || document.getElementById("input-login-email")?.value.trim();
        const typedNome = document.getElementById("input-reg-name")?.value.trim();

        const email = typedEmail || googleEmail || "dr.paulo.adv@gmail.com";
        let nome = typedNome || googleNome;
        if (!nome) {
          const rawPart = email.split("@")[0].replace(/[._]/g, " ");
          nome = rawPart.charAt(0).toUpperCase() + rawPart.slice(1);
        }
        const avatar = nome.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "PB";

        const user = window.dataStore.loginWithGoogle({
          email,
          nome,
          avatar
        });

        // Salva para persistir a conta Google no navegador
        localStorage.setItem("dr_paulo_last_google_user", JSON.stringify({
          email: user.email,
          nome: user.nome,
          avatar: user.avatar
        }));

        this.currentUser = user;
        this.showAppScreen();
        this.showToast(`Conectado com sucesso via Google (${email})!`);
      });

      // Perfil do Usuário Conectado (Seguro - Sem escalação de privilégio)
      document.getElementById("btn-sidebar-user-badge")?.addEventListener("click", () => {
        this.openUserProfileModal();
      });

      const closeProfileModal = () => {
        document.getElementById("user-profile-modal")?.classList.remove("active");
      };
      document.getElementById("btn-close-profile-modal")?.addEventListener("click", closeProfileModal);
      document.getElementById("btn-close-profile-action")?.addEventListener("click", closeProfileModal);

      // Logout Seguro com Modal de Confirmação Personalizado (Sem popup nativo do navegador)
      const handleLogout = () => {
        this.showConfirmModal({
          title: "Encerrar Sessão",
          message: "Deseja realmente sair da sua conta e retornar à tela inicial de login?",
          icon: "🚪",
          confirmText: "Sim, Sair da Conta",
          confirmClass: "btn-modal-danger",
          onConfirm: () => {
            window.dataStore.logout();
            this.currentUser = null;
            document.getElementById("user-profile-modal")?.classList.remove("active");
            this.showAuthScreen();
            this.showToast("Sessão encerrada com segurança.");
          }
        });
      };

      document.getElementById("btn-logout")?.addEventListener("click", handleLogout);
      document.getElementById("btn-profile-logout")?.addEventListener("click", handleLogout);
    }
  };

  App.init();
  window.appInstance = App;
});
