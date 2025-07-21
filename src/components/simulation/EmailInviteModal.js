// src/components/simulation/EmailInviteModal.js
import { SimulationService } from "../../services/simulation.js";
import { AuthService } from "../../services/auth.js";
import {
    getElement,
    removeElement,
    insertAtBodyEnd,
    focusElement,
    addEventListenerById,
    getElementValue,
    setButtonLoading,
    showErrorMessage,
    hideErrorMessage,
    showSuccessMessage,
    hideSuccessMessage,
    removeModal,
    copyToClipboard,
    updateElementText,
    addClass,
    removeClass
} from "../../utils/dom-utils.js";

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
        focusElement("invite-emails", 100);
    }

    hide() {
        this.isVisible = false;
        removeModal("email-invite-modal");
    }

    render() {
        // Remove existing modal if any
        removeElement("email-invite-modal");

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
                            <p class="text-gray-400">${this.currentSimulation.name}</p>
                        </div>
                        <button id="close-email-modal-btn" class="text-gray-400 hover:text-white transition-colors">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>

                    <!-- Body -->
                    <div class="p-6">
                        <form id="email-invite-form" class="space-y-6">
                            <!-- Shareable Link Section -->
                            <div>
                                <label class="block text-sm font-medium text-gray-300 mb-2">Shareable Link</label>
                                <div class="flex gap-2">
                                    <input 
                                        type="text" 
                                        id="shareable-link"
                                        value="${inviteLink}"
                                        readonly
                                        class="flex-1 bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                    >
                                    <button 
                                        type="button" 
                                        id="copy-link-btn"
                                        class="bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2"
                                    >
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                                        </svg>
                                        Copy Link
                                    </button>
                                </div>
                                <p class="text-sm text-gray-400 mt-2">Anyone with this link can join your simulation using invite code: <span class="font-mono text-cyan-400">${this.currentSimulation.inviteCode}</span></p>
                            </div>

                            <!-- Email Addresses -->
                            <div>
                                <label for="invite-emails" class="block text-sm font-medium text-gray-300 mb-2">
                                    Email Addresses
                                </label>
                                <textarea 
                                    id="invite-emails"
                                    placeholder="Enter email addresses separated by commas (e.g., friend1@email.com, friend2@email.com)"
                                    class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                                    rows="3"
                                    required
                                ></textarea>
                                <p class="text-sm text-gray-400 mt-1">Separate multiple emails with commas or semicolons</p>
                            </div>

                            <!-- Personal Message -->
                            <div>
                                <label for="invite-message" class="block text-sm font-medium text-gray-300 mb-2">
                                    Personal Message (Optional)
                                </label>
                                <textarea 
                                    id="invite-message"
                                    placeholder="Add a personal note to your invitation..."
                                    class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                                    rows="3"
                                    maxlength="500"
                                ></textarea>
                                <div class="flex justify-between items-center mt-1">
                                    <p class="text-sm text-gray-400">This message will be included in the invitation</p>
                                    <span id="message-count" class="text-xs text-gray-500">0/500</span>
                                </div>
                            </div>

                            <!-- Simulation Info -->
                            <div class="bg-gray-700 rounded-lg p-4">
                                <h4 class="text-lg font-semibold text-white mb-3">Simulation Details</h4>
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
                                        <span class="text-gray-400">Participants</span>
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
            </div>
        `;

        insertAtBodyEnd(modalHTML);
    }

    attachEventListeners() {
        // Close modal events
        addEventListenerById("close-email-modal-btn", "click", () => this.hide());
        addEventListenerById("cancel-email-btn", "click", () => this.hide());
        
        // Close on outside click
        addEventListenerById("email-invite-modal", "click", (e) => {
            if (e.target.id === "email-invite-modal") this.hide();
        });

        // Close on Escape key
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && this.isVisible) this.hide();
        });

        // Form submission
        addEventListenerById("email-invite-form", "submit", (e) => {
            e.preventDefault();
            this.handleSendInvites();
        });

        // Copy link functionality
        addEventListenerById("copy-link-btn", "click", async () => {
            const linkInput = getElement("shareable-link");
            const copyBtn = getElement("copy-link-btn");
            
            try {
                const success = await copyToClipboard(linkInput.value);
                
                if (success) {
                    // Visual feedback
                    const originalHTML = copyBtn.innerHTML;
                    copyBtn.innerHTML = `
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        Copied!
                    `;
                    copyBtn.className = "bg-green-600 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2";
                    
                    setTimeout(() => {
                        copyBtn.innerHTML = originalHTML;
                        copyBtn.className = "bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2";
                    }, 2000);
                } else {
                    // Fallback selection
                    linkInput.select();
                    linkInput.setSelectionRange(0, 99999);
                }
            } catch (error) {
                console.error("Failed to copy link:", error);
                // Fallback selection
                linkInput.select();
                linkInput.setSelectionRange(0, 99999);
            }
        });

        // Character counter for message
        addEventListenerById("invite-message", "input", (e) => {
            const count = e.target.value.length;
            const counter = getElement("message-count");
            if (counter) {
                updateElementText("message-count", `${count}/500`);
                
                // Update counter color based on length
                removeClass("message-count", "text-gray-500");
                removeClass("message-count", "text-yellow-400");
                removeClass("message-count", "text-red-400");
                
                if (count > 450) {
                    addClass("message-count", "text-yellow-400");
                } else if (count === 500) {
                    addClass("message-count", "text-red-400");
                } else {
                    addClass("message-count", "text-gray-500");
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
        const emailsInput = getElementValue("invite-emails")?.trim();
        const personalMessage = getElementValue("invite-message")?.trim();
        
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
            
            this.showSuccess(`Invitation details prepared for ${validEmails.length} recipient${validEmails.length !== 1 ? "s" : ""}. Share the message below or the invite link!`);
            
            // Call callback if provided
            if (this.onInvitesSent) {
                this.onInvitesSent(invitationData);
            }

        } catch (error) {
            console.error("Error sending invites:", error);
            this.showError(error.message);
        } finally {
            this.setLoading(false);
        }
    }

    async simulateEmailSending(invitationData) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // In a real implementation, this would send emails via backend
        console.log("Simulating email sending:", invitationData);
        
        // For demo purposes, we'll show the message that would be sent
        const messageContent = this.generateEmailMessage(invitationData);
        console.log("Email message would be:", messageContent);
        
        return { success: true, message: messageContent };
    }

    generateEmailMessage(invitationData) {
        const baseMessage = `🎯 You're Invited to Join "${invitationData.simulationName}"!

${invitationData.inviterName} has invited you to compete in a stock trading simulation.

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
        setButtonLoading("send-invites-btn", loading, "send-invites-text", "send-invites-loading");
    }

    showError(message) {
        showErrorMessage("email-invite-error", message);
    }

    hideError() {
        hideErrorMessage("email-invite-error");
    }

    showSuccess(message) {
        showSuccessMessage("email-invite-success", message);
    }

    hideSuccess() {
        hideSuccessMessage("email-invite-success");
    }
}