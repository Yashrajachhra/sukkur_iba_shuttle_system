// Schedule Manager - handles shuttle schedule display and filtering
class ScheduleManager {
    constructor() {
        this.schedule = [];
        this.filteredSchedule = [];
    }

    async loadSchedule() {
        try {
            // Always try to fetch from JSON file first to get latest data
            const response = await fetch('data/schedule.json');
            if (response.ok) {
                this.schedule = await response.json();
                localStorage.setItem('shuttleSchedule', JSON.stringify(this.schedule));
            } else {
                throw new Error('Fetch failed');
            }
        } catch (error) {
            // If fetch fails (file:// protocol or network error), use fallback
            console.log('Using fallback schedule data');
            const savedSchedule = localStorage.getItem('shuttleSchedule');
            if (savedSchedule) {
                try {
                    this.schedule = JSON.parse(savedSchedule);
                } catch (e) {
                    // If parsing fails, use default
                    this.schedule = this.getDefaultSchedule();
                    localStorage.setItem('shuttleSchedule', JSON.stringify(this.schedule));
                }
            } else {
                // Use default schedule data as fallback
                this.schedule = this.getDefaultSchedule();
                localStorage.setItem('shuttleSchedule', JSON.stringify(this.schedule));
            }
        }
        
        // Ensure data is always in localStorage
        if (!localStorage.getItem('shuttleSchedule')) {
            localStorage.setItem('shuttleSchedule', JSON.stringify(this.schedule));
        }
        
        this.displaySchedule();
        this.populateRouteFilter();
        
        // Listen for schedule update events
        window.addEventListener('refreshSchedule', () => {
            const savedSchedule = localStorage.getItem('shuttleSchedule');
            if (savedSchedule) {
                this.schedule = JSON.parse(savedSchedule);
                this.displaySchedule();
            }
        });
        
        // Dispatch event that schedule is loaded
        window.dispatchEvent(new CustomEvent('scheduleLoaded'));
    }

    getDefaultSchedule() {
        return [
            { id: 1, route: 'Rohri to Sukkur IBA University (Route 01)', shift: '1st Shift (Morning)', departure: '08:00', arrival: '08:35', status: 'on-time', capacity: 40, available: 25 },
            { id: 2, route: 'Qasim Park to Sukkur IBA University (Route 02)', shift: '1st Shift (Morning)', departure: '08:10', arrival: '08:30', status: 'on-time', capacity: 40, available: 30 },
            { id: 3, route: 'City Point to Sukkur IBA University (Route 03)', shift: '1st Shift (Morning)', departure: '08:20', arrival: '08:30', status: 'on-time', capacity: 40, available: 28 },
            { id: 4, route: 'Rohri to Sukkur IBA University (Route 01)', shift: '2nd Shift (Afternoon)', departure: '11:00', arrival: '11:30', status: 'on-time', capacity: 40, available: 20 },
            { id: 5, route: 'Qasim Park to Sukkur IBA University (Route 02)', shift: '2nd Shift (Afternoon)', departure: '11:10', arrival: '11:30', status: 'on-time', capacity: 40, available: 22 },
            { id: 6, route: 'Rohri to Sukkur IBA University (Route 01)', shift: '3rd Shift (Evening)', departure: '15:30', arrival: '16:05', status: 'on-time', capacity: 40, available: 18 },
            { id: 7, route: 'Qasim Park to Sukkur IBA University (Route 02)', shift: '3rd Shift (Evening)', departure: '15:40', arrival: '16:00', status: 'on-time', capacity: 40, available: 15 },
            { id: 8, route: 'Sukkur IBA University to Rohri (Route 01)', shift: '1st Shift Return', departure: '14:30', arrival: '15:15', status: 'on-time', capacity: 40, available: 32 },
            { id: 9, route: 'Sukkur IBA University to Qasim Park (Route 02)', shift: '1st Shift Return', departure: '14:30', arrival: '15:10', status: 'on-time', capacity: 40, available: 35 },
            { id: 10, route: 'Sukkur IBA University to City Point (Route 03)', shift: '1st Shift Return', departure: '14:30', arrival: '14:50', status: 'on-time', capacity: 40, available: 30 },
            { id: 11, route: 'Sukkur IBA University to Rohri (Route 01)', shift: '2nd Shift Return', departure: '17:15', arrival: '18:00', status: 'on-time', capacity: 40, available: 25 },
            { id: 12, route: 'Sukkur IBA University to Qasim Park (Route 02)', shift: '2nd Shift Return', departure: '17:15', arrival: '17:55', status: 'on-time', capacity: 40, available: 28 },
            { id: 13, route: 'Sukkur IBA University to Rohri (Route 01)', shift: '3rd Shift Return', departure: '20:10', arrival: '20:55', status: 'on-time', capacity: 40, available: 20 },
            { id: 14, route: 'Sukkur IBA University to Qasim Park (Route 02)', shift: '3rd Shift Return', departure: '20:10', arrival: '20:50', status: 'on-time', capacity: 40, available: 22 }
        ];
    }

