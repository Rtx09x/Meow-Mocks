/**
 * Login module for the NTA Mock Test Platform
 * Handles user login, photo upload, and test selection
 */
class LoginManager {
    constructor() {
        // DOM elements
        this.loginScreen = document.getElementById('login-screen');
        this.photoUploadInput = document.getElementById('photo-upload');
        this.photoPreview = document.getElementById('photo-preview');
        this.rollNumberInput = document.getElementById('roll-number');
        this.candidateNameInput = document.getElementById('candidate-name');
        this.testSelector = document.getElementById('test-selector');
        this.loginBtn = document.getElementById('login-btn');
        this.customJsonInput = document.getElementById('custom-json-file');
        this.fileNameDisplay = document.getElementById('file-name-display');
        
        // Candidate data
        this.candidateData = {
            photoURL: null,
            rollNumber: '',
            name: '',
            selectedTest: '',
            customJsonData: null
        };
        
        this.init();
    }
    
    /**
     * Initialize the login module
     */
    async init() {
        this.bindEvents();
        await this.loadAvailableTests();
        this.validateForm();
    }
    
    /**
     * Bind event handlers
     */
    bindEvents() {
        // Photo upload handler
        this.photoUploadInput.addEventListener('change', (e) => {
            this.handlePhotoUpload(e);
        });
        
        // Custom JSON file upload handler
        this.customJsonInput.addEventListener('change', (e) => {
            this.handleCustomJsonUpload(e);
        });
        
        // Input change handlers
        this.rollNumberInput.addEventListener('input', () => {
            this.candidateData.rollNumber = this.rollNumberInput.value;
            this.validateForm();
        });
        
        this.candidateNameInput.addEventListener('input', () => {
            this.candidateData.name = this.candidateNameInput.value;
            this.validateForm();
        });
        
        this.testSelector.addEventListener('change', () => {
            this.candidateData.selectedTest = this.testSelector.value;
            this.validateForm();
        });
        
        // Login button handler
        this.loginBtn.addEventListener('click', () => {
            if (this.validateForm(true)) {
                this.processLogin();
            }
        });
    }
    
    /**
     * Handle photo upload and preview
     * @param {Event} event - The change event from file input
     */
    handlePhotoUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Check if the file is an image
        if (!file.type.match('image.*')) {
            alert('Please select an image file');
            return;
        }
        
        // Create a FileReader to read and preview the image
        const reader = new FileReader();
        reader.onload = (e) => {
            // Store the image data URL
            this.candidateData.photoURL = e.target.result;
            
            // Update the preview
            this.photoPreview.innerHTML = '';
            const img = document.createElement('img');
            img.src = this.candidateData.photoURL;
            img.alt = 'Candidate Photo';
            this.photoPreview.appendChild(img);
            
            this.validateForm();
        };
        
