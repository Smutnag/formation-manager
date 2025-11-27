/**
 * THE VILLAGE - Module d'authentification
 * Gestion des sessions utilisateurs
 * Derniere mise a jour : 27/11/2025
 */

/**
 * Configuration des utilisateurs
 * En production, ces donnees viendront de Google Sheets
 */
const USERS_CONFIG = {
  elisa: {
    name: 'Elisa',
    role: 'user',
    access: {
      vegas: true,
      crepe: true,
      rentabilite: true,
      historique: true,
      parametres: false
    }
  },
  carolina: {
    name: 'Carolina',
    role: 'user',
    access: {
      vegas: true,
      crepe: true,
      rentabilite: true,
      historique: true,
      parametres: false
    }
  },
  charlotte: {
    name: 'Charlotte',
    role: 'user',
    access: {
      vegas: true,
      crepe: true,
      rentabilite: true,
      historique: false,
      parametres: false
    }
  },
  sephana: {
    name: 'Sephana',
    role: 'user',
    access: {
      vegas: true,
      crepe: true,
      rentabilite: true,
      historique: false,
      parametres: false
    }
  },
  shaina: {
    name: 'Shaina',
    role: 'user',
    access: {
      vegas: true,
      crepe: true,
      rentabilite: true,
      historique: false,
      parametres: false
    }
  },
  remi: {
    name: 'Remi',
    role: 'user',
    access: {
      vegas: true,
      crepe: true,
      rentabilite: true,
      historique: true,
      parametres: false
    }
  },
  orlane: {
    name: 'Orlane',
    role: 'user',
    access: {
      vegas: true,
      crepe: true,
      rentabilite: true,
      historique: false,
      parametres: false
    }
  },
  kt: {
    name: 'KT',
    role: 'admin',
    access: {
      vegas: true,
      crepe: true,
      rentabilite: true,
      historique: true,
      parametres: true
    }
  }
};

/**
 * Mots de passe temporaires (en production, verification via Google Sheets)
 * Note: Ces mots de passe sont uniquement pour le developpement
 */
const TEMP_PASSWORDS = {
  elisa: 'village2024',
  carolina: 'village2024',
  charlotte: 'village2024',
  sephana: 'village2024',
  shaina: 'village2024',
  remi: 'village2024',
  orlane: 'village2024',
  kt: 'admin2024'
};

/**
 * Cle de stockage pour la session
 */
const SESSION_KEY = 'village_session';
const RESTAURANT_KEY = 'village_restaurant';

/**
 * Module d'authentification
 */
