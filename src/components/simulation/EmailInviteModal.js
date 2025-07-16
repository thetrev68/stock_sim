// src/components/simulation/EmailInviteModal.js
import { SimulationService } from "../../services/simulation.js";
import { AuthService } from "../../services/auth.js";

export class EmailInviteModal {
    constructor() {
        this.simulationService = new SimulationService();
        this.authService = new AuthService();
        this.isVisible = false;
        this.currentSimulation = null;
        this.onInvitesSent = null;
    }

    show(simulation, onSentCallback = null) {
        this.currentSimulation = simulation;
        this.onInvitesSent = onSentCallback;
        this.isVisible = true;
        this.render();
        this.attachEventListeners();
        
        // Focus on email input
        setTimeout(() => {
            const emailInput = document.getElementById("invite-emails");
            if (emailInput) emailInput.focus();
        }, 100);
    }

    hide() {
        this.isVisible = false;
        const modal = document.getElementById("email-invite-modal");
        if (modal) {
            modal.remove();
        }
    }

    render() {
        // Remove existing modal if any
        const existingModal = document.getElementById("email-invite-modal");
        if (existingModal) {
            existingModal.remove();
        }

        if (!this.currentSimulation) return;

        // Generate shareable link
        const baseUrl = window.location.origin;
        const inviteLink = `${baseUrl}/?invite=${this.currentSimulation.inviteCode}`;

        const modalHTML = `
            <div id="email-invite-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div class="bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl border border-gray-700 max-h-[90vh] overflow-y-auto">
                    <!-- Header -->
                    <div class="flex justify-between items-center p-6 border-b border-gray-700">
                        <div>
                            <h2 class="text-xl font-bold text-white">Invite Friends</h2>
                            <p class="text-gray-400 mt-1">Send invitations to join "${this.currentSimulation.name}"</p>
                        </div>
                        <button id="close-email-modal-btn" class="text-gray-400 hover:text-white transition-colors">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>

                    <!-- Form -->
                    <form id="email-invite-form" class="p-6 space-y-6">
                        <!-- Email Addresses -->
                        <div>
                            <label for="invite-emails" class="block text-sm font-medium text-gray-300 mb-2">
                                Email Addresses
                            </label>
                            <textarea 
                                id="invite-emails" 
                                rows="3"
                                placeholder="Enter email addresses separated by commas&#10;example@email.com, friend@email.com"
                                class="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition resize-none"
                            ></textarea>
                            <p class="text-xs text-gray-500 mt-2">Separate multiple emails with commas</p>
                        </div>

                        <!-- Personal Message -->
                        <div>
                            <label for="invite-message" class="block text-sm font-medium text-gray-300 mb-2">
                                Personal Message (Optional)
                            </label>
                            <textarea 
                                id="invite-message" 
                                rows="4"
                                maxlength="500"
                                placeholder="Add a personal message to your invitation..."
                                class="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition resize-none"
                            ></textarea>
                            <div class="flex justify-between mt-2">
                                <p class="text-xs text-gray-500">Make it personal to encourage participation</p>
                                <span id="message-count" class="text-xs text-gray-500">0/500</span>
                            </div>
                        </div>

                        <!-- Shareable Link Section -->
                        <div class="bg-gray-700 rounded-lg p-4">
                            <h3 class="text-white font-semibold mb-3 flex items-center gap-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                                </svg>
                                Or Share This Link
                            </h3>
                            <div class="flex gap-3">
                                <input 
                                    type="text" 
                                    id="shareable-link" 
                                    value="${inviteLink}"
                                    readonly
                                    class="flex-1 bg-gray-600 text-white rounded-lg px-3 py-2 border border-gray-500 text-sm font-mono"
                                >
                                <button 
                                    type="button" 
                                    id="copy-link-btn"
                                    class="bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2"
                                >
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                                    </svg>
                                    Copy
                                </button>
                            </div>
                            <p class="text-xs text-gray-400 mt-2">Anyone with this link can join using code: <span class="font-mono text-cyan-400">${this.currentSimulation.inviteCode}</span></p>
                        </div>

                        <!-- Simulation Preview -->
                        <div class="bg-gray-700 rounded-lg p-4">
                            <h3 class="text-white font-semibold mb-3">Simulation Details</h3>
                            <div class="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span class="text-gray-400">Starting Balance</span>
                                    <p class="text-white font-medium">$${this.currentSimulation.startingBalance.toLocaleString()}</p>
                                </div>
                                <div>
                                    <span class="text-gray-400">Duration</span>
                                    <p class="text-white font-medium">${this.formatDuration()}</p>
                                </div>
                                <div>
                                    <span class="text-gray-400">Current Participants</span>
                                    <p class="text-white font-medium">${this.currentSimulation.memberCount}/${this.currentSimulation.maxMembers}</p>
                                </div>
                                <div>
                                    <span class="text-gray-400">Status</span>
                                    <p class="text-white font-medium">${this.currentSimulation.status}</p>
                                </div>
                            </div>
                        </div>

                        <!-- Error Message -->
                        <div id="email-invite-error" class="hidden bg-red-900/20 border border-red-500 rounded-lg p-3">
                            <p class="text-red-400 text-sm"></p>
                        </div>

                        <!-- Success Message -->
                        <div id="email-invite-success" class="hidden bg-green-900/20 border border-green-500 rounded-lg p-3">
                            <p class="text-green-400 text-sm"></p>
                        </div>

                        <!-- Form Actions -->
                        <div class="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-700">
                            <button 
                                type="button" 
                                id="cancel-email-btn"
                                class="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                id="send-invites-btn"
                                class="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 flex items-center justify-center"
                            >
                                <span id="send-invites-text">Send Invitations</span>
                                <div id="send-invites-loading" class="hidden w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML("beforeend", modalHTML);
    }

    attachEventListeners() {
        const modal = document.getElementById("email-invite-modal");
        const form = document.getElementById("email-invite-form");
        const closeBtn = document.getElementById("close-email-modal-btn");
        const cancelBtn = document.getElementById("cancel-email-btn");
        const copyLinkBtn = document.getElementById("copy-link-btn");
        const messageTextarea = document.getElementById("invite-message");

        // Close modal events
        closeBtn?.addEventListener("click", () => this.hide());
        cancelBtn?.addEventListener("click", () => this.hide());
        
        // Close on outside click
        modal?.addEventListener("click", (e) => {
            if (e.target === modal) this.hide();
        });

        // Close on Escape key
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && this.isVisible) this.hide();
        });

        // Form submission
        form?.addEventListener("submit", (e) => {
            e.preventDefault();
            this.handleSendInvites();
        });

        // Copy link functionality
        copyLinkBtn?.addEventListener("click", async () => {
            const linkInput = document.getElementById("shareable-link");
            try {
                await navigator.clipboard.writeText(linkInput.value);
                
                // Visual feedback
                const originalText = copyLinkBtn.innerHTML;
                copyLinkBtn.innerHTML = `
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Copied!
                `;
                copyLinkBtn.className = "bg-green-600 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2";
                
                setTimeout(() => {
                    copyLinkBtn.innerHTML = originalText;
                    copyLinkBtn.className = "bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2";
                }, 2000);
                
            } catch (err) {
                console.error("Failed to copy link:", err);
                // Fallback selection
                linkInput.select();
                linkInput.setSelectionRange(0, 99999);
            }
        });

        // Character counter for message
        messageTextarea?.addEventListener("input", (e) => {
            const count = e.target.value.length;
            const counter = document.getElementById("message-count");
            if (counter) {
                counter.textContent = `${count}/500`;
                if (count > 450) {
                    counter.className = "text-xs text-yellow-400";
                } else if (count === 500) {
                    counter.className = "text-xs text-red-400";
                } else {
                    counter.className = "text-xs text-gray-500";
                }
            }
        });
    }

    formatDuration() {
        const startDate = this.currentSimulation.startDate.toDate ? 
            this.currentSimulation.startDate.toDate() : 
            new Date(this.currentSimulation.startDate);
        const endDate = this.currentSimulation.endDate.toDate ? 
            this.currentSimulation.endDate.toDate() : 
            new Date(this.currentSimulation.endDate);
        
        return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
    }

    parseEmailAddresses(emailString) {
        if (!emailString.trim()) return [];
        
        // Split by common delimiters and clean up
        const emails = emailString
            .split(/[,;]/)
            .map(email => email.trim())
            .filter(email => email.length > 0);
        
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const validEmails = [];
        const invalidEmails = [];
        
        emails.forEach(email => {
            if (emailRegex.test(email)) {
                validEmails.push(email);
            } else {
                invalidEmails.push(email);
            }
        });
        
        return { validEmails, invalidEmails };
    }

    async handleSendInvites() {
        const emailsInput = document.getElementById("invite-emails")?.value.trim();
        const personalMessage = document.getElementById("invite-message")?.value.trim();
        
        if (!emailsInput) {
            this.showError("Please enter at least one email address");
            return;
        }

        // Parse and validate emails
        const { validEmails, invalidEmails } = this.parseEmailAddresses(emailsInput);
        
        if (invalidEmails.length > 0) {
            this.showError(`Invalid email addresses: ${invalidEmails.join(", ")}`);
            return;
        }
        
        if (validEmails.length === 0) {
            this.showError("Please enter valid email addresses");
            return;
        }

        this.setLoading(true);
        this.hideError();
        this.hideSuccess();

        try {
            const user = this.authService.getCurrentUser();
            if (!user) {
                throw new Error("You must be signed in to send invitations");
            }

            // Generate invitation data
            const invitationData = {
                simulationId: this.currentSimulation.id,
                simulationName: this.currentSimulation.name,
                inviteCode: this.currentSimulation.inviteCode,
                inviterName: user.displayName || user.email,
                inviterEmail: user.email,
                personalMessage: personalMessage,
                inviteLink: `${window.location.origin}/?invite=${this.currentSimulation.inviteCode}`,
                recipients: validEmails,
                sentAt: new Date().toISOString()
            };

            // In a real app, this would call a backend API or Cloud Function to send emails
            // For now, we'll simulate the process and provide a shareable message
            await this.simulateEmailSending(invitationData);
            
            this.showSuccess(`Invitation details prepared for ${validEmails.length} recipient${validEmails.length !== 1 ? "s" : ""}! Copy the invitation text and send via your preferred method.`);
            
            // Call callback if provided
            if (this.onInvitesSent) {
                this.onInvitesSent(invitationData);
            }
            
            // Close modal after brief delay
            setTimeout(() => {
                this.hide();
            }, 3000);

        } catch (error) {
            console.error("Error sending invitations:", error);
            this.showError(error.message);
        } finally {
            this.setLoading(false);
        }
    }

    async simulateEmailSending(invitationData) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Generate invitation text that user can copy and send manually
        const inviteText = this.generateInviteText(invitationData);
        
        // Store in local storage for user to access (since we can't actually send emails)
        const inviteKey = `invite_${Date.now()}`;
        localStorage.setItem(inviteKey, JSON.stringify({
            ...invitationData,
            inviteText
        }));
        
        // Show the invitation text in a way user can copy it
        console.log("Generated invitation text:", inviteText);
        
        // In a real implementation, this would call:
        // await this.emailService.sendInvitations(invitationData);
    }

    generateInviteText(invitationData) {
        const baseMessage = `🎯 You're invited to join a trading simulation!

${invitationData.inviterName} has invited you to compete in "${invitationData.simulationName}" - a fun paper trading competition.

${invitationData.personalMessage ? `Personal message: "${invitationData.personalMessage}"` : ""}

🏆 Simulation Details:
• Starting Balance: $${this.currentSimulation.startingBalance.toLocaleString()}
• Duration: ${this.formatDuration()}
• Current Participants: ${this.currentSimulation.memberCount}/${this.currentSimulation.maxMembers}

🚀 How to Join:
1. Visit: ${invitationData.inviteLink}
2. Or use invite code: ${invitationData.inviteCode}

Start trading and see if you can beat your friends! 📈`;

        return baseMessage;
    }

    setLoading(loading) {
        const submitBtn = document.getElementById("send-invites-btn");
        const submitText = document.getElementById("send-invites-text");
        const loadingSpinner = document.getElementById("send-invites-loading");
        
        if (submitBtn) submitBtn.disabled = loading;
        if (submitText) {
            if (loading) {
                submitText.classList.add("hidden");
                loadingSpinner?.classList.remove("hidden");
            } else {
                submitText.classList.remove("hidden");
                loadingSpinner?.classList.add("hidden");
            }
        }
    }

    showError(message) {
        const errorDiv = document.getElementById("email-invite-error");
        const errorText = errorDiv?.querySelector("p");
        
        if (errorText) errorText.textContent = message;
        if (errorDiv) errorDiv.classList.remove("hidden");
    }

    hideError() {
        const errorDiv = document.getElementById("email-invite-error");
        if (errorDiv) errorDiv.classList.add("hidden");
    }

    showSuccess(message) {
        const successDiv = document.getElementById("email-invite-success");
        const successText = successDiv?.querySelector("p");
        
        if (successText) successText.textContent = message;
        if (successDiv) successDiv.classList.remove("hidden");
    }

    hideSuccess() {
        const successDiv = document.getElementById("email-invite-success");
        if (successDiv) successDiv.classList.add("hidden");
    }
}