    populateRouteFilter() {
        const filterSelect = document.getElementById('routeFilter');
        if (!filterSelect) return;

        // Get unique routes
        const routes = [...new Set(this.schedule.map(item => item.route))];
        
        // Clear existing options except "All Routes"
        filterSelect.innerHTML = '<option value="all">All Routes</option>';
        
        // Add route options
        routes.forEach(route => {
            const option = document.createElement('option');
            option.value = route;
            option.textContent = route;
            filterSelect.appendChild(option);
        });

        // Add event listener for filtering
        filterSelect.addEventListener('change', (e) => {
            this.filterSchedule(e.target.value);
        });
    }

    filterSchedule(routeFilter) {
        if (routeFilter === 'all') {
            this.filteredSchedule = [...this.schedule];
        } else {
            this.filteredSchedule = this.schedule.filter(item => item.route === routeFilter);
        }
        this.displaySchedule();
    }

    displaySchedule() {
        const tbody = document.getElementById('scheduleTableBody');
        if (!tbody) return;

        const scheduleToDisplay = this.filteredSchedule.length > 0 ? this.filteredSchedule : this.schedule;

        tbody.innerHTML = scheduleToDisplay.map(item => {
            const statusClass = `status-${item.status}`;
            const availabilityStatus = item.available > 0 ? 'available' : 'full';
            const availabilityClass = `status-${availabilityStatus}`;
            
            const shift = item.shift || 'Regular';
            return `
                <tr class="table-row">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${item.route}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${shift}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700">${item.departure}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700">${item.arrival}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-3 py-1 text-xs font-semibold rounded-full ${statusClass}">
                            ${item.status.charAt(0).toUpperCase() + item.status.slice(1).replace('-', ' ')}
                        </span>
                        <span class="ml-2 px-3 py-1 text-xs font-semibold rounded-full ${availabilityClass}">
                            ${item.available} seats
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                        <button class="book-btn text-blue-600 hover:text-blue-800 font-semibold transition-all" 
                                data-route="${item.route}" 
                                data-time="${item.departure}"
                                data-id="${item.id}">
                            📅 Book
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        // Add event listeners to book buttons
        tbody.querySelectorAll('.book-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const route = btn.getAttribute('data-route');
                const time = btn.getAttribute('data-time');
                this.handleQuickBook(route, time);
            });
        });
    }

    handleQuickBook(route, time) {
        // Switch to booking section and pre-fill form
        const bookingSection = document.getElementById('booking');
        if (bookingSection) {
            document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
            bookingSection.classList.add('active');
            
            // Pre-fill booking form
            const routeSelect = document.getElementById('bookingRoute');
            const timeSelect = document.getElementById('bookingTime');
            
            if (routeSelect) {
                routeSelect.value = route;
                // Trigger change event to populate time options
                const changeEvent = new Event('change', { bubbles: true });
                routeSelect.dispatchEvent(changeEvent);
                
                // Wait a bit for time options to populate, then set the time
                setTimeout(() => {
                    if (timeSelect && time) {
                        timeSelect.value = time;
                    }
                }, 100);
            }
            
            // Scroll to form
            bookingSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    getSchedule() {
        return this.schedule;
    }

    getScheduleByRoute(route) {
        return this.schedule.filter(item => item.route === route);
    }
}