const Auth = {
  /**
   * Tente de connecter un utilisateur
   * @param {string} username - Identifiant utilisateur
   * @param {string} password - Mot de passe
   * @returns {Object} - Resultat de la connexion
   */
  async login(username, password) {
    // Verification des champs
    if (!username || !password) {
      return {
        success: false,
        message: 'Veuillez remplir tous les champs'
      };
    }

    // Verification de l'utilisateur
    const user = USERS_CONFIG[username.toLowerCase()];
    if (!user) {
      return {
        success: false,
        message: 'Utilisateur inconnu'
      };
    }

    // Verification du mot de passe (en production: appel API Google Sheets)
    const validPassword = TEMP_PASSWORDS[username.toLowerCase()];
    if (password !== validPassword) {
      return {
        success: false,
        message: 'Mot de passe incorrect'
      };
    }

    // Creation de la session
    const session = {
      userId: username.toLowerCase(),
      userName: user.name,
      role: user.role,
      access: user.access,
      loginTime: new Date().toISOString()
    };

    // Sauvegarde en localStorage
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));

    // Effacer le restaurant precedemment selectionne
    localStorage.removeItem(RESTAURANT_KEY);

    return {
      success: true,
      user: session
    };
  },

  /**
   * Deconnecte l'utilisateur courant
   */
  logout() {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(RESTAURANT_KEY);
    window.location.href = 'login.html';
  },

  /**
   * Recupere la session courante
   * @returns {Object|null} - Session utilisateur ou null
   */
  getSession() {
    const sessionData = localStorage.getItem(SESSION_KEY);
    if (!sessionData) {
      return null;
    }

    try {
      return JSON.parse(sessionData);
    } catch (e) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
  },

  /**
   * Verifie si l'utilisateur est connecte
   * @returns {boolean}
   */
  isLoggedIn() {
    return this.getSession() !== null;
  },

  /**
   * Verifie si l'utilisateur est admin
   * @returns {boolean}
   */
  isAdmin() {
    const session = this.getSession();
    return session && session.role === 'admin';
  },

  /**
   * Verifie si l'utilisateur a acces a une fonctionnalite
   * @param {string} feature - Nom de la fonctionnalite
   * @returns {boolean}
   */
  hasAccess(feature) {
    const session = this.getSession();
    if (!session || !session.access) {
      return false;
    }
    return session.access[feature] === true;
  },

  /**
   * Recupere les restaurants accessibles pour l'utilisateur
   * @returns {Array} - Liste des restaurants accessibles
   */
  getAccessibleRestaurants() {
    const session = this.getSession();
    if (!session || !session.access) {
      return [];
    }

    const restaurants = [];
    if (session.access.vegas) {
      restaurants.push({
        id: 'vegas',
        name: 'Vegas Kitchen',
        icon: 'utensils',
        color: 'vegas'
      });
    }
    if (session.access.crepe) {
      restaurants.push({
        id: 'crepe',
        name: 'La Crepe au Carre',
        icon: 'cookie',
        color: 'crepe'
      });
    }
    if (session.access.rentabilite) {
      restaurants.push({
        id: 'rentabilite',
        name: 'Rentabilite Globale',
        icon: 'bar-chart-2',
        color: 'rentabilite'
      });
    }

    return restaurants;
  },

  /**
   * Definit le restaurant selectionne
   * @param {string} restaurantId - ID du restaurant
   * @returns {boolean} - Succes de l'operation
   */
  setRestaurant(restaurantId) {
    const session = this.getSession();
    if (!session) {
      return false;
    }

    // Verification des droits
    const accessKey = restaurantId === 'vegas' ? 'vegas' :
                      restaurantId === 'crepe' ? 'crepe' :
                      restaurantId === 'rentabilite' ? 'rentabilite' : null;

    if (!accessKey || !session.access[accessKey]) {
      return false;
    }

    localStorage.setItem(RESTAURANT_KEY, restaurantId);
    return true;
  },

  /**
   * Recupere le restaurant selectionne
   * @returns {string|null} - ID du restaurant ou null
   */
  getRestaurant() {
    return localStorage.getItem(RESTAURANT_KEY);
  },

  /**
   * Recupere les informations completes du restaurant selectionne
   * @returns {Object|null}
   */
  getRestaurantInfo() {
    const restaurantId = this.getRestaurant();
    if (!restaurantId) {
      return null;
    }

    const restaurants = {
      vegas: {
        id: 'vegas',
        name: 'Vegas Kitchen',
        shortName: 'Vegas',
        icon: 'utensils',
        color: 'vegas',
        theme: 'theme-vegas'
      },
      crepe: {
        id: 'crepe',
        name: 'La Crepe au Carre',
        shortName: 'Crepe',
        icon: 'cookie',
        color: 'crepe',
        theme: 'theme-crepe'
      },
      rentabilite: {
        id: 'rentabilite',
        name: 'Rentabilite Globale',
        shortName: 'Global',
        icon: 'bar-chart-2',
        color: 'rentabilite',
        theme: 'theme-rentabilite'
      }
    };

    return restaurants[restaurantId] || null;
  },

  /**
   * Verifie la session et redirige si necessaire
   * @param {Object} options - Options de verification
   * @param {boolean} options.requireLogin - Necessite une connexion
   * @param {boolean} options.requireRestaurant - Necessite un restaurant selectionne
   * @param {string} options.requireAccess - Fonctionnalite requise
   */
  checkAuth(options = {}) {
    const {
      requireLogin = true,
      requireRestaurant = false,
      requireAccess = null
    } = options;

    // Verification de la connexion
    if (requireLogin && !this.isLoggedIn()) {
      window.location.href = 'login.html';
      return false;
    }

    // Verification du restaurant
    if (requireRestaurant && !this.getRestaurant()) {
      window.location.href = 'selection.html';
      return false;
    }

    // Verification des droits
    if (requireAccess && !this.hasAccess(requireAccess)) {
      window.location.href = 'selection.html';
      return false;
    }

    return true;
  },

  /**
   * Recupere les initiales de l'utilisateur
   * @returns {string}
   */
  getUserInitials() {
    const session = this.getSession();
    if (!session || !session.userName) {
      return '?';
    }

    const name = session.userName;
    if (name.length <= 2) {
      return name.toUpperCase();
    }

    return name.charAt(0).toUpperCase();
  }
};

// Export pour utilisation dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Auth;
}
