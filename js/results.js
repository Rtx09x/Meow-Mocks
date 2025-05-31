/**
 * Results module for the NTA Mock Test Platform
 * Handles displaying test results and score
 */
class ResultsManager {
    constructor() {
        // DOM elements
        this.resultsScreen = document.getElementById('results-screen');
        this.resultsCandidatePhoto = document.getElementById('results-candidate-photo');
        this.resultsCandidateName = document.getElementById('results-candidate-name');
        this.resultsRollNumber = document.getElementById('results-roll-number');
        this.totalScore = document.getElementById('total-score');
        this.totalQuestions = document.getElementById('total-questions');
        this.attemptedQuestions = document.getElementById('attempted-questions');
        this.correctAnswers = document.getElementById('correct-answers');
        this.incorrectAnswers = document.getElementById('incorrect-answers');
        this.subjectWiseResults = document.getElementById('subject-wise-results');
        this.reviewAnswersBtn = document.getElementById('review-answers-btn');
        this.analysisBtn = document.getElementById('analysis-btn');
        this.exportResultsBtn = document.getElementById('export-results-btn');
        
        // Analysis screen elements
        this.analysisScreen = document.getElementById('analysis-screen');
        this.analysisContainer = document.getElementById('analysis-container');
        this.exitAnalysisBtn = document.getElementById('exit-analysis-btn');
        
        // Results data
        this.testData = null;
        this.candidateData = null;
        this.userAnswers = null;
        this.results = null;
        this.timeSpent = 0;
        
        this.bindEvents();
        
        document.addEventListener('DOMContentLoaded', () => {
            // Analysis button event
            const analysisBtn = document.getElementById('analysis-btn');
            if (analysisBtn) {
                analysisBtn.addEventListener('click', () => {
                    this.showAnalysis();
                });
            }
            
            // Exit analysis button event
            const exitAnalysisBtn = document.getElementById('exit-analysis-btn');
            if (exitAnalysisBtn) {
                exitAnalysisBtn.addEventListener('click', () => {
                    this.exitAnalysis();
                });
            }
        });
    }
    
    /**
     * Bind event handlers
     */
    bindEvents() {
        // Review answers button handler
        this.reviewAnswersBtn.addEventListener('click', () => {
            this.reviewAnswers();
        });
        
        // Analysis button handler
        this.analysisBtn.addEventListener('click', () => {
            this.showAnalysis();
        });
        
        // Exit analysis button handler
        if (this.exitAnalysisBtn) {
            this.exitAnalysisBtn.addEventListener('click', () => {
                this.exitAnalysis();
            });
        }
        
        // Export results button handler
        this.exportResultsBtn.addEventListener('click', () => {
            this.exportResults();
        });
    }
    
    /**
     * Show results screen with calculated score
     * @param {boolean} isAutoSubmit - Whether this was an auto-submission due to time expiry
     */
    showResults(isAutoSubmit = false) {
        // Load results from session storage
        const storedResults = JSON.parse(sessionStorage.getItem('testResults'));
        
        if (storedResults) {
            this.testData = storedResults.testData;
            this.candidateData = storedResults.candidateData;
            this.userAnswers = storedResults.userAnswers;
            this.results = storedResults.results;
            this.timeSpent = storedResults.timeSpent || 0;
            
            // Update UI
            this.updateCandidateInfo();
            this.displayResults();
            this.displaySubjectWiseResults();
            
            // Show results screen
            this.resultsScreen.classList.add('active');
            
            // Show auto-submit message if applicable
            if (isAutoSubmit) {
                alert('Time has expired. Your test has been automatically submitted.');
            }
        } else {
            console.error('No test results found in session storage');
        }
    }
    
    /**
     * Update UI with candidate information
     */
    updateCandidateInfo() {
        // Set candidate name and roll number
        if (this.resultsCandidateName) {
            this.resultsCandidateName.textContent = this.candidateData.name || 'N/A';
        }
        
        if (this.resultsRollNumber) {
            this.resultsRollNumber.textContent = this.candidateData.rollNumber || 'N/A';
        }
        
        // Set candidate photo if available
        if (this.resultsCandidatePhoto && this.candidateData.photoURL) {
            this.resultsCandidatePhoto.innerHTML = `<img src="${this.candidateData.photoURL}" alt="Candidate Photo">`;
        }
    }
    
