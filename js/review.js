/**
 * Review module for the NTA Mock Test Platform
 * Handles displaying review of answers after test submission with exam-like navigation.
 */
class ReviewManager {
    constructor() {
        // Main screen element
        this.reviewScreen = document.getElementById('review-screen');
        
        // Header elements
        this.reviewTestHeader = document.getElementById('review-test-header');
        this.reviewCandidateNamePlaceholder = document.getElementById('review-candidate-name-placeholder');
        this.reviewRollNumberPlaceholder = document.getElementById('review-roll-number-placeholder');
        
        // Main content areas
        this.reviewQuestionTitleInfo = document.getElementById('review-question-title-info');
        this.reviewQuestionContentContainer = document.getElementById('review-question-content-container');
        
        // Sidebar elements
        this.reviewSubjectTabsContainer = document.getElementById('review-subject-tabs-container');
        this.reviewQuestionPalette = document.getElementById('review-question-palette');
        this.exitReviewBtn = document.getElementById('exit-review-btn');
        this.questionNotesTextarea = document.getElementById('question-notes');
        
        // Review data
        this.testData = null;
        this.candidateData = null;
        this.userAnswers = null;
        this.results = null;
        this.subjects = [];
        this.currentReviewQuestionIndex = 0;
        this.currentReviewSubject = '';
        this.questionNotes = {}; // Store notes for each question

        // Palette status constants
        this.PALETTE_STATUS = {
            CORRECT: 'review-correct',
            INCORRECT: 'review-incorrect',
            NOT_ATTEMPTED: 'review-not-attempted',
            CURRENT: 'current-review-item'
        };
        
        this.bindEvents();
    }
    
    /**
     * Bind event handlers
     */
    bindEvents() {
        // Exit review button handler
        this.exitReviewBtn.addEventListener('click', () => {
            this.exitReview();
        });
        
        // Notes textarea change handler
        this.questionNotesTextarea.addEventListener('input', () => {
            this.saveNotes(this.currentReviewQuestionIndex);
        });
    }
    
    /**
     * Show review screen with answers
     * @param {Object} testData - Test data
     * @param {Object} candidateData - Candidate information
     * @param {Array} userAnswers - User's answers
     * @param {Object} results - Test results
     */
    showReview(testData, candidateData, userAnswers, results) {
        this.testData = testData;
        this.candidateData = candidateData;
        this.userAnswers = userAnswers;
        this.results = results;
        
        // Update header information
        this.updateHeaderInfo();
        
        // Set up subject tabs
        this.setupSubjectTabs();
        
        // Generate question palette
        this.generateQuestionPalette();
        
        // Load the first question by default
        if (this.testData.questions.length > 0) {
            this.loadQuestionDetails(0);
        }
        
        // Show review screen
        this.reviewScreen.classList.add('active');
    }
    
    /**
     * Update the header information with test title and candidate details
     */
    updateHeaderInfo() {
        if (!this.testData || !this.candidateData) {
            console.error("Test data or candidate data not available for review header.");
            if (this.reviewTestHeader) {
                this.reviewTestHeader.textContent = 'Review: Test Data Unavailable';
            }
            return;
        }

        if (this.reviewTestHeader) {
            this.reviewTestHeader.textContent = `Review: ${this.testData.testTitle || 'Test'}`;
        }
        
        if (this.reviewCandidateNamePlaceholder) {
            this.reviewCandidateNamePlaceholder.textContent = this.candidateData.name || 'N/A';
        }
        
        if (this.reviewRollNumberPlaceholder) {
            this.reviewRollNumberPlaceholder.textContent = this.candidateData.rollNumber || 'N/A';
        }
    }
    
    /**
     * Set up the subject tabs in the sidebar
     */
    setupSubjectTabs() {
        if (!this.reviewSubjectTabsContainer) return;
        
        this.reviewSubjectTabsContainer.innerHTML = '';
        
        // Extract unique subjects from questions
        this.subjects = [...new Set(this.testData.questions.map(q => q.subject))];
        
        // Create a tab for each subject
        this.subjects.forEach(subject => {
            const tab = document.createElement('button');
            tab.className = 'subject-tab';
            tab.textContent = subject;
            tab.addEventListener('click', () => this.switchSubject(subject));
            
            this.reviewSubjectTabsContainer.appendChild(tab);
        });
        
        // Set the first subject as active by default
        if (this.subjects.length > 0) {
            this.currentReviewSubject = this.subjects[0];
            this.setActiveSubjectTab(this.currentReviewSubject);
        }
    }
    
    /**
     * Switch to a different subject
     * @param {string} subject - The subject to switch to
     */
    switchSubject(subject) {
        if (subject === this.currentReviewSubject) return;
        
        this.currentReviewSubject = subject;
        this.setActiveSubjectTab(subject);
        
        // Find the first question of this subject and load it
        const firstQuestionIndex = this.testData.questions.findIndex(q => q.subject === subject);
        if (firstQuestionIndex >= 0) {
            this.loadQuestionDetails(firstQuestionIndex);
        }
    }
    
