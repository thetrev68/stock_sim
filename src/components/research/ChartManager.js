// src/components/research/ChartManager.js
/* global Chart */
// Extracted from views/research.js - Chart rendering and management functionality
// Handles all chart-related operations for research view

import { getChartUnavailableTemplate } from "../../templates/research/research-errors.js";
import { setUIState, updateElementHTML } from "../../utils/dom-utils.js";


export class ChartManager {
    constructor(stockService) {
        this.stockService = stockService;
        this.currentChart = null;
    }

    async loadPriceChart(currentStockData, period = 7, resolution = "D") {
        if (!currentStockData) {
            console.warn("No current stock data for chart");
            return;
        }

        this.showChartLoading();

        try {
            // Check if Chart.js is available
            if (typeof Chart === "undefined") {
                console.warn("Chart.js not available, showing fallback message");
                this.showChartUnavailable();
                return;
            }

            const historicalData = await this.stockService.getHistoricalData(
                currentStockData.ticker, 
                resolution, 
                period
            );

            // REMOVE MOCK DATA FALLBACK - just check for real data
            if (historicalData && historicalData.timestamps && historicalData.closes && historicalData.closes.length > 0) {
                await this.renderChart(historicalData, currentStockData);
                this.showChart();
            } else {
                // Instead of falling back to mock data, show unavailable message
                console.warn("No historical data available for", currentStockData.ticker);
                this.showChartUnavailable(`Historical data temporarily unavailable for ${currentStockData.ticker}`);
            }

        } catch (error) {
            console.error("Chart loading error:", error);
            // Show the error message from the API instead of generic message
            this.showChartUnavailable(error.message || "Historical data temporarily unavailable");
        }
    }

    async renderChart(historicalData, currentStockData) {
        const canvas = document.getElementById("price-chart");
        if (!canvas) {
            console.error("Chart canvas not found");
            return;
        }

        // Check if Chart.js is available
        if (typeof Chart === "undefined") {
            console.error("Chart.js not loaded");
            this.showChartUnavailable("Chart library not available");
            return;
        }

        // Destroy existing chart
        if (this.currentChart) {
            try {
                this.currentChart.destroy();
            } catch (error) {
                console.warn("Error destroying previous chart:", error);
            }
            this.currentChart = null;
        }

        try {
            const ctx = canvas.getContext("2d");
            
            // Prepare data for Chart.js
            const labels = historicalData.timestamps.map(timestamp => {
                const date = new Date(timestamp * 1000);
                return date.toLocaleDateString();
            });
            const prices = historicalData.closes;

            // Validate data
            if (!labels.length || !prices.length) {
                throw new Error("No chart data available");
            }

            // Create gradient
            const gradient = ctx.createLinearGradient(0, 0, 0, 400);
            gradient.addColorStop(0, "rgba(6, 182, 212, 0.1)");
            gradient.addColorStop(1, "rgba(6, 182, 212, 0)");

            const chartConfig = {
                type: "line",
                data: {
                    labels: labels,
                    datasets: [{
                        label: `${currentStockData.ticker} Price`,
                        data: prices,
                        borderColor: "#06B6D4",
                        backgroundColor: gradient,
                        borderWidth: 2,
                        fill: true,
                        tension: 0.1,
                        pointRadius: 0,
                        pointHoverRadius: 4,
                        pointHoverBackgroundColor: "#06B6D4",
                        pointHoverBorderColor: "#ffffff",
                        pointHoverBorderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        intersect: false,
                        mode: "index"
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            backgroundColor: "rgba(0, 0, 0, 0.8)",
                            titleColor: "#ffffff",
                            bodyColor: "#ffffff",
                            borderColor: "#06B6D4",
                            borderWidth: 1,
                            callbacks: {
                                label: function(context) {
                                    return `$${context.parsed.y.toFixed(2)}`;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: {
                                color: "rgba(75, 85, 99, 0.3)",
                                drawBorder: false
                            },
                            ticks: {
                                color: "#9CA3AF",
                                maxTicksLimit: 8
                            }
                        },
                        y: {
                            grid: {
                                color: "rgba(75, 85, 99, 0.3)",
                                drawBorder: false
                            },
                            ticks: {
                                color: "#9CA3AF",
                                callback: function(value) {
                                    return "$" + value.toFixed(2);
                                }
                            }
                        }
                    }
                }
            };

            this.currentChart = new Chart(ctx, chartConfig);
            console.log("Chart rendered successfully");

        } catch (error) {
            console.error("Error rendering chart:", error);
            this.showChartUnavailable("Unable to render chart");
        }
    }

    switchChartPeriod(targetButton, currentStockData) {
        const period = parseInt(targetButton.dataset.period);
        const resolution = targetButton.dataset.resolution;

        // Update active button style
        document.querySelectorAll(".chart-period-btn").forEach(btn => {
            btn.classList.remove("bg-cyan-600", "text-white");
            btn.classList.add("text-gray-300", "hover:text-white");
        });
        targetButton.classList.add("bg-cyan-600", "text-white");
        targetButton.classList.remove("text-gray-300", "hover:text-white");

        this.loadPriceChart(currentStockData, period, resolution);
    }

    refreshChart(currentStockData) {
        const activeBtn = document.querySelector(".chart-period-btn.bg-cyan-600");
        if (activeBtn) {
            const period = parseInt(activeBtn.dataset.period);
            const resolution = activeBtn.dataset.resolution;
            this.loadPriceChart(currentStockData, period, resolution);
        } else {
            // Default to 7D if no active button found
            this.loadPriceChart(currentStockData, 7, "D");
        }
    }

    // Chart UI State Management
    showChartLoading() {
        setUIState({
            loadingId: "chart-loading",
            contentId: "chart-container", 
            errorId: "chart-error"
        }, "loading");
    }

    showChart() {
        setUIState({
            loadingId: "chart-loading",
            contentId: "chart-container", 
            errorId: "chart-error"
        }, "content");
    }

    showChartError() {
        setUIState({
            loadingId: "chart-loading",
            contentId: "chart-container", 
            errorId: "chart-error"
        }, "error");
    }

    showChartUnavailable(message = "Chart temporarily unavailable") {
    setUIState({
        loadingId: "chart-loading",
        contentId: "chart-container", 
        errorId: "chart-error"
    }, "error");
    
    // Use your existing error template but add retry functionality
    updateElementHTML("chart-error", getChartUnavailableTemplate(message));
    
    // Add retry button functionality
    setTimeout(() => {
        const retryBtn = document.getElementById("retry-chart");
        if (retryBtn) {
            retryBtn.addEventListener("click", () => {
                // Get current stock data and retry
                const _researchView = this;
                if (this.currentStockData) {
                    this.loadPriceChart(this.currentStockData);
                }
            });
        }
    }, 100);
}}