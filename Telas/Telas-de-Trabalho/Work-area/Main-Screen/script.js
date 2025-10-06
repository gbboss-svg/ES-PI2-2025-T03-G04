const toggleSidebarBtn = document.getElementById('toggleSidebar');
const sidebar = document.getElementById('sidebar');
// Select only the texts within the main navigation
const navTexts = document.querySelectorAll('nav .sidebar-text');
const navLinks = document.querySelectorAll('nav a');
const toggleIcon = document.getElementById('toggleIcon');
// Select the text of the toggle button itself
const toggleButtonText = toggleSidebarBtn.querySelector('.sidebar-text');

toggleSidebarBtn.addEventListener('click', () => {
    sidebar.classList.toggle('w-72');
    sidebar.classList.toggle('w-24');
    
    // Toggle visibility for navigation items only
    navTexts.forEach(text => {
        text.classList.toggle('hidden');
    });

    const isCollapsed = sidebar.classList.contains('w-24');

    if (isCollapsed) {
        // Hide the button's text when collapsed
        toggleButtonText.classList.add('hidden');
        
        toggleSidebarBtn.classList.remove('space-x-4', 'justify-start', 'px-6');
        toggleSidebarBtn.classList.add('justify-center');

        navLinks.forEach(link => {
            link.classList.remove('space-x-4', 'px-6');
            link.classList.add('justify-center');
        });
        
        // Change icon to point right (>)
        toggleIcon.innerHTML = `<polyline points="9 6 15 12 9 18"></polyline>`; 
        
        // Make icon bigger
        toggleIcon.classList.remove('h-6', 'w-6');
        toggleIcon.classList.add('h-8', 'w-8');

    } else {
        // Show the button's text when expanded
        toggleButtonText.classList.remove('hidden');

        toggleSidebarBtn.classList.remove('justify-center');
        toggleSidebarBtn.classList.add('space-x-4', 'justify-start', 'px-6');
        
        navLinks.forEach(link => {
            link.classList.add('space-x-4', 'px-6');
            link.classList.remove('justify-center');
        });
        
        // Change icon to point left (<)
        toggleIcon.innerHTML = `<polyline points="15 18 9 12 15 6"></polyline>`;
        
        // Revert icon size
        toggleIcon.classList.remove('h-8', 'w-8');
        toggleIcon.classList.add('h-6', 'w-6');
    }
});
