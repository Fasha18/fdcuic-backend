// ── Candidat Pages ──
const CandidatPages = {
  async dashboard() {
    UI.setActiveNav('/dashboard');
    UI.renderContent(UI.loader());
    try {
      const [projetsRes, mobRes, notifRes, appelsRes, dossiersRes] = await Promise.allSettled([
        Api.mesProjets(), Api.mesMobilites(), Api.mesNotifications(), Api.listerAppels(), Api.mesDossiers()
      ]);
      const projets = projetsRes.status === 'fulfilled' ? (projetsRes.value.projets || []) : [];
      const mobilites = mobRes.status === 'fulfilled' ? (mobRes.value.projets || []) : [];
      const notifs = notifRes.status === 'fulfilled' ? (notifRes.value.data || []) : [];
      const appels = appelsRes.status === 'fulfilled' ? (appelsRes.value.appels || []) : [];
      const dossiers = dossiersRes.status === 'fulfilled' ? (dossiersRes.value.dossiers || []) : [];
      const unread = notifs.filter(n => !n.lu).length;
      const user = Api.getUser();

      let html = UI.pageHeader(`${UI.greeting()}, ${user?.prenom || 'Candidat'}`, 'Voici un aperçu de votre activité');
      html += `<div class="stats-grid">
        ${UI.statCard('📋', 'Projets soumis', projets.length)}
        ${UI.statCard('📑', 'Dossiers', dossiers.length, 'accent-warning')}
        ${UI.statCard('✈️', 'Dossiers mobilité', mobilites.length, 'accent-success')}
        ${UI.statCard('🔔', 'Notifications', unread, 'accent-danger')}
      </div>`;

      // Recent appels
      html += UI.card('Appels à projets ouverts', appels.length === 0
        ? UI.emptyState('📢', 'Aucun appel ouvert', 'Les prochains appels apparaîtront ici.')
        : `<div class="table-wrap"><table><thead><tr><th>Titre</th><th>Ouverture</th><th>Clôture</th><th>Statut</th><th></th></tr></thead><tbody>
          ${appels.slice(0, 5).map(a => `<tr>
            <td><strong>${a.titre}</strong></td>
            <td>${UI.formatDate(a.date_debut)}</td>
            <td>${UI.formatDate(a.date_fin)}</td>
            <td>${UI.badge(a.statut)}</td>
            <td><a href="#/appels/${a.id}" class="btn btn-ghost btn-sm">Voir</a></td>
          </tr>`).join('')}</tbody></table></div>`,
        appels.length > 5 ? `<a href="#/appels" class="btn btn-ghost btn-sm">Voir tous</a>` : ''
      );

      // Recent projets
      html += `<div class="mt-md">${UI.card('Mes projets récents', projets.length === 0
        ? UI.emptyState('📁', 'Aucun projet', 'Soumettez votre premier projet via un appel ouvert.')
        : `<div class="table-wrap"><table><thead><tr><th>Titre</th><th>Appel</th><th>Soumission</th><th>Statut</th></tr></thead><tbody>
          ${projets.slice(0, 5).map(p => `<tr>
            <td><strong>${p.titre}</strong></td>
            <td>${p.appel?.titre || '—'}</td>
            <td>${UI.formatDate(p.date_soumission)}</td>
            <td>${UI.badge(p.statut)}</td>
          </tr>`).join('')}</tbody></table></div>`
      )}</div>`;

      UI.renderContent(html);
    } catch (err) {
      UI.renderContent(UI.emptyState('⚠️', 'Erreur de chargement', err.message));
    }
  },

  async appels() {
    UI.setActiveNav('/appels');
    UI.renderContent(UI.loader());
    try {
      const data = await Api.listerAppels();
      const appels = data.appels || [];
      let html = UI.pageHeader('Appels à Projets', `${appels.length} appel(s) ouvert(s)`);
      if (appels.length === 0) {
        html += `<div class="card"><div class="card-body">${UI.emptyState('📢', 'Aucun appel disponible', 'Les prochains appels à projets seront affichés ici.')}</div></div>`;
      } else {
        html += appels.map(a => `<div class="card mb-md">
          <div class="card-header"><h3>${a.titre}</h3>${UI.badge(a.statut)}</div>
          <div class="card-body">
            <p style="margin-bottom:12px;color:var(--text-secondary);font-size:.88rem;">${(a.description || '').substring(0, 200)}${(a.description || '').length > 200 ? '...' : ''}</p>
            <div style="display:flex;gap:24px;flex-wrap:wrap;margin-bottom:16px;">
              <div class="detail-field"><label>Ouverture</label><span>${UI.formatDate(a.date_debut)}</span></div>
              <div class="detail-field"><label>Clôture</label><span>${UI.formatDate(a.date_fin)}</span></div>
            </div>
            ${a.criteres ? `<div class="detail-field"><label>Critères</label><span style="font-size:.85rem;color:var(--text-secondary)">${a.criteres}</span></div>` : ''}
            <a href="#/appels/${a.id}" class="btn btn-primary btn-sm">Voir les détails</a>
          </div>
        </div>`).join('');
      }
      UI.renderContent(html);
    } catch (err) {
      UI.renderContent(UI.emptyState('⚠️', 'Erreur', err.message));
    }
  },

  async appelDetail(params) {
    UI.renderContent(UI.loader());
    try {
      const data = await Api.detailAppel(params.id);
      const a = data.appel;
      let html = UI.pageHeader(a.titre, '', `<a href="#/appels" class="btn btn-secondary btn-sm">← Retour</a>`);
      html += `<div class="detail-grid"><div>
        <div class="card"><div class="card-body">
          <div class="detail-section"><h4>Description</h4><p style="line-height:1.8;color:var(--text-secondary)">${a.description}</p></div>
          ${a.criteres ? `<div class="detail-section"><h4>Critères d'éligibilité</h4><p style="line-height:1.8;color:var(--text-secondary)">${a.criteres}</p></div>` : ''}
        </div></div>
      </div><div>
        <div class="card mb-md"><div class="card-body">
          ${UI.infoRow('Statut', UI.badge(a.statut))}
          ${UI.infoRow('Date d\'ouverture', UI.formatDate(a.date_debut))}
          ${UI.infoRow('Date de clôture', UI.formatDate(a.date_fin))}
        </div></div>
        ${a.statut === 'ouvert' ? `<div style="display:flex;flex-direction:column;gap:10px">
          <button class="btn btn-primary" style="width:100%" onclick="CandidatPages.showSubmitModal(${a.id})">📋 Soumettre un projet rapide</button>
          <button class="btn btn-ghost" style="width:100%" onclick="CandidatPages.startDossier(${a.id})">📑 Déposer un dossier complet</button>
        </div>` : ''}
      </div></div>`;
      // Submit project modal
      html += UI.modal('submit-projet-modal', 'Soumettre un projet', `
        <form id="submit-projet-form">
          <input type="hidden" id="sp-appel-id" value="${a.id}" />
          <div class="form-group"><label class="form-label">Titre du projet</label><input class="form-input" id="sp-titre" required placeholder="Titre de votre projet" /></div>
          <div class="form-group"><label class="form-label">Description</label><textarea class="form-input" id="sp-desc" required placeholder="Décrivez votre projet..."></textarea></div>
          <div class="form-group"><label class="form-label">Dossier PDF</label><input class="form-input" type="file" id="sp-pdf" accept=".pdf" required /><p class="form-hint">PDF uniquement, 15 Mo max</p></div>
          <button type="submit" class="btn btn-primary" style="width:100%">Soumettre le projet</button>
        </form>
      `);
      UI.renderContent(html);
    } catch (err) {
      UI.renderContent(UI.emptyState('⚠️', 'Erreur', err.message));
    }
  },

  showSubmitModal(appelId) {
    UI.showModal('submit-projet-modal');
    const form = document.getElementById('submit-projet-form');
    if (form && !form.dataset.bound) {
      form.dataset.bound = 'true';
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData();
        fd.append('titre', document.getElementById('sp-titre').value);
        fd.append('description', document.getElementById('sp-desc').value);
        fd.append('appel_id', document.getElementById('sp-appel-id').value);
        fd.append('fichier_pdf', document.getElementById('sp-pdf').files[0]);
        try {
          await Api.soumettreProjet(fd);
          UI.hideModal('submit-projet-modal');
          UI.toast('Projet soumis avec succès !', 'success');
          Router.navigate('/mes-projets');
        } catch (err) {
          UI.toast(err.message || 'Erreur de soumission', 'error');
        }
      });
    }
  },

  async mesProjets() {
    UI.setActiveNav('/mes-projets');
    UI.renderContent(UI.loader());
    try {
      const data = await Api.mesProjets();
      const projets = data.projets || [];
      let html = UI.pageHeader('Mes Projets', `${projets.length} projet(s) soumis`);
      html += `<div class="card">${projets.length === 0
        ? `<div class="card-body">${UI.emptyState('📁', 'Aucun projet soumis', 'Consultez les appels ouverts pour soumettre votre premier projet.', '<a href="#/appels" class="btn btn-primary">Voir les appels</a>')}</div>`
        : `<div class="card-body" style="padding:0">${UI.table(
            ['Titre', 'Appel', 'Date', 'Statut'],
            projets.map(p => [
              `<strong>${p.titre}</strong>`,
              p.appel?.titre || '—',
              UI.formatDate(p.date_soumission),
              UI.badge(p.statut)
            ])
          )}</div>`
      }</div>`;
      UI.renderContent(html);
    } catch (err) {
      UI.renderContent(UI.emptyState('⚠️', 'Erreur', err.message));
    }
  },

  // ── Mobilité wizard ──
  mobiliteState: { projetId: null, step: 0 },

  // Word limit config per field
  wordLimits: {
    'm-presentation': 500, 'm-opportunite': 300, 'm-pertinence': 300,
    'm-obj-gen': 500, 'm-obj-spec': 500,
    'm-programme': 1000, 'm-activites': 500, 'm-resultats': 500, 'm-impacts': 500,
  },

  countWords(text) {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  },

  // Creates a textarea with word counter
  textareaWithCounter(id, label, placeholder, required, limit) {
    const req = required ? '<span class="required">*</span>' : '';
    return `<div class="form-group">
      <label class="form-label">${label}${req}</label>
      <div class="textarea-wrap">
        <textarea class="form-input" id="${id}" placeholder="${placeholder}" ${required ? 'required' : ''} data-limit="${limit}"></textarea>
        <div class="word-counter">
          <span class="count" id="${id}-count">0 / ${limit} mots</span>
          <div class="limit-bar"><div class="limit-fill" id="${id}-bar" style="width:0%"></div></div>
        </div>
      </div>
    </div>`;
  },

  // Attach word counters after render
  attachWordCounters() {
    Object.entries(this.wordLimits).forEach(([id, limit]) => {
      const el = document.getElementById(id);
      if (!el) return;
      const update = () => {
        const count = this.countWords(el.value);
        const pct = Math.min((count / limit) * 100, 100);
        const countEl = document.getElementById(`${id}-count`);
        const barEl = document.getElementById(`${id}-bar`);
        if (countEl) {
          countEl.textContent = `${count} / ${limit} mots`;
          countEl.className = count > limit ? 'count over' : 'count';
        }
        if (barEl) {
          barEl.style.width = pct + '%';
          barEl.className = count > limit ? 'limit-fill over' : count > limit * 0.8 ? 'limit-fill warning' : 'limit-fill';
        }
      };
      el.addEventListener('input', update);
      update();
    });
  },

  // Country select HTML with cascading region
  countryRegionSelects() {
    const countries = GeoData.getCountries();
    const options = countries.map(c => `<option value="${c}">${c}</option>`).join('');
    return `<div class="form-row">
      <div class="form-group">
        <label class="form-label">Pays de destination<span class="required">*</span></label>
        <select class="form-input" id="m-pays" required>
          <option value="">— Sélectionnez un pays —</option>
          ${options}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Région<span class="required">*</span></label>
        <select class="form-input" id="m-region" required disabled>
          <option value="">— Choisissez d'abord un pays —</option>
        </select>
      </div>
    </div>`;
  },

  // Attach cascading region logic
  attachCountryRegion() {
    const paysEl = document.getElementById('m-pays');
    const regionEl = document.getElementById('m-region');
    if (!paysEl || !regionEl) return;
    paysEl.addEventListener('change', () => {
      const country = paysEl.value;
      regionEl.innerHTML = '';
      if (!country) {
        regionEl.disabled = true;
        regionEl.innerHTML = '<option value="">— Choisissez d\'abord un pays —</option>';
        return;
      }
      const regions = GeoData.getRegions(country);
      regionEl.disabled = false;
      regionEl.innerHTML = `<option value="">— Sélectionnez une région —</option>` +
        regions.map(r => `<option value="${r}">${r}</option>`).join('');
    });
  },

  // Validate a step before proceeding
  validateStep(step) {
    let valid = true;
    let firstInvalid = null;

    const check = (id, required = true) => {
      const el = document.getElementById(id);
      if (!el) return true;
      el.classList.remove('invalid', 'valid');
      const val = el.value?.trim();

      // Required check
      if (required && !val) {
        el.classList.add('invalid');
        if (!firstInvalid) firstInvalid = el;
        valid = false;
        return false;
      }

      // Word limit check for textareas
      const limit = this.wordLimits[id];
      if (limit && val && this.countWords(val) > limit) {
        el.classList.add('invalid');
        if (!firstInvalid) firstInvalid = el;
        valid = false;
        return false;
      }

      if (val) el.classList.add('valid');
      return true;
    };

    if (step === 1) {
      check('m-structure');
      check('m-discipline');
      check('m-depart');
      check('m-arrivee');
      check('m-pays');
      check('m-region');
      // Date logic: arrivée must be after départ
      const dep = document.getElementById('m-depart')?.value;
      const arr = document.getElementById('m-arrivee')?.value;
      if (dep && arr && arr < dep) {
        document.getElementById('m-arrivee')?.classList.add('invalid');
        UI.toast('La date d\'arrivée doit être après la date de départ', 'warning');
        valid = false;
      }
    } else if (step === 2) {
      check('m-presentation');
      check('m-opportunite');
      check('m-pertinence');
      check('m-obj-gen');
      check('m-obj-spec');
    } else if (step === 3) {
      check('m-programme');
      check('m-activites');
      check('m-resultats');
      check('m-impacts');
    } else if (step === 4) {
      // Documents: NINEA and invitation are required
      const ninea = document.getElementById('m-ninea');
      const invitation = document.getElementById('m-invitation');
      if (ninea && !ninea.files[0]) { ninea.classList.add('invalid'); valid = false; if (!firstInvalid) firstInvalid = ninea; }
      if (invitation && !invitation.files[0]) { invitation.classList.add('invalid'); valid = false; if (!firstInvalid) firstInvalid = invitation; }
    }

    if (!valid) {
      UI.toast('Veuillez remplir tous les champs obligatoires avant de continuer.', 'warning');
      firstInvalid?.focus();
      firstInvalid?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return valid;
  },

  async mobilite() {
    UI.setActiveNav('/mobilite');
    UI.renderContent(UI.loader());
    try {
      const data = await Api.mesMobilites();
      const projets = data.projets || [];
      let html = UI.pageHeader('Mobilité Artistique', 'Gérez vos demandes de mobilité',
        `<button class="btn btn-primary" onclick="CandidatPages.startMobilite()">+ Nouvelle demande</button>`);

      if (projets.length > 0) {
        html += `<div class="card"><div class="card-body" style="padding:0">${UI.table(
          ['Structure', 'Destination', 'Étape', 'Statut', 'Actions'],
          projets.map(p => [
            p.nom_structure || '—',
            p.pays_destination || '—',
            `${p.etape_courante || 1}/5`,
            UI.badge(p.statut),
            p.statut === 'brouillon'
              ? `<button class="btn btn-ghost btn-sm" onclick="CandidatPages.resumeMobilite(${p.id}, ${p.etape_courante || 1})">Continuer</button>`
              : `<button class="btn btn-ghost btn-sm" onclick="CandidatPages.viewMobilite(${p.id})">Voir</button>`
          ])
        )}</div></div>`;
      } else {
        html += `<div class="card"><div class="card-body">${UI.emptyState('✈️', 'Aucune demande de mobilité', 'Créez votre première demande de mobilité artistique.', '<button class="btn btn-primary" onclick="CandidatPages.startMobilite()">Commencer</button>')}</div></div>`;
      }
      UI.renderContent(html);
    } catch (err) {
      UI.renderContent(UI.emptyState('⚠️', 'Erreur', err.message));
    }
  },

  startMobilite() { this.mobiliteState = { projetId: null, step: 1 }; this.renderMobiliteStep(); },
  resumeMobilite(id, step) { this.mobiliteState = { projetId: id, step: step || 1 }; this.renderMobiliteStep(); },

  renderMobiliteStep() {
    const s = this.mobiliteState.step;
    const steps = ['Informations', 'Contexte', 'Programme', 'Documents', 'Récapitulatif'];
    let html = UI.pageHeader('Demande de Mobilité', `Étape ${s} sur 5`, `<a href="#/mobilite" class="btn btn-secondary btn-sm">← Retour</a>`);
    html += UI.timeline(steps, s - 1);
    html += `<div class="wizard-content">`;

    if (s === 1) {
      html += `<form id="mob-step-form">
        <div class="form-row">
          <div class="form-group"><label class="form-label">Nom de la structure / artiste<span class="required">*</span></label><input class="form-input" id="m-structure" required placeholder="Ex: Compagnie Djarama" /></div>
          <div class="form-group"><label class="form-label">Discipline artistique<span class="required">*</span></label><input class="form-input" id="m-discipline" required placeholder="Ex: Musique, Danse, Arts visuels..." /></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Date de départ<span class="required">*</span></label><input class="form-input" type="date" id="m-depart" required /></div>
          <div class="form-group"><label class="form-label">Date d'arrivée<span class="required">*</span></label><input class="form-input" type="date" id="m-arrivee" required /></div>
        </div>
        ${this.countryRegionSelects()}
        <p class="form-hint" style="margin-top:-8px">Tous les champs marqués d'un <span class="required">*</span> sont obligatoires.</p>
        <div class="wizard-actions"><span></span><button type="submit" class="btn btn-primary">Suivant →</button></div>
      </form>`;
    } else if (s === 2) {
      html += `<form id="mob-step-form">
        ${this.textareaWithCounter('m-presentation', 'Présentation succincte', 'Qui êtes-vous ? Présentez votre parcours, votre structure...', true, 500)}
        ${this.textareaWithCounter('m-opportunite', 'Opportunité', 'Événement, invitation, partenariat, résidence...', true, 300)}
        ${this.textareaWithCounter('m-pertinence', 'Pertinence', 'Pourquoi cette mobilité maintenant ? Quel est le contexte ?', true, 300)}
        ${this.textareaWithCounter('m-obj-gen', 'Objectifs généraux', 'Quels sont vos objectifs principaux ?', true, 500)}
        ${this.textareaWithCounter('m-obj-spec', 'Objectifs spécifiques', 'Liste des objectifs spécifiques à atteindre...', true, 500)}
        <p class="form-hint">Respectez les limites de mots indiquées pour chaque champ.</p>
        <div class="wizard-actions"><button type="button" class="btn btn-secondary" onclick="CandidatPages.mobiliteState.step=1;CandidatPages.renderMobiliteStep()">← Précédent</button><button type="submit" class="btn btn-primary">Suivant →</button></div>
      </form>`;
    } else if (s === 3) {
      html += `<form id="mob-step-form">
        ${this.textareaWithCounter('m-programme', 'Programme détaillé du séjour', 'Décrivez le déroulement jour par jour ou par grande phase...', true, 1000)}
        ${this.textareaWithCounter('m-activites', 'Activités prévues', 'Ateliers, conférences, rencontres, spectacles...', true, 500)}
        ${this.textareaWithCounter('m-resultats', 'Résultats attendus', 'Livrables, expositions, publications, rencontres...', true, 500)}
        ${this.textareaWithCounter('m-impacts', 'Impacts', 'Impact sur votre pratique, votre public, votre carrière...', true, 500)}
        <div class="wizard-actions"><button type="button" class="btn btn-secondary" onclick="CandidatPages.mobiliteState.step=2;CandidatPages.renderMobiliteStep()">← Précédent</button><button type="submit" class="btn btn-primary">Suivant →</button></div>
      </form>`;
    } else if (s === 4) {
      html += `<form id="mob-step-form" enctype="multipart/form-data">
        <div class="form-group"><label class="form-label">NINEA<span class="required">*</span></label><input class="form-input" type="file" id="m-ninea" accept=".pdf,.jpg,.jpeg,.png" required /><p class="form-hint">Document obligatoire</p></div>
        <div class="form-group"><label class="form-label">Récépissé</label><input class="form-input" type="file" id="m-recepisse" accept=".pdf,.jpg,.jpeg,.png" /></div>
        <div class="form-group"><label class="form-label">Lettre d'invitation<span class="required">*</span></label><input class="form-input" type="file" id="m-invitation" accept=".pdf,.jpg,.jpeg,.png" required /><p class="form-hint">Document obligatoire</p></div>
        <div class="form-group"><label class="form-label">Note de présentation (structure d'accueil)</label><input class="form-input" type="file" id="m-note" accept=".pdf,.jpg,.jpeg,.png" /></div>
        <div class="form-group"><label class="form-label">CV / Portfolio</label><input class="form-input" type="file" id="m-cv" accept=".pdf,.jpg,.jpeg,.png" /></div>
        <p class="form-hint">Formats : PDF, JPG, PNG — 10 Mo max par fichier. Les champs avec <span class="required">*</span> sont obligatoires.</p>
        <div class="wizard-actions"><button type="button" class="btn btn-secondary" onclick="CandidatPages.mobiliteState.step=3;CandidatPages.renderMobiliteStep()">← Précédent</button><button type="submit" class="btn btn-primary">Suivant →</button></div>
      </form>`;
    } else if (s === 5) {
      html += `<div style="text-align:center;padding:20px 0;">
        <div style="font-size:3rem;margin-bottom:12px">📋</div>
        <h3 style="margin-bottom:8px">Récapitulatif</h3>
        <p style="color:var(--text-secondary);margin-bottom:24px">Vérifiez vos informations puis soumettez votre dossier.<br>Une fois soumis, le dossier ne pourra plus être modifié.</p>
        <div class="wizard-actions" style="justify-content:center;border:none;margin:0;padding:0">
          <button class="btn btn-secondary" onclick="CandidatPages.mobiliteState.step=4;CandidatPages.renderMobiliteStep()">← Précédent</button>
          <button class="btn btn-success btn-lg" onclick="CandidatPages.submitMobilite()">✓ Soumettre le dossier</button>
        </div>
      </div>`;
    }
    html += `</div>`;
    UI.renderContent(html);

    // Post-render hooks
    if (s >= 2 && s <= 3) this.attachWordCounters();
    if (s === 1) this.attachCountryRegion();

    // Bind form submit with validation
    const form = document.getElementById('mob-step-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (this.validateStep(s)) {
          this.handleMobiliteStep();
        }
      });
    }
  },

  async handleMobiliteStep() {
    const s = this.mobiliteState.step;
    try {
      if (s === 1) {
        const data = await Api.mobiliteEtape1({
          nom_structure: document.getElementById('m-structure').value,
          discipline: document.getElementById('m-discipline').value,
          date_depart: document.getElementById('m-depart').value,
          date_arrivee: document.getElementById('m-arrivee').value,
          pays_destination: document.getElementById('m-pays').value,
          region_destination: document.getElementById('m-region').value,
        });
        this.mobiliteState.projetId = data.projet_id;
      } else if (s === 2) {
        await Api.mobiliteEtape2(this.mobiliteState.projetId, {
          presentation_succincte: document.getElementById('m-presentation').value,
          opportunite: document.getElementById('m-opportunite').value,
          pertinence: document.getElementById('m-pertinence').value,
          objectifs_generaux: document.getElementById('m-obj-gen').value,
          objectifs_specifiques: document.getElementById('m-obj-spec').value,
        });
      } else if (s === 3) {
        await Api.mobiliteEtape3(this.mobiliteState.projetId, {
          programme_sejour_detaille_du_sejour: document.getElementById('m-programme').value,
          activites_prevues: document.getElementById('m-activites').value,
          resultats_attendus: document.getElementById('m-resultats').value,
          impacts: document.getElementById('m-impacts').value,
        });
      } else if (s === 4) {
        const fd = new FormData();
        const fields = [['doc_ninea','m-ninea'],['doc_recepisse','m-recepisse'],['doc_invitation','m-invitation'],['doc_note_structure','m-note'],['doc_cv_portfolio','m-cv']];
        fields.forEach(([key, id]) => { const f = document.getElementById(id).files[0]; if (f) fd.append(key, f); });
        await Api.mobiliteEtape4(this.mobiliteState.projetId, fd);
      }
      UI.toast(`Étape ${s} enregistrée avec succès !`, 'success');
      this.mobiliteState.step = s + 1;
      this.renderMobiliteStep();
    } catch (err) {
      UI.toast(err.message || 'Erreur', 'error');
    }
  },

  async submitMobilite() {
    try {
      await Api.mobiliteSoumettre(this.mobiliteState.projetId);
      UI.toast('Dossier soumis avec succès !', 'success');
      Router.navigate('/mobilite');
    } catch (err) {
      UI.toast(err.message || 'Erreur — dossier peut-être incomplet', 'error');
    }
  },

  viewMobilite(id) {
    UI.toast('Détails du dossier #' + id, 'info');
  },

  async notifications() {
    UI.setActiveNav('/notifications');
    UI.renderContent(UI.loader());
    try {
      const data = await Api.mesNotifications();
      const notifs = data.data || [];
      const unread = notifs.filter(n => !n.lu).length;
      let html = UI.pageHeader('Notifications', `${unread} non lue(s)`,
        unread > 0 ? `<button class="btn btn-secondary btn-sm" onclick="CandidatPages.markAllRead()">Tout marquer comme lu</button>` : '');
      html += `<div class="card"><div class="notif-list">`;
      if (notifs.length === 0) {
        html += UI.emptyState('🔔', 'Aucune notification', 'Vous serez notifié des mises à jour de vos dossiers.');
      } else {
        notifs.forEach(n => {
          html += `<div class="notif-item ${n.lu ? '' : 'unread'}" onclick="CandidatPages.markRead(${n.id}, this)">
            <div class="notif-dot"></div>
            <div class="notif-content"><p>${n.message}</p><span class="notif-date">${UI.formatDateRelative(n.date_envoi)}</span></div>
          </div>`;
        });
      }
      html += `</div></div>`;
      UI.renderContent(html);
    } catch (err) {
      UI.renderContent(UI.emptyState('⚠️', 'Erreur', err.message));
    }
  },

  async markRead(id, el) {
    try { await Api.marquerLu(id); el?.classList.remove('unread'); } catch (e) { /* ignore */ }
  },

  async markAllRead() {
    try { await Api.toutMarquerLu(); UI.toast('Toutes les notifications marquées comme lues', 'success'); this.notifications(); } catch (e) { UI.toast('Erreur', 'error'); }
  },

  // ── Mes Dossiers (AppelProjet) ──
  async mesDossiers() {
    UI.setActiveNav('/mes-dossiers');
    UI.renderContent(UI.loader());
    try {
      const data = await Api.mesDossiers();
      const dossiers = data.dossiers || [];
      let html = UI.pageHeader('Mes Dossiers', `${dossiers.length} dossier(s)`);
      if (dossiers.length === 0) {
        html += `<div class="card"><div class="card-body">${UI.emptyState('📑', 'Aucun dossier', 'Consultez les appels à projets ouverts pour déposer un dossier.', '<a href="#/appels" class="btn btn-primary">Voir les appels</a>')}</div></div>`;
      } else {
        html += `<div class="card"><div class="card-body" style="padding:0">${UI.table(
          ['Structure', 'Type', 'Appel', 'Étape', 'Statut', ''],
          dossiers.map(d => [
            `<strong>${d.nom_structure || '—'}</strong>`,
            d.type_projet || '—',
            d.appel?.titre || '—',
            `<span style="font-weight:600">${d.etape_courante || 1}</span>/4`,
            UI.badge(d.statut),
            d.statut === 'brouillon'
              ? `<button class="btn btn-ghost btn-sm" onclick="CandidatPages.resumeDossier(${d.id}, ${d.etape_courante || 1}, '${d.type_projet || ''}')">Continuer</button>`
              : ''
          ])
        )}</div></div>`;
      }
      UI.renderContent(html);
    } catch (err) {
      UI.renderContent(UI.emptyState('⚠️', 'Erreur', err.message));
    }
  },

  // ── Dossier Wizard ──
  dossierState: { dossierId: null, appelId: null, step: 0, typeProjet: '' },
  _equipeMembers: [{ poste: '', prenom: '', nom: '', telephone: '' }],

  startDossier(appelId) {
    this.dossierState = { dossierId: null, appelId, step: 1, typeProjet: '' };
    this._equipeMembers = [{ poste: '', prenom: '', nom: '', telephone: '' }];
    this.renderDossierStep();
  },
  resumeDossier(id, step, type) {
    this.dossierState = { dossierId: id, appelId: null, step: Math.min(step + 1, 4), typeProjet: type };
    this.renderDossierStep();
  },

  renderDossierStep() {
    const s = this.dossierState.step;
    const steps = ['Informations', 'Détails & Impacts', 'Documents', 'Soumission'];
    let html = UI.pageHeader('Dossier d\'appel à projet', `Étape ${s} sur 4`,
      `<a href="#/mes-dossiers" class="btn btn-secondary btn-sm">← Retour</a>`);
    html += UI.timeline(steps, s - 1);
    html += `<div class="wizard-content">`;

    if (s === 1) {
      const regions = ['Dakar','Thiès','Diourbel','Fatick','Kaolack','Kaffrine','Saint-Louis','Louga','Matam','Tambacounda','Kédougou','Kolda','Ziguinchor','Sédhiou'];
      html += `<form id="dossier-step-form">
        <div class="form-row">
          <div class="form-group"><label class="form-label">Prénom et nom du porteur<span class="required">*</span></label><input class="form-input" id="d-porteur" required placeholder="Ex: Mamadou Diop" /></div>
          <div class="form-group"><label class="form-label">Nom de la structure<span class="required">*</span></label><input class="form-input" id="d-structure" required placeholder="Ex: Compagnie Djarama" /></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Type de projet<span class="required">*</span></label>
            <select class="form-input" id="d-type" required><option value="">— Sélectionnez —</option>
              <option value="structuration">Structuration</option><option value="formation">Formation</option><option value="evenementiel">Événementiel</option>
            </select></div>
          <div class="form-group"><label class="form-label">Secteur d'activité<span class="required">*</span></label>
            <select class="form-input" id="d-secteur" required><option value="">— Sélectionnez —</option>
              <option value="claque">Claque</option><option value="danse_urbaine">Danse urbaine</option><option value="conception">Conception</option>
              <option value="sport_de_rue">Sport de rue</option><option value="art_vivant">Art vivant</option><option value="mode">Mode</option>
              <option value="hiphop">Hip-hop</option><option value="graffiti">Graffiti</option>
            </select></div>
        </div>
        <div class="form-group"><label class="form-label">Région<span class="required">*</span></label>
          <select class="form-input" id="d-region" required><option value="">— Sélectionnez —</option>
            ${regions.map(r => `<option value="${r}">${r}</option>`).join('')}
          </select></div>
        <div class="form-group"><label class="form-label">Activité de l'entreprise<span class="required">*</span></label>
          <textarea class="form-input" id="d-activite" required placeholder="Décrivez les activités principales..."></textarea></div>
        <div class="form-group"><label class="form-label">Nature du projet<span class="required">*</span></label>
          <textarea class="form-input" id="d-nature" required placeholder="Décrivez la nature de votre projet..."></textarea></div>
        <div class="wizard-actions"><span></span><button type="submit" class="btn btn-primary">Suivant →</button></div>
      </form>`;
    } else if (s === 2) {
      html += `<form id="dossier-step-form">
        <div class="form-row">
          <div class="form-group"><label class="form-label">Phase d'idéation<span class="required">*</span></label>
            <select class="form-input" id="d-ideation" required><option value="">—</option><option value="true">Oui</option><option value="false">Non</option></select></div>
          <div class="form-group"><label class="form-label">Phase d'exécution<span class="required">*</span></label>
            <select class="form-input" id="d-execution" required><option value="">—</option><option value="true">Oui</option><option value="false">Non</option></select></div>
        </div>
        <div class="form-group"><label class="form-label">Objectifs globaux<span class="required">*</span></label>
          <textarea class="form-input" id="d-objectifs" required placeholder="Objectifs globaux du projet..."></textarea></div>
        <div class="form-group"><label class="form-label">Importance pour le territoire<span class="required">*</span></label>
          <textarea class="form-input" id="d-importance" required placeholder="Offre nouvelle, innovante..."></textarea></div>
        <div class="form-group"><label class="form-label">Impacts économiques<span class="required">*</span></label>
          <textarea class="form-input" id="d-impacts" required placeholder="Création d'emplois..."></textarea></div>
        <div class="form-group"><label class="form-label">Potentiel de réussite<span class="required">*</span></label>
          <textarea class="form-input" id="d-potentiel" required placeholder="Potentiel de réussite..."></textarea></div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Localisation<span class="required">*</span></label><input class="form-input" id="d-localisation" required placeholder="Lieu" /></div>
          <div class="form-group"><label class="form-label">Bénéficiaires<span class="required">*</span></label><input class="form-input" id="d-beneficiaires" required placeholder="Public cible" /></div>
        </div>
        <div class="form-group"><label class="form-label">Plan de pérennisation<span class="required">*</span></label>
          <textarea class="form-input" id="d-perennisation" required placeholder="Pérennisation après financement..."></textarea></div>
        <div class="form-group"><label class="form-label">Description du produit / service<span class="required">*</span></label>
          <textarea class="form-input" id="d-produit" required placeholder="Description détaillée..."></textarea></div>
        ${UI.sectionTitle('Équipe du projet (1 à 3 membres)')}
        <div id="d-equipe-list"></div>
        <button type="button" class="btn btn-ghost btn-sm" id="d-add-membre" style="margin-bottom:16px">+ Ajouter un membre</button>
        <div class="wizard-actions">
          <button type="button" class="btn btn-secondary" onclick="CandidatPages.dossierState.step=1;CandidatPages.renderDossierStep()">← Précédent</button>
          <button type="submit" class="btn btn-primary">Suivant →</button>
        </div>
      </form>`;
    } else if (s === 3) {
      const tp = this.dossierState.typeProjet;
      html += `<form id="dossier-step-form" enctype="multipart/form-data">
        <div class="form-group"><label class="form-label">NINEA / Récépissé<span class="required">*</span></label>
          <input class="form-input" type="file" id="d-ninea" accept=".pdf,.jpg,.jpeg,.png" required /></div>
        <div class="form-group"><label class="form-label">CNI / Passeport<span class="required">*</span></label>
          <input class="form-input" type="file" id="d-cni" accept=".pdf,.jpg,.jpeg,.png" required /></div>
        <div class="form-group"><label class="form-label">Plan d'action</label>
          <input class="form-input" type="file" id="d-plan" accept=".pdf,.jpg,.jpeg,.png" /></div>
        <div class="form-group"><label class="form-label">Photo / Prototype</label>
          <input class="form-input" type="file" id="d-photo" accept=".pdf,.jpg,.jpeg,.png" /></div>
        ${tp === 'formation' || tp === 'evenementiel' ? `<div class="form-group"><label class="form-label">Budget</label><input class="form-input" type="file" id="d-budget" accept=".pdf,.jpg,.jpeg,.png" /></div>` : ''}
        ${tp === 'structuration' ? `<div class="form-group"><label class="form-label">Analyse financière</label><input class="form-input" type="file" id="d-finance" accept=".pdf,.jpg,.jpeg,.png" /></div>
        <div class="form-group"><label class="form-label">Business Model Canvas</label><input class="form-input" type="file" id="d-bmc" accept=".pdf,.jpg,.jpeg,.png" /></div>` : ''}
        <div class="wizard-actions">
          <button type="button" class="btn btn-secondary" onclick="CandidatPages.dossierState.step=2;CandidatPages.renderDossierStep()">← Précédent</button>
          <button type="submit" class="btn btn-primary">Suivant →</button>
        </div>
      </form>`;
    } else if (s === 4) {
      html += `<div style="text-align:center;padding:24px 0">
        <div style="font-size:3rem;margin-bottom:12px">📋</div>
        <h3 style="margin-bottom:8px;font-family:'Outfit',sans-serif">Récapitulatif</h3>
        <p style="color:var(--text-secondary);margin-bottom:24px">Vérifiez puis soumettez votre dossier. Il ne pourra plus être modifié.</p>
        <div class="wizard-actions" style="justify-content:center;border:none;margin:0;padding:0">
          <button class="btn btn-secondary" onclick="CandidatPages.dossierState.step=3;CandidatPages.renderDossierStep()">← Précédent</button>
          <button class="btn btn-success btn-lg" onclick="CandidatPages.submitDossier()">✓ Soumettre le dossier</button>
        </div>
      </div>`;
    }
    html += `</div>`;
    UI.renderContent(html);
    if (s === 2) this._initEquipeForm();
    const form = document.getElementById('dossier-step-form');
    if (form) form.addEventListener('submit', (e) => { e.preventDefault(); this.handleDossierStep(); });
  },

  _initEquipeForm() {
    this._renderEquipeList();
    document.getElementById('d-add-membre')?.addEventListener('click', () => {
      if (this._equipeMembers.length >= 3) return UI.toast('3 membres maximum', 'warning');
      this._equipeMembers.push({ poste: '', prenom: '', nom: '', telephone: '' });
      this._renderEquipeList();
    });
  },
  _renderEquipeList() {
    const c = document.getElementById('d-equipe-list');
    if (!c) return;
    c.innerHTML = this._equipeMembers.map((m, i) => `
      <div class="card mb-md" style="border-left:3px solid var(--primary-light)"><div class="card-body" style="padding:14px 18px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
          <span style="font-size:.82rem;font-weight:600;color:var(--primary)">Membre ${i+1}</span>
          ${i > 0 ? `<button type="button" class="btn btn-danger btn-sm" onclick="CandidatPages._removeEquipeMember(${i})">Retirer</button>` : ''}
        </div>
        <div class="form-row"><div class="form-group mb-0"><input class="form-input eq-f" data-i="${i}" data-k="poste" value="${m.poste}" placeholder="Poste *"/></div>
          <div class="form-group mb-0"><input class="form-input eq-f" data-i="${i}" data-k="telephone" value="${m.telephone}" placeholder="Téléphone *"/></div></div>
        <div class="form-row" style="margin-top:10px"><div class="form-group mb-0"><input class="form-input eq-f" data-i="${i}" data-k="prenom" value="${m.prenom}" placeholder="Prénom *"/></div>
          <div class="form-group mb-0"><input class="form-input eq-f" data-i="${i}" data-k="nom" value="${m.nom}" placeholder="Nom *"/></div></div>
      </div></div>`).join('');
    c.querySelectorAll('.eq-f').forEach(el => el.addEventListener('input', () => { this._equipeMembers[el.dataset.i][el.dataset.k] = el.value; }));
  },
  _removeEquipeMember(i) { this._equipeMembers.splice(i, 1); this._renderEquipeList(); },

  async handleDossierStep() {
    const s = this.dossierState.step;
    try {
      if (s === 1) {
        const data = await Api.dossierEtape1({
          appel_id: this.dossierState.appelId,
          prenom_nom_porteur: document.getElementById('d-porteur').value,
          nom_structure: document.getElementById('d-structure').value,
          type_projet: document.getElementById('d-type').value,
          secteur_activite: document.getElementById('d-secteur').value,
          region: document.getElementById('d-region').value,
          activite_entreprise: document.getElementById('d-activite').value,
          nature_projet: document.getElementById('d-nature').value,
        });
        this.dossierState.dossierId = data.dossier_id;
        this.dossierState.typeProjet = document.getElementById('d-type').value;
      } else if (s === 2) {
        await Api.dossierEtape2(this.dossierState.dossierId, {
          phase_ideation: document.getElementById('d-ideation').value === 'true',
          phase_execution: document.getElementById('d-execution').value === 'true',
          objectifs_globaux: document.getElementById('d-objectifs').value,
          importance_territoire: document.getElementById('d-importance').value,
          impacts_economiques: document.getElementById('d-impacts').value,
          potentiel_reussite: document.getElementById('d-potentiel').value,
          localisation: document.getElementById('d-localisation').value,
          beneficiaires: document.getElementById('d-beneficiaires').value,
          plan_perennisation: document.getElementById('d-perennisation').value,
          description_produit: document.getElementById('d-produit').value,
          equipe: this._equipeMembers,
        });
      } else if (s === 3) {
        const fd = new FormData();
        [['doc_ninea_recepisse','d-ninea'],['doc_cni_passeport','d-cni'],['doc_plan_action','d-plan'],['doc_photo_prototype','d-photo'],
         ['doc_budget','d-budget'],['doc_analyse_financiere','d-finance'],['doc_business_model','d-bmc']
        ].forEach(([k,id]) => { const el = document.getElementById(id); if (el?.files[0]) fd.append(k, el.files[0]); });
        await Api.dossierEtape3(this.dossierState.dossierId, fd);
      }
      UI.toast(`Étape ${s} enregistrée !`, 'success');
      this.dossierState.step = s + 1;
      this.renderDossierStep();
    } catch (err) { UI.toast(err.message || 'Erreur', 'error'); }
  },

  async submitDossier() {
    try {
      await Api.dossierSoumettre(this.dossierState.dossierId);
      UI.toast('Dossier soumis avec succès !', 'success');
      Router.navigate('/mes-dossiers');
    } catch (err) { UI.toast(err.message || 'Dossier incomplet', 'error'); }
  }
};

window.CandidatPages = CandidatPages;