    /**
     * Display test results
     */
    displayResults() {
        // Total score
        if (this.totalScore) {
            this.totalScore.textContent = `${this.results.score.toFixed(2)} / ${this.results.maxScore}`;
        }
        
        // Total questions
        if (this.totalQuestions) {
            this.totalQuestions.textContent = this.results.totalQuestions;
        }
        
        // Attempted questions
        if (this.attemptedQuestions) {
            this.attemptedQuestions.textContent = this.results.attempted;
        }
        
        // Correct answers
        if (this.correctAnswers) {
            this.correctAnswers.textContent = this.results.correct;
        }
        
        // Incorrect answers
        if (this.incorrectAnswers) {
            this.incorrectAnswers.textContent = this.results.incorrect;
        }
    }
    
    /**
     * Display subject-wise results
     */
    displaySubjectWiseResults() {
        if (!this.subjectWiseResults) return;
        
        this.subjectWiseResults.innerHTML = '';
        
        // Create table header
        const table = document.createElement('table');
        table.className = 'subject-results-table';
        
        const headerRow = document.createElement('tr');
        headerRow.innerHTML = `
            <th>Subject</th>
            <th>Score</th>
            <th>Correct</th>
            <th>Incorrect</th>
            <th>Attempted</th>
            <th>Total</th>
        `;
        table.appendChild(headerRow);
        
        // Add rows for each subject
        Object.keys(this.results.subjects).forEach(subject => {
            const subjectData = this.results.subjects[subject];
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${subject}</td>
                <td>${subjectData.score.toFixed(2)} / ${subjectData.maxScore}</td>
                <td>${subjectData.correct}</td>
                <td>${subjectData.incorrect}</td>
                <td>${subjectData.attempted}</td>
                <td>${subjectData.total}</td>
            `;
            
            table.appendChild(row);
        });
        
        this.subjectWiseResults.appendChild(table);
    }
    
    /**
     * Review answers
     */
    reviewAnswers() {
        // Hide results screen
        this.resultsScreen.classList.remove('active');
        
        // Show review screen
        window.reviewManager.showReview(this.testData, this.candidateData, this.userAnswers, this.results);
    }
    
    /**
     * Show timing analysis
     */
    showAnalysis() {
        // Generate analysis content
        this.generateAnalysisContent();
        
        // Hide results screen
        this.resultsScreen.classList.remove('active');
        
        // Show analysis screen
        this.analysisScreen.classList.add('active');
    }
    
    /**
     * Exit timing analysis
     */
    exitAnalysis() {
        // Hide analysis screen
        this.analysisScreen.classList.remove('active');
        
        // Show results screen
        this.resultsScreen.classList.add('active');
    }
    generateAnalysisContent() {
        if (!this.analysisContainer) return;

        // Ensure testData and candidateData are available
        if (!this.testData || !this.candidateData) {
            console.error("Test data or candidate data not available for analysis content generation.");
            // Optionally, display a message in the UI or return early
            this.analysisContainer.innerHTML = '<p>Error: Test data is not available to generate analysis.</p>';
            return;
        }
        
        // Clear container
        this.analysisContainer.innerHTML = '';
        
        // Create header with test info
        const header = document.createElement('div');
        header.className = 'analysis-header';
        header.innerHTML = `
            <h2>${this.testData.testTitle || 'Test'} - Timing Analysis</h2>
            <p>Candidate: ${this.candidateData.name || 'N/A'} | Roll Number: ${this.candidateData.rollNumber || 'N/A'}</p>
        `;
        this.analysisContainer.appendChild(header);
        
        // Create overall timing section
        this.createOverallTimingSection();
        
        // Create subject-wise timing section
        this.createSubjectTimingSection();
        
        // Create timing by correctness section
        this.createCorrectnessTimingSection();
        
        // Create question-wise timing section
        this.createQuestionTimingSection();
    }
    
    /**
     * Create overall timing section
     */
    createOverallTimingSection() {
        const section = document.createElement('div');
        section.className = 'analysis-section';
        
        // Calculate total time spent
        const totalTimeSpent = this.userAnswers.reduce((total, answer) => total + answer.timeSpent, 0);
        const totalTimeFormatted = formatTime(totalTimeSpent);
        const averageTimePerQuestion = totalTimeSpent / this.userAnswers.length;
        const averageTimeFormatted = formatTime(Math.round(averageTimePerQuestion));
        
        section.innerHTML = `
            <h3>Overall Timing</h3>
            <div class="time-analysis-table-container">
                <table class="time-analysis-table">
                    <tr>
                        <th>Total Test Time</th>
                        <td class="time-cell">${formatTime(this.timeSpent)}</td>
                    </tr>
                    <tr>
                        <th>Active Question Time</th>
                        <td class="time-cell">${totalTimeFormatted}</td>
                    </tr>
                    <tr>
                        <th>Average Time per Question</th>
                        <td class="time-cell">${averageTimeFormatted}</td>
                    </tr>
                </table>
            </div>
        `;
        
        this.analysisContainer.appendChild(section);
    }
    
    /**
     * Create subject-wise timing section
     */
    createSubjectTimingSection() {
        const section = document.createElement('div');
        section.className = 'analysis-section';
        
        // Group questions by subject
        const subjectTimings = {};
        this.userAnswers.forEach((answer, index) => {
            const question = this.testData.questions[index];
            const subject = question.subject;
            
            if (!subjectTimings[subject]) {
                subjectTimings[subject] = {
                    totalTime: 0,
                    questionCount: 0,
                    correct: 0,
                    incorrect: 0,
                    notAttempted: 0,
                    timeCorrect: 0,
                    timeIncorrect: 0,
                    timeNotAttempted: 0
                };
            }
            
            subjectTimings[subject].totalTime += answer.timeSpent;
            subjectTimings[subject].questionCount++;
            
            // Categorize by correctness
            if (answer.correctness === 'correct') {
                subjectTimings[subject].correct++;
                subjectTimings[subject].timeCorrect += answer.timeSpent;
            } else if (answer.correctness === 'incorrect') {
                subjectTimings[subject].incorrect++;
                subjectTimings[subject].timeIncorrect += answer.timeSpent;
            } else {
                subjectTimings[subject].notAttempted++;
                subjectTimings[subject].timeNotAttempted += answer.timeSpent;
            }
        });
        
        // Create table header
        let tableHTML = `
            <h3>Subject-wise Timing</h3>
            <div class="time-analysis-table-container">
                <table class="time-analysis-table">
                    <thead>
                        <tr>
                            <th>Subject</th>
                            <th>Questions</th>
                            <th>Total Time</th>
                            <th>Average Time</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        // Add rows for each subject
        Object.keys(subjectTimings).forEach(subject => {
            const timing = subjectTimings[subject];
            const averageTime = timing.totalTime / timing.questionCount;
            
            tableHTML += `
                <tr>
                    <td>${subject}</td>
                    <td>${timing.questionCount}</td>
                    <td class="time-cell">${formatTime(timing.totalTime)}</td>
                    <td class="time-cell">${formatTime(Math.round(averageTime))}</td>
                </tr>
            `;
        });
        
        tableHTML += `
                    </tbody>
                </table>
            </div>
        `;
        
        section.innerHTML = tableHTML;
        this.analysisContainer.appendChild(section);
    }
    
    /**
     * Create timing by correctness section
     */
    createCorrectnessTimingSection() {
        const section = document.createElement('div');
        section.className = 'analysis-section';
        
        // Categorize questions by correctness
        const correctnessStats = {
            correct: { count: 0, totalTime: 0 },
            incorrect: { count: 0, totalTime: 0 },
            notAttempted: { count: 0, totalTime: 0 }
        };
        
        this.userAnswers.forEach(answer => {
            if (answer.correctness === 'correct') {
                correctnessStats.correct.count++;
                correctnessStats.correct.totalTime += answer.timeSpent;
            } else if (answer.correctness === 'incorrect') {
                correctnessStats.incorrect.count++;
                correctnessStats.incorrect.totalTime += answer.timeSpent;
            } else {
                correctnessStats.notAttempted.count++;
                correctnessStats.notAttempted.totalTime += answer.timeSpent;
            }
        });
        
        // Calculate averages
        const correctAvg = correctnessStats.correct.count > 0 ? 
            correctnessStats.correct.totalTime / correctnessStats.correct.count : 0;
        const incorrectAvg = correctnessStats.incorrect.count > 0 ? 
            correctnessStats.incorrect.totalTime / correctnessStats.incorrect.count : 0;
        const notAttemptedAvg = correctnessStats.notAttempted.count > 0 ? 
            correctnessStats.notAttempted.totalTime / correctnessStats.notAttempted.count : 0;
        
        section.innerHTML = `
            <h3>Timing by Answer Correctness</h3>
            <div class="time-analysis-table-container">
                <table class="time-analysis-table">
                    <thead>
                        <tr>
                            <th>Answer Type</th>
                            <th>Count</th>
                            <th>Total Time</th>
                            <th>Average Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Correct Answers</td>
                            <td>${correctnessStats.correct.count}</td>
                            <td class="time-cell">${formatTime(correctnessStats.correct.totalTime)}</td>
                            <td class="time-cell">${formatTime(Math.round(correctAvg))}</td>
                        </tr>
                        <tr>
                            <td>Incorrect Answers</td>
                            <td>${correctnessStats.incorrect.count}</td>
                            <td class="time-cell">${formatTime(correctnessStats.incorrect.totalTime)}</td>
                            <td class="time-cell">${formatTime(Math.round(incorrectAvg))}</td>
                        </tr>
                        <tr>
                            <td>Not Attempted</td>
                            <td>${correctnessStats.notAttempted.count}</td>
                            <td class="time-cell">${formatTime(correctnessStats.notAttempted.totalTime)}</td>
                            <td class="time-cell">${formatTime(Math.round(notAttemptedAvg))}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
        
        this.analysisContainer.appendChild(section);
    }
    
    /**
     * Create question-wise timing section
     */
    createQuestionTimingSection() {
        const section = document.createElement('div');
        section.className = 'analysis-section';
        
        // Create table header
        let tableHTML = `
            <h3>Question-wise Timing</h3>
            <div class="time-analysis-table-container">
                <table class="time-analysis-table">
                    <thead>
                        <tr>
                            <th>Q #</th>
                            <th>Subject</th>
                            <th>Time Spent</th>
                            <th>Visits</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        // Add rows for each question
        this.userAnswers.forEach((answer, index) => {
            const question = this.testData.questions[index];
            
            // Get status text and class
            let statusText, statusClass;
            if (answer.correctness === 'correct') {
                statusText = 'Correct';
                statusClass = 'correct';
            } else if (answer.correctness === 'incorrect') {
                statusText = 'Incorrect';
                statusClass = 'incorrect';
            } else {
                statusText = 'Not Attempted';
                statusClass = 'not-attempted';
            }
            
            tableHTML += `
                <tr>
                    <td>${question.id}</td>
                    <td>${question.subject}</td>
                    <td class="time-cell">${formatTime(answer.timeSpent)}</td>
                    <td>${answer.visitCount}</td>
                    <td class="status-${statusClass}">${statusText}</td>
                </tr>
            `;
        });
        
        tableHTML += `
                    </tbody>
                </table>
            </div>
        `;
        
        section.innerHTML = tableHTML;
        this.analysisContainer.appendChild(section);
    }
    
    /**
     * Export results as JSON
     */
    exportResults() {
        // Ensure critical data is available
        if (!this.testData || !this.candidateData || !this.results || !this.userAnswers) {
            console.error("Cannot export results: Test data, candidate data, results, or user answers are missing.");
            alert("Error: Could not export results. Required data is missing. Please try again or contact support.");
            return; // Prevent further execution if data is missing
        }

        // Format results data
        const resultsToExport = {
            testTitle: this.testData.testTitle || 'N/A',
            candidateName: this.candidateData.name || 'N/A',
            rollNumber: this.candidateData.rollNumber || 'N/A',
            totalScore: this.results.score !== undefined ? this.results.score : 'N/A',
            maxPossibleScore: this.results.maxScore !== undefined ? this.results.maxScore : 'N/A',
            totalQuestions: this.results.totalQuestions !== undefined ? this.results.totalQuestions : 'N/A',
            attemptedQuestions: this.results.attempted !== undefined ? this.results.attempted : 'N/A',
            correctAnswers: this.results.correct !== undefined ? this.results.correct : 'N/A',
            incorrectAnswers: this.results.incorrect !== undefined ? this.results.incorrect : 'N/A',
            timeSpent: this.timeSpent !== undefined ? this.timeSpent : 'N/A',
            timeSpentFormatted: this.timeSpent !== undefined ? formatTime(this.timeSpent) : 'N/A',
            subjects: this.results.subjects || {},
            timingAnalysis: {
                totalQuestionTime: this.userAnswers ? this.userAnswers.reduce((total, answer) => total + (answer && answer.timeSpent !== undefined ? answer.timeSpent : 0), 0) : 'N/A',
                averageTimePerQuestion: Math.round(this.userAnswers.reduce((total, answer) => total + answer.timeSpent, 0) / this.userAnswers.length),
                subjectTimings: {},
                correctnessTimings: {
                    correct: { count: 0, totalTime: 0 },
                    incorrect: { count: 0, totalTime: 0 },
                    notAttempted: { count: 0, totalTime: 0 }
                }
            },
            questions: []
        };
        
        // Retrieve question notes if available
        const savedExamData = JSON.parse(localStorage.getItem('savedExam') || '{}');
        const questionNotes = savedExamData.questionNotes || {};
        
        // Calculate subject timings
        this.userAnswers.forEach((answer, index) => {
            const question = this.testData.questions[index];
            const subject = question.subject;
            
            if (!results.timingAnalysis.subjectTimings[subject]) {
                results.timingAnalysis.subjectTimings[subject] = {
                    totalTime: 0,
                    questionCount: 0,
                    averageTime: 0
                };
            }
            
            results.timingAnalysis.subjectTimings[subject].totalTime += answer.timeSpent;
            results.timingAnalysis.subjectTimings[subject].questionCount++;
            
            // Categorize by correctness
            if (answer.correctness === 'correct') {
                results.timingAnalysis.correctnessTimings.correct.count++;
                results.timingAnalysis.correctnessTimings.correct.totalTime += answer.timeSpent;
            } else if (answer.correctness === 'incorrect') {
                results.timingAnalysis.correctnessTimings.incorrect.count++;
                results.timingAnalysis.correctnessTimings.incorrect.totalTime += answer.timeSpent;
            } else {
                results.timingAnalysis.correctnessTimings.notAttempted.count++;
                results.timingAnalysis.correctnessTimings.notAttempted.totalTime += answer.timeSpent;
            }
        });
        
        // Calculate average times for each subject
        Object.keys(results.timingAnalysis.subjectTimings).forEach(subject => {
            const timing = results.timingAnalysis.subjectTimings[subject];
            timing.averageTime = Math.round(timing.totalTime / timing.questionCount);
        });
        
        // Format questions data
        this.testData.questions.forEach((question, index) => {
            const userAnswer = this.userAnswers[index];
            const questionDetail = this.results.questionDetails.find(qd => qd.questionId === question.globalId);
            
            // Get note for this question from multiple possible sources
            let note = '';
            
            // First check if the questionDetail has notes directly
            if (questionDetail && questionDetail.notes) {
                note = questionDetail.notes;
            } 
            // Then check if the note exists in the global questionNotes object from review
            else if (questionNotes && questionNotes[index]) {
                note = questionNotes[index];
            } 
            // Lastly check if notes are available from window.reviewManager
            else if (window.reviewManager && window.reviewManager.questionNotes && window.reviewManager.questionNotes[index]) {
                note = window.reviewManager.questionNotes[index];
            }
            
            results.questions.push({
                id: question.id,
                subject: question.subject,
                text: stripHtml(question.text),
                userAnswer: userAnswer.selected,
                correctAnswer: question.correctAnswer,
                score: questionDetail ? questionDetail.score : 0,
                maxScore: questionDetail ? questionDetail.maxScore : 0,
                isCorrect: questionDetail ? questionDetail.correct : false,
                isAttempted: questionDetail ? questionDetail.attempted : false,
                timeSpent: userAnswer.timeSpent,
                timeSpentFormatted: formatTime(userAnswer.timeSpent),
                visitCount: userAnswer.visitCount,
                correctness: userAnswer.correctness,
                notes: note
            });
        });
        
        // Convert to JSON and create download link
        const json = JSON.stringify(results, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `${this.testData.testTitle.replace(/\s+/g, '_')}_results.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        
        console.log('Exported results with notes:', results.questions.filter(q => q.notes).length);
    }
}

/**
 * Helper function to format seconds as MM:SS
 * @param {number} seconds - Seconds to format
 * @returns {string} - Formatted time string
 */
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Helper function to strip HTML tags from text
 * @param {string} html - HTML string to strip
 * @returns {string} - Plain text
 */
function stripHtml(html) {
    if (!html) return '';
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
}

// Initialize results manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.resultsManager = new ResultsManager();
});
