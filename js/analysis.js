/**
 * Analysis module for the NTA Mock Test Platform
 * Handles displaying test analysis with graphs and visualizations
 */
class AnalysisManager {
    constructor() {
        // DOM elements
        this.analysisScreen = document.getElementById('analysis-screen');
        this.analysisContent = document.getElementById('analysis-content');
        this.exitAnalysisBtn = document.getElementById('exit-analysis-btn');
        this.chartsContainer = document.getElementById('charts-container') || document.createElement('div');
        
        // Test data
        this.results = null;
        this.charts = [];
        
        // Create chart containers if they don't exist
        if (!document.getElementById('charts-container')) {
            this.chartsContainer.id = 'charts-container';
            this.analysisContent.appendChild(this.chartsContainer);
        }
        
        this.bindEvents();
    }
    
    /**
     * Bind event handlers
     */
    bindEvents() {
        // Exit analysis button
        if (this.exitAnalysisBtn) {
            this.exitAnalysisBtn.addEventListener('click', () => {
                this.hideAnalysisScreen();
            });
        }
    }
    
    /**
     * Initialize with test results data
     * @param {Object} results - The test results data
     */
    initialize(results) {
        this.results = results;
        console.log('Initializing analysis with results:', results);
        
        // Clear previous charts
        this.destroyCharts();
        
        // Prepare the container
        this.prepareChartsContainer();
        
        // Create all charts
        this.createAllCharts();
    }
    
    /**
     * Hide analysis screen
     */
    hideAnalysisScreen() {
        if (this.analysisScreen) {
            this.analysisScreen.classList.remove('active');
            
            // Show results screen
            const resultsScreen = document.getElementById('results-screen');
            if (resultsScreen) {
                resultsScreen.classList.add('active');
            }
        }
    }
    
    /**
     * Show analysis screen
     * @param {Object} results - The test results data
     */
    showAnalysisScreen(results) {
        if (results) {
            this.initialize(results);
        }
        
        if (this.analysisScreen) {
            this.analysisScreen.classList.add('active');
        }
    }
    
    /**
     * Prepare charts container
     */
    prepareChartsContainer() {
        // Clear container
        this.chartsContainer.innerHTML = '';
        
        // Create sections
        const timingSection = document.createElement('div');
        timingSection.className = 'chart-section';
        timingSection.innerHTML = '<h3>Timing Analysis</h3>';
        
        const performanceSection = document.createElement('div');
        performanceSection.className = 'chart-section';
        performanceSection.innerHTML = '<h3>Performance Analysis</h3>';
        
        // Create chart containers
        const timePerQuestionContainer = document.createElement('div');
        timePerQuestionContainer.className = 'chart-container';
        timePerQuestionContainer.id = 'time-per-question-chart';
        
        const timeDistributionContainer = document.createElement('div');
        timeDistributionContainer.className = 'chart-container';
        timeDistributionContainer.id = 'time-distribution-chart';
        
        const performanceOverviewContainer = document.createElement('div');
        performanceOverviewContainer.className = 'chart-container';
        performanceOverviewContainer.id = 'performance-overview-chart';
        
        const subjectComparisonContainer = document.createElement('div');
        subjectComparisonContainer.className = 'chart-container';
        subjectComparisonContainer.id = 'subject-comparison-chart';
        
        // Append containers to sections
        timingSection.appendChild(timePerQuestionContainer);
        timingSection.appendChild(timeDistributionContainer);
        
        performanceSection.appendChild(performanceOverviewContainer);
        performanceSection.appendChild(subjectComparisonContainer);
        
        // Append sections to main container
        this.chartsContainer.appendChild(timingSection);
        this.chartsContainer.appendChild(performanceSection);
    }
    
    /**
     * Create all charts
     */
    createAllCharts() {
        if (!this.results || !this.results.questions || !window.Chart) {
            console.error('Missing data or Chart.js for creating charts');
            return;
        }
        
        this.createTimePerQuestionChart();
        this.createTimeDistributionChart();
        this.createPerformanceOverviewChart();
        this.createSubjectComparisonChart();
    }
    
