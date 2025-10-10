// New JavaScript for toggling the drawer and overlay
const drawer = document.getElementById('drawer');
const overlay = document.getElementById('overlay');
const navLinks = document.querySelectorAll('nav a');

function toggleDrawer() {
    drawer.classList.toggle('open');
    overlay.classList.toggle('active');
}

function closeDrawer() {
    drawer.classList.remove('open');
    overlay.classList.remove('active');
}

// Event listeners for opening and closing the drawer
const toggleButton = document.getElementById('toggle-button');
toggleButton.addEventListener('click', toggleDrawer);

overlay.addEventListener('click', closeDrawer);

navLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
});

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeDrawer();
    }
});

// Old mobile nav logic removed
