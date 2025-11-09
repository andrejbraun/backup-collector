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
    let filterValues = { source_host: '', database_type: '', status: '' };

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

        filterBar.innerHTML = '';
        // Source Host Dropdown
        const sourceHostSelect = createDropdown('filter-source-host', 'Quellen', sourceHosts);
        sourceHostSelect.value = prevSource;
        sourceHostSelect.onchange = e => {
            filterValues.source_host = e.target.value;
            renderBackups();
        };
        filterBar.appendChild(sourceHostSelect);
        // DB Type Dropdown
        const dbTypeSelect = createDropdown('filter-db-type', 'Datenbanktypen', dbTypes);
        dbTypeSelect.value = prevDbType;
        dbTypeSelect.onchange = e => {
            filterValues.database_type = e.target.value;
            renderBackups();
        };
        filterBar.appendChild(dbTypeSelect);
        // Status Dropdown
        const statusSelect = createDropdown('filter-status', 'Status', statuses);
        statusSelect.value = prevStatus;
        statusSelect.onchange = e => {
            filterValues.status = e.target.value;
            renderBackups();
        };
        filterBar.appendChild(statusSelect);
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

        container.innerHTML = '';
        if (filtered.length === 0) {
            container.innerHTML = '<p>Keine Backups gefunden.</p>';
            return;
        }
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        filtered.forEach(backup => {
            const createdAt = new Date(backup.created_at).toLocaleString('de-DE');
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
                        <p><span class="status ${backup.status.toLowerCase()}">${backup.status.toUpperCase()}</span></p>
                    </div>
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