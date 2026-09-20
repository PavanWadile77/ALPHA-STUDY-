import { auth, db, onAuthStateChanged, collection, query, where, onSnapshot } from './firebase-config.js';
import { getGroupsForYear, getYearLabel, isValidYearGroup } from './year-group-config.js';
import { safeMaterialURL, subjectKey } from './material-utils.js';
import { connectMaterialLinks } from './supabase-storage.js';

connectMaterialLinks();

const host = document.querySelector('[data-materials-view]') || document.querySelector('[data-materials-year]');
if (host) {
  let year = host.dataset.materialsYear || '';
  const fixedGroup = host.dataset.materialsGroup || '';
  const subject = host.dataset.materialsSubject || '';
  const fixedCategory = host.dataset.materialsCategory || '';
  let stop = () => {}, user = null, generation = 0, records = [];
  
  host.innerHTML = `
    <div class="materials-header">
      <div class="materials-header-text">
        <h2>Study Materials</h2>
        <p>Browse notes, question papers, and resources for your year and group.</p>
      </div>
      <div class="materials-status" role="status" aria-live="polite">Sign in to view materials.</div>
    </div>
    <div class="materials-controls">
      <label class="materials-year-label" style="display: ${year ? 'none' : 'block'}">
        <span class="sr-only">Year</span>
        <select class="materials-year-select" aria-label="Year">
            <option value="" disabled selected>Select Year...</option>
            <option value="year-1">1st Year</option>
            <option value="year-2">2nd Year</option>
            <option value="year-3">3rd Year</option>
            <option value="year-4">4th Year</option>
        </select>
      </label>
      <label class="materials-group-label">
        <span class="sr-only">Group / Branch</span>
        <select class="materials-group-select" aria-label="Group / Branch"></select>
      </label>
      <div class="materials-search">
        <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input type="search" class="materials-search-input" placeholder="Search by title or subject..." aria-label="Search uploaded materials" />
      </div>
    </div>
    <div class="materials-grid" role="list"></div>
  `;
  
  const statusEl = host.querySelector('.materials-status');
  const groupSelect = host.querySelector('.materials-group-select');
  const searchInput = host.querySelector('.materials-search-input');
  const gridEl = host.querySelector('.materials-grid');
  
  const initialFilter = new URLSearchParams(window.location.search).get('filter');
  if (initialFilter) {
      searchInput.value = initialFilter;
  }
  
  const yearSelect = host.querySelector('.materials-year-select');

  const populateGroups = (y) => {
      groupSelect.innerHTML = '';
      if (!y) return;
      for (const group of getGroupsForYear(y)) {
          const o = document.createElement('option');
          o.value = group.id;
          o.textContent = group.label;
          groupSelect.appendChild(o);
      }
  };

  populateGroups(year);
  if (yearSelect) yearSelect.value = year || '';

  if (yearSelect) {
      yearSelect.addEventListener('change', () => {
          year = yearSelect.value;
          populateGroups(year);
          subscribe();
      });
  }
  
  if (fixedGroup && isValidYearGroup(year, fixedGroup)) {
      groupSelect.value = fixedGroup;
      groupSelect.disabled = true;
  } else if (year === 'year-1') {
      groupSelect.value = localStorage.getItem('dbatu_group') === 'B' ? 'group-b' : 'group-a';
  }
  
  const formatBytes = (bytes) => {
      if (!bytes) return '';
      const k = 1024, sizes = ['B', 'KB', 'MB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };
  
  const formatDate = (seconds) => {
      if (!seconds) return '';
      return new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(seconds * 1000));
  };
  
  const render = () => {
      const needle = searchInput.value.toLowerCase().trim();
      const matches = records.filter(m => {
          const matchCategory = !fixedCategory || m.type === fixedCategory;
          const matchSubject = (!subject || subjectKey(m.subject) === subjectKey(subject) || subjectKey(m.subjectId) === subjectKey(subject));
          const matchSearch = [m.title, m.subject, m.description, m.type].join(' ').toLowerCase().includes(needle);
          return matchCategory && matchSubject && matchSearch;
      });
      
      if (!user) {
         statusEl.textContent = 'Sign in to view materials.';
         gridEl.innerHTML = '';
         return;
      }
      
      statusEl.textContent = `${getYearLabel(year)} · ${matches.length} material${matches.length === 1 ? '' : 's'}`;
      
      if (matches.length === 0) {
          if (records.length === 0) {
             gridEl.innerHTML = `<div class="materials-empty">No materials uploaded for this group yet.</div>`;
          } else {
             gridEl.innerHTML = `<div class="materials-empty">
                 <p>No materials match your search.</p>
                 <button class="btn-clear-search">Clear Search</button>
             </div>`;
             gridEl.querySelector('.btn-clear-search').addEventListener('click', () => {
                 searchInput.value = '';
                 render();
             });
          }
          return;
      }
      
      gridEl.innerHTML = matches.map(m => {
          const url = safeMaterialURL(m.downloadURL);
          const size = formatBytes(m.sizeBytes);
          const date = formatDate(m.createdAt?.seconds);
          
          return `
          <article class="material-card" role="listitem">
              <div class="material-card-body">
                  <div class="material-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  </div>
                  <div class="material-content">
                      <div class="material-badges">
                          ${m.semester ? `<span class="badge badge-sem">${m.semester.replace('sem-', 'Sem ')}</span>` : ''}
                          ${m.type ? `<span class="badge badge-type">${m.type}</span>` : ''}
                      </div>
                      <h3>${m.title || 'Untitled material'}</h3>
                      <p class="material-subject">${m.subject || ''}</p>
                      ${m.description ? `<p class="material-desc">${m.description}</p>` : ''}
                      ${(size || date) ? `
                      <div class="material-meta">
                          ${size ? `<span class="meta-item">${size}</span>` : ''}
                          ${(size && date) ? `<span class="meta-dot">&middot;</span>` : ''}
                          ${date ? `<span class="meta-item">${date}</span>` : ''}
                      </div>` : ''}
                  </div>
              </div>
              <div class="material-actions">
                  ${url ? `
                  <a href="${url}" class="btn-primary" target="_blank" rel="noopener noreferrer">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                      <span>View / Download</span>
                  </a>` : `
                  <span class="btn-disabled">Unavailable</span>
                  `}
              </div>
          </article>
          `;
      }).join('');
  };

  const subscribe = () => {
      stop();
      const thisGeneration = ++generation;
      records = [];
      
      if (!user) {
          render();
          return;
      }
      
      if (!isValidYearGroup(year, groupSelect.value)) {
          statusEl.textContent = 'Select a valid group.';
          gridEl.innerHTML = '';
          return;
      }
      
      gridEl.innerHTML = `<div class="materials-loading">
          <svg class="spinner" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
          Loading materials…
      </div>`;
      statusEl.textContent = 'Loading…';
      
      const q = query(collection(db, 'materials'), where('yearId', '==', year), where('groupId', '==', groupSelect.value), where('published', '==', true));
      
      stop = onSnapshot(q, snap => {
          if (thisGeneration !== generation) return;
          records = snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
          render();
      }, error => {
          if (thisGeneration !== generation) return;
          records = [];
          gridEl.innerHTML = `
              <div class="materials-error">
                  <p>Could not load materials.</p>
                  <button class="btn-retry">Retry</button>
              </div>`;
          gridEl.querySelector('.btn-retry').addEventListener('click', subscribe);
          statusEl.textContent = 'Error loading materials.';
          console.error('Materials read failed:', error.code);
      });
  };

  groupSelect.addEventListener('change', subscribe);
  searchInput.addEventListener('input', render);
  
  const unsubscribeAuth = onAuthStateChanged(auth, u => {
      user = u;
      if (!u) {
          stop();
          records = [];
          location.replace('login.html');
          return;
      }
      subscribe();
  });
  
  window.addEventListener('pagehide', () => { stop(); unsubscribeAuth(); }, { once: true });
  
  // Follow the original first-year group buttons without changing their design.
  document.getElementById('group-selector')?.addEventListener('click', () => queueMicrotask(() => {
      groupSelect.value = localStorage.getItem('dbatu_group') === 'B' ? 'group-b' : 'group-a';
      subscribe();
  }));
}