    /**
     * Set the active subject tab
     * @param {string} subject - The subject to set as active
     */
    setActiveSubjectTab(subject) {
        if (!this.reviewSubjectTabsContainer) return;
        
        const tabs = this.reviewSubjectTabsContainer.querySelectorAll('.subject-tab');
        tabs.forEach(tab => {
            if (tab.textContent === subject) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
    }
    
    /**
     * Generate the question palette in the sidebar
     */
    generateQuestionPalette() {
        if (!this.reviewQuestionPalette) return;
        
        this.reviewQuestionPalette.innerHTML = '';
        
        // Create a button for each question
        this.testData.questions.forEach((question, index) => {
            const button = document.createElement('button');
            button.textContent = index + 1; // Question number (1-based)
            
            // Get question details to determine its status
            const questionDetail = this.results.questionDetails.find(qd => qd.questionId === question.globalId);
            
            // Set appropriate class based on correctness
            if (questionDetail.attempted) {
                if (questionDetail.correct) {
                    button.className = `palette-btn ${this.PALETTE_STATUS.CORRECT}`;
                } else {
                    button.className = `palette-btn ${this.PALETTE_STATUS.INCORRECT}`;
                }
            } else {
                button.className = `palette-btn ${this.PALETTE_STATUS.NOT_ATTEMPTED}`;
            }
            
            // Add click event to load the question
            button.addEventListener('click', () => this.loadQuestionDetails(index));
            
            this.reviewQuestionPalette.appendChild(button);
        });
    }
    
    /**
     * Load and display details for a specific question
     * @param {number} questionIndex - The index of the question to load
     */
    loadQuestionDetails(questionIndex) {
        if (questionIndex < 0 || questionIndex >= this.testData.questions.length) return;
        
        this.currentReviewQuestionIndex = questionIndex;
        const question = this.testData.questions[questionIndex];
        const userAnswer = this.userAnswers[questionIndex];
        const questionDetail = this.results.questionDetails.find(qd => qd.questionId === question.globalId);
        
        // Update question title info
        if (this.reviewQuestionTitleInfo) {
            this.reviewQuestionTitleInfo.innerHTML = `Question ${question.id || (questionIndex + 1)} <span class="question-type-badge">${question.question_type || 'MCQ'}</span>`;
        }
        
        // Update content container
        if (this.reviewQuestionContentContainer) {
            this.reviewQuestionContentContainer.innerHTML = '';
            
            // Question text
            const questionTextDiv = document.createElement('div');
            questionTextDiv.className = 'review-question-text';
            questionTextDiv.innerHTML = replaceImagePaths(question.text, this.testData.imagePathPrefix);
            this.reviewQuestionContentContainer.appendChild(questionTextDiv);
            
            // Options
            const optionsDiv = document.createElement('div');
            optionsDiv.className = 'review-options';
            
            const isMultipleChoice = question.question_type === 'multiple_choice_subject';
            const correctOptions = Array.isArray(question.correctAnswer) ? 
                question.correctAnswer.map(String) : [String(question.correctAnswer)];
            
            Object.keys(question.options).forEach(key => {
                const optionLabel = document.createElement('div');
                optionLabel.className = 'review-option';
                
                // Add classes based on correctness and selection
                if (correctOptions.includes(String(key))) {
                    optionLabel.classList.add('correct-answer');
                }
                
                const userSelected = isMultipleChoice && Array.isArray(userAnswer.selected) 
                    ? userAnswer.selected.map(String).includes(String(key))
                    : String(userAnswer.selected) === String(key);
                    
                if (userSelected) {
                    optionLabel.classList.add('user-selected');
                    
                    if (!correctOptions.includes(String(key))) {
                        optionLabel.classList.add('incorrect-selection');
                    }
                }
                
                // Option text
                const optionText = document.createElement('span');
                optionText.className = 'option-text';
                optionText.innerHTML = `${key}. ${replaceImagePaths(question.options[key], this.testData.imagePathPrefix)}`;
                
                // Option indicators
                const optionIndicators = document.createElement('div');
                optionIndicators.className = 'option-indicators';
                
                if (correctOptions.includes(String(key))) {
                    const correctIndicator = document.createElement('span');
                    correctIndicator.className = 'material-symbols-rounded indicator correct';
                    correctIndicator.textContent = 'check_circle';
                    correctIndicator.title = 'Correct Answer';
                    optionIndicators.appendChild(correctIndicator);
                }
                
                if (userSelected) {
                    const userChoiceIndicator = document.createElement('span');
                    userChoiceIndicator.className = 'material-symbols-rounded indicator user-choice';
                    userChoiceIndicator.textContent = 'account_circle';
                    userChoiceIndicator.title = 'Your Answer';
                    optionIndicators.appendChild(userChoiceIndicator);
                }
                
                optionLabel.appendChild(optionText);
                optionLabel.appendChild(optionIndicators);
                optionsDiv.appendChild(optionLabel);
            });
            
            this.reviewQuestionContentContainer.appendChild(optionsDiv);
            
            // Solution if available
            if (question.solution) {
                const solution = document.createElement('div');
                solution.className = 'question-review-solution';
                solution.innerHTML = `
                    <h4>Solution:</h4>
                    <div>${replaceImagePaths(question.solution, this.testData.imagePathPrefix)}</div>
                `;
                this.reviewQuestionContentContainer.appendChild(solution);
            }
        }
        
        // Update subject if needed
        if (question.subject !== this.currentReviewSubject) {
            this.currentReviewSubject = question.subject;
            this.setActiveSubjectTab(question.subject);
        }
        
        // Update the active palette button
        this.updateActivePaletteButton(questionIndex);
        
        // Load notes for this question
        this.loadNotes(questionIndex);
    }
    
    /**
     * Update the active button in the question palette
     * @param {number} questionIndex - The index of the currently viewed question
     */
    updateActivePaletteButton(questionIndex) {
        if (!this.reviewQuestionPalette) return;
        
        // Remove active class from all buttons
        const buttons = this.reviewQuestionPalette.querySelectorAll('.palette-btn');
        buttons.forEach(btn => btn.classList.remove(this.PALETTE_STATUS.CURRENT));
        
        // Add active class to the current question button
        if (buttons[questionIndex]) {
            buttons[questionIndex].classList.add(this.PALETTE_STATUS.CURRENT);
        }
    }
    
    /**
     * Exit review and go back to results
     */
    exitReview() {
        // Save any unsaved notes before exiting
        this.saveNotes(this.currentReviewQuestionIndex);
        
        // Hide review screen
        this.reviewScreen.classList.remove('active');
        
        // Show results screen
        document.getElementById('results-screen').classList.add('active');
        
        // Reset review state if needed
        this.currentReviewQuestionIndex = 0;
        this.currentReviewSubject = '';
        if (this.reviewQuestionContentContainer) this.reviewQuestionContentContainer.innerHTML = '';
        if (this.reviewSubjectTabsContainer) this.reviewSubjectTabsContainer.innerHTML = '';
        if (this.reviewQuestionPalette) this.reviewQuestionPalette.innerHTML = '';
    }
    
    /**
     * Save notes for a question
     * @param {number} questionIndex - The overall index of the question
     */
    saveNotes(questionIndex) {
        const noteText = this.questionNotesTextarea.value.trim();
        this.questionNotes[questionIndex] = noteText;
        
        // Update the notes in the results data for export
        if (this.results && this.results.questionDetails) {
            const questionDetail = this.results.questionDetails.find(q => q.overallIndex === questionIndex);
            if (questionDetail) {
                questionDetail.notes = noteText;
                
                // Make sure notes are directly accessible in window.testResults object
                if (window.testResults && window.testResults.questionDetails) {
                    const globalQuestionDetail = window.testResults.questionDetails.find(q => q.overallIndex === questionIndex);
                    if (globalQuestionDetail) {
                        globalQuestionDetail.notes = noteText;
                    }
                }
                
                console.log(`Saved note for question ${questionIndex}: ${noteText.substring(0, 20)}${noteText.length > 20 ? '...' : ''}`);
            }
        }
        
        // Show saving indicator
        const saveIndicator = document.getElementById('notes-save-indicator');
        if (saveIndicator) {
            saveIndicator.classList.add('show');
            setTimeout(() => {
                saveIndicator.classList.remove('show');
            }, 1500);
        }
        
        // If we have auto-save functionality, trigger it
        if (typeof window.autoSaveExam === 'function' && this.results) {
            const autoSaveData = {
                testData: this.testData,
                userAnswers: this.userAnswers,
                candidateName: this.candidateData?.candidateName,
                rollNumber: this.candidateData?.rollNumber,
                photoDataUrl: this.candidateData?.photoDataUrl,
                results: this.results,
                isCompleted: true,
                testName: this.testData?.testName,
                questionNotes: this.questionNotes,
                timestamp: Date.now()
            };
            window.autoSaveExam(autoSaveData);
        }
    }
    
    /**
     * Load notes for a question
     * @param {number} questionIndex - The overall index of the question
     */
    loadNotes(questionIndex) {
        const noteText = this.questionNotes[questionIndex] || '';
        this.questionNotesTextarea.value = noteText;
    }
}

// Initialize review manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.reviewManager = new ReviewManager();
});
