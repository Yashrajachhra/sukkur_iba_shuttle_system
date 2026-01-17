// Main application entry point
// All classes are loaded via script tags in index.html

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Sukkur IBA Shuttle System initialized');
    
    // Initialize navigation first (doesn't depend on data)
    const navigationManager = new NavigationManager();
    
    // Initialize managers
    const scheduleManager = new ScheduleManager();
    const routeManager = new RouteManager();
    const bookingManager = new BookingManager();
    
    // Load initial data
    scheduleManager.loadSchedule();
    routeManager.loadRoutes();
    
    // Initialize booking manager after a short delay to ensure schedule is loaded
    // The scheduleLoaded event will trigger when async load completes
    let bookingInitialized = false;
    
    const initBooking = () => {
        if (!bookingInitialized) {
            bookingInitialized = true;
            bookingManager.initialize();
        }
    };
    
    // Wait for schedule to load before initializing booking manager
    window.addEventListener('scheduleLoaded', () => {
        initBooking();
    }, { once: true });
    
    // Also try to initialize after a delay if event hasn't fired
    // This handles cases where data is already in localStorage
    setTimeout(() => {
        initBooking();
    }, 200);
    
    // Make managers globally available for debugging
    window.scheduleManager = scheduleManager;
    window.routeManager = routeManager;
    window.bookingManager = bookingManager;
});
