// static/js/script.js
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('backup-cards-container');
    // Filter-Container einfügen, falls nicht vorhanden
    let filterBar = document.getElementById('backup-filter-bar');
    if (!filterBar) {
        filterBar = document.createElement('div');
        filterBar.id = 'backup-filter-bar';
        filterBar.style.display = 'flex';
        filterBar.style.gap = '1rem';
        filterBar.style.marginBottom = '1.5rem';
        container.parentNode.insertBefore(filterBar, container);
    }

    let allBackups = [];
    let filterValues = { source_host: '', database_type: '', status: '', created_at: '' };

    function createDropdown(id, label, options) {
        const select = document.createElement('select');
        select.id = id;
        select.innerHTML = `<option value="">Alle ${label}</option>` +
            options.map(opt => `<option value="${opt}">${opt}</option>`).join('');
        select.style.padding = '0.3rem 0.7rem';
        select.style.borderRadius = '6px';
        select.style.border = '1px solid #ccc';
        select.style.background = '#fff';
        select.style.fontSize = '1rem';
        select.style.cursor = 'pointer';
        return select;
    }

    function createDateIntervalDropdown() {
        const select = document.createElement('select');
        select.id = 'filter-created-at';
        select.innerHTML = `
            <option value="">Alle Zeiträume</option>
            <option value="1h">Letzte Stunde</option>
            <option value="12h">Letzte 12 Stunden</option>
            <option value="1d">Letzter Tag</option>
            <option value="1w">Letzte Woche</option>
            <option value="1m">Letzter Monat</option>
        `;
        select.style.padding = '0.3rem 0.7rem';
        select.style.borderRadius = '6px';
        select.style.border = '1px solid #ccc';
        select.style.background = '#fff';
        select.style.fontSize = '1rem';
        select.style.cursor = 'pointer';
        return select;
    }

    function updateFilterBar(backups) {
        // Einzigartige Werte extrahieren
        const sourceHosts = [...new Set(backups.map(b => b.source_host).filter(Boolean))].sort();
        const dbTypes = [...new Set(backups.map(b => b.database_type).filter(Boolean))].sort();
        const statuses = [...new Set(backups.map(b => b.status).filter(Boolean))].sort();

        // Merke aktuelle Auswahl
        const prevSource = filterValues.source_host;
        const prevDbType = filterValues.database_type;
        const prevStatus = filterValues.status;
        const prevCreatedAt = filterValues.created_at;

        filterBar.innerHTML = '';
         // DB Type Dropdown
        const dbTypeSelect = createDropdown('filter-db-type', 'Datenbanktypen', dbTypes);
        dbTypeSelect.value = prevDbType;
        dbTypeSelect.onchange = e => {
            filterValues.database_type = e.target.value;
            renderBackups();
        };
        filterBar.appendChild(dbTypeSelect);
        // Source Host Dropdown
        const sourceHostSelect = createDropdown('filter-source-host', 'Quellen', sourceHosts);
        sourceHostSelect.value = prevSource;
        sourceHostSelect.onchange = e => {
            filterValues.source_host = e.target.value;
            renderBackups();
        };
        filterBar.appendChild(sourceHostSelect);
        // Status Dropdown
        const statusSelect = createDropdown('filter-status', 'Status', statuses);
        statusSelect.value = prevStatus;
        statusSelect.onchange = e => {
            filterValues.status = e.target.value;
            renderBackups();
        };
        filterBar.appendChild(statusSelect);
        // Created At Intervall Dropdown
        const createdAtSelect = createDateIntervalDropdown();
        createdAtSelect.value = prevCreatedAt;
        createdAtSelect.onchange = e => {
            filterValues.created_at = e.target.value;
            renderBackups();
        };
        filterBar.appendChild(createdAtSelect);
        // Reset Button
        const resetBtn = document.createElement('button');
        resetBtn.textContent = 'Filter zurücksetzen';
        resetBtn.style.padding = '0.3rem 1.2rem';
        resetBtn.style.borderRadius = '6px';
        resetBtn.style.border = '1px solid #bbb';
        resetBtn.style.background = '#f3f3f3';
        resetBtn.style.fontSize = '1rem';
        resetBtn.style.cursor = 'pointer';
        resetBtn.onclick = () => {
            filterValues = { source_host: '', database_type: '', status: '', created_at: '' };
            updateFilterBar(backups);
            renderBackups();
        };
        filterBar.appendChild(resetBtn);
    }

    function renderBackups() {
        let filtered = allBackups;
        if (filterValues.source_host) {
            filtered = filtered.filter(b => b.source_host === filterValues.source_host);
        }
        if (filterValues.database_type) {
            filtered = filtered.filter(b => b.database_type === filterValues.database_type);
        }
        if (filterValues.status) {
            filtered = filtered.filter(b => b.status === filterValues.status);
        }
        if (filterValues.created_at) {
            const now = new Date();
            let minDate = null;
            switch (filterValues.created_at) {
                case '1h':
                    minDate = new Date(now.getTime() - 60 * 60 * 1000); break;
                case '12h':
                    minDate = new Date(now.getTime() - 12 * 60 * 60 * 1000); break;
                case '1d':
                    minDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); break;
                case '1w':
                    minDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break;
                case '1m':
                    minDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); break;
            }
            if (minDate) {
                filtered = filtered.filter(b => {
                    const created = new Date(b.created_at);
                    return created >= minDate && created <= now;
                });
            }
        }

        container.innerHTML = '';
        if (filtered.length === 0) {
            container.innerHTML = '<p>Keine Backups gefunden.</p>';
            return;
        }
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        filtered.forEach(backup => {
            const createdAt = new Date(backup.created_at).toLocaleString('de-DE');
            const statusClass = (backup.status ? backup.status.toLowerCase() : 'unknown');
            const cardHtml = `
                <div class="card">
                    <div class="card-header">
                        <h2>${backup.source_host}</h2>
                        <p>Datenbank: ${backup.database_type} | Level: ${backup.backup_level}</p>
                    </div>
                    <div class="card-body">
                        <p><strong>Größe:</strong> ${backup.size_mb.toFixed(2)} MB</p>
                        <p><strong>Dauer:</strong> ${backup.duration_sec.toFixed(2)} s</p>
                        <p><strong>Programm:</strong> ${backup.program || 'N/A'}</p>
                        <p><strong>Erstellt am:</strong> ${createdAt}</p>
                    </div>
                    <div class="card-footer ${statusClass}">${backup.status ? backup.status.toUpperCase() : '-'}</div>
                </div>
            `;
            container.innerHTML += cardHtml;
        });
    }

    async function fetchAndDisplayBackups() {
        try {
            const response = await fetch('/api/backups');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            allBackups = data.backups;
            // Filter-Auswahl bleibt erhalten, Filter werden auf neue Daten angewendet
            updateFilterBar(allBackups);
            renderBackups();
        } catch (error) {
            console.error("Fehler beim Abrufen der Backups:", error);
            container.innerHTML = '<p>Fehler beim Laden der Daten. Bitte versuchen Sie es später erneut.</p>';
        }
    }

    fetchAndDisplayBackups();
    setInterval(fetchAndDisplayBackups, 60000); // Alle 60 Sekunden aktualisieren
});