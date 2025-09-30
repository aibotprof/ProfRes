/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

document.addEventListener('DOMContentLoaded', () => {
    // Získání prvků z DOM
    const searchInput = document.getElementById('searchInput');
    const finstatNameBtn = document.getElementById('finstatNameBtn');
    const finstatIcoBtn = document.getElementById('finstatIcoBtn');
    const justiceNameBtn = document.getElementById('justiceNameBtn');
    const justiceIcoBtn = document.getElementById('justiceIcoBtn');
    const googleBtn = document.getElementById('googleBtn');
    const facebookBtn = document.getElementById('facebookBtn');
    const linkedinBtn = document.getElementById('linkedinBtn');
    const perplexityBtn = document.getElementById('perplexityBtn');
    const searchAllBtn = document.getElementById('searchAllBtn');
    const themeToggle = document.getElementById('themeToggle');
    const docElement = document.documentElement;
    const historyList = document.getElementById('historyList');

    // --- Logika pro přepínání vzhledu ---
    const applyTheme = (theme) => {
        if (theme === 'light') {
            docElement.classList.add('light-mode');
        } else {
            docElement.classList.remove('light-mode');
        }
    };

    themeToggle?.addEventListener('click', () => {
        const newTheme = docElement.classList.contains('light-mode') ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    });

    // Aplikace uloženého tématu při načtení stránky
    const savedTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(savedTheme);


    // --- Logika pro historii vyhledávání ---
    const HISTORY_KEY = 'companySearchHistory';
    const MAX_HISTORY_ITEMS = 10;

    const getSearchHistory = () => {
        try {
            const history = localStorage.getItem(HISTORY_KEY);
            return history ? JSON.parse(history) : [];
        } catch (e) {
            console.error("Failed to parse search history:", e);
            return [];
        }
    };

    const saveSearchQuery = (query) => {
        if (!query) return;
        let history = getSearchHistory();
        history = history.filter(item => item.toLowerCase() !== query.toLowerCase());
        history.unshift(query);
        const trimmedHistory = history.slice(0, MAX_HISTORY_ITEMS);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmedHistory));
    };

    const renderSearchHistory = () => {
        const history = getSearchHistory();
        historyList.innerHTML = '';
        if (history.length === 0) {
            historyList.style.display = 'none';
            return;
        }

        history.forEach(query => {
            const li = document.createElement('li');
            li.textContent = query;
            li.addEventListener('click', () => {
                searchInput.value = query;
                historyList.style.display = 'none';
                searchAllBtn?.click();
            });
            historyList.appendChild(li);
        });

        historyList.style.display = 'block';
    };

    searchInput?.addEventListener('focus', renderSearchHistory);
    document.addEventListener('click', (event) => {
        if (!searchInput.contains(event.target) && !historyList.contains(event.target)) {
            historyList.style.display = 'none';
        }
    });


    // --- Logika pro vyhledávání ---
    const openPopup = (url) => {
        const features = 'width=1200,height=800,scrollbars=yes,resizable=yes,status=yes,toolbar=yes,menubar=yes,location=yes';
        window.open(url, '_blank', features);
    };

    const getQuery = () => searchInput.value.trim();
    
    const showError = (message) => {
        if (message) {
            alert(message);
        }
        searchInput.focus();
        searchInput.style.borderColor = 'red';
        setTimeout(() => {
            searchInput.style.borderColor = '';
        }, 2000);
    };

    const handleSearch = (urlBuilder) => {
        const query = getQuery();
        if (query) {
            saveSearchQuery(query);
            const url = urlBuilder(encodeURIComponent(query));
            openPopup(url);
        } else {
            showError('Zadejte prosím název firmy nebo IČO.');
        }
    };

    const handleIcoSearch = (urlBuilder) => {
        const query = getQuery();
        if (!query) {
            showError('Zadejte prosím IČO.');
            return;
        }
        if (!/^\d+$/.test(query)) {
            showError('IČO musí obsahovat pouze číslice.');
            return;
        }
        saveSearchQuery(query);
        const url = urlBuilder(encodeURIComponent(query));
        openPopup(url);
    };

    finstatNameBtn?.addEventListener('click', () => {
        handleSearch(query => `https://finstat.sk/vyhladavanie?query=${query}`);
    });

    finstatIcoBtn?.addEventListener('click', () => {
        handleIcoSearch(query => `https://finstat.sk/${query}`);
    });

    justiceNameBtn?.addEventListener('click', () => {
        handleSearch(query => `https://or.justice.cz/ias/ui/rejstrik-$firma?nazev=${query}`);
    });

    justiceIcoBtn?.addEventListener('click', () => {
        handleIcoSearch(query => `https://or.justice.cz/ias/ui/rejstrik-$firma?ico=${query}`);
    });

    googleBtn?.addEventListener('click', () => {
        const query = getQuery();
        if (!query) {
            showError('Zadejte prosím název firmy nebo IČO.');
            return;
        }
        saveSearchQuery(query);
        const isIco = /^\d+$/.test(query);
        const googleQuery = isIco ? `IČO Firmy ${query}` : `${query} Firma`;
        const url = `https://www.google.com/search?q=${encodeURIComponent(googleQuery)}`;
        openPopup(url);
    });

    facebookBtn?.addEventListener('click', () => {
        handleSearch(query => `https://www.google.com/search?q=${encodeURIComponent(query)}+Facebook`);
    });

    linkedinBtn?.addEventListener('click', () => {
        handleSearch(query => `https://www.google.com/search?q=${encodeURIComponent(query)}+Linkedin`);
    });

    perplexityBtn?.addEventListener('click', () => {
        const query = getQuery();
        if (!query) {
            showError('Zadejte prosím název firmy nebo IČO.');
            return;
        }
        saveSearchQuery(query);
        const isIco = /^\d+$/.test(query);
        const inputType = isIco ? `IČO '${query}'` : `názvem '${query}'`;
        
        const prompt = `Proveďte podrobnou rešerši o firmě s ${inputType} se zaměřením na český a slovenský trh (CZ/SK weby). Zaměřte se na následující body:
1. Základní informace (oficiální název, sídlo, IČO, datum vzniku).
2. Předmět podnikání a hlavní činnosti.
3. Vlastnická struktura a klíčové osoby (jednatelé, management).
4. Finanční zdraví (dostupné informace o obratu, zisku, hospodářských výsledcích).
5. Aktuální zprávy, kauzy nebo významné události spojené s firmou.
6. Online přítomnost a reputace (webové stránky, sociální sítě, recenze).
Výsledky prezentujte strukturovaně a přehledně. Hledejte primárně v českých a slovenských zdrojích.`;

        const url = `https://www.perplexity.ai/search?q=${encodeURIComponent(prompt)}`;
        openPopup(url);
    });

    searchAllBtn?.addEventListener('click', () => {
        const query = getQuery();
        if (!query) {
            showError('Zadejte prosím název firmy nebo IČO.');
            return;
        }
        saveSearchQuery(query);
        const isIco = /^\d+$/.test(query);

        if (isIco) {
            justiceIcoBtn?.click();
            finstatIcoBtn?.click();
            googleBtn?.click();
            perplexityBtn?.click();
        } else {
            justiceNameBtn?.click();
            finstatNameBtn?.click();
            googleBtn?.click();
            facebookBtn?.click();
            linkedinBtn?.click();
            perplexityBtn?.click();
        }
    });

    searchInput?.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            searchAllBtn?.click(); 
        }
    });

    searchInput?.addEventListener('input', () => {
        if (searchInput.style.borderColor === 'red') {
            searchInput.style.borderColor = '';
        }
        historyList.style.display = 'none';
    });
});
