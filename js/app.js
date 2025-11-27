/**
 * THE VILLAGE - Module principal
 * Navigation, etat global et fonctions utilitaires
 * Derniere mise a jour : 27/11/2025
 */

/**
 * Configuration de l'application
 */
const APP_CONFIG = {
  name: 'THE VILLAGE',
  version: '1.0.0',
  company: 'Pacala Group',

  // Chemins des pages
  pages: {
    login: 'login.html',
    selection: 'selection.html',
    dashboard: 'dashboard.html',
    caisses: 'caisses.html',
    depots: 'depots.html',
    achats: 'achats.html',
    ebe: 'ebe.html',
    historique: 'historique.html',
    parametres: 'parametres.html',
    rentabilite: 'rentabilite.html'
  },

  // Configuration des restaurants
  restaurants: {
    vegas: {
      id: 'vegas',
      name: 'Vegas Kitchen',
      shortName: 'Vegas',
      icon: 'utensils',
      emoji: '🔵',
      color: '#6B9BD2',
      theme: 'theme-vegas',
      fournisseurs: ['Metro', 'Promocash', 'Sysco', 'Transgourmet', 'RAD', 'Nature a Table', 'Delidrink', 'Maintenance']
    },
    crepe: {
      id: 'crepe',
      name: 'La Crepe au Carre',
      shortName: 'Crepe',
      icon: 'cookie',
      emoji: '🟢',
      color: '#7DB88F',
      theme: 'theme-crepe',
      fournisseurs: ['Metro', 'Promocash', 'Sysco', 'Transgourmet', 'RAD', 'Nature a Table', 'Maintenance']
    },
    rentabilite: {
      id: 'rentabilite',
      name: 'Rentabilite Globale',
      shortName: 'Global',
      icon: 'bar-chart-2',
      emoji: '🩷',
      color: '#D4A5A5',
      theme: 'theme-rentabilite'
    }
  },

  // Categories d'achats
  categories: ['Alimentaire', 'Boissons', 'Consommables', 'Emballages', 'Hygiene/Entretien'],

  // Taux TVA
  tauxTVA: [5.5, 10, 20],

  // Valeurs cheques vacances
  valeursCV: [10, 20, 25, 50],

  // Seuils d'alerte
  seuils: {
    masseSalariale: {
      vert: 28,
      jaune: 32,
      orange: 35
    },
    achats: {
      vert: 21
    },
    ecartCaisse: 5
  }
};

/**
 * Module principal de l'application
 */
