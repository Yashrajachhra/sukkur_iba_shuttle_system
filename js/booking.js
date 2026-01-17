// Booking Manager - handles ride bookings
class BookingManager {
    constructor() {
        this.bookings = [];
        this.loadBookings();
    }

    initialize() {
        this.setupForm();
        this.populateRouteOptions();
        this.setupTimeOptions();
        this.setupStudentIdFormat();
    }

    setupStudentIdFormat() {
        const studentIdInput = document.getElementById('studentId');
        if (!studentIdInput) return;

        studentIdInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, ''); // Remove all non-digits
            
            // Format: xxx-xx-xxxx
            if (value.length > 0) {
                if (value.length <= 3) {
                    value = value;
                } else if (value.length <= 5) {
                    value = value.slice(0, 3) + '-' + value.slice(3);
                } else {
                    value = value.slice(0, 3) + '-' + value.slice(3, 5) + '-' + value.slice(5, 9);
                }
            }
            
            e.target.value = value;
        });

        studentIdInput.addEventListener('keydown', (e) => {
            // Allow: backspace, delete, tab, escape, enter, and arrow keys
            if ([46, 8, 9, 27, 13, 35, 36, 37, 38, 39, 40].indexOf(e.keyCode) !== -1 ||
                // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                (e.keyCode === 65 && e.ctrlKey === true) ||
                (e.keyCode === 67 && e.ctrlKey === true) ||
                (e.keyCode === 86 && e.ctrlKey === true) ||
                (e.keyCode === 88 && e.ctrlKey === true)) {
                return;
            }
            // Ensure that it is a number and stop the keypress if not
            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                e.preventDefault();
            }
        });
    }

    loadBookings() {
        const savedBookings = localStorage.getItem('shuttleBookings');
        if (savedBookings) {
            this.bookings = JSON.parse(savedBookings);
        }
    }

    saveBookings() {
        localStorage.setItem('shuttleBookings', JSON.stringify(this.bookings));
    }

    setupForm() {
        const form = document.getElementById('bookingForm');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleBooking(e);
        });
    }

    populateRouteOptions() {
        const routeSelect = document.getElementById('bookingRoute');
        if (!routeSelect) return;

        // Clear existing options
        routeSelect.innerHTML = '<option value="">Choose a route...</option>';

        // Get routes from schedule
        const scheduleData = localStorage.getItem('shuttleSchedule');
        if (scheduleData) {
            try {
                const schedule = JSON.parse(scheduleData);
                const uniqueRoutes = [...new Set(schedule.map(item => item.route))];
                
                uniqueRoutes.forEach(route => {
                    const option = document.createElement('option');
                    option.value = route;
                    option.textContent = route;
                    routeSelect.appendChild(option);
                });
            } catch (e) {
                console.error('Error parsing schedule data:', e);
            }
        }

        // Update time options when route changes
        routeSelect.addEventListener('change', () => {
            this.updateTimeOptions(routeSelect.value);
        });
    }

    setupTimeOptions() {
        const routeSelect = document.getElementById('bookingRoute');
        if (routeSelect && routeSelect.value) {
            this.updateTimeOptions(routeSelect.value);
        }
    }

    updateTimeOptions(route) {
        const timeSelect = document.getElementById('bookingTime');
        if (!timeSelect) return;

        // Clear existing options
        timeSelect.innerHTML = '<option value="">Select time...</option>';

        if (!route) return;

        // Get schedule for selected route - use exact times from schedule
        const scheduleData = localStorage.getItem('shuttleSchedule');
        if (scheduleData) {
            try {
                const schedule = JSON.parse(scheduleData);
                // Filter by exact route match and only show available slots
                const routeSchedule = schedule.filter(item => 
                    item.route === route && 
                    item.available > 0 &&
                    item.departure // Ensure departure time exists
                );
                
                // Sort by departure time
                routeSchedule.sort((a, b) => {
                    const timeA = a.departure.replace(':', '');
                    const timeB = b.departure.replace(':', '');
                    return timeA.localeCompare(timeB);
                });
                
                // Add each available time from the schedule
                routeSchedule.forEach(item => {
                    const option = document.createElement('option');
                    option.value = item.departure;
                    const shiftInfo = item.shift ? ` - ${item.shift}` : '';
                    option.textContent = `${item.departure}${shiftInfo} (${item.available} seats available)`;
                    option.setAttribute('data-arrival', item.arrival || '');
                    timeSelect.appendChild(option);
                });
                
                // If no times available, show message
                if (routeSchedule.length === 0) {
                    const option = document.createElement('option');
                    option.value = '';
                    option.textContent = 'No available times for this route';
                    option.disabled = true;
                    timeSelect.appendChild(option);
                }
            } catch (e) {
                console.error('Error parsing schedule data in updateTimeOptions:', e);
                const option = document.createElement('option');
                option.value = '';
                option.textContent = 'Error loading times';
                option.disabled = true;
                timeSelect.appendChild(option);
            }
        } else {
            // If no schedule data, try to reload it
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'Loading schedule...';
            option.disabled = true;
            timeSelect.appendChild(option);
            
            // Trigger a reload after a short delay
            setTimeout(() => {
                this.updateTimeOptions(route);
            }, 500);
        }
    }

    handleBooking(event) {
        const formData = new FormData(event.target);
        const name = document.getElementById('studentName').value;
        const studentId = document.getElementById('studentId').value;
        const route = document.getElementById('bookingRoute').value;
        const time = document.getElementById('bookingTime').value;

        // Use current date automatically
        const today = new Date().toISOString().split('T')[0];

        // Validate form
        if (!name || !studentId || !route || !time) {
            alert('Please fill in all fields');
            return;
        }

        // Check availability
        if (!this.checkAvailability(route, time)) {
            alert('Sorry, this time slot is no longer available');
            return;
        }

        // Create booking
        const booking = {
            id: this.generateBookingId(),
            name,
            studentId,
            route,
            date: today,
            time,
            status: 'confirmed',
            createdAt: new Date().toISOString()
        };

        // Save booking
        this.bookings.push(booking);
        this.saveBookings();

        // Update schedule availability
        this.updateScheduleAvailability(route, time);

        // Refresh schedule display to show updated seat numbers
        this.refreshScheduleDisplay();

        // Show success message
        this.showBookingSuccess(booking.id);

        // Reset form
        event.target.reset();
    }

    refreshScheduleDisplay() {
        // Trigger a custom event to refresh the schedule
        window.dispatchEvent(new CustomEvent('scheduleUpdated'));
        
        // Also directly reload schedule if ScheduleManager is available
        const scheduleData = localStorage.getItem('shuttleSchedule');
        if (scheduleData) {
            // Force reload by triggering schedule reload
            setTimeout(() => {
                const event = new CustomEvent('refreshSchedule');
                window.dispatchEvent(event);
            }, 100);
        }
    }

    checkAvailability(route, time) {
        const scheduleData = localStorage.getItem('shuttleSchedule');
        if (!scheduleData) return false;

        const schedule = JSON.parse(scheduleData);
        const scheduleItem = schedule.find(item => item.route === route && item.departure === time);
        
        return scheduleItem && scheduleItem.available > 0;
    }

    updateScheduleAvailability(route, time) {
        const scheduleData = localStorage.getItem('shuttleSchedule');
        if (!scheduleData) return;

        const schedule = JSON.parse(scheduleData);
        const scheduleItem = schedule.find(item => item.route === route && item.departure === time);
        
        if (scheduleItem && scheduleItem.available > 0) {
            scheduleItem.available -= 1;
            localStorage.setItem('shuttleSchedule', JSON.stringify(schedule));
            
            // Update the schedule in memory if ScheduleManager is tracking it
            // This ensures the display updates immediately
            return true;
        }
        return false;
    }

    generateBookingId() {
        return 'BK' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 5).toUpperCase();
    }

    showBookingSuccess(bookingId) {
        const successDiv = document.getElementById('bookingSuccess');
        const bookingIdSpan = document.getElementById('bookingId');
        
        if (successDiv && bookingIdSpan) {
            bookingIdSpan.textContent = bookingId;
            successDiv.classList.remove('hidden');
            
            // Hide after 5 seconds
            setTimeout(() => {
                successDiv.classList.add('hidden');
            }, 5000);
        }
    }

    getBookings() {
        return this.bookings;
    }

    getBookingsByStudentId(studentId) {
        return this.bookings.filter(booking => booking.studentId === studentId);
    }
}
