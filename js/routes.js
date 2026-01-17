// Route Manager - handles route information display
class RouteManager {
    constructor() {
        this.routes = [];
    }

    async loadRoutes() {
        try {
            // Always try to fetch from JSON file first to get latest data
            const response = await fetch('data/routes.json');
            if (response.ok) {
                this.routes = await response.json();
                localStorage.setItem('shuttleRoutes', JSON.stringify(this.routes));
            } else {
                throw new Error('Fetch failed');
            }
        } catch (error) {
            // If fetch fails (file:// protocol or network error), use fallback
            console.log('Using fallback routes data');
            const savedRoutes = localStorage.getItem('shuttleRoutes');
            if (savedRoutes) {
                try {
                    this.routes = JSON.parse(savedRoutes);
                } catch (e) {
                    // If parsing fails, use default
                    this.routes = this.getDefaultRoutes();
                    localStorage.setItem('shuttleRoutes', JSON.stringify(this.routes));
                }
            } else {
                // Use default route data as fallback
                this.routes = this.getDefaultRoutes();
                localStorage.setItem('shuttleRoutes', JSON.stringify(this.routes));
            }
        }
        
        // Ensure data is always in localStorage
        if (!localStorage.getItem('shuttleRoutes')) {
            localStorage.setItem('shuttleRoutes', JSON.stringify(this.routes));
        }
        
        this.displayRoutes();
        
        // Dispatch event that routes are loaded
        window.dispatchEvent(new CustomEvent('routesLoaded'));
    }

    getDefaultRoutes() {
        return [
            {
                id: 1,
                name: 'Rohri to Sukkur IBA University (Route 01)',
                description: 'Route from Rohri to Sukkur IBA University with multiple pickup points',
                stops: ['Rohri', 'Navy Park', 'Old Sukkur', 'Shalimar', 'Local Board', 'Dolphin', 'Ayub Gate', 'Gurdwara Chowk', 'Police Line', 'Officer Club', 'Sukkur IBA University'],
                duration: '45 minutes',
                frequency: 'Multiple shifts daily',
                fare: 'Free for students'
            },
            {
                id: 2,
                name: 'Qasim Park to Sukkur IBA University (Route 02)',
                description: 'Route from Qasim Park to Sukkur IBA University via multiple stops',
                stops: ['Qasim Park', 'Dua Chowk', 'Emmys Pizza', 'Allah Wali Masjid', 'Bhutta Road', 'Lanch Mor', 'Hira Hospital', 'Hockey Ground', 'High Court', 'Benazir Park', 'Military Road', 'Airport Road', '100 ft. Road', 'Society Hostels', 'Physical Hostel', 'Sukkur IBA University'],
                duration: '40 minutes',
                frequency: 'Multiple shifts daily',
                fare: 'Free for students',
                note: '100ft Road Pick only for Girls'
            },
            {
                id: 3,
                name: 'City Point to Sukkur IBA University (Route 03)',
                description: 'Direct route from City Point to Sukkur IBA University',
                stops: ['City Point', 'NICVD Hospital', 'Township', 'Sukkur IBA University'],
                duration: '20 minutes',
                frequency: 'Multiple shifts daily',
                fare: 'Free for students'
            }
        ];
    }

    displayRoutes() {
        const container = document.getElementById('routesContainer');
        if (!container) return;

        container.innerHTML = this.routes.map(route => {
            const stopsList = route.stops.map((stop, index) => 
                `<li class="flex items-center">
                    <span class="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs mr-2">${index + 1}</span>
                    ${stop}
                </li>`
            ).join('');

            return `
                <div class="route-card stagger-item bg-white p-6 rounded-xl shadow-lg">
                    <div class="flex items-center mb-4">
                        <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                            ${route.id}
                        </div>
                        <h3 class="text-2xl font-bold gradient-text">${route.name}</h3>
                    </div>
                    <p class="text-gray-600 mb-4 leading-relaxed">${route.description}</p>
                    
                    <div class="mb-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg">
                        <h4 class="font-bold text-gray-800 mb-3 flex items-center">
                            <span class="mr-2">📍</span>Stops:
                        </h4>
                        <ul class="space-y-2">
                            ${stopsList}
                        </ul>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4 mb-4">
                        <div class="p-3 bg-blue-50 rounded-lg">
                            <span class="text-xs text-gray-500 block mb-1">Duration:</span>
                            <p class="font-bold text-blue-600">${route.duration}</p>
                        </div>
                        <div class="p-3 bg-green-50 rounded-lg">
                            <span class="text-xs text-gray-500 block mb-1">Frequency:</span>
                            <p class="font-bold text-green-600">${route.frequency}</p>
                        </div>
                    </div>
                    
                    <div class="border-t pt-4 mt-4 bg-gradient-to-r from-green-100 to-emerald-100 p-4 rounded-lg">
                        <span class="text-lg font-bold text-green-700 flex items-center">
                            <span class="mr-2">💰</span>${route.fare}
                        </span>
                        ${route.note ? `<p class="text-xs text-orange-700 mt-2 italic bg-orange-50 p-2 rounded">⚠️ Note: ${route.note}</p>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    getRoutes() {
        return this.routes;
    }

    getRouteByName(name) {
        return this.routes.find(route => route.name === name);
    }
}
