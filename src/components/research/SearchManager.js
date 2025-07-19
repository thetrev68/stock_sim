// src/components/research/SearchManager.js
// Extracted from views/research.js - Search and autocomplete functionality
// Handles all search-related operations for research view

import { TIMEOUTS } from "../../constants/app-config.js";
import { 
    getSearchResultItemTemplate, 
    getSearchEmptyStateTemplate 
} from "../../templates/research/research-search.js";

export class SearchManager {
    constructor(stockService) {
        this.stockService = stockService;
        this.searchResults = [];
        this.searchTimeout = null;
    }

    async handleSearchInput(e, onStockSelected) {
        const query = e.target.value.trim();
        
        // Clear previous timeout
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        if (query.length < 1) {
            this.hideSearchResults();
            return;
        }

        // Show loading
        this.showSearchLoading(true);

        // Debounce search
        this.searchTimeout = setTimeout(async () => {
            try {
                this.searchResults = await this.stockService.searchStocks(query);
                this.displaySearchResults(onStockSelected);
            } catch (error) {
                console.error("Search error:", error);
                this.hideSearchResults();
            } finally {
                this.showSearchLoading(false);
            }
        }, TIMEOUTS.SEARCH_DEBOUNCE);
    }

    showSearchLoading(show) {
        const searchIcon = document.querySelector("#research-ticker-input + div svg");
        const loadingIcon = document.getElementById("search-loading");
        
        if (show) {
            if (searchIcon) searchIcon.style.display = "none";
            if (loadingIcon) loadingIcon.classList.remove("hidden");
        } else {
            if (searchIcon) searchIcon.style.display = "block";
            if (loadingIcon) loadingIcon.classList.add("hidden");
        }
    }

    displaySearchResults(onStockSelected) {
        const resultsContainer = document.getElementById("search-results");
        const resultsList = document.getElementById("search-results-list");
        
        if (!resultsContainer || !resultsList) return;

        if (this.searchResults.length === 0) {
            resultsList.innerHTML = getSearchEmptyStateTemplate();
        } else {
            resultsList.innerHTML = this.searchResults.map(stock => getSearchResultItemTemplate(stock)).join("");

            // Attach click events to search results
            resultsList.querySelectorAll(".search-result-item").forEach(item => {
                item.addEventListener("click", (e) => {
                    const ticker = e.currentTarget.dataset.ticker;
                    onStockSelected(ticker);
                    this.hideSearchResults();
                });
            });
        }

        this.showSearchResults();
    }

    showSearchResults() {
        const resultsContainer = document.getElementById("search-results");
        if (resultsContainer && this.searchResults.length > 0) {
            resultsContainer.classList.remove("hidden");
        }
    }

    hideSearchResults() {
        const resultsContainer = document.getElementById("search-results");
        if (resultsContainer) {
            resultsContainer.classList.add("hidden");
        }
    }
}