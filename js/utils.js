/**
 * Community Skill Exchange - Utilities & UI Helpers
 * Toast notifications, modals, date formatters, avatar generator, download handlers, and animations.
 */

const Utils = {
    /**
     * Show interactive toast notification
     */
    showToast(message, type = 'info', duration = 3800) {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type} animate-slide-in`;

        const iconMap = {
            success: 'check-circle',
            error: 'alert-circle',
            warning: 'alert-triangle',
            info: 'info'
        };

        const iconName = iconMap[type] || 'info';

        toast.innerHTML = `
            <div class="toast-icon">
                <i data-lucide="${iconName}"></i>
            </div>
            <div class="toast-message">${this.escapeHTML(message)}</div>
            <button class="toast-close" aria-label="Close">
                <i data-lucide="x"></i>
            </button>
        `;

        container.appendChild(toast);
        this.renderIcons(toast);

        const removeToast = () => {
            toast.classList.add('animate-slide-out');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        };

        toast.querySelector('.toast-close').addEventListener('click', removeToast);

        setTimeout(removeToast, duration);
    },

    /**
     * Confirmation Modal helper
     */
    confirm(options = {}) {
        const {
            title = 'Are you sure?',
            message = 'This action cannot be undone.',
            confirmText = 'Confirm',
            cancelText = 'Cancel',
            confirmButtonClass = 'btn-danger',
            onConfirm = () => {}
        } = options;

        const modalId = 'generic-confirm-modal';
        let modalEl = document.getElementById(modalId);
        if (modalEl) modalEl.remove();

        modalEl = document.createElement('div');
        modalEl.id = modalId;
        modalEl.className = 'modal-backdrop active';
        modalEl.innerHTML = `
            <div class="modal-card modal-card-sm animate-scale-up" role="dialog" aria-modal="true">
                <div class="modal-header">
                    <h3 class="modal-title">${this.escapeHTML(title)}</h3>
                    <button class="modal-close-btn" id="confirm-modal-close"><i data-lucide="x"></i></button>
                </div>
                <div class="modal-body">
                    <p class="text-secondary">${this.escapeHTML(message)}</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" id="confirm-modal-cancel">${this.escapeHTML(cancelText)}</button>
                    <button type="button" class="btn ${confirmButtonClass}" id="confirm-modal-action">${this.escapeHTML(confirmText)}</button>
                </div>
            </div>
        `;

        document.body.appendChild(modalEl);
        this.renderIcons(modalEl);

        const closeModal = () => {
            modalEl.classList.remove('active');
            setTimeout(() => modalEl.remove(), 250);
        };

        modalEl.querySelector('#confirm-modal-close').onclick = closeModal;
        modalEl.querySelector('#confirm-modal-cancel').onclick = closeModal;
        modalEl.querySelector('#confirm-modal-action').onclick = () => {
            closeModal();
            onConfirm();
        };

        modalEl.addEventListener('click', (e) => {
            if (e.target === modalEl) closeModal();
        });
    },

    /**
     * Open a target modal by ID
     */
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.classList.add('modal-open');
            this.renderIcons(modal);
        }
    },

    /**
     * Close a modal by ID
     */
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.classList.remove('modal-open');
        }
    },

    /**
     * Generate user avatar markup with gradient colors
     */
    getAvatarHTML(user, size = 'md') {
        if (!user) return '<div class="avatar avatar-md avatar-placeholder">?</div>';

        const initials = user.avatarInitial || this.getInitials(user.name || 'User');
        const gradient = user.avatarColor || 'from-indigo-500 to-purple-600';
        const sizeClass = `avatar-${size}`;

        return `
            <div class="avatar ${sizeClass} bg-gradient-${this.escapeHTML(gradient)}" title="${this.escapeHTML(user.name || '')}">
                <span class="avatar-text">${initials}</span>
                ${user.availability === 'Available' ? '<span class="avatar-status-dot online"></span>' : ''}
            </div>
        `;
    },

    /**
     * Get initials from full name
     */
    getInitials(name) {
        if (!name) return 'U';
        const parts = name.trim().split(' ').filter(Boolean);
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    },

    /**
     * Escape HTML special chars to prevent XSS
     */
    escapeHTML(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },

    /**
     * Format ISO date string into readable format (e.g., "08 Oct 2026")
     */
    formatDate(isoString) {
        if (!isoString) return 'N/A';
        try {
            const date = new Date(isoString);
            return date.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        } catch (e) {
            return isoString;
        }
    },

    /**
     * Format relative time (e.g., "2 hours ago", "Yesterday", "Just now")
     */
    formatRelativeTime(isoString) {
        if (!isoString) return '';
        try {
            const date = new Date(isoString);
            const now = new Date();
            const diffSeconds = Math.floor((now - date) / 1000);

            if (diffSeconds < 60) return 'Just now';
            if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
            if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
            if (diffSeconds < 172800) return 'Yesterday';
            const days = Math.floor(diffSeconds / 86400);
            if (days < 30) return `${days}d ago`;
            return this.formatDate(isoString);
        } catch (e) {
            return this.formatDate(isoString);
        }
    },

    /**
     * Format minutes into readable hour string
     */
    formatDuration(minutes) {
        const mins = Number(minutes) || 0;
        if (mins < 60) return `${mins} min`;
        const hrs = Math.floor(mins / 60);
        const rem = mins % 60;
        return rem > 0 ? `${hrs}h ${rem}m` : `${hrs} hrs`;
    },

    /**
     * Re-render Lucide icons safely
     */
    renderIcons(parent = document) {
        if (window.lucide && typeof window.lucide.createIcons === 'function') {
            window.lucide.createIcons({
                attrs: {
                    class: ['lucide-icon']
                },
                nameAttr: 'data-lucide',
                scope: parent
            });
        }
    },

    /**
     * Trigger browser file download
     */
    downloadFile(content, fileName, contentType = 'application/json') {
        const a = document.createElement('a');
        const file = new Blob([content], { type: contentType });
        a.href = URL.createObjectURL(file);
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(a.href);
        }, 100);
    },

    /**
     * Confetti celebration effect
     */
    celebrate() {
        const colors = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'];
        for (let i = 0; i < 60; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti-piece';
            confetti.style.left = `${Math.random() * 100}vw`;
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = `${Math.random() * 0.4}s`;
            confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
            document.body.appendChild(confetti);

            setTimeout(() => {
                if (confetti.parentNode) confetti.parentNode.removeChild(confetti);
            }, 3000);
        }
    }
};

window.Utils = Utils;
