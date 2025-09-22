// Wait for DOM to load (concept: Avoid errors if JS runs before HTML)
document.addEventListener('DOMContentLoaded', function() {
    // Grab elements (concept: querySelector—searches DOM like CSS)
    const openBtn = document.getElementById('openModalBtn');
    const modal = document.getElementById('myModal');
    const closeBtn = document.querySelector('.close-btn'); // Class selector
    const confirmBtn = document.getElementById('confirmChoiceBtn');
    const counter = document.getElementById('counter'); // For updating title

    // Open modal (concept: Toggle display—reverse: Without this, button does nothing)
    openBtn.addEventListener('click', function() {
        modal.style.display = 'block'; // Assumes CSS has .modal { display: none; }
    });

    // Close on X click (concept: Event listeners—reusable for any click)
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    // Close on outside click (bonus: Enhances UX, concept: Event delegation)
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Confirm choice (concept: Form handling + conditionals)
    confirmBtn.addEventListener('click', function() {
        const selected = document.querySelector('input[name="choice"]:checked');
        if (selected) {
            const choice = selected.value;
            let roleName = '';
            // Switch statement (concept: Cleaner than if-else for multiples)
            switch (choice) {
                case 'option1': roleName = 'Base Engineer'; break;
                case 'option2': roleName = 'Exploratory Engineer'; break;
                case 'option3': roleName = 'Food Tech Expert'; break;
                case 'option4': roleName = 'Comms Specialist'; break;
                case 'option5': roleName = 'Resource Miner'; break;
                case 'option6': roleName = 'Medical Officer'; break;
                case 'option7': roleName = 'Navigator'; break;
                default: roleName = 'Unknown';
            }
            // Update page (concept: Manipulate innerHTML—dynamic content)
            counter.innerHTML = `<h1>Welcome, ${roleName}! Your perks are active.</h1>`;
            alert(`You chose: ${roleName}`); // Temp feedback; replace with game logic
            modal.style.display = 'none'; // Hide after confirm
        } else {
            alert('Pick one!'); // Validation (concept: Error handling)
        }
    });
});