document.addEventListener('DOMContentLoaded', function () {
    const domainInput = document.getElementById('domainInput');
    const resultsContainer = document.getElementById('results');

    // Fetch dorks from the JSON file
    fetch('dorks.json')
        .then(response => response.json())
        .then(data => {
            // Display the initial dorks
            displayDorks(data);

            // Update dorks when the input changes
            domainInput.addEventListener('input', function () {
                const searchTerm = domainInput.value;
                const updatedDorks = updateDorks(data, searchTerm);
                displayDorks(updatedDorks);
            });
        })
        .catch(error => console.error('Error fetching dorks:', error));

    function updateDorks(dorks, searchTerm) {
        return dorks.map(dork => {
            if (Array.isArray(dork.dork)) {
                return {
                    ...dork,
                    dork: dork.dork.map(d => d.replace('example.com', searchTerm))
                };
            } else {
                return {
                    ...dork,
                    dork: dork.dork.replace('example.com', searchTerm)
                };
            }
        });
    }

    function displayDorks(dorks) {
        resultsContainer.innerHTML = '';
        dorks.forEach((dork, index) => {
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
                link.target = '_blank'; // Opens the link in a new tab
                link.textContent = dorkLink;
                link.style.display = 'block'; // Ensure each link is on a new line
                dorkContent.appendChild(link);
            });

            dorkItem.appendChild(dorkContent);
            resultsContainer.appendChild(dorkItem);
        });
    }
});
