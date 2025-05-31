/**
 * Instructions module for the NTA Mock Test Platform
 * Handles the display of test instructions and agreement before starting the test
 */
class InstructionsManager {
    constructor() {
        // DOM elements
        this.instructionsScreen = document.getElementById('instructions-screen');
        this.instructionTestTitle = document.getElementById('instruction-test-title');
        this.instructionCandidatePhoto = document.getElementById('instruction-candidate-photo');
        this.instructionCandidateName = document.getElementById('instruction-candidate-name');
        this.instructionRollNumber = document.getElementById('instruction-roll-number');
        this.instructionsContent = document.getElementById('instructions-content');
        this.agreeCheckbox = document.getElementById('agree-checkbox');
        this.startTestBtn = document.getElementById('start-test-btn');
        
        // Test data
        this.testData = null;
        this.candidateData = null;
        
        this.bindEvents();
    }
    
    /**
     * Bind event handlers
     */
    bindEvents() {
        // Agreement checkbox handler
        this.agreeCheckbox.addEventListener('change', () => {
            this.startTestBtn.disabled = !this.agreeCheckbox.checked;
        });
        
        // Start test button handler
        this.startTestBtn.addEventListener('click', () => {
            if (this.agreeCheckbox.checked) {
                this.startTest();
            }
        });
    }
    
    /**
     * Initialize instructions screen with candidate data
     * @param {Object} candidateData - Candidate data from login
     */
    async initInstructions(candidateData) {
        this.candidateData = candidateData;
        
        try {
            // First check if the test data is in session storage (for custom JSON uploads)
            const storedTestData = sessionStorage.getItem('testData');
            
            if (storedTestData) {
                console.log('Using test data from session storage');
                this.testData = JSON.parse(storedTestData);
            } else if (candidateData.customJsonData) {
                console.log('Using custom JSON data from candidate data');
                this.testData = candidateData.customJsonData;
            } else {
                // Load test data from server as a fallback
                console.log('Loading test data from server:', candidateData.selectedTest);
                this.testData = await loadTestData(candidateData.selectedTest);
            }
            
            console.log('Test data loaded successfully for instructions', this.testData);
            
            // Update UI with candidate information
            this.updateCandidateInfo();
            
            // Load and display test instructions
            this.loadInstructions();
        } catch (error) {
            console.error('Error loading test data for instructions:', error);
            alert('Failed to load test data. Please try again.');
        }
    }
    
    /**
     * Update UI with candidate information
     */
    updateCandidateInfo() {
        // Set test title
        this.instructionTestTitle.textContent = this.testData.testTitle || 'Test Instructions';
        
        // Set candidate name and roll number
        this.instructionCandidateName.textContent = this.candidateData.name;
        this.instructionRollNumber.textContent = this.candidateData.rollNumber || 'N/A';
        
        // Set candidate photo if available
        if (this.candidateData.photoURL) {
            this.instructionCandidatePhoto.innerHTML = '';
            const img = document.createElement('img');
            img.src = this.candidateData.photoURL;
            img.alt = 'Candidate Photo';
            this.instructionCandidatePhoto.appendChild(img);
        }
    }
    
    /**
     * Load and display test instructions
     */
    loadInstructions() {
        // Get instructions from test data or use default JEE instructions
        const instructions = this.testData.instructions || this.getDefaultInstructions();
        
        // Set instructions content
        this.instructionsContent.innerHTML = instructions;
        
        // If instructions contain MathJax, render it
        if (typeof MathJax !== 'undefined') {
            MathJax.typeset([this.instructionsContent]);
        }
    }
    
    /**
     * Get default JEE exam instructions
     * @returns {string} - HTML content for default instructions
     */
    getDefaultInstructions() {
        return `
            <h2>General Instructions</h2>
            <ol>
                <li>The examination is of ${this.testData.duration || CONFIG.DEFAULT_TEST_DURATION / 60} hours duration.</li>
                <li>The Test consists of multiple-choice questions with negative marking for wrong answers.</li>
                <li>Each subject may have different marking schemes as indicated on the questions.</li>
                <li>The clock will be set at the server. The countdown timer will display the remaining time to complete the exam.</li>
                <li>You cannot pause the test once started. The timer will continue to run until the allotted time ends.</li>
            </ol>
            
            <h2>Navigating Through the Test</h2>
            <ol>
                <li>To answer a question, click on one of the option buttons.</li>
                <li>To change your answer, click on another option.</li>
                <li>To clear your answer, click on "Clear Response" button.</li>
                <li>To save your answer and move to the next question, click on "Save & Next" button.</li>
                <li>To mark a question for review, click on "Mark for Review" button. This will save your answer and mark the question for later review.</li>
            </ol>
            
            <h2>Question Palette</h2>
            <ol>
                <li>The Question Palette displayed on the right side of screen shows the status of each question using one of the following symbols:</li>
                <ul>
                    <li>Not Visited: Question not viewed yet</li>
                    <li>Not Answered: Question viewed but not answered</li>
                    <li>Answered: Question answered</li>
                    <li>Marked for Review: Question marked for review</li>
                </ul>
                <li>To navigate directly to any question, click on the question number in the Question Palette.</li>
            </ol>
            
            <h2>Marking Scheme</h2>
            <ol>
                <li>Each correct answer will be awarded marks as per the marking scheme shown on the question.</li>
                <li>Incorrect answers may have negative marks as per the marking scheme.</li>
                <li>Unattempted questions will not be marked.</li>
            </ol>
            
            <h2>Submitting the Test</h2>
            <ol>
                <li>The test will be automatically submitted when the time expires.</li>
                <li>You can submit the test any time by clicking on "Submit Test" button.</li>
                <li>After submitting the test, you will not be able to modify your answers.</li>
            </ol>
        `;
    }
    
    /**
     * Start the test and transition to exam screen
     */
    startTest() {
        // Hide instructions screen
        this.instructionsScreen.classList.remove('active');
        
        // Initialize exam screen with test data and candidate info
        if (window.examManager && typeof window.examManager.initialize === 'function') {
            window.examManager.initialize(this.testData, this.candidateData);
        } else if (window.examManager && typeof window.examManager.initExam === 'function') {
            window.examManager.initExam(this.testData, this.candidateData);
        } else {
            console.error('Exam manager not found or initialization method not available');
            alert('Error initializing exam. Please refresh the page and try again.');
        }
    }
}

// Initialize instructions manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.instructionsManager = new InstructionsManager();
});
