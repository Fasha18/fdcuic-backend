// ── FDCUIC UI Components — Premium Dark Edition ──
const UI = {
  // Status badge colors
  statusConfig: {
    ouvert: { label: 'Ouvert', cls: 'badge-success', icon: '●' },
    'fermé': { label: 'Fermé', cls: 'badge-muted', icon: '○' },
    en_attente: { label: 'En attente', cls: 'badge-warning', icon: '◐' },
    approuve: { label: 'Approuvé', cls: 'badge-success', icon: '✓' },
    accepte: { label: 'Accepté', cls: 'badge-success', icon: '✓' },
    rejete: { label: 'Rejeté', cls: 'badge-danger', icon: '✗' },
    brouillon: { label: 'Brouillon', cls: 'badge-muted', icon: '◌' },
    soumis: { label: 'Soumis', cls: 'badge-info', icon: '↗' },
    en_examen: { label: 'En examen', cls: 'badge-warning', icon: '◐' },
    en_attente_paiement: { label: 'En attente', cls: 'badge-warning', icon: '◐' },
    verse: { label: 'Versé', cls: 'badge-success', icon: '✓' },
    annule: { label: 'Annulé', cls: 'badge-danger', icon: '✗' },
  },

  badge(status) {
    const c = this.statusConfig[status] || { label: status, cls: 'badge-muted', icon: '○' };
    return `<span class="badge ${c.cls}">${c.icon} ${c.label}</span>`;
  },

  statCard(icon, label, value, accent = '') {
    return `<div class="stat-card ${accent}">
      <div class="stat-icon">${icon}</div>
      <div class="stat-info"><span class="stat-value">${value}</span><span class="stat-label">${label}</span></div>
    </div>`;
  },

  card(title, content, actions = '') {
    return `<div class="card animate-in"><div class="card-header"><h3>${title}</h3>${actions}</div><div class="card-body">${content}</div></div>`;
  },

  emptyState(icon, title, desc, action = '') {
    return `<div class="empty-state"><div class="empty-icon">${icon}</div><h3>${title}</h3><p>${desc}</p>${action}</div>`;
  },

  table(headers, rows) {
    const th = headers.map(h => `<th>${h}</th>`).join('');
    const tr = rows.map((r, i) => `<tr style="animation:fadeInUp .3s ease ${i * .03}s both">${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('');
    return `<div class="table-wrap"><table><thead><tr>${th}</tr></thead><tbody>${tr.length ? tr : `<tr><td colspan="${headers.length}" class="table-empty">Aucune donnée</td></tr>`}</tbody></table></div>`;
  },

  timeline(steps, current) {
    return `<div class="timeline">${steps.map((s, i) => {
      const state = i < current ? 'done' : i === current ? 'active' : '';
      return `<div class="timeline-step ${state}"><div class="timeline-dot">${i < current ? '✓' : i + 1}</div><span>${s}</span></div>`;
    }).join('')}</div>`;
  },

  modal(id, title, body, footer = '') {
    return `<div class="modal-overlay" id="${id}" onclick="if(event.target===this)this.classList.remove('active')">
      <div class="modal"><div class="modal-header"><h3>${title}</h3><button onclick="document.getElementById('${id}').classList.remove('active')" class="modal-close">&times;</button></div>
      <div class="modal-body">${body}</div>${footer ? `<div class="modal-footer">${footer}</div>` : ''}</div></div>`;
  },

  showModal(id) { document.getElementById(id)?.classList.add('active'); },
  hideModal(id) { document.getElementById(id)?.classList.remove('active'); },

  _toastIcons: { success: '✓', error: '✗', info: 'ℹ', warning: '⚠' },

  toast(msg, type = 'info') {
    const icon = this._toastIcons[type] || 'ℹ';
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    t.innerHTML = `<span style="display:flex;align-items:center;gap:10px"><strong style="font-size:1.1em;opacity:.9">${icon}</strong> ${msg}</span>`;
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
    container.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 3500);
  },

  loader() {
    return `<div class="loader">
      <div class="spinner"></div>
      <span style="font-size:.82rem;color:var(--text-muted);font-weight:500;font-family:'Outfit',sans-serif;letter-spacing:1.5px;text-transform:uppercase">Chargement...</span>
    </div>`;
  },

  formatDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  },

  formatDateRelative(d) {
    if (!d) return '—';
    const now = new Date();
    const date = new Date(d);
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'À l\'instant';
    if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `Il y a ${Math.floor(diff / 86400)}j`;
    return this.formatDate(d);
  },

  formatMoney(n) {
    if (!n) return '—';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(n);
  },

  greeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Bonjour';
    if (h < 18) return 'Bon après-midi';
    return 'Bonsoir';
  },

  pageHeader(title, subtitle = '', actions = '') {
    return `<div class="page-header"><div><h1>${title}</h1>${subtitle ? `<p class="page-subtitle">${subtitle}</p>` : ''}</div><div class="page-actions">${actions}</div></div>`;
  },

  progressBar(pct, label = '') {
    return `<div class="progress-wrap">${label ? `<div class="progress-label"><span>${label}</span><span>${pct}%</span></div>` : ''}<div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div></div>`;
  },

  // Animated page content render with fade transition
  renderContent(html) {
    const main = document.getElementById('main-content');
    if (!main) return;
    main.style.opacity = '0';
    main.style.transform = 'translateY(8px)';
    main.innerHTML = html;
    requestAnimationFrame(() => {
      main.style.transition = 'opacity .35s ease, transform .35s ease';
      main.style.opacity = '1';
      main.style.transform = 'translateY(0)';
    });
  },

  setActiveNav(route) {
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.route === route);
    });
  },

  // Section divider with label
  sectionTitle(text) {
    return `<div style="display:flex;align-items:center;gap:12px;margin:24px 0 16px"><span style="font-size:.72rem;font-weight:600;text-transform:uppercase;letter-spacing:1.5px;color:var(--text-muted);white-space:nowrap;font-family:'Outfit',sans-serif">${text}</span><div style="flex:1;height:1px;background:var(--border)"></div></div>`;
  },

  // Info row helper for detail views
  infoRow(label, value) {
    return `<div class="detail-field"><label>${label}</label><span>${value || '—'}</span></div>`;
  }
};

window.UI = UI;
