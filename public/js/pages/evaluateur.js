// ── Evaluateur Pages ──
const EvaluateurPages = {
  async dashboard() {
    UI.setActiveNav('/evaluateur');
    UI.renderContent(UI.loader());
    try {
      // Evaluateurs can view all projects (they use the general detail route)
      // For now show a welcome with available actions
      const user = Api.getUser();
      let html = UI.pageHeader(`Espace Évaluateur`, `${UI.greeting()}, ${user?.prenom || 'Évaluateur'}`);
      html += `<div class="stats-grid">
        ${UI.statCard('📝', 'Évaluations', '—')}
        ${UI.statCard('📋', 'Projets à évaluer', '—', 'accent-warning')}
      </div>`;
      html += UI.card('Évaluer un projet', `
        <p style="color:var(--text-secondary);margin-bottom:20px">Entrez l'identifiant du projet à évaluer pour accéder à son dossier.</p>
        <div style="display:flex;gap:12px;align-items:flex-end">
          <div class="form-group" style="flex:1;margin-bottom:0">
            <label class="form-label">ID du projet</label>
            <input class="form-input" type="number" id="eval-projet-id" placeholder="Ex: 1" />
          </div>
          <button class="btn btn-primary" onclick="EvaluateurPages.loadProjet()">Charger le projet</button>
        </div>
        <div id="eval-projet-detail" class="mt-md"></div>
      `);
      html += `<div class="mt-md">${UI.card('Consulter une évaluation', `
        <div style="display:flex;gap:12px;align-items:flex-end">
          <div class="form-group" style="flex:1;margin-bottom:0">
            <label class="form-label">ID de l'évaluation</label>
            <input class="form-input" type="number" id="eval-detail-id" placeholder="Ex: 1" />
          </div>
          <button class="btn btn-secondary" onclick="EvaluateurPages.loadEvaluation()">Consulter</button>
        </div>
        <div id="eval-detail-view" class="mt-md"></div>
      `)}</div>`;
      UI.renderContent(html);
    } catch (err) {
      UI.renderContent(UI.emptyState('⚠️', 'Erreur', err.message));
    }
  },

  async loadProjet() {
    const id = document.getElementById('eval-projet-id')?.value;
    if (!id) return UI.toast('Entrez un ID de projet', 'warning');
    const container = document.getElementById('eval-projet-detail');
    if (!container) return;
    container.innerHTML = UI.loader();
    try {
      const data = await Api.detailProjet(id);
      const p = data.projet;
      container.innerHTML = `
        <div class="card" style="margin-top:16px">
          <div class="card-header"><h3>${p.titre}</h3>${UI.badge(p.statut)}</div>
          <div class="card-body">
            <div class="detail-field"><label>Description</label><p style="color:var(--text-secondary)">${p.description}</p></div>
            <div style="display:flex;gap:24px;margin:16px 0">
              <div class="detail-field"><label>Candidat</label><span>${p.candidat ? `${p.candidat.prenom} ${p.candidat.nom}` : '—'}</span></div>
              <div class="detail-field"><label>Appel</label><span>${p.appel?.titre || '—'}</span></div>
            </div>
            ${p.fichier_pdf ? `<div class="detail-field"><label>Dossier</label><a href="/uploads/${p.fichier_pdf}" target="_blank" class="btn btn-ghost btn-sm">📄 Voir le PDF</a></div>` : ''}
            <hr style="border:none;border-top:1px solid var(--border);margin:20px 0">
            <h4 style="font-size:.9rem;font-weight:600;margin-bottom:16px">Formulaire d'évaluation</h4>
            <form id="eval-form">
              <input type="hidden" id="ef-projet-id" value="${p.id}" />
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Note (0 à 20)</label>
                  <input class="form-input" type="number" id="ef-note" min="0" max="20" step="0.5" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Décision</label>
                  <select class="form-input" id="ef-decision" required>
                    <option value="">Choisir...</option>
                    <option value="accepte">Accepter</option>
                    <option value="rejete">Rejeter</option>
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Commentaire</label>
                <textarea class="form-input" id="ef-commentaire" required placeholder="Votre analyse du projet..."></textarea>
              </div>
              <button type="submit" class="btn btn-primary">Soumettre l'évaluation</button>
            </form>
          </div>
        </div>
      `;
      document.getElementById('eval-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
          await Api.evaluerProjet({
            projet_id: parseInt(document.getElementById('ef-projet-id').value),
            note: parseFloat(document.getElementById('ef-note').value),
            commentaire: document.getElementById('ef-commentaire').value,
            decision: document.getElementById('ef-decision').value,
          });
          UI.toast('Évaluation soumise avec succès !', 'success');
          container.innerHTML = `<div style="text-align:center;padding:30px;color:var(--success)"><strong>✓ Évaluation enregistrée</strong></div>`;
        } catch (err) {
          UI.toast(err.message || 'Erreur', 'error');
        }
      });
    } catch (err) {
      container.innerHTML = `<p style="color:var(--danger);margin-top:12px">${err.message || 'Projet introuvable'}</p>`;
    }
  },

  async loadEvaluation() {
    const id = document.getElementById('eval-detail-id')?.value;
    if (!id) return UI.toast('Entrez un ID', 'warning');
    const container = document.getElementById('eval-detail-view');
    if (!container) return;
    container.innerHTML = UI.loader();
    try {
      const data = await Api.detailEvaluation(id);
      const e = data.data;
      container.innerHTML = `
        <div class="card" style="margin-top:16px">
          <div class="card-body">
            <div style="display:flex;gap:24px;flex-wrap:wrap">
              <div class="detail-field"><label>Note</label><span style="font-size:1.3rem;font-weight:700;color:var(--primary)">${e.note}/20</span></div>
              <div class="detail-field"><label>Décision</label>${UI.badge(e.decision)}</div>
              <div class="detail-field"><label>Date</label><span>${UI.formatDate(e.date_evaluation)}</span></div>
              ${e.evaluateur ? `<div class="detail-field"><label>Évaluateur</label><span>${e.evaluateur.prenom} ${e.evaluateur.nom}</span></div>` : ''}
            </div>
            <div class="detail-field" style="margin-top:16px"><label>Commentaire</label><p style="color:var(--text-secondary);line-height:1.7">${e.commentaire}</p></div>
          </div>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<p style="color:var(--danger);margin-top:12px">${err.message || 'Évaluation introuvable'}</p>`;
    }
  }
};

window.EvaluateurPages = EvaluateurPages;
