/**
 * Dr. Paulo — Motor de Gráficos Nativos Premium (SVG / HTML5)
 * Suporte a múltiplos tipos de gráficos:
 * 1. Donut / Pizza Executivo ('donut')
 * 2. Barras Verticais em Colunas ('bar')
 * 3. Barras Horizontais Elegantes ('hbar')
 * 4. Linha de Tendência & Curva de Prazos ('timeline')
 * 5. Medidores Radiais Concêntricos ('radial')
 * 6. Matriz de Risco em Cards ('cards')
 */

class LegalCharts {
  constructor() {
    this.containerId = null;
  }

  renderDashboardChart(containerId, type, data, colors) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = "";

    const items = [
      { label: "Urgente", count: data.porUrgencia.urgente || 0, color: colors.urgente, key: "urgente", icon: "🚨", desc: "Ação Imediata" },
      { label: "Prazo Fatal", count: data.porUrgencia.prazo_fatal || 0, color: colors.prazo_fatal, key: "prazo_fatal", icon: "⚡", desc: "Prazo em Curso" },
      { label: "Normal / Andamento", count: data.porUrgencia.normal || 0, color: colors.normal, key: "normal", icon: "📌", desc: "Expediente Geral" },
      { label: "Informativo", count: data.porUrgencia.informativo || 0, color: colors.informativo, key: "informativo", icon: "ℹ️", desc: "Sem Prazo Fatal" }
    ];

    const total = items.reduce((acc, it) => acc + it.count, 0);

