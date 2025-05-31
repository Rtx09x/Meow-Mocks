/**
 * Exam module for the NTA Mock Test Platform
 * Handles the core exam functionality including question navigation,
 * answer selection, timer, and submission
 */
class ExamManager {
    constructor() {
        // DOM elements
        this.examScreen = document.getElementById('exam-screen');
        this.testHeader = document.getElementById('test-header');
        this.examCandidatePhoto = document.getElementById('exam-candidate-photo');
        this.examCandidateName = document.getElementById('exam-candidate-name');
        this.examRollNumber = document.getElementById('exam-roll-number');
        this.timerElement = document.getElementById('timer');
        this.questionTitleInfo = document.getElementById('question-title-info');
        this.questionText = document.getElementById('question-text');
        this.optionsContainer = document.getElementById('options-container');
        this.subjectTabsContainer = document.getElementById('subject-tabs-container');
        this.questionPalette = document.getElementById('question-palette');
        this.clearResponseBtn = document.getElementById('clear-response-btn');
        this.markReviewBtn = document.getElementById('mark-review-btn');
        this.saveNextBtn = document.getElementById('save-next-btn');
        this.submitTestBtn = document.getElementById('submit-test-btn');
        this.submitModal = document.getElementById('submit-modal');
        this.submissionSummary = document.getElementById('submission-summary');
        this.cancelSubmitBtn = document.getElementById('cancel-submit-btn');
        this.confirmSubmitBtn = document.getElementById('confirm-submit-btn');
        
        // Exam data
        this.testData = null;
        this.candidateData = null;
        this.userAnswers = [];
        this.currentQuestionIndex = 0;
        this.currentSubject = '';
        this.subjects = [];
        this.timerInterval = null;
        this.timeRemaining = 0;
        this.isReviewMode = false;
        
        // Question timing data
        this.questionTimerInterval = null;
        this.currentQuestionStartTime = 0;
        this.questionTimerElement = null;
        
        this.bindEvents();
    }
    
    /**
     * Bind event handlers
     */
    bindEvents() {
        // Navigation button handlers
        this.clearResponseBtn.addEventListener('click', () => this.clearResponse());
        this.markReviewBtn.addEventListener('click', () => this.markForReview());
        this.saveNextBtn.addEventListener('click', () => this.saveAndNext());
        this.submitTestBtn.addEventListener('click', () => this.showSubmitConfirmation());
        
        // Submit modal handlers
        this.cancelSubmitBtn.addEventListener('click', () => this.hideSubmitConfirmation());
        this.confirmSubmitBtn.addEventListener('click', () => this.submitTest());
    }
    
    /**
     * Initialize the exam with test data
     * @param {Object} testData - The test data object
     * @param {Object} candidateData - The candidate information
     */
    initialize(testData, candidateData) {
        this.testData = testData;
        this.candidateData = candidateData;
        this.subjects = testData ? testData.subjects || [] : [];
        this.currentSubject = this.subjects[0]?.name || '';
        
        // Initialize auto-save if available
        if (typeof window.initializeAutoSave === 'function') {
            const examData = {
                testData: this.testData,
                userAnswers: this.userAnswers,
                candidateName: this.candidateData?.candidateName,
                rollNumber: this.candidateData?.rollNumber,
                photoDataUrl: this.candidateData?.photoDataUrl,
                currentQuestionIndex: this.currentQuestionIndex,
                isCompleted: false,
                testName: this.testData?.testName,
                timestamp: Date.now()
            };
            // window.initializeAutoSave(examData); // Exam autosave disabled by user request
        }
        
        // Show exam screen and setup the test
        this.showExamScreen();
    }
    
    /**
     * Alias for initialize method (for backward compatibility)
     * @param {Object} testData - The test data object
     * @param {Object} candidateData - The candidate information
     */
    initExam(testData, candidateData) {
        return this.initialize(testData, candidateData);
    }
    
    /**
     * Show exam screen and update UI
     */
    showExamScreen() {
        
        // Show exam screen
        this.examScreen.classList.add('active');
        
        // Update UI with test and candidate information
        this.updateExamInfo();
        
        // Initialize test framework
        this.setupTestFramework();
    }
    
