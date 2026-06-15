// ── Admin Pages ──
const AdminPages = {
  async dashboard() {
    UI.setActiveNav('/admin');
    UI.renderContent(UI.loader());
    try {
      const [projetsRes, appelsRes, mobRes, dossiersRes] = await Promise.allSettled([
        Api.tousLesProjets(), Api.listerAppels(), Api.toutesMobilites(), Api.tousDossiers()
      ]);
      const projets = projetsRes.status === 'fulfilled' ? (projetsRes.value.projets || []) : [];
      const appels = appelsRes.status === 'fulfilled' ? (appelsRes.value.appels || []) : [];
      const mobilites = mobRes.status === 'fulfilled' ? (mobRes.value.projets || []) : [];
      const dossiers = dossiersRes.status === 'fulfilled' ? (dossiersRes.value.dossiers || []) : [];

      const enAttente = projets.filter(p => p.statut === 'en_attente').length;
      const soumis = mobilites.filter(m => m.statut === 'soumis' || m.statut === 'en_examen').length;

      let html = UI.pageHeader('Tableau de bord', 'Vue d\'ensemble de la plateforme');
      html += `<div class="stats-grid">
        ${UI.statCard('📋', 'Total projets', projets.length)}
        ${UI.statCard('📑', 'Dossiers', dossiers.length)}
        ${UI.statCard('✈️', 'Mobilités', mobilites.length, 'accent-success')}
        ${UI.statCard('📢', 'Appels ouverts', appels.length, 'accent-warning')}
      </div>`;

      // Recent projets
      html += UI.card('Projets récents', projets.length === 0
        ? '<p style="color:var(--text-muted);padding:20px 0;text-align:center">Aucun projet</p>'
        : `<div class="table-wrap"><table><thead><tr><th>Titre</th><th>Candidat</th><th>Statut</th><th>Actions</th></tr></thead><tbody>
          ${projets.slice(0, 8).map(p => `<tr>
            <td><strong>${p.titre}</strong></td>
            <td>${p.candidat ? `${p.candidat.prenom} ${p.candidat.nom}` : '—'}</td>
            <td>${UI.badge(p.statut)}</td>
            <td><div style="display:flex;gap:6px;flex-wrap:wrap">
              <button class="btn btn-success btn-sm" onclick="AdminPages.changeProjetStatus(${p.id},'approuve')">Approuver</button>
              <button class="btn btn-danger btn-sm" onclick="AdminPages.changeProjetStatus(${p.id},'rejete')">Rejeter</button>
            </div></td>
          </tr>`).join('')}</tbody></table></div>`
      );

      // Mobilités soumises
      html += `<div class="mt-md">${UI.card('Mobilités en attente de traitement', soumis === 0
        ? '<p style="color:var(--text-muted);padding:20px 0;text-align:center">Aucune demande en attente</p>'
        : `<div class="table-wrap"><table><thead><tr><th>Structure</th><th>Candidat</th><th>Destination</th><th>Statut</th><th>Actions</th></tr></thead><tbody>
          ${mobilites.filter(m => m.statut !== 'brouillon').slice(0, 8).map(m => `<tr>
            <td>${m.nom_structure || '—'}</td>
            <td>${m.candidat ? `${m.candidat.prenom} ${m.candidat.nom}` : '—'}</td>
            <td>${m.pays_destination || '—'}</td>
            <td>${UI.badge(m.statut)}</td>
            <td><div style="display:flex;gap:6px;flex-wrap:wrap">
              <button class="btn btn-ghost btn-sm" onclick="AdminPages.changeMobiliteStatus(${m.id},'en_examen')">Examiner</button>
              <button class="btn btn-success btn-sm" onclick="AdminPages.changeMobiliteStatus(${m.id},'accepte')">Accepter</button>
              <button class="btn btn-danger btn-sm" onclick="AdminPages.changeMobiliteStatus(${m.id},'rejete')">Rejeter</button>
            </div></td>
          </tr>`).join('')}</tbody></table></div>`
      )}</div>`;

      UI.renderContent(html);
    } catch (err) {
      UI.renderContent(UI.emptyState('⚠️', 'Erreur', err.message));
    }
  },

  async changeProjetStatus(id, status) {
    try {
      await Api.changerStatutProjet(id, status);
      UI.toast(`Projet ${status === 'approuve' ? 'approuvé' : 'rejeté'}`, 'success');
      this.dashboard();
    } catch (err) { UI.toast(err.message || 'Erreur', 'error'); }
  },

  async changeMobiliteStatus(id, statut) {
    try {
      await Api.changerStatutMobilite(id, statut);
      UI.toast(`Statut mis à jour : ${statut}`, 'success');
      this.dashboard();
    } catch (err) { UI.toast(err.message || 'Erreur', 'error'); }
  },

  async appels() {
    UI.setActiveNav('/admin/appels');
    UI.renderContent(UI.loader());
    try {
      const data = await Api.listerAppels();
      const appels = data.appels || [];
      let html = UI.pageHeader('Gestion des Appels', `${appels.length} appel(s)`,
        `<button class="btn btn-primary" onclick="AdminPages.showCreateAppel()">+ Nouvel appel</button>`);
      html += `<div class="card"><div class="card-body" style="padding:0">${UI.table(
        ['Titre', 'Ouverture', 'Clôture', 'Statut', 'Actions'],
        appels.map(a => [
          `<strong>${a.titre}</strong>`,
          UI.formatDate(a.date_debut),
          UI.formatDate(a.date_fin),
          UI.badge(a.statut),
          a.statut === 'ouvert' ? `<button class="btn btn-danger btn-sm" onclick="AdminPages.closeAppel(${a.id})">Clôturer</button>` : '—'
        ])
      )}</div></div>`;

      html += UI.modal('create-appel-modal', 'Créer un appel à projets', `
        <form id="create-appel-form">
          <div class="form-group"><label class="form-label">Titre</label><input class="form-input" id="ca-titre" required /></div>
          <div class="form-group"><label class="form-label">Description et Objectifs</label><textarea class="form-input" id="ca-desc" required></textarea></div>
          <div class="form-row">
            <div class="form-group"><label class="form-label">Date d'ouverture</label><input class="form-input" type="date" id="ca-open" required /></div>
            <div class="form-group"><label class="form-label">Date de clôture</label><input class="form-input" type="date" id="ca-close" required /></div>
          </div>
          <div class="form-group"><label class="form-label">Critères</label><textarea class="form-input" id="ca-criteres" placeholder="Critères d'éligibilité..."></textarea></div>
          <button type="submit" class="btn btn-primary" style="width:100%">Créer l'appel</button>
        </form>
      `);
      UI.renderContent(html);
    } catch (err) {
      UI.renderContent(UI.emptyState('⚠️', 'Erreur', err.message));
    }
  },

  showCreateAppel() {
    UI.showModal('create-appel-modal');
    const form = document.getElementById('create-appel-form');
    if (form && !form.dataset.bound) {
      form.dataset.bound = 'true';
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
          await Api.creerAppel({
            titre: document.getElementById('ca-titre').value,
            description: document.getElementById('ca-desc').value,
            date_ouverture: document.getElementById('ca-open').value,
            date_cloture: document.getElementById('ca-close').value,
            criteres: document.getElementById('ca-criteres').value,
          });
          UI.hideModal('create-appel-modal');
          UI.toast('Appel créé avec succès !', 'success');
          this.appels();
        } catch (err) { UI.toast(err.message || 'Erreur', 'error'); }
      });
    }
  },

  async closeAppel(id) {
    if (!confirm('Clôturer cet appel ?')) return;
    try {
      await Api.cloturerAppel(id);
      UI.toast('Appel clôturé', 'success');
      this.appels();
    } catch (err) { UI.toast(err.message || 'Erreur', 'error'); }
  },

  async projets() {
    UI.setActiveNav('/admin/projets');
    UI.renderContent(UI.loader());
    try {
      const data = await Api.tousLesProjets();
      const projets = data.projets || [];
      let html = UI.pageHeader('Tous les Projets', `${projets.length} projet(s)`);
      html += `<div class="card"><div class="card-body" style="padding:0">${UI.table(
        ['Titre', 'Candidat', 'Appel', 'Soumission', 'Statut', 'Actions'],
        projets.map(p => [
          `<strong>${p.titre}</strong>`,
          p.candidat ? `${p.candidat.prenom} ${p.candidat.nom}` : '—',
          p.appel?.titre || '—',
          UI.formatDate(p.date_soumission),
          UI.badge(p.statut),
          `<div style="display:flex;gap:6px"><button class="btn btn-success btn-sm" onclick="AdminPages.changeProjetStatus(${p.id},'approuve');AdminPages.projets()">✓</button><button class="btn btn-danger btn-sm" onclick="AdminPages.changeProjetStatus(${p.id},'rejete');AdminPages.projets()">✗</button></div>`
        ])
      )}</div></div>`;
      UI.renderContent(html);
    } catch (err) {
      UI.renderContent(UI.emptyState('⚠️', 'Erreur', err.message));
    }
  },

  async mobilites() {
    UI.setActiveNav('/admin/mobilites');
    UI.renderContent(UI.loader());
    try {
      const data = await Api.toutesMobilites();
      const projets = data.projets || [];
      let html = UI.pageHeader('Mobilités', `${projets.length} dossier(s)`);
      html += `<div class="card"><div class="card-body" style="padding:0">${UI.table(
        ['Structure', 'Candidat', 'Destination', 'Étape', 'Statut', 'Actions'],
        projets.map(m => [
          m.nom_structure || '—',
          m.candidat ? `${m.candidat.prenom} ${m.candidat.nom}` : '—',
          m.pays_destination || '—',
          `${m.etape_courante || 1}/5`,
          UI.badge(m.statut),
          `<select class="form-input" style="width:auto;padding:4px 8px;font-size:.78rem" onchange="AdminPages.changeMobiliteStatus(${m.id},this.value);AdminPages.mobilites()">
            <option value="">Action...</option>
            <option value="en_examen">En examen</option>
            <option value="accepte">Accepter</option>
            <option value="rejete">Rejeter</option>
          </select>`
        ])
      )}</div></div>`;
      UI.renderContent(html);
    } catch (err) {
      UI.renderContent(UI.emptyState('⚠️', 'Erreur', err.message));
    }
  },

  async subventions() {
    UI.setActiveNav('/admin/subventions');
    UI.renderContent(UI.loader());
    try {
      const data = await Api.tousLesProjets();
      const projetsAcceptes = (data.projets || []).filter(p => p.statut === 'accepte' || p.statut === 'approuve');
      let html = UI.pageHeader('Subventions', 'Attribuez et gérez les subventions',
        `<button class="btn btn-primary" onclick="AdminPages.showSubventionForm()">+ Attribuer</button>`);

      html += `<div class="card"><div class="card-header"><h3>Projets éligibles (acceptés)</h3></div><div class="card-body" style="padding:0">${UI.table(
        ['Projet', 'Candidat', 'Statut'],
        projetsAcceptes.map(p => [
          `<strong>${p.titre}</strong>`,
          p.candidat ? `${p.candidat.prenom} ${p.candidat.nom}` : '—',
          UI.badge(p.statut),
        ])
      )}</div></div>`;

      html += UI.modal('subvention-modal', 'Attribuer une subvention', `
        <form id="subvention-form">
          <div class="form-group"><label class="form-label">ID du projet</label><input class="form-input" type="number" id="sub-projet" required placeholder="Ex: 1" /></div>
          <div class="form-group"><label class="form-label">Montant (FCFA)</label><input class="form-input" type="number" id="sub-montant" required placeholder="500000" /></div>
          <div class="form-group"><label class="form-label">Référence virement</label><input class="form-input" id="sub-ref" placeholder="REF-2026-XXX" /></div>
          <button type="submit" class="btn btn-primary" style="width:100%">Attribuer</button>
        </form>
      `);

      UI.renderContent(html);
    } catch (err) {
      UI.renderContent(UI.emptyState('⚠️', 'Erreur', err.message));
    }
  },

  showSubventionForm() {
    UI.showModal('subvention-modal');
    const form = document.getElementById('subvention-form');
    if (form && !form.dataset.bound) {
      form.dataset.bound = 'true';
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
          await Api.attribuerSubvention({
            projet_id: parseInt(document.getElementById('sub-projet').value),
            montant: parseFloat(document.getElementById('sub-montant').value),
            reference_virement: document.getElementById('sub-ref').value,
          });
          UI.hideModal('subvention-modal');
          UI.toast('Subvention attribuée !', 'success');
          this.subventions();
        } catch (err) { UI.toast(err.message || 'Erreur', 'error'); }
      });
    }
  },

  async dossiers() {
    UI.setActiveNav('/admin/dossiers');
    UI.renderContent(UI.loader());
    try {
      const data = await Api.tousDossiers();
      const dossiers = data.dossiers || [];
      let html = UI.pageHeader('Dossiers d\'appels à projets', `${dossiers.length} dossier(s)`);
      html += `<div class="card"><div class="card-body" style="padding:0">${UI.table(
        ['Structure', 'Candidat', 'Type', 'Appel', 'Étape', 'Statut', 'Actions'],
        dossiers.map(d => [
          d.nom_structure || '—',
          d.candidat ? `${d.candidat.prenom} ${d.candidat.nom}` : '—',
          d.type_projet || '—',
          d.appel?.titre || '—',
          `${d.etape_courante || 1}/4`,
          UI.badge(d.statut),
          `<select class="form-input" style="width:auto;padding:4px 8px;font-size:.78rem" onchange="AdminPages.changeDossierStatus(${d.id},this.value)">
            <option value="">Action...</option>
            <option value="en_examen">En examen</option>
            <option value="accepte">Accepter</option>
            <option value="rejete">Rejeter</option>
          </select>`
        ])
      )}</div></div>`;
      UI.renderContent(html);
    } catch (err) {
      UI.renderContent(UI.emptyState('⚠️', 'Erreur', err.message));
    }
  },

  async changeDossierStatus(id, statut) {
    if (!statut) return;
    try {
      await Api.changerStatutDossier(id, statut);
      UI.toast(`Statut mis à jour : ${statut}`, 'success');
      this.dossiers();
    } catch (err) { UI.toast(err.message || 'Erreur', 'error'); }
  }
};

window.AdminPages = AdminPages;
