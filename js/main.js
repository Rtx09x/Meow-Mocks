/**
 * Main entry point for the NTA Mock Test Platform
 * Coordinates the initialization of all modules
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all the managers - ensure they're created in the correct order
    window.themeManager = new ThemeManager();
    window.loginManager = new LoginManager();
    window.instructionsManager = new InstructionsManager();
    window.examManager = new ExamManager();
    window.resultsManager = new ResultsManager();
    window.reviewManager = new ReviewManager();
    
    // Check if a local JSON file is specified in URL
    const urlParams = new URLSearchParams(window.location.search);
    const testFile = urlParams.get('test');
    
    // If a test file is specified, load it directly
    if (testFile) {
        // Remove active class from login screen
        document.getElementById('login-screen').classList.remove('active');
        
        // Load test data and start instructions
        loadTestData(testFile)
            .then(testData => {
                // Create mock candidate data
                const candidateData = {
                    name: 'Test User',
                    rollNumber: '12345678',
                    photoURL: null,
                    selectedTest: testFile
                };
                
                // Initialize instructions
                window.instructionsManager.initInstructions(candidateData);
            })
            .catch(error => {
                console.error('Error loading test file:', error);
                alert(`Failed to load test file: ${error.message}`);
            });
    }
    
    // Add ripple effect to buttons
    addRippleEffect();
    
    // Log that initialization is complete
    console.log('NTA Mock Test Platform initialized');
});

/**
 * Add ripple effect to buttons for Material You theme
 */
function addRippleEffect() {
    // Add ripple class to all buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.classList.add('ripple');
        
        // Add click handler for ripple effect
        button.addEventListener('click', function(e) {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const ripple = document.createElement('span');
            ripple.className = 'ripple-effect';
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            
            button.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

/**
 * Handle window beforeunload event to prevent accidental navigation
 */
window.addEventListener('beforeunload', function(e) {
    // Only show warning if test is in progress (exam screen is active)
    const isExamActive = document.getElementById('exam-screen').classList.contains('active');
    
    if (isExamActive) {
        // Cancel the event
        e.preventDefault();
        // Chrome requires returnValue to be set
        e.returnValue = '';
        
        // Custom message (though most browsers show their own message)
        return 'Your test is in progress. Are you sure you want to leave?';
    }
});