const App = {
  /**
   * Initialise l'application
   */
  init() {
    // Initialisation des icones Lucide
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }

    // Application du theme selon le restaurant
    this.applyTheme();

    // Configuration des evenements globaux
    this.setupEventListeners();

    // Mise a jour de l'UI
    this.updateUI();
  },

  /**
   * Applique le theme du restaurant selectionne
   */
  applyTheme() {
    const restaurant = Auth.getRestaurantInfo();
    const body = document.body;

    // Suppression des themes existants
    body.classList.remove('theme-vegas', 'theme-crepe', 'theme-rentabilite', 'theme-neutral');

    if (restaurant) {
      body.classList.add(restaurant.theme);
    } else {
      body.classList.add('theme-neutral');
    }
  },

  /**
   * Configure les ecouteurs d'evenements globaux
   */
  setupEventListeners() {
    // Gestion du menu mobile
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');

    if (menuToggle && sidebar) {
      menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
      });

      // Fermer le menu en cliquant en dehors
      document.addEventListener('click', (e) => {
        if (sidebar.classList.contains('open') &&
            !sidebar.contains(e.target) &&
            !menuToggle.contains(e.target)) {
          sidebar.classList.remove('open');
        }
      });
    }

    // Gestion des dropdowns
    document.querySelectorAll('.dropdown').forEach(dropdown => {
      const toggle = dropdown.querySelector('.dropdown-toggle');
      if (toggle) {
        toggle.addEventListener('click', (e) => {
          e.stopPropagation();
          dropdown.classList.toggle('active');
        });
      }
    });

    // Fermer les dropdowns en cliquant ailleurs
    document.addEventListener('click', () => {
      document.querySelectorAll('.dropdown.active').forEach(d => {
        d.classList.remove('active');
      });
    });

    // Bouton de deconnexion
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        Auth.logout();
      });
    }

    // Bouton de changement de restaurant
    const changeRestaurantBtn = document.getElementById('changeRestaurantBtn');
    if (changeRestaurantBtn) {
      changeRestaurantBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = APP_CONFIG.pages.selection;
      });
    }
  },

  /**
   * Met a jour l'interface utilisateur
   */
  updateUI() {
    // Mise a jour du nom utilisateur
    const userNameElements = document.querySelectorAll('.user-name');
    const session = Auth.getSession();
    if (session) {
      userNameElements.forEach(el => {
        el.textContent = session.userName;
      });
    }

    // Mise a jour de l'avatar
    const userAvatars = document.querySelectorAll('.user-avatar');
    userAvatars.forEach(avatar => {
      avatar.textContent = Auth.getUserInitials();
    });

    // Mise a jour de l'indicateur restaurant
    const restaurant = Auth.getRestaurantInfo();
    const restaurantIndicators = document.querySelectorAll('.restaurant-indicator');
    restaurantIndicators.forEach(indicator => {
      if (restaurant) {
        indicator.querySelector('.restaurant-name').textContent = restaurant.shortName;
        indicator.style.display = 'flex';
      } else {
        indicator.style.display = 'none';
      }
    });

    // Mise a jour de la navigation active
    this.updateActiveNav();

    // Masquer/afficher elements selon les droits
    this.updateAccessibleElements();
  },

  /**
   * Met a jour la navigation active
   */
  updateActiveNav() {
    const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
      const href = item.getAttribute('href');
      if (href && href.includes(currentPage)) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  },

  /**
   * Met a jour les elements selon les droits d'acces
   */
  updateAccessibleElements() {
    // Elements admin
    const adminElements = document.querySelectorAll('[data-require-admin]');
    adminElements.forEach(el => {
      if (Auth.isAdmin()) {
        el.style.display = '';
      } else {
        el.style.display = 'none';
      }
    });

    // Elements par fonctionnalite
    document.querySelectorAll('[data-require-access]').forEach(el => {
      const requiredAccess = el.dataset.requireAccess;
      if (Auth.hasAccess(requiredAccess)) {
        el.style.display = '';
      } else {
        el.style.display = 'none';
      }
    });
  },

  /**
   * Affiche un toast de notification
   * @param {string} message - Message a afficher
   * @param {string} type - Type de notification (success, warning, danger, info)
   * @param {number} duration - Duree d'affichage en ms
   */
  showToast(message, type = 'info', duration = 3000) {
    // Creation du toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} animate-slide-in`;
    toast.innerHTML = `
      <div class="toast-content">
        <i data-lucide="${this.getToastIcon(type)}" class="icon"></i>
        <span>${message}</span>
      </div>
      <button class="toast-close" onclick="this.parentElement.remove()">
        <i data-lucide="x" class="icon-sm"></i>
      </button>
    `;

    // Ajout au conteneur
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    container.appendChild(toast);

    // Initialisation des icones
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }

    // Suppression automatique
    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  /**
   * Retourne l'icone du toast selon le type
   * @param {string} type
   * @returns {string}
   */
  getToastIcon(type) {
    const icons = {
      success: 'check-circle',
      warning: 'alert-triangle',
      danger: 'alert-circle',
      info: 'info'
    };
    return icons[type] || 'info';
  },

  /**
   * Affiche une modale de confirmation
   * @param {Object} options - Options de la modale
   * @returns {Promise<boolean>}
   */
  confirm(options = {}) {
    return new Promise((resolve) => {
      const {
        title = 'Confirmation',
        message = 'Etes-vous sur ?',
        confirmText = 'Confirmer',
        cancelText = 'Annuler',
        type = 'warning'
      } = options;

      // Creation de la modale
      const backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop active';
      backdrop.innerHTML = `
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title">${title}</h3>
          </div>
          <div class="modal-body">
            <p>${message}</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" id="modalCancel">${cancelText}</button>
            <button class="btn btn-${type === 'danger' ? 'danger' : 'primary'}" id="modalConfirm">${confirmText}</button>
          </div>
        </div>
      `;

      document.body.appendChild(backdrop);

      // Gestion des boutons
      backdrop.querySelector('#modalCancel').addEventListener('click', () => {
        backdrop.remove();
        resolve(false);
      });

      backdrop.querySelector('#modalConfirm').addEventListener('click', () => {
        backdrop.remove();
        resolve(true);
      });

      // Fermeture en cliquant sur le backdrop
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
          backdrop.remove();
          resolve(false);
        }
      });
    });
  }
};