    /**
     * Update UI with test and candidate information
     */
    updateExamInfo() {
        // Set test title
        this.testHeader.textContent = this.testData.testTitle || 'Mock Test';
        
        // Set candidate name and roll number
        this.examCandidateName.textContent = this.candidateData.name;
        this.examRollNumber.textContent = this.candidateData.rollNumber || 'N/A';
        
        // Set candidate photo if available
        if (this.candidateData.photoURL) {
            this.examCandidatePhoto.innerHTML = '';
            const img = document.createElement('img');
            img.src = this.candidateData.photoURL;
            img.alt = 'Candidate Photo';
            this.examCandidatePhoto.appendChild(img);
        }
    }
    
    /**
     * Set up the test framework
     */
    setupTestFramework() {
        // Extract subjects from questions
        this.subjects = [...new Set(this.testData.questions.map(q => q.subject))];
        
        // Set default subject if not found
        if (this.subjects.length === 0) {
            this.subjects = [CONFIG.DEFAULT_SUBJECT];
        }
        
        // Set current subject to first subject
        this.currentSubject = this.subjects[0];
        
        // Initialize user answers
        this.initializeUserAnswers();
        
        // Set up subject tabs
        this.setupSubjectTabs();
        
        // Generate question palette
        this.generatePalette();
        
        // Load first question
        this.loadQuestion(0);
        
        // Start timer
        this.startTimer();
    }
    
    /**
     * Initialize user answers array
     */
    initializeUserAnswers() {
        this.userAnswers = this.testData.questions.map(q => ({
            questionId: q.globalId,
            subject: q.subject,
            selected: q.question_type === 'multiple_choice_subject' ? [] : null,
            status: CONFIG.BUTTON_STATUS.NOT_VISITED,
            reviewed: false,
            timeSpent: 0, // Time spent on this question in seconds
            visitCount: 0, // Number of times this question was visited
            correctness: null // Will be set after submission (correct, incorrect, or not attempted)
        }));
    }
    
    /**
     * Set up subject tabs
     */
    setupSubjectTabs() {
        this.subjectTabsContainer.innerHTML = '';
        
        this.subjects.forEach(subject => {
            const tab = document.createElement('button');
            tab.className = 'subject-tab';
            tab.textContent = subject;
            tab.addEventListener('click', () => this.switchSubject(subject));
            
            if (subject === this.currentSubject) {
                tab.classList.add('active');
            }
            
            this.subjectTabsContainer.appendChild(tab);
        });
    }
    
    /**
     * Switch to a different subject
     * @param {string} subject - Subject to switch to
     */
    switchSubject(subject) {
        if (subject === this.currentSubject) return;
        
        this.currentSubject = subject;
        this.setActiveSubjectTab(subject);
        
        // Find first question of the subject
        const firstQuestionIndex = this.testData.questions.findIndex(q => q.subject === subject);
        if (firstQuestionIndex >= 0) {
            this.loadQuestion(firstQuestionIndex);
        }
    }
    
