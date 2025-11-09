// static/js/script.js
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('backup-cards-container');

    async function fetchAndDisplayBackups() {
        try {
            const response = await fetch('/api/backups');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            const backups = data.backups;

            container.innerHTML = ''; // Alte Inhalte löschen

            if (backups.length === 0) {
                container.innerHTML = '<p>Keine Backups gefunden.</p>';
                return;
            }

            backups.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            backups.forEach(backup => {
                // Formatieren des Datums für eine bessere Lesbarkeit
                const createdAt = new Date(backup.created_at).toLocaleString('de-DE');

                // Erstellen der HTML-Karte mit Template-Literals
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

        } catch (error) {
            console.error("Fehler beim Abrufen der Backups:", error);
            container.innerHTML = '<p>Fehler beim Laden der Daten. Bitte versuchen Sie es später erneut.</p>';
        }
    }

    // Ersten Aufruf starten
    fetchAndDisplayBackups();

    // Alle 10 Sekunden aktualisieren
    setInterval(fetchAndDisplayBackups, 10000);
});