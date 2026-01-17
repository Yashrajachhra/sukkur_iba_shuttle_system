// Navigation Manager - handles page navigation
class NavigationManager {
    constructor() {
        this.currentSection = 'home';
        // Wait a bit to ensure DOM is fully loaded
        setTimeout(() => {
            this.init();
        }, 100);
    }

    init() {
        // Use event delegation for navigation links to ensure it works
        document.addEventListener('click', (e) => {
            const navLink = e.target.closest('.nav-link');
            if (navLink) {
                e.preventDefault();
                e.stopPropagation();
                const href = navLink.getAttribute('href');
                const targetId = href ? href.substring(1) : '';
                if (targetId) {
                    this.showSection(targetId);
                    // Update URL hash
                    window.history.pushState(null, null, `#${targetId}`);
                }
            }
            
            // Handle feature card clicks on home page
            const featureCard = e.target.closest('.feature-card');
            if (featureCard) {
                e.preventDefault();
                e.stopPropagation();
                const sectionId = featureCard.getAttribute('data-section');
                if (sectionId) {
                    this.showSection(sectionId);
                    // Update URL hash
                    window.history.pushState(null, null, `#${sectionId}`);
                    // Smooth scroll to section
                    const section = document.getElementById(sectionId);
                    if (section) {
                        section.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            }
        });

        // Also handle hash changes in URL (back/forward buttons)
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.substring(1);
            if (hash) {
                this.showSection(hash);
            } else {
                this.showSection('home');
            }
        });

        // Show initial section based on hash or default to home
        const initialHash = window.location.hash.substring(1);
        if (initialHash) {
            this.showSection(initialHash);
        } else {
            this.showSection('home');
        }
    }

    showSection(sectionId) {
        // Hide all sections
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
            section.classList.remove('active');
        });

        // Remove active class from all nav links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
        });

        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionId;
            
            // Add active class to corresponding nav link
            const activeLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
            }
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    getCurrentSection() {
        return this.currentSection;
    }
}
