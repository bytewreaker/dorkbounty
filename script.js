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
            displayDorks(updateDorks(dorkData, 'example.com'));

            domainInput.addEventListener('input', () => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    const searchTerm = domainInput.value.trim();
                    const updated = updateDorks(dorkData, searchTerm || 'example.com');
                    displayDorks(updated);
                }, 300);
            });
        })
        .catch(error => {
            console.error('Error fetching dorks:', error);
            hideLoading();
            showError('Failed to load dorks. Please try again later.');
        });

    function updateDorks(dorks, searchTerm) {
        return dorks.map(dork => ({
            ...dork,
            dork: Array.isArray(dork.dork)
                ? dork.dork.map(d => d.replace(/example\.com/g, searchTerm))
                : dork.dork.replace(/example\.com/g, searchTerm)
        }));
    }

    function displayDorks(dorks) {
        resultsContainer.innerHTML = '';
        if (dorks.length === 0) {
            resultsContainer.innerHTML = '<p class="text-muted">No results found.</p>';
            return;
        }

        dorks.forEach(dork => {
            const dorkItem = document.createElement('div');
            dorkItem.className = 'result-item';

            const title = document.createElement('h3');
            title.textContent = dork.title;
            dorkItem.appendChild(title);

            const dorkContent = document.createElement('p');
            const dorkLinks = Array.isArray(dork.dork) ? dork.dork : [dork.dork];

            dorkLinks.forEach(dorkLink => {
                const link = document.createElement('a');
                link.href = `https://www.google.com/search?q=${encodeURIComponent(dorkLink)}`;
                link.target = '_blank';
                link.textContent = dorkLink;
                link.classList.add('d-block', 'mb-1');
                dorkContent.appendChild(link);
            });

            dorkItem.appendChild(dorkContent);
            resultsContainer.appendChild(dorkItem);
        });
    }

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