    /**
     * Set active subject tab
     * @param {string} subject - Subject to set as active
     */
    setActiveSubjectTab(subject) {
        const tabs = this.subjectTabsContainer.querySelectorAll('.subject-tab');
        tabs.forEach(tab => {
            if (tab.textContent === subject) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
    }
    
    /**
     * Generate question palette
     */
    generatePalette() {
        this.questionPalette.innerHTML = '';
        
        this.testData.questions.forEach((question, index) => {
            const button = document.createElement('button');
            button.textContent = question.id;
            button.dataset.index = index;
            button.dataset.status = this.userAnswers[index].status;
            button.classList.add(this.userAnswers[index].status);
            
            button.addEventListener('click', () => this.navigateToQuestion(index));
            
            this.questionPalette.appendChild(button);
        });
    }
    
    /**
     * Update palette button status
     * @param {number} index - Question index to update
     * @param {string} status - New status
     */
    updatePaletteButtonStatus(index, status) {
        // Update the user answer status
        this.userAnswers[index].status = status;
        
        // Update the palette button
        const button = this.questionPalette.querySelector(`button[data-index="${index}"]`);
        if (button) {
            button.classList.remove(
                CONFIG.BUTTON_STATUS.NOT_VISITED,
                CONFIG.BUTTON_STATUS.NOT_ANSWERED,
                CONFIG.BUTTON_STATUS.ANSWERED,
                CONFIG.BUTTON_STATUS.MARKED_REVIEW
            );
            button.classList.add(status);
            button.dataset.status = status;
        }
    }
    
    /**
     * Navigate to a specific question
     * @param {number} index - Question index to navigate to
     */
    navigateToQuestion(index) {
        if (index < 0 || index >= this.testData.questions.length) return;
        
        this.currentQuestionIndex = index;
        this.loadQuestion(index);
        
        // Set the subject tab if needed
        const subject = this.testData.questions[index].subject;
        if (subject !== this.currentSubject) {
            this.currentSubject = subject;
            this.setActiveSubjectTab(subject);
        }
    }
    
    /**
     * Load a question
     * @param {number} index - Question index to load
     */
    loadQuestion(index) {
        // Stop timing for previous question if any
        this.stopQuestionTimer();
        
        const previousIndex = this.currentQuestionIndex;
        this.currentQuestionIndex = index;
        
        const question = this.testData.questions[index];
        const userAnswer = this.userAnswers[index];
        
        // Update question title
        this.questionTitleInfo.textContent = `Question ${question.id} | ${question.subject}`;
        
        // Update question text with image path replacement
        const questionText = replaceImagePaths(question.text, this.testData.imagePathPrefix);
        this.questionText.innerHTML = questionText;
        
        // Render MathJax if available
        if (typeof MathJax !== 'undefined') {
            MathJax.typeset([this.questionText]);
        }
        
        // Build options based on question type
        this.buildOptions(question, userAnswer, index);
        
        // Set current question in palette
        const buttons = this.questionPalette.querySelectorAll('button');
        buttons.forEach(btn => btn.classList.remove('current'));
        buttons[index].classList.add('current');
        
        // Update status if not visited
        if (userAnswer.status === CONFIG.BUTTON_STATUS.NOT_VISITED) {
            this.updatePaletteButtonStatus(index, CONFIG.BUTTON_STATUS.NOT_ANSWERED);
        }
        
        // Track visit count
        userAnswer.visitCount++;
        
        // Start timing this question
        this.startQuestionTimer();
    }
    
    /**
     * Build question options
     * @param {Object} question - Question object
     * @param {Object} userAnswer - User's answer object
     * @param {number} index - Question index
     */
    buildOptions(question, userAnswer, index) {
        this.optionsContainer.innerHTML = '';
        
        const isMultipleChoice = question.question_type === 'multiple_choice_subject';
        const options = question.options;
        
        // Create option elements
        Object.keys(options).forEach(key => {
            const label = document.createElement('label');
            
            // Check if this option is selected
            let isSelected = false;
            if (isMultipleChoice) {
                isSelected = userAnswer.selected && userAnswer.selected.includes(key);
            } else {
                isSelected = userAnswer.selected === key;
            }
            
            if (isSelected) {
                label.classList.add('user-selected');
            }
            
            const input = document.createElement('input');
            input.type = isMultipleChoice ? 'checkbox' : 'radio';
            input.name = `q_${question.globalId}`;
            input.value = key;
            input.checked = isSelected;
            
            // Add event listener
            if (isMultipleChoice) {
                input.addEventListener('change', (e) => {
                    this.handleMultiOptionSelect(key, index, e.target.checked);
                });
            } else {
                input.addEventListener('change', () => {
                    this.handleOptionSelect(key, index);
                });
            }
            
            // Create option text span
            const optionTextSpan = document.createElement('span');
            optionTextSpan.className = 'option-text-span';
            optionTextSpan.innerHTML = `${key}. ${replaceImagePaths(options[key], this.testData.imagePathPrefix)}`;
            
            // Add elements to label
            label.appendChild(input);
            label.appendChild(optionTextSpan);
            
            // Add to container
            this.optionsContainer.appendChild(label);
        });
        
        // If in review mode, show correct answers
        if (this.isReviewMode) {
            this.showCorrectAnswers(question);
        }
        
        // Render MathJax if available
        if (typeof MathJax !== 'undefined') {
            MathJax.typeset([this.optionsContainer]);
        }
    }
    
    /**
     * Handle single option select
     * @param {string} optionKey - Selected option key
     * @param {number} index - Question index
     */
    handleOptionSelect(optionKey, index) {
        // Update user answer
        this.userAnswers[index].selected = optionKey;
        
        // Update status to answered
        this.updatePaletteButtonStatus(index, CONFIG.BUTTON_STATUS.ANSWERED);
        
        // Update UI
        const labels = this.optionsContainer.querySelectorAll('label');
        labels.forEach(label => {
            const input = label.querySelector('input');
            if (input.value === optionKey) {
                label.classList.add('user-selected');
            } else {
                label.classList.remove('user-selected');
            }
        });
    }
    
    /**
     * Handle multiple option select
     * @param {string} optionKey - Selected option key
     * @param {number} index - Question index
     * @param {boolean} isChecked - Whether the option is checked
     */
    handleMultiOptionSelect(optionKey, index, isChecked) {
        // Initialize selected array if not already
        if (!Array.isArray(this.userAnswers[index].selected)) {
            this.userAnswers[index].selected = [];
        }
        
        // Update selected options
        if (isChecked) {
            this.userAnswers[index].selected.push(optionKey);
        } else {
            this.userAnswers[index].selected = this.userAnswers[index].selected.filter(key => key !== optionKey);
        }
        
        // Update status based on whether any options are selected
        if (this.userAnswers[index].selected.length > 0) {
            // Set status to answered or marked for review
            if (this.userAnswers[index].status === CONFIG.BUTTON_STATUS.MARKED_REVIEW) {
                this.updatePaletteButtonStatus(index, CONFIG.BUTTON_STATUS.MARKED_REVIEW);
            } else {
                this.updatePaletteButtonStatus(index, CONFIG.BUTTON_STATUS.ANSWERED);
            }
        } else {
            // Set status to not answered if no options selected
            this.updatePaletteButtonStatus(index, CONFIG.BUTTON_STATUS.NOT_ANSWERED);
        }
        
        // Update UI
        const labels = this.optionsContainer.querySelectorAll('label');
        labels.forEach(label => {
            const input = label.querySelector('input');
            if (input.checked) {
                label.classList.add('user-selected');
            } else {
                label.classList.remove('user-selected');
            }
        });
    }
    
    /**
     * Clear the current response
     */
    clearResponse() {
        const index = this.currentQuestionIndex;
        const question = this.testData.questions[index];
        const isMultipleChoice = question.question_type === 'multiple_choice_subject';
        
        // Reset user answer
        if (isMultipleChoice) {
            this.userAnswers[index].selected = [];
        } else {
            this.userAnswers[index].selected = null;
        }
        
        // IMPROVED: Always reset to NOT_ANSWERED status when clearing response
        // This addresses the issue where Mark for Review questions couldn't be reset
        this.userAnswers[index].status = CONFIG.BUTTON_STATUS.NOT_ANSWERED;
        this.updatePaletteButtonStatus(index, CONFIG.BUTTON_STATUS.NOT_ANSWERED);
        
        // Uncheck all inputs
        const inputs = this.optionsContainer.querySelectorAll('input');
        inputs.forEach(input => {
            input.checked = false;
        });
        
        // Remove user-selected class
        const labels = this.optionsContainer.querySelectorAll('label');
        labels.forEach(label => {
            label.classList.remove('user-selected');
        });
    }
    
    /**
     * Mark the current question for review
     */
    markForReview() {
        const index = this.currentQuestionIndex;
        
        // Update status to marked for review
        this.updatePaletteButtonStatus(index, CONFIG.BUTTON_STATUS.MARKED_REVIEW);
        
        // Save current answer
        const saveBtn = this.saveNextBtn.cloneNode(true);
        this.saveNextBtn.parentNode.replaceChild(saveBtn, this.saveNextBtn);
        this.saveNextBtn = saveBtn;
        this.saveNextBtn.addEventListener('click', () => this.saveAndNext());
        
        // Move to next question
        this.navigateToNextQuestion();
    }
    
    /**
     * Save current answer and navigate to next question
     */
    saveAndNext() {
        const index = this.currentQuestionIndex;
        
        // If an answer is selected, update status to answered
        const userAnswer = this.userAnswers[index];
        // Ensure userAnswer and userAnswer.selected are valid before accessing them
        const hasAnswer = userAnswer && userAnswer.selected !== null && 
                         (Array.isArray(userAnswer.selected) ? userAnswer.selected.length > 0 : true);
        
        if (hasAnswer && userAnswer.status !== CONFIG.BUTTON_STATUS.MARKED_REVIEW) {
            this.updatePaletteButtonStatus(index, CONFIG.BUTTON_STATUS.ANSWERED);
        }
        
        // Navigate to next question
        this.navigateToNextQuestion();
    }
    
    /**
     * Navigate to the next question
     */
    navigateToNextQuestion() {
        // Find next question
        let nextIndex = this.currentQuestionIndex + 1;
        
        // If at the end of the test, go to the first question
        if (nextIndex >= this.testData.questions.length) {
            nextIndex = 0;
        }
        
        // Navigate to the next question
        this.navigateToQuestion(nextIndex);
    }
    
    /**
     * Start the timer for tracking per-question time
     */
    startQuestionTimer() {
        // Stop any existing timer first
        this.stopQuestionTimer();
        
        // Record start time for current question
        this.currentQuestionStartTime = Date.now();
        
        // Initialize or update question timer display if present
        if (!this.questionTimerElement) {
            this.questionTimerElement = document.createElement('div');
            this.questionTimerElement.className = 'question-timer';
            this.questionTimerElement.innerHTML = '<span>Time on question: 00:00</span>';
            
            // Insert timer after question title
            if (this.questionTitleInfo && this.questionTitleInfo.parentNode) {
                this.questionTitleInfo.parentNode.insertBefore(
                    this.questionTimerElement, 
                    this.questionTitleInfo.nextSibling
                );
            }
        }
        
        // Start interval to update question timer display
        this.questionTimerInterval = setInterval(() => {
            // Calculate elapsed time in seconds
            const elapsedSeconds = Math.floor((Date.now() - this.currentQuestionStartTime) / 1000);
            
            // Update user answer object with current time spent
            this.userAnswers[this.currentQuestionIndex].timeSpent = 
                (this.userAnswers[this.currentQuestionIndex].timeSpent || 0) + 1;
            
            // Format and display time
            const minutes = Math.floor(this.userAnswers[this.currentQuestionIndex].timeSpent / 60);
            const seconds = this.userAnswers[this.currentQuestionIndex].timeSpent % 60;
            const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            if (this.questionTimerElement) {
                this.questionTimerElement.innerHTML = `<span>Time on question: ${formattedTime}</span>`;
            }
        }, 1000);
    }
    
    /**
     * Stop the timer for the current question
     */
    stopQuestionTimer() {
        if (this.questionTimerInterval) {
            clearInterval(this.questionTimerInterval);
            this.questionTimerInterval = null;
        }
    }
    
    /**
     * Start the timer
     */
    startTimer() {
        // Get test duration from test data or use default
        const durationMinutes = this.testData.duration || CONFIG.DEFAULT_TEST_DURATION / 60;
        this.timeRemaining = durationMinutes * 60;
        
        // Update timer display
        this.updateTimerDisplay();
        
        // Start interval
        this.timerInterval = setInterval(() => {
            this.timeRemaining--;
            this.updateTimerDisplay();
            
            // Auto-submit when time runs out
            if (this.timeRemaining <= 0) {
                clearInterval(this.timerInterval);
                this.submitTest(true);
            }
        }, 1000);
    }
    
    /**
     * Update timer display
     */
    updateTimerDisplay() {
        this.timerElement.textContent = formatTime(this.timeRemaining);
        
        // Change color to red when less than 5 minutes remaining
        if (this.timeRemaining <= 300) {
            this.timerElement.style.color = 'var(--danger-color)';
        }
    }
    
    // Note: Using the implementation of startQuestionTimer and stopQuestionTimer defined earlier
    
    /**
     * Show submit confirmation dialog
     */
    showSubmitConfirmation() {
        // Generate submission summary
        this.generateSubmissionSummary();
        
        // Show modal
        this.submitModal.classList.add('active');
    }
    
    /**
     * Hide submit confirmation dialog
     */
    hideSubmitConfirmation() {
        this.submitModal.classList.remove('active');
    }
    
    /**
     * Generate submission summary
     */
    generateSubmissionSummary() {
        // Count answers by status
        const summary = {
            total: this.userAnswers.length,
            answered: 0,
            notAnswered: 0,
            markedForReview: 0
        };
        
        this.userAnswers.forEach(answer => {
            if (answer.status === CONFIG.BUTTON_STATUS.ANSWERED) {
                summary.answered++;
            } else if (answer.status === CONFIG.BUTTON_STATUS.MARKED_REVIEW) {
                summary.markedForReview++;
            } else {
                summary.notAnswered++;
            }
        });
        
        // Create summary HTML
        const summaryHTML = `
            <h3>Submission Summary</h3>
            <div class="summary-grid">
                <div class="summary-item">
                    <span>Total Questions:</span>
                    <span>${summary.total}</span>
                </div>
                <div class="summary-item">
                    <span>Answered:</span>
                    <span>${summary.answered}</span>
                </div>
                <div class="summary-item">
                    <span>Not Answered:</span>
                    <span>${summary.notAnswered}</span>
                </div>
                <div class="summary-item">
                    <span>Marked for Review:</span>
                    <span>${summary.markedForReview}</span>
                </div>
            </div>
            <p style="margin-top: 16px; font-weight: 500; color: var(--danger-color);">
                Are you sure you want to submit your test?
            </p>
        `;
        
        this.submissionSummary.innerHTML = summaryHTML;
    }
    
    /**
     * Submit the test
     * @param {boolean} isAutoSubmit - Whether this is an auto-submission due to time expiry
     */
    submitTest(isAutoSubmit = false) {
        // Stop the main test timer
        clearInterval(this.timerInterval);
        
        // Stop the question timer to save final time spent on current question
        this.stopQuestionTimer();
        
        // Hide modal if showing
        this.hideSubmitConfirmation();
        
        // Calculate score
        const results = this.calculateScore();
        
        // Save results to session storage
        sessionStorage.setItem('testResults', JSON.stringify({
            testData: this.testData,
            candidateData: this.candidateData,
            userAnswers: this.userAnswers,
            results: results,
            timeSpent: (this.testData.duration * 60) - this.timeRemaining
        }));
        
        // Hide exam screen
        this.examScreen.classList.remove('active');
        
        // Show results screen
        window.resultsManager.showResults(isAutoSubmit);
    }
    
    /**
     * Calculate the test score
     * @returns {Object} - Score results
     */
    calculateScore() {
        // Ensure testData and questions are available
        if (!this.testData || !this.testData.questions) {
            console.error("Test data or questions not available for score calculation.");
            // Return a default or empty results object to prevent further errors
            return {
                totalQuestions: 0,
                attempted: 0,
                correct: 0,
                incorrect: 0,
                score: 0,
                maxScore: 0,
                subjects: {},
                questionDetails: []
            };
        }

        const results = {
            totalQuestions: this.testData.questions.length,
            attempted: 0,
            correct: 0,
            incorrect: 0,
            score: 0,
            maxScore: 0,
            subjects: {},
            questionDetails: []
        };
        
        // Process each question
        this.testData.questions.forEach((question, index) => {
            const userAnswer = this.userAnswers[index];
            const subject = question.subject;
            
            // Initialize subject if not exists
            if (!results.subjects[subject]) {
                results.subjects[subject] = {
                    total: 0,
                    attempted: 0,
                    correct: 0,
                    incorrect: 0,
                    score: 0,
                    maxScore: 0
                };
            }
            
            // Increment subject total
            results.subjects[subject].total++;
            
            // Get question scoring
            const marksCorrect = question.marks_correct || 
                (CONFIG.DEFAULT_MARKING_SCHEME[question.question_type]?.marks_correct || 1);
            const marksIncorrect = question.marks_incorrect !== undefined ? 
                question.marks_incorrect : 
                (CONFIG.DEFAULT_MARKING_SCHEME[question.question_type]?.marks_incorrect || 0);
            
            // Add to max possible score
            results.maxScore += marksCorrect;
            results.subjects[subject].maxScore += marksCorrect;
            
            // Check if question was attempted
            const isMultipleChoice = question.question_type === 'multiple_choice_subject';
            const isAttempted = userAnswer.selected !== null && 
                (isMultipleChoice ? userAnswer.selected.length > 0 : true);
            
            // Process attempt
            let isCorrect = false;
            let questionScore = 0;
            
            if (isAttempted) {
                results.attempted++;
                results.subjects[subject].attempted++;
                
                // Check correctness
                if (isMultipleChoice) {
                    // For multiple choice, all correct options must be selected and no incorrect ones
                    const correctOptions = Array.isArray(question.correctAnswer) ? 
                        question.correctAnswer : [question.correctAnswer];
                    
                    isCorrect = correctOptions.length === userAnswer.selected.length &&
                        correctOptions.every(opt => userAnswer.selected.includes(opt));
                } else {
                    // For single choice, selected must match correct answer
                    isCorrect = userAnswer.selected === question.correctAnswer;
                }
                
                // Calculate score
                if (isCorrect) {
                    results.correct++;
                    results.subjects[subject].correct++;
                    questionScore = marksCorrect;
                } else {
                    results.incorrect++;
                    results.subjects[subject].incorrect++;
                    questionScore = marksIncorrect;
                }
                
                // Add to total score
                results.score += questionScore;
                results.subjects[subject].score += questionScore;
            }
            
            // Update the user answer with correctness info
            userAnswer.correctness = isAttempted ? (isCorrect ? 'correct' : 'incorrect') : 'not-attempted';
            
            // Save question details
            results.questionDetails.push({
                questionId: question.globalId,
                questionNumber: question.id,
                subject: subject,
                attempted: isAttempted,
                correct: isCorrect,
                userAnswer: userAnswer.selected,
                correctAnswer: question.correctAnswer,
                score: questionScore,
                maxScore: marksCorrect,
                timeSpent: userAnswer.timeSpent,
                visitCount: userAnswer.visitCount
            });
        });
        
        return results;
    }
    
    /**
     * Enter review mode to show correct answers
     * @param {Object} results - Test results
     */
    enterReviewMode(results) {
        this.isReviewMode = true;
        
        // Hide navigation buttons
        this.clearResponseBtn.style.display = 'none';
        this.markReviewBtn.style.display = 'none';
        this.saveNextBtn.style.display = 'none';
        this.submitTestBtn.style.display = 'none';
        
        // Load the first question
        this.loadQuestion(0);
    }
    
    /**
     * Show correct answers for a question
     * @param {Object} question - Question object
     */
    showCorrectAnswers(question) {
        const correctAnswer = question.correctAnswer;
        const isMultipleChoice = question.question_type === 'multiple_choice_subject';
        const correctOptions = isMultipleChoice && Array.isArray(correctAnswer) ? 
            correctAnswer : [correctAnswer];
        
        // Get user's answer for this question
        const userAnswerObj = this.userAnswers.find(ans => ans.questionId === question.globalId);
        const userSelected = userAnswerObj ? userAnswerObj.selected : null;
        
        // Mark options as correct or incorrect
        const labels = this.optionsContainer.querySelectorAll('label');
        labels.forEach(label => {
            const input = label.querySelector('input');
            const optionKey = input.value;
            
            if (correctOptions.includes(optionKey)) {
                // This is a correct answer
                label.classList.add('correct-answer');
            } else if (isMultipleChoice && Array.isArray(userSelected) && userSelected.includes(optionKey) ||
                      !isMultipleChoice && userSelected === optionKey) {
                // This is an incorrect selection
                label.classList.add('incorrect-selection');
            }
            
            // Disable the input
            input.disabled = true;
        });
    }
}

// Initialize exam manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.examManager = new ExamManager();
});
