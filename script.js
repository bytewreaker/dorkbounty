document.addEventListener('DOMContentLoaded', function () {
    const domainInput = document.getElementById('domainInput');
    const resultsContainer = document.getElementById('results');

    let dorkData = [];
    let debounceTimer;

    showLoading();

    fetch('dorks.json')
        .then(response => response.json())
        .then(data => {
            dorkData = data;
            hideLoading();
            renderDorks(updateDorks(dorkData, 'example.com'));

            domainInput.addEventListener('input', () => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    const searchTerm = domainInput.value.trim() || 'example.com';
                    renderDorks(updateDorks(dorkData, searchTerm));
                }, 300);
            });
        })
        .catch(error => {
            console.error('Error fetching dorks:', error);
            hideLoading();
            showError('Failed to load dorks. Please try again later.');
        });

    // --------------------------
    // Replace example.com -> target
    // --------------------------
    function updateDorks(dorks, target) {
        return dorks.map(entry => ({
            ...entry,
            dork: Array.isArray(entry.dork)
                ? entry.dork.map(q => q.replace(/example\.com/g, target))
                : entry.dork.replace(/example\.com/g, target)
        }));
    }


    // =====================================
// Universal → Per-Engine Operator Mapper
// =====================================

function rewriteQueryForEngine(query, engine) {
    engine = engine.toLowerCase();

    // ======================
    // GOOGLE (native syntax)
    // ======================
    if (engine === "google") {
        return query;
    }

    // ======================
    // BING
    // - Converts -word → NOT word
    // - Keeps site:, inurl:, intitle:
    // ======================
    if (engine === "bing") {
        return query
            .replace(/ -/g, " NOT ")    // -xxx → NOT xxx
            .replace(/\|/g, " OR ");    // "|" → "OR"
    }

    // ======================
    // DUCKDUCKGO
    // - No reliable inurl:
    // - Convert -word → -"word"
    // - Convert inurl:x → "x" (soft match)
    // ======================
    if (engine === "duckduckgo") {
        return query
            .split(/\s+/)
            .map(token => {
                if (token.startsWith("inurl:")) {
                    return `"${token.slice(6)}"`;     // inurl:admin → "admin"
                }
                if (token.startsWith("-")) {
                    return `-"${token.slice(1)}"`;    // -admin → -"admin"
                }
                return token;
            })
            .join(" ")
            .replace(/\|/g, " OR ");
    }

    // default (no rewrite)
    return query;
}


    // --------------------------
    // Build URLs for multiple engines
    // --------------------------
    function buildSearchUrl(engine, query) {
    const rewritten = rewriteQueryForEngine(query, engine);
    const encoded = encodeURIComponent(rewritten);

    const engines = {
        google:    `https://www.google.com/search?q=${encoded}`,
        bing:      `https://www.bing.com/search?q=${encoded}`,
        duckduckgo:`https://duckduckgo.com/?q=${encoded}`
    };

    return engines[engine];
}


    const enginesList = ["google", "bing", "duckduckgo"];


    // --------------------------
    // Render results
    // --------------------------
    function renderDorks(dorks) {
        resultsContainer.innerHTML = '';

        if (!dorks.length) {
            resultsContainer.innerHTML = '<p class="text-muted">No results found.</p>';
            return;
        }

        dorks.forEach(entry => {
            const card = document.createElement('div');
            card.className = 'result-item';

            const title = document.createElement('h3');
            title.textContent = entry.title;
            card.appendChild(title);

            const dorkContent = document.createElement('div');
            const patterns = Array.isArray(entry.dork) ? entry.dork : [entry.dork];

            patterns.forEach(pattern => {
                const block = document.createElement('div');
                block.className = 'dork-block';

                const patternText = document.createElement('div');
                patternText.className = 'dork-pattern';
                patternText.textContent = pattern;
                block.appendChild(patternText);

                // Engine links
                const btnRow = document.createElement('div');
                btnRow.className = 'engine-links';

                enginesList.forEach(engine => {
                    const a = document.createElement('a');
                    a.href = buildSearchUrl(engine, pattern);
                    a.target = "_blank";
                    a.className = 'engine-btn';
                    a.textContent = engine;
                    btnRow.appendChild(a);
                });

                block.appendChild(btnRow);
                dorkContent.appendChild(block);
            });

            card.appendChild(dorkContent);
            resultsContainer.appendChild(card);
        });
    }

    // --------------------------
    // UI helpers
    // --------------------------
    function showLoading() {
        resultsContainer.innerHTML = `
            <div class="text-center my-4">
                <div class="spinner-border text-success" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        `;
    }

    function hideLoading() {
        resultsContainer.innerHTML = '';
    }

    function showError(message) {
        resultsContainer.innerHTML = `
            <div class="alert alert-danger text-center" role="alert">
                ${message}
            </div>
        `;
    }
});
