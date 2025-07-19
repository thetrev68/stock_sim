// src/components/research/StockDataManager.js
// Extracted from views/research.js - Stock data processing and display functionality
// Handles stock data formatting, company profile display, and UI updates

import { 
    formatPrice,
    formatNumberWithCommas,
    formatPriceChange,
    getGainLossColorClass
} from "../../utils/currency-utils.js";
import { getInitial } from "../../utils/string-utils.js";

export class StockDataManager {
    constructor() {
        // No dependencies needed for this manager
    }

    displayStockData(stockData) {
        if (!stockData) return;

        const data = stockData;

        // Update header information
        this.updateElement("company-name", data.companyName);
        this.updateElement("quote-ticker", data.ticker);
        this.updateElement("company-exchange", data.exchange);
        this.updateElement("company-sector", data.sector);
        this.updateElement("company-currency", data.currency);

        // Update price information
        this.updateElement("current-price", formatPrice(data.currentPrice));
        
        // Price change with color
        const changeEl = document.getElementById("price-change");
        if (changeEl && data.priceChange !== undefined) {
            const changeFormatted = formatPriceChange(data.priceChange, data.priceChangePercent);
            const colorClass = getGainLossColorClass(data.priceChange);

            changeEl.className = `text-lg font-semibold ${colorClass}`;
            changeEl.textContent = changeFormatted;
        }

        // Update quick stats
        this.updateElement("open-price", formatPrice(data.openPrice));
        this.updateElement("day-high", formatPrice(data.dayHigh));
        this.updateElement("day-low", formatPrice(data.dayLow));
        this.updateElement("volume", data.volume ? formatNumberWithCommas(data.volume) : "--");

        // Update last updated
        this.updateElement("last-updated", `Last updated: ${new Date().toLocaleTimeString()}`);

        // Update company logo
        const logoImg = document.getElementById("logo-img");
        const logoContainer = document.getElementById("company-logo");
        const logoFallback = document.getElementById("company-logo-fallback");
        const companyInitial = document.getElementById("company-initial");

        if (data.logo && logoImg && logoContainer && logoFallback) {
            logoImg.src = data.logo;
            logoImg.onerror = () => {
                logoContainer.classList.add("hidden");
                logoFallback.classList.remove("hidden");
            };
            logoImg.onload = () => {
                logoContainer.classList.remove("hidden");
                logoContainer.classList.add("flex");
                logoFallback.classList.add("hidden");
            };
        }

        if (companyInitial) {
            companyInitial.textContent = getInitial(data.ticker);
        }
    }

    displayCompanyProfile(stockData) {
        if (!stockData || !stockData.companyProfile) {
            this.showProfileError();
            return;
        }

        const profile = stockData.companyProfile;

        this.updateElement("market-cap", profile.marketCapitalization ? this.formatMillionsBillions(profile.marketCapitalization) : "--");
        this.updateElement("shares-outstanding", profile.shareOutstanding ? profile.shareOutstanding.toLocaleString() : "--");
        this.updateElement("ipo-date", profile.ipo ? new Date(profile.ipo).toLocaleDateString() : "--");
        this.updateElement("company-country", profile.country || "--");

        const companyWebsiteDiv = document.getElementById("company-website");
        const websiteLink = document.getElementById("website-link");
        if (profile.weburl && websiteLink && companyWebsiteDiv) {
            websiteLink.href = profile.weburl;
            companyWebsiteDiv.classList.remove("hidden");
        } else if (companyWebsiteDiv) {
            companyWebsiteDiv.classList.add("hidden");
        }

        this.showProfileData();
    }

    formatMillionsBillions(num) {
        if (num >= 1000000000) {
            return (num / 1000000000).toFixed(2) + "B";
        }
        if (num >= 1000000) {
            return (num / 1000000).toFixed(2) + "M";
        }
        return num.toLocaleString();
    }

    updateElement(id, text) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = text;
        }
    }

    // Profile UI State Management
    showProfileLoading() {
        document.getElementById("profile-loading")?.classList.remove("hidden");
        document.getElementById("profile-data")?.classList.add("hidden");
        document.getElementById("profile-error")?.classList.add("hidden");
    }

    showProfileData() {
        document.getElementById("profile-loading")?.classList.add("hidden");
        document.getElementById("profile-data")?.classList.remove("hidden");
        document.getElementById("profile-error")?.classList.add("hidden");
    }

    showProfileError() {
        document.getElementById("profile-loading")?.classList.add("hidden");
        document.getElementById("profile-data")?.classList.add("hidden");
        document.getElementById("profile-error")?.classList.remove("hidden");
    }
}