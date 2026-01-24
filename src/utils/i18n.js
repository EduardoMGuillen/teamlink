import AsyncStorage from '@react-native-async-storage/async-storage';

// Translations
const translations = {
  en: {
    // Auth
    login: 'Login',
    signUp: 'Sign Up',
    signUpTitle: 'Create Account',
    username: 'Username',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    signIn: 'Sign In',
    signOut: 'Sign Out',
    welcome: 'Welcome',
    invalidCredentials: 'Invalid username or password',
    fullName: 'Full Name',
    dateOfBirth: 'Date of Birth',
    country: 'Country',
    city: 'City',
    timezone: 'Timezone',
    gender: 'Gender',
    phoneNumber: 'Phone Number',
    male: 'Male',
    female: 'Female',
    other: 'Other',
    alreadyHaveAccount: 'Already have an account?',
    dontHaveAccount: "Don't have an account?",
    passwordsDontMatch: 'Passwords do not match',
    registrationSuccess: 'Registration successful!',
    selectGender: 'Select Gender',
    
    // Dashboard
    dashboard: 'Dashboard',
    quickActions: 'Quick Actions',
    recentActivity: 'Recent Activity',
    clockIn: 'Clock In',
    viewSchedule: 'View Schedule',
    myTasks: 'My Tasks',
    messages: 'Messages',
    
    // Time Clock
    timeClock: 'Time Clock',
    clockOut: 'Clock Out',
    clockedInAt: 'Clocked in at',
    duration: 'Duration',
    location: 'Location',
    recentShifts: 'Recent Shifts',
    mainOffice: 'Main Office',
    warehouse: 'Warehouse',
    remote: 'Remote',
    
    // Tasks
    tasks: 'Tasks',
    all: 'All',
    pending: 'Pending',
    inProgress: 'In Progress',
    completed: 'Completed',
    addTask: 'Add Task',
    taskTitle: 'Task Title',
    taskDescription: 'Description',
    dueDate: 'Due Date',
    priority: 'Priority',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    noTasks: 'No tasks found',
    
    // Settings
    settings: 'Settings',
    language: 'Language',
    english: 'English',
    spanish: 'Spanish',
    french: 'French',
    profile: 'Profile',
    notifications: 'Notifications',
    about: 'About',
    
    // Team Collaboration
    directory: 'Directory',
    chat: 'Chat',
    updates: 'Updates',
    team: 'Team',
    assignTo: 'Assign To',
    assignedBy: 'Assigned By',
    sendMessage: 'Send Message',
    typeMessage: 'Type a message...',
    noMessages: 'No messages yet',
    noUsers: 'No users found',
    noResults: 'No results found',
    createUpdate: 'Create Update',
    updateTitle: 'Title',
    updateContent: 'Content',
    urgent: 'Urgent',
    normal: 'Normal',
    pinned: 'Pinned',
    noUpdates: 'No updates yet',
    noNotifications: 'No notifications',
    markAllRead: 'Mark all read',
    
    // Common
    today: 'Today',
    yesterday: 'Yesterday',
    justNow: 'Just now',
    hoursAgo: 'hours ago',
    minutesAgo: 'minutes ago',
    hours: 'Hours',
    thisWeek: 'This Week',
    noRecentActivity: 'No recent activity',
    search: 'Search',
    sortBy: 'Sort By',
    date: 'Date',
    priority: 'Priority',
    status: 'Status',
    totalHours: 'Total Hours',
    weeklySummary: 'Weekly Summary',
    alreadyClockedIn: 'You are already clocked in',
    mustClockOut: 'Please clock out first',
    noShiftsFound: 'No shifts found',
    changeStatus: 'Change Status',
    selectNewStatus: 'Select new status:',
  },
  es: {
    // Auth
    login: 'Iniciar Sesión',
    signUp: 'Registrarse',
    signUpTitle: 'Crear Cuenta',
    username: 'Usuario',
    email: 'Correo Electrónico',
    password: 'Contraseña',
    confirmPassword: 'Confirmar Contraseña',
    signIn: 'Iniciar Sesión',
    signOut: 'Cerrar Sesión',
    welcome: 'Bienvenido',
    invalidCredentials: 'Usuario o contraseña inválidos',
    fullName: 'Nombre Completo',
    dateOfBirth: 'Fecha de Nacimiento',
    country: 'País',
    city: 'Ciudad',
    timezone: 'Zona Horaria',
    gender: 'Género',
    phoneNumber: 'Número de Teléfono',
    male: 'Masculino',
    female: 'Femenino',
    other: 'Otro',
    alreadyHaveAccount: '¿Ya tienes una cuenta?',
    dontHaveAccount: '¿No tienes una cuenta?',
    passwordsDontMatch: 'Las contraseñas no coinciden',
    registrationSuccess: '¡Registro exitoso!',
    selectGender: 'Seleccionar Género',
    
    // Dashboard
    dashboard: 'Panel',
    quickActions: 'Acciones Rápidas',
    recentActivity: 'Actividad Reciente',
    clockIn: 'Marcar Entrada',
    viewSchedule: 'Ver Horario',
    myTasks: 'Mis Tareas',
    messages: 'Mensajes',
    
    // Time Clock
    timeClock: 'Reloj de Tiempo',
    clockOut: 'Marcar Salida',
    clockedInAt: 'Entrada a las',
    duration: 'Duración',
    location: 'Ubicación',
    recentShifts: 'Turnos Recientes',
    mainOffice: 'Oficina Principal',
    warehouse: 'Almacén',
    remote: 'Remoto',
    
    // Tasks
    tasks: 'Tareas',
    all: 'Todas',
    pending: 'Pendientes',
    inProgress: 'En Progreso',
    completed: 'Completadas',
    addTask: 'Agregar Tarea',
    taskTitle: 'Título de Tarea',
    taskDescription: 'Descripción',
    dueDate: 'Fecha de Vencimiento',
    priority: 'Prioridad',
    high: 'Alta',
    medium: 'Media',
    low: 'Baja',
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    noTasks: 'No se encontraron tareas',
    
    // Settings
    settings: 'Configuración',
    language: 'Idioma',
    english: 'Inglés',
    spanish: 'Español',
    french: 'Francés',
    profile: 'Perfil',
    notifications: 'Notificaciones',
    about: 'Acerca de',
    
    // Team Collaboration
    directory: 'Directorio',
    chat: 'Chat',
    updates: 'Actualizaciones',
    team: 'Equipo',
    assignTo: 'Asignar A',
    assignedBy: 'Asignado Por',
    sendMessage: 'Enviar Mensaje',
    typeMessage: 'Escribe un mensaje...',
    noMessages: 'Aún no hay mensajes',
    noUsers: 'No se encontraron usuarios',
    noResults: 'No se encontraron resultados',
    createUpdate: 'Crear Actualización',
    updateTitle: 'Título',
    updateContent: 'Contenido',
    urgent: 'Urgente',
    normal: 'Normal',
    pinned: 'Fijado',
    noUpdates: 'Aún no hay actualizaciones',
    noNotifications: 'No hay notificaciones',
    markAllRead: 'Marcar todas como leídas',
    
    // Common
    today: 'Hoy',
    yesterday: 'Ayer',
    justNow: 'Ahora mismo',
    hoursAgo: 'hace horas',
    minutesAgo: 'hace minutos',
    hours: 'Horas',
    thisWeek: 'Esta Semana',
    noRecentActivity: 'Sin actividad reciente',
    search: 'Buscar',
    sortBy: 'Ordenar Por',
    date: 'Fecha',
    status: 'Estado',
    totalHours: 'Total de Horas',
    weeklySummary: 'Resumen Semanal',
    alreadyClockedIn: 'Ya has marcado entrada',
    mustClockOut: 'Por favor marca salida primero',
    noShiftsFound: 'No se encontraron turnos',
    changeStatus: 'Cambiar Estado',
    selectNewStatus: 'Selecciona el nuevo estado:',
  },
  fr: {
    // Auth
    login: 'Connexion',
    signUp: "S'inscrire",
    signUpTitle: 'Créer un compte',
    username: "Nom d'utilisateur",
    email: 'Email',
    password: 'Mot de passe',
    confirmPassword: 'Confirmer le mot de passe',
    signIn: 'Se connecter',
    signOut: 'Se déconnecter',
    welcome: 'Bienvenue',
    invalidCredentials: "Nom d'utilisateur ou mot de passe invalide",
    fullName: 'Nom complet',
    dateOfBirth: 'Date de naissance',
    country: 'Pays',
    city: 'Ville',
    timezone: 'Fuseau horaire',
    gender: 'Genre',
    phoneNumber: 'Numéro de téléphone',
    male: 'Masculin',
    female: 'Féminin',
    other: 'Autre',
    alreadyHaveAccount: 'Vous avez déjà un compte?',
    dontHaveAccount: "Vous n'avez pas de compte?",
    passwordsDontMatch: 'Les mots de passe ne correspondent pas',
    registrationSuccess: 'Inscription réussie!',
    selectGender: 'Sélectionner le genre',
    
    // Dashboard
    dashboard: 'Tableau de bord',
    quickActions: 'Actions rapides',
    recentActivity: 'Activité récente',
    clockIn: "Pointer l'entrée",
    viewSchedule: 'Voir le planning',
    myTasks: 'Mes tâches',
    messages: 'Messages',
    
    // Time Clock
    timeClock: 'Horloge',
    clockOut: "Pointer la sortie",
    clockedInAt: 'Entrée à',
    duration: 'Durée',
    location: 'Emplacement',
    recentShifts: 'Shifts récents',
    mainOffice: 'Bureau principal',
    warehouse: 'Entrepôt',
    remote: 'Distant',
    
    // Tasks
    tasks: 'Tâches',
    all: 'Toutes',
    pending: 'En attente',
    inProgress: 'En cours',
    completed: 'Terminées',
    addTask: 'Ajouter une tâche',
    taskTitle: 'Titre de la tâche',
    taskDescription: 'Description',
    dueDate: 'Date d\'échéance',
    priority: 'Priorité',
    high: 'Élevée',
    medium: 'Moyenne',
    low: 'Faible',
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    noTasks: 'Aucune tâche trouvée',
    
    // Settings
    settings: 'Paramètres',
    language: 'Langue',
    english: 'Anglais',
    spanish: 'Espagnol',
    french: 'Français',
    profile: 'Profil',
    notifications: 'Notifications',
    about: 'À propos',
    
    // Team Collaboration
    directory: 'Répertoire',
    chat: 'Chat',
    updates: 'Mises à jour',
    team: 'Équipe',
    assignTo: 'Assigner à',
    assignedBy: 'Assigné par',
    sendMessage: 'Envoyer un message',
    typeMessage: 'Tapez un message...',
    noMessages: 'Aucun message pour le moment',
    noUsers: 'Aucun utilisateur trouvé',
    noResults: 'Aucun résultat trouvé',
    createUpdate: 'Créer une mise à jour',
    updateTitle: 'Titre',
    updateContent: 'Contenu',
    urgent: 'Urgent',
    normal: 'Normal',
    pinned: 'Épinglé',
    noUpdates: 'Aucune mise à jour pour le moment',
    noNotifications: 'Aucune notification',
    markAllRead: 'Tout marquer comme lu',
    
    // Common
    today: "Aujourd'hui",
    yesterday: 'Hier',
    justNow: 'À l\'instant',
    hoursAgo: 'il y a heures',
    minutesAgo: 'il y a minutes',
    hours: 'Heures',
    thisWeek: 'Cette Semaine',
    noRecentActivity: 'Aucune activité récente',
    search: 'Rechercher',
    sortBy: 'Trier Par',
    date: 'Date',
    status: 'Statut',
    totalHours: 'Total d\'Heures',
    weeklySummary: 'Résumé Hebdomadaire',
    alreadyClockedIn: 'Vous avez déjà pointé l\'entrée',
    mustClockOut: 'Veuillez pointer la sortie d\'abord',
    noShiftsFound: 'Aucun shift trouvé',
    changeStatus: 'Changer le Statut',
    selectNewStatus: 'Sélectionnez le nouveau statut:',
  },
};

const STORAGE_KEY = '@teamlink_language';

class I18n {
  constructor() {
    this.currentLanguage = 'en';
    this.translations = translations;
  }

  async init() {
    try {
      const savedLanguage = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedLanguage && this.translations[savedLanguage]) {
        this.currentLanguage = savedLanguage;
      }
    } catch (error) {
      console.error('Error loading language:', error);
    }
  }

  async setLanguage(language) {
    if (this.translations[language]) {
      this.currentLanguage = language;
      try {
        await AsyncStorage.setItem(STORAGE_KEY, language);
      } catch (error) {
        console.error('Error saving language:', error);
      }
    }
  }

  t(key) {
    return this.translations[this.currentLanguage]?.[key] || key;
  }

  getLanguage() {
    return this.currentLanguage;
  }

  getAvailableLanguages() {
    return Object.keys(this.translations).map(key => ({
      code: key,
      name: this.translations[key].language || key,
    }));
  }
}

export const i18n = new I18n();
export default i18n;