        reader.readAsDataURL(file);
    }
    
    /**
     * Handle custom JSON file upload
     * @param {Event} event - The change event from file input
     */
    handleCustomJsonUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Update the file name display immediately
        this.fileNameDisplay.textContent = file.name;
        
        // Create a FileReader to read the JSON file
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                // Parse the JSON data
                const jsonData = JSON.parse(e.target.result);
                this.candidateData.customJsonData = jsonData;
                
                console.log('Custom JSON loaded successfully:', file.name);
                
                // Set selectedTest to a special value to indicate custom JSON
                this.candidateData.selectedTest = 'custom-json';
                
                // Validate form to enable login button
                this.validateForm();
            } catch (error) {
                console.error('Error parsing JSON file:', error);
                alert('Invalid JSON file. Please ensure it is properly formatted.');
                this.fileNameDisplay.textContent = 'No file chosen';
                this.candidateData.customJsonData = null;
            }
        };
        
        reader.onerror = (error) => {
            console.error('Error reading file:', error);
            alert('Error reading file. Please try again.');
            this.fileNameDisplay.textContent = 'No file chosen';
        };
        
        reader.readAsText(file);
    }
    
    /**
     * Load available tests into the selector
     */
    async loadAvailableTests() {
        try {
            const tests = await getAvailableTests();
            
            // Clear existing options except the placeholder
            while (this.testSelector.options.length > 1) {
                this.testSelector.remove(1);
            }
            
            // Add test options
            tests.forEach(test => {
                const option = document.createElement('option');
                option.value = test.id;
                option.textContent = test.name;
                this.testSelector.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading tests:', error);
            alert('Failed to load available tests. Please try again.');
        }
    }
    
    /**
     * Validate form inputs
     * @param {boolean} showErrors - Whether to show error messages
     * @returns {boolean} - Whether the form is valid
     */
    validateForm(showErrors = false) {
        let isValid = true;
        
        // Validate roll number (required, at least 5 chars)
        if (!this.candidateData.rollNumber || this.candidateData.rollNumber.length < 5) {
            isValid = false;
            if (showErrors && !this.candidateData.rollNumber) {
                alert('Please enter your roll number');
            } else if (showErrors && this.candidateData.rollNumber.length < 5) {
                alert('Roll number should be at least 5 characters long');
            }
        }
        
        // Validate name (required, at least 3 chars)
        if (!this.candidateData.name || this.candidateData.name.length < 3) {
            isValid = false;
            if (showErrors && !this.candidateData.name) {
                alert('Please enter your name');
            } else if (showErrors && this.candidateData.name.length < 3) {
                alert('Name should be at least 3 characters long');
            }
        }
        
        // Check if a test is selected or custom JSON is uploaded
        const hasTestSelected = this.candidateData.selectedTest !== '' || this.candidateData.customJsonData !== null;
        if (!hasTestSelected) {
            isValid = false;
            if (showErrors) {
                alert('Please select a test paper or upload a custom JSON file');
            }
        }
        
        // Update login button state
        this.loginBtn.disabled = !isValid;
        
        // Debug info
        console.log('Form validation:', {
            rollNumber: this.candidateData.rollNumber,
            name: this.candidateData.name,
            selectedTest: this.candidateData.selectedTest,
            customJson: this.candidateData.customJsonData !== null,
            isValid: isValid
        });
        
        return isValid;
    }
    
    /**
     * Process login and transition to instructions screen
     */
    async processLogin() {
        console.log('Processing login...', this.candidateData);
        
        // Store candidate data in session storage for use in other screens
        sessionStorage.setItem('candidateData', JSON.stringify(this.candidateData));
        
        // Show loading state
        this.loginBtn.disabled = true;
        this.loginBtn.innerHTML = '<span class="material-symbols-rounded spin">sync</span> Loading...';
        
        try {
            let testData;
            
            // Check if we have custom JSON data from file upload
            if (this.candidateData.customJsonData) {
                console.log('Using custom JSON data from uploaded file');
                testData = this.candidateData.customJsonData;
                // Store the test data in session storage
                sessionStorage.setItem('testData', JSON.stringify(testData));
            } else {
                // Load test data from server
                console.log('Loading test data from server:', this.candidateData.selectedTest);
                testData = await loadTestData(this.candidateData.selectedTest);
                // Store the test data in session storage
                sessionStorage.setItem('testData', JSON.stringify(testData));
            }
            
            console.log('Test data loaded successfully', testData);
            console.log('Login successful, transitioning to instructions screen');
            
            // Direct transition to instructions screen
            this.loginScreen.classList.remove('active');
            
            // Make sure instructions screen exists
            const instructionsScreen = document.getElementById('instructions-screen');
            console.log('Instructions screen element:', instructionsScreen);
            
            if (!instructionsScreen) {
                console.error('Instructions screen element not found');
                alert('An error occurred. Please refresh the page and try again.');
                return;
            }
            
            // Force other screens to be inactive
            document.querySelectorAll('.screen').forEach(screen => {
                if (screen.id !== 'instructions-screen') {
                    screen.classList.remove('active');
                    console.log(`Removed active class from ${screen.id}`);
                }
            });
            
            // Force display properties
            this.loginScreen.style.display = 'none';
            instructionsScreen.style.display = 'block';
            
            // Make sure instructions manager exists
            if (window.instructionsManager) {
                // Initialize instructions screen with explicit CSS and class changes
                instructionsScreen.classList.add('active');
                console.log('Added active class to instructions screen');
                try {
                    window.instructionsManager.initInstructions(this.candidateData);
                    console.log('Instructions manager initialized');
                } catch (err) {
                    console.error('Error initializing instructions:', err);
                    alert('An error occurred when loading instructions. Please refresh the page.');
                }
            } else {
                console.error('Instructions manager not initialized');
                alert('An error occurred. Please refresh the page and try again.');
            }
        } catch (error) {
            console.error('Error in login process:', error);
            alert('Failed to load test data. Please try again.');
        } finally {
            // Reset login button
            this.loginBtn.disabled = false;
            this.loginBtn.innerHTML = 'Login';
        }
    }
}

// Initialize login manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.loginManager = new LoginManager();
});