    switch (type) {
      case "bar":
        this.renderBarChart(container, items, total);
        break;
      case "hbar":
        this.renderHorizontalBarChart(container, items, total);
        break;
      case "timeline":
      case "curve":
        this.renderSplineTimelineChart(container, items, total);
        break;
      case "radial":
        this.renderRadialChart(container, items, total);
        break;
      case "cards":
        this.renderRiskCardsMatrix(container, items, total);
        break;
      case "donut":
      default:
        this.renderDonutChart(container, items, total);
        break;
    }
  }

  // 1. DONUT CHART
  renderDonutChart(container, items, total) {
    const size = 220;
    const strokeWidth = 26;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    let accumulatedAngle = 0;
    const circles = items.map(item => {
      const percentage = total > 0 ? item.count / total : 0;
      const strokeDasharray = `${circumference * percentage} ${circumference * (1 - percentage)}`;
      const strokeDashoffset = -accumulatedAngle;
      accumulatedAngle += circumference * percentage;

      return `
        <circle 
          cx="${size / 2}" 
          cy="${size / 2}" 
          r="${radius}" 
          fill="none" 
          stroke="${item.color}" 
          stroke-width="${strokeWidth}" 
          stroke-dasharray="${strokeDasharray}" 
          stroke-dashoffset="${strokeDashoffset}" 
          stroke-linecap="round"
          class="chart-donut-segment"
          data-label="${item.label}"
          data-count="${item.count}"
        />
      `;
    }).join("");

    const legendHtml = items.map(item => {
      const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
      return `
        <div class="chart-legend-item">
          <div class="legend-color-dot" style="background-color: ${item.color}; box-shadow: 0 0 10px ${item.color}50;"></div>
          <div class="legend-info">
            <span class="legend-name">${item.icon} ${item.label}</span>
            <span class="legend-count">${item.count} <small>(${pct}%)</small></span>
          </div>
        </div>
      `;
    }).join("");

    container.innerHTML = `
      <div class="donut-chart-wrapper">
        <div class="donut-svg-container">
          <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" class="donut-svg">
            <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" fill="none" stroke="var(--bg-glass-card)" stroke-width="${strokeWidth}" />
            ${circles}
          </svg>
          <div class="donut-center-stat">
            <span class="donut-center-total">${total}</span>
            <span class="donut-center-label">Publicações</span>
          </div>
        </div>
        <div class="donut-legend-container">
          ${legendHtml}
        </div>
      </div>
    `;
  }

  // 2. COLUNAS VERTICAIS
  renderBarChart(container, items, total) {
    const maxVal = Math.max(...items.map(it => it.count), 1);

    const barsHtml = items.map(item => {
      const heightPct = Math.round((item.count / maxVal) * 100);
      const displayHeight = Math.max(heightPct, 14);
      const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;

      return `
        <div class="bar-column">
          <div class="bar-value-tag" style="color: ${item.color}; font-weight: 800;">${item.count}</div>
          <div class="bar-track">
            <div class="bar-fill" style="height: ${displayHeight}%; background: linear-gradient(180deg, ${item.color}, ${item.color}88); box-shadow: 0 0 18px ${item.color}40;"></div>
          </div>
          <div class="bar-label-tag">
            <span class="bar-color-indicator" style="background: ${item.color}; box-shadow: 0 0 8px ${item.color};"></span>
            <span class="bar-text">${item.icon} ${item.label}</span>
            <span class="bar-pct">${pct}%</span>
          </div>
        </div>
      `;
    }).join("");

    container.innerHTML = `
      <div class="bar-chart-wrapper">
        <div class="bar-columns-grid">
          ${barsHtml}
        </div>
      </div>
    `;
  }

  // 3. BARRAS HORIZONTAIS ELEGANTES (NOVO)
  renderHorizontalBarChart(container, items, total) {
    const rowsHtml = items.map(item => {
      const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
      const displayWidth = Math.max(pct, 6);

      return `
        <div class="hbar-item-row">
          <div class="hbar-info-header">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 1.1rem;">${item.icon}</span>
              <span class="hbar-label">${item.label}</span>
              <span class="hbar-desc-chip" style="background: ${item.color}1a; color: ${item.color};">
                ${item.desc}
              </span>
            </div>
            <div class="hbar-values">
              <span class="hbar-count-badge" style="background: ${item.color}20; color: ${item.color};">${item.count} publicações</span>
              <span class="hbar-pct-val">${pct}%</span>
            </div>
          </div>
          <div class="hbar-track">
            <div class="hbar-fill" style="width: ${displayWidth}%; background: linear-gradient(90deg, ${item.color}, ${item.color}cc); box-shadow: 0 0 14px ${item.color}44;"></div>
          </div>
        </div>
      `;
    }).join("");

    container.innerHTML = `
      <div class="hbar-chart-container">
        ${rowsHtml}
      </div>
    `;
  }

  // 4. LINHA DE TENDÊNCIA E CURVA DE PRAZOS (SPLINE AREA CHART - REDESENHADO)
  renderSplineTimelineChart(container, items, total) {
    // Dias da semana e pontos simulados com base nas publicações reais
    const days = [
      { day: "Seg", date: "21/09", count: 1, label: "Sentença Favorável", color: items[3].color },
      { day: "Ter", date: "22/09", count: 1, label: "Despacho Geral", color: items[2].color },
      { day: "Qua", date: "23/09", count: 2, label: "Alvará & Réplica", color: items[0].color },
      { day: "Qui", date: "24/09", count: 3, label: "Prazos Fatais", color: items[1].color },
      { day: "Sex", date: "25/09", count: 2, label: "Audiência & Perícia", color: items[0].color },
      { day: "Sáb", date: "26/09", count: 0, label: "Sem expediente", color: "#64748B" },
      { day: "Dom", date: "27/09", count: 0, label: "Sem expediente", color: "#64748B" }
    ];

    const maxCount = 4;
    const svgWidth = 540;
    const svgHeight = 160;
    const paddingX = 40;
    const paddingY = 24;

    const points = days.map((d, index) => {
      const x = paddingX + (index * ((svgWidth - (paddingX * 2)) / (days.length - 1)));
      const y = (svgHeight - paddingY) - ((d.count / maxCount) * (svgHeight - (paddingY * 2)));
      return { ...d, x, y };
    });

    // Gera curva bezier suave (Spline)
    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cx = (p0.x + p1.x) / 2;
      pathD += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
    }

    // Área sombreada sob a curva
    const areaD = `${pathD} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`;

    const nodesSvg = points.map(p => `
      <g class="spline-node" style="cursor: pointer;">
        <circle cx="${p.x}" cy="${p.y}" r="6" fill="${p.count > 0 ? p.color : 'var(--bg-card)'}" stroke="var(--bg-app)" stroke-width="2.5" style="filter: drop-shadow(0 0 6px ${p.color});" />
        ${p.count > 0 ? `<text x="${p.x}" y="${p.y - 12}" text-anchor="middle" font-size="11" font-weight="bold" fill="var(--text-main)">${p.count}</text>` : ''}
        <text x="${p.x}" y="${svgHeight - 6}" text-anchor="middle" font-size="10" font-weight="600" fill="var(--text-dim)">${p.day}</text>
      </g>
    `).join("");

    const legendPills = items.map(it => `
      <div class="spline-legend-pill">
        <span class="pill-dot" style="background: ${it.color};"></span>
        <span style="color: var(--text-main); font-weight: 600;">${it.label}:</span>
        <span style="color: ${it.color}; font-weight: 800;">${it.count}</span>
      </div>
    `).join("");

    container.innerHTML = `
      <div class="spline-chart-wrapper">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-muted);">
            📈 Volume de Prazos por Dia da Semana
          </div>
          <span style="font-size: 0.75rem; background: var(--primary-orange-subtle); color: var(--primary-orange); padding: 3px 8px; border-radius: 12px; font-weight: 700;">
            Semana Vigente
          </span>
        </div>

        <div style="position: relative; width: 100%; overflow-x: auto;">
          <svg viewBox="0 0 ${svgWidth} ${svgHeight}" style="width: 100%; height: 180px; overflow: visible;">
            <defs>
              <linearGradient id="splineAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="var(--primary-orange)" stop-opacity="0.35" />
                <stop offset="100%" stop-color="var(--primary-orange)" stop-opacity="0.0" />
              </linearGradient>
            </defs>
            <!-- Grid horizontal de fundo -->
            <line x1="${paddingX}" y1="${svgHeight - paddingY}" x2="${svgWidth - paddingX}" y2="${svgHeight - paddingY}" stroke="var(--border-subtle)" stroke-width="1" />
            <line x1="${paddingX}" y1="${(svgHeight - paddingY) / 2}" x2="${svgWidth - paddingX}" y2="${(svgHeight - paddingY) / 2}" stroke="var(--border-subtle)" stroke-dasharray="4 4" stroke-width="1" />
            
            <!-- Curva e Área -->
            <path d="${areaD}" fill="url(#splineAreaGrad)" />
            <path d="${pathD}" fill="none" stroke="var(--primary-orange)" stroke-width="3.5" stroke-linecap="round" />
            
            <!-- Nós e Rótulos -->
            ${nodesSvg}
          </svg>
        </div>

        <div class="spline-legend-row" style="margin-top: 14px;">
          ${legendPills}
        </div>
      </div>
    `;
  }

  // 5. MEDIDORES RADIAIS CONCÊNTRICOS (NOVO)
  renderRadialChart(container, items, total) {
    const size = 220;
    const center = size / 2;
    const baseRadius = 35;
    const step = 15;
    const strokeWidth = 9;

    let svgTracks = "";
    items.forEach((item, index) => {
      const radius = baseRadius + (index * step);
      const circumference = 2 * Math.PI * radius;
      const pct = total > 0 ? (item.count / total) : 0;
      const dash = circumference * pct;
      const gap = circumference * (1 - pct);

      svgTracks += `
        <!-- Trilha de fundo -->
        <circle cx="${center}" cy="${center}" r="${radius}" fill="none" stroke="var(--bg-glass-card)" stroke-width="${strokeWidth}" />
        <!-- Arco preenchido -->
        <circle 
          cx="${center}" 
          cy="${center}" 
          r="${radius}" 
          fill="none" 
          stroke="${item.color}" 
          stroke-width="${strokeWidth}" 
          stroke-dasharray="${dash} ${gap}" 
          stroke-dashoffset="0"
          stroke-linecap="round" 
          transform="rotate(-90 ${center} ${center})"
          style="filter: drop-shadow(0 0 6px ${item.color}50);"
        />
      `;
    });

    const legendHtml = items.map(item => {
      const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
      return `
        <div class="radial-legend-item">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="legend-color-dot" style="background-color: ${item.color};"></span>
            <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-main);">${item.label}</span>
          </div>
          <div style="font-size: 0.88rem; font-weight: 800; color: ${item.color};">${item.count} <small style="color: var(--text-dim);">(${pct}%)</small></div>
        </div>
      `;
    }).join("");

    container.innerHTML = `
      <div class="radial-chart-wrapper">
        <div class="radial-svg-box">
          <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
            ${svgTracks}
            <text x="${center}" y="${center + 6}" text-anchor="middle" font-size="22" font-weight="800" fill="var(--text-main)">${total}</text>
          </svg>
        </div>
        <div class="radial-legend-box">
          ${legendHtml}
        </div>
      </div>
    `;
  }

  // 6. MATRIZ DE RISCO EM CARDS INTERATIVOS (NOVO)
  renderRiskCardsMatrix(container, items, total) {
    const cardsHtml = items.map(item => {
      const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
      return `
        <div class="risk-matrix-card" style="border-top: 4px solid ${item.color};">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 1.4rem;">${item.icon}</span>
            <span class="risk-count-number" style="color: ${item.color};">${item.count}</span>
          </div>
          <div class="risk-card-name">${item.label}</div>
          <div style="font-size: 0.72rem; color: var(--text-dim); margin-top: 2px;">${item.desc}</div>
          <div class="risk-progress-track">
            <div class="risk-progress-fill" style="width: ${pct}%; background: ${item.color}; box-shadow: 0 0 10px ${item.color}55;"></div>
          </div>
          <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700; text-align: right; margin-top: 4px;">${pct}% do total</div>
        </div>
      `;
    }).join("");

    container.innerHTML = `
      <div class="risk-matrix-grid">
        ${cardsHtml}
      </div>
    `;
  }
}

window.legalCharts = new LegalCharts();
