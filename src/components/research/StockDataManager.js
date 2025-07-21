// src/components/research/StockDataManager.js
// Extracted from views/research.js - Stock data processing and display functionality
// Handles stock data formatting, company profile display, and UI updates

import { 
    formatPrice,
    formatNumberWithCommas,
    formatPriceChange,
    getGainLossColorClass
} from "../../utils/currency-utils.js";
import { 
    updateElementText,
    setUIState,
    getElement
} from "../../utils/dom-utils.js";
import { getInitial } from "../../utils/string-utils.js";

export class StockDataManager {
    constructor() {
        // No dependencies needed for this manager
    }

    displayStockData(stockData) {
        if (!stockData) return;

        const data = stockData;

        // Update header information
        updateElementText("company-name", data.companyName);
        updateElementText("quote-ticker", data.ticker);
        updateElementText("company-exchange", data.exchange);
        updateElementText("company-sector", data.sector);
        updateElementText("company-currency", data.currency);

        // Update price information
        updateElementText("current-price", formatPrice(data.currentPrice));
        
        // Price change with color
        const changeEl = getElement("price-change");
        if (changeEl && data.priceChange !== undefined) {
            const changeFormatted = formatPriceChange(data.priceChange, data.priceChangePercent);
            const colorClass = getGainLossColorClass(data.priceChange);

            changeEl.className = `text-lg font-semibold ${colorClass}`;
            changeEl.textContent = changeFormatted;
        }

        // Update quick stats
        updateElementText("open-price", formatPrice(data.openPrice));
        updateElementText("day-high", formatPrice(data.dayHigh));
        updateElementText("day-low", formatPrice(data.dayLow));
        updateElementText("volume", data.volume ? formatNumberWithCommas(data.volume) : "--");

        // Update last updated
        updateElementText("last-updated", `Last updated: ${new Date().toLocaleTimeString()}`);

        // Update company logo
        const logoImg = getElement("logo-img");
        const logoContainer = getElement("company-logo");
        const logoFallback = getElement("company-logo-fallback");
        const companyInitial = getElement("company-initial");

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

        updateElementText("market-cap", profile.marketCapitalization ? this.formatMillionsBillions(profile.marketCapitalization) : "--");
        updateElementText("shares-outstanding", profile.shareOutstanding ? formatNumberWithCommas(profile.shareOutstanding): "--");
        updateElementText("ipo-date", profile.ipo ? new Date(profile.ipo).toLocaleDateString() : "--");
        updateElementText("company-country", profile.country || "--");

        const companyWebsiteDiv = getElement("company-website");
        const websiteLink = getElement("website-link");
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

    // Profile UI State Management
    // Replace all profile state methods with these:
    showProfileLoading() {
        setUIState({
            loadingId: "profile-loading",
            contentId: "profile-data", 
            errorId: "profile-error"
        }, "loading");
    }

    showProfileData() {
        setUIState({
            loadingId: "profile-loading",
            contentId: "profile-data", 
            errorId: "profile-error"
        }, "content");
    }

    showProfileError() {
        setUIState({
            loadingId: "profile-loading",
            contentId: "profile-data", 
            errorId: "profile-error"
        }, "error");
    }
}