    /**
     * Create time per question chart
     */
    createTimePerQuestionChart() {
        const questions = this.results.questions;
        const data = {
            labels: questions.map((q, i) => `Q${i+1}`),
            datasets: [{
                label: 'Time Spent (seconds)',
                data: questions.map(q => Math.round(q.timeSpent / 1000)),
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        };
        
        const config = {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Time Spent Per Question'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const seconds = context.raw;
                                const minutes = Math.floor(seconds / 60);
                                const remainingSeconds = seconds % 60;
                                return `${minutes}m ${remainingSeconds}s`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Seconds'
                        }
                    }
                }
            }
        };
        
        const ctx = document.getElementById('time-per-question-chart');
        if (ctx) {
            const chart = new Chart(ctx, config);
            this.charts.push(chart);
        }
    }
    
    /**
     * Create time distribution chart
     */
    createTimeDistributionChart() {
        const questions = this.results.questions;
        
        // Calculate time ranges
        const timeRanges = {
            'Less than 30s': 0,
            '30s to 1m': 0,
            '1m to 2m': 0,
            '2m to 3m': 0,
            'More than 3m': 0
        };
        
        questions.forEach(q => {
            const seconds = Math.round(q.timeSpent / 1000);
            if (seconds < 30) {
                timeRanges['Less than 30s']++;
            } else if (seconds < 60) {
                timeRanges['30s to 1m']++;
            } else if (seconds < 120) {
                timeRanges['1m to 2m']++;
            } else if (seconds < 180) {
                timeRanges['2m to 3m']++;
            } else {
                timeRanges['More than 3m']++;
            }
        });
        
        const data = {
            labels: Object.keys(timeRanges),
            datasets: [{
                label: 'Number of Questions',
                data: Object.values(timeRanges),
                backgroundColor: [
                    'rgba(75, 192, 192, 0.5)',
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(255, 206, 86, 0.5)',
                    'rgba(255, 159, 64, 0.5)',
                    'rgba(255, 99, 132, 0.5)'
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(255, 99, 132, 1)'
                ],
                borderWidth: 1
            }]
        };
        
        const config = {
            type: 'pie',
            data: data,
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Time Distribution'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${value} questions (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        };
        
        const ctx = document.getElementById('time-distribution-chart');
        if (ctx) {
            const chart = new Chart(ctx, config);
            this.charts.push(chart);
        }
    }
    
    /**
     * Create performance overview chart
     */
    createPerformanceOverviewChart() {
        const totalQuestions = this.results.questions.length;
        const correctAnswers = this.results.questions.filter(q => q.isCorrect).length;
        const incorrectAnswers = this.results.questions.filter(q => q.isCorrect === false).length;
        const unattempted = totalQuestions - correctAnswers - incorrectAnswers;
        
        const data = {
            labels: ['Correct', 'Incorrect', 'Unattempted'],
            datasets: [{
                label: 'Questions',
                data: [correctAnswers, incorrectAnswers, unattempted],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.5)',
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(201, 203, 207, 0.5)'
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(201, 203, 207, 1)'
                ],
                borderWidth: 1
            }]
        };
        
        const config = {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Performance Overview'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${value} questions (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        };
        
        const ctx = document.getElementById('performance-overview-chart');
        if (ctx) {
            const chart = new Chart(ctx, config);
            this.charts.push(chart);
        }
    }
    
    /**
     * Create subject comparison chart
     */
    createSubjectComparisonChart() {
        // Group questions by subject
        const subjects = {};
        
        this.results.questions.forEach(q => {
            const subject = q.subject || 'Unknown';
            
            if (!subjects[subject]) {
                subjects[subject] = {
                    total: 0,
                    correct: 0,
                    incorrect: 0,
                    unattempted: 0
                };
            }
            
            subjects[subject].total++;
            
            if (q.isCorrect === true) {
                subjects[subject].correct++;
            } else if (q.isCorrect === false) {
                subjects[subject].incorrect++;
            } else {
                subjects[subject].unattempted++;
            }
        });
        
        const subjectNames = Object.keys(subjects);
        const correctData = subjectNames.map(s => subjects[s].correct);
        const incorrectData = subjectNames.map(s => subjects[s].incorrect);
        const unattemptedData = subjectNames.map(s => subjects[s].unattempted);
        
        const data = {
            labels: subjectNames,
            datasets: [
                {
                    label: 'Correct',
                    data: correctData,
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Incorrect',
                    data: incorrectData,
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Unattempted',
                    data: unattemptedData,
                    backgroundColor: 'rgba(201, 203, 207, 0.5)',
                    borderColor: 'rgba(201, 203, 207, 1)',
                    borderWidth: 1
                }
            ]
        };
        
        const config = {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Performance by Subject'
                    }
                },
                scales: {
                    x: {
                        stacked: true
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Number of Questions'
                        }
                    }
                }
            }
        };
        
        const ctx = document.getElementById('subject-comparison-chart');
        if (ctx) {
            const chart = new Chart(ctx, config);
            this.charts.push(chart);
        }
    }
    
    /**
     * Display basic analysis when Chart.js is not available
     */
    displayBasicAnalysis() {
        if (!this.analysisContent || !this.results) return;
        
        this.analysisContent.innerHTML = '<h2>Test Analysis</h2>';
        
        // Basic statistics
        const totalQuestions = this.results.questions.length;
        const correctAnswers = this.results.questions.filter(q => q.isCorrect).length;
        const accuracy = Math.round((correctAnswers / totalQuestions) * 100);
        
        const statsDiv = document.createElement('div');
        statsDiv.className = 'analysis-stats';
        statsDiv.innerHTML = `
            <p><strong>Total Questions:</strong> ${totalQuestions}</p>
            <p><strong>Correct Answers:</strong> ${correctAnswers}</p>
            <p><strong>Accuracy:</strong> ${accuracy}%</p>
        `;
        
        this.analysisContent.appendChild(statsDiv);
    }
    
    /**
     * Destroy all charts
     */
    destroyCharts() {
        this.charts.forEach(chart => chart.destroy());
        this.charts = [];
    }
}

// Initialize analysis manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.analysisManager = new AnalysisManager();
});