/**
 * Fonctions utilitaires
 */
const Utils = {
  /**
   * Formate un nombre en devise EUR
   * @param {number} value - Valeur a formater
   * @param {boolean} showSymbol - Afficher le symbole EUR
   * @returns {string}
   */
  formatCurrency(value, showSymbol = true) {
    const formatted = new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);

    return showSymbol ? `${formatted} €` : formatted;
  },

  /**
   * Formate un pourcentage
   * @param {number} value - Valeur a formater
   * @param {number} decimals - Nombre de decimales
   * @returns {string}
   */
  formatPercent(value, decimals = 1) {
    return `${value.toFixed(decimals)} %`;
  },

  /**
   * Formate une date
   * @param {Date|string} date - Date a formater
   * @param {string} format - Format (short, long, iso)
   * @returns {string}
   */
  formatDate(date, format = 'short') {
    const d = new Date(date);

    if (format === 'iso') {
      return d.toISOString().split('T')[0];
    }

    const options = format === 'long'
      ? { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
      : { day: '2-digit', month: '2-digit', year: 'numeric' };

    return d.toLocaleDateString('fr-FR', options);
  },

  /**
   * Formate un jour de la semaine
   * @param {Date|string} date
   * @returns {string}
   */
  formatDayOfWeek(date) {
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', { weekday: 'long' });
  },

  /**
   * Calcule la semaine ISO
   * @param {Date} date
   * @returns {number}
   */
  getISOWeek(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  },

  /**
   * Debounce une fonction
   * @param {Function} func
   * @param {number} wait
   * @returns {Function}
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Parse un nombre depuis une chaine
   * @param {string} str
   * @returns {number}
   */
  parseNumber(str) {
    if (typeof str === 'number') return str;
    if (!str) return 0;
    // Gestion du format francais (virgule)
    const cleaned = str.replace(/\s/g, '').replace(',', '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  },

  /**
   * Calcule le CA HT depuis la ventilation TVA
   * @param {Object} ventilation - {5.5: montantHT, 10: montantHT, 20: montantHT}
   * @returns {number}
   */
  calculateCAHT(ventilation) {
    return Object.values(ventilation).reduce((sum, val) => sum + (val || 0), 0);
  },

  /**
   * Calcule le CA TTC depuis la ventilation TVA
   * @param {Object} ventilation - {5.5: montantHT, 10: montantHT, 20: montantHT}
   * @returns {number}
   */
  calculateCATTC(ventilation) {
    let total = 0;
    for (const [taux, ht] of Object.entries(ventilation)) {
      total += ht * (1 + parseFloat(taux) / 100);
    }
    return total;
  },

  /**
   * Determine la couleur d'alerte pour la masse salariale
   * @param {number} percent
   * @returns {string}
   */
  getMasseSalarialeAlertColor(percent) {
    const { seuils } = APP_CONFIG;
    if (percent < seuils.masseSalariale.vert) return 'success';
    if (percent < seuils.masseSalariale.jaune) return 'warning';
    if (percent < seuils.masseSalariale.orange) return 'caution';
    return 'danger';
  },

  /**
   * Determine la couleur d'alerte pour les achats
   * @param {number} percent
   * @returns {string}
   */
  getAchatsAlertColor(percent) {
    return percent < APP_CONFIG.seuils.achats.vert ? 'success' : 'danger';
  },

  /**
   * Determine la couleur d'alerte pour l'EBE
   * @param {number} value
   * @returns {string}
   */
  getEBEAlertColor(value) {
    return value >= 0 ? 'success' : 'danger';
  },

  /**
   * Determine la couleur d'alerte pour l'ecart de caisse
   * @param {number} ecart
   * @returns {string}
   */
  getEcartCaisseStatus(ecart) {
    const absEcart = Math.abs(ecart);
    if (absEcart <= 1) return 'success';
    if (absEcart <= APP_CONFIG.seuils.ecartCaisse) return 'caution';
    return 'danger';
  }
};

// Initialisation automatique au chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

// Export pour utilisation dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { App, Utils, APP_CONFIG };
}
