/**
 * Graphs and Visualization Module for the Mock Test Platform
 * Uses Chart.js for rendering various analytics graphs
 */

class TestAnalysisGraphs {
    constructor() {
        this.charts = {};
        this.colors = {
            correct: 'rgba(40, 167, 69, 0.7)',
            incorrect: 'rgba(220, 53, 69, 0.7)',
            unattempted: 'rgba(108, 117, 125, 0.7)',
            time: 'rgba(23, 162, 184, 0.7)',
            borderCorrect: 'rgb(40, 167, 69)',
            borderIncorrect: 'rgb(220, 53, 69)',
            borderUnattempted: 'rgb(108, 117, 125)',
            borderTime: 'rgb(23, 162, 184)',
            grid: 'rgba(0, 0, 0, 0.1)',
            gridDark: 'rgba(255, 255, 255, 0.1)'
        };
    }

    /**
     * Initialize the graphs based on test results
     * @param {Object} results - The test results data
     */
    initialize(results) {
        if (!results) return;
        
        // Load Chart.js if not already loaded
        this.loadChartJs().then(() => {
            this.renderGraphs(results);
        });
    }
    
    /**
     * Load Chart.js library dynamically
     * @returns {Promise} - Promise that resolves when Chart.js is loaded
     */
    loadChartJs() {
        return new Promise((resolve, reject) => {
            if (window.Chart) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    /**
     * Render all graphs for test results
     * @param {Object} results - The test results data
     */
    renderGraphs(results) {
        const subjectsData = results.subjectWiseResults || [];
        const questionsData = results.questionDetails || [];
        
        // Prepare containers if they don't exist
        this.prepareGraphContainers();
        
        // Calculate time spent on each question
        this.calculateTimeData(questionsData);
        
        // Render overview pie chart
        this.renderOverviewPieChart(results);
        
        // Render subject performance chart
        this.renderSubjectPerformanceChart(subjectsData);
        
        // Render time distribution graph
        this.renderTimeDistributionGraph(questionsData);
        
        // Render accuracy vs time graph
        this.renderAccuracyTimeGraph(questionsData);
    }
    
    /**
     * Prepare graph containers in the DOM
     */
    prepareGraphContainers() {
        const analysisContent = document.getElementById('analysis-content');
        if (!analysisContent) return;
        
        // Clear existing content
        analysisContent.innerHTML = '';
        
        // Create overview container
        const overviewContainer = document.createElement('div');
        overviewContainer.className = 'graph-container';
        overviewContainer.innerHTML = `
            <h2>Performance Overview</h2>
            <div class="graph-row">
                <div class="graph-card">
                    <h3>Overall Performance</h3>
                    <div class="chart-wrapper">
                        <canvas id="overview-chart"></canvas>
                    </div>
                </div>
                <div class="graph-card">
                    <h3>Subject Performance</h3>
                    <div class="chart-wrapper">
                        <canvas id="subject-performance-chart"></canvas>
                    </div>
                </div>
            </div>
        `;
        
        // Create time analysis container
        const timeContainer = document.createElement('div');
        timeContainer.className = 'graph-container';
        timeContainer.innerHTML = `
            <h2>Time Analysis</h2>
            <div class="graph-row">
                <div class="graph-card time-distribution-graph">
                    <h3>Time Spent Per Question</h3>
                    <div class="chart-wrapper">
                        <canvas id="time-distribution-chart"></canvas>
                    </div>
                </div>
            </div>
            <div class="graph-row">
                <div class="graph-card">
                    <h3>Accuracy vs Time Spent</h3>
                    <div class="chart-wrapper">
                        <canvas id="accuracy-time-chart"></canvas>
                    </div>
                </div>
            </div>
        `;
        
        // Append to analysis content
        analysisContent.appendChild(overviewContainer);
        analysisContent.appendChild(timeContainer);
    }
    
    /**
     * Calculate time data for questions
     * @param {Array} questionsData - Question details array
     */
    calculateTimeData(questionsData) {
        // If time data is already present, no need to calculate
        if (questionsData.length > 0 && questionsData[0].timeSpent !== undefined) {
            return;
        }
        
        // Otherwise, assign random time data for demo purposes
        // In a real implementation, this would come from actual tracking
        questionsData.forEach(q => {
            q.timeSpent = Math.floor(Math.random() * 120) + 30; // 30-150 seconds
        });
    }
    
    /**
     * Render overview pie chart
     * @param {Object} results - The test results data
     */
    renderOverviewPieChart(results) {
        const ctx = document.getElementById('overview-chart');
        if (!ctx) return;
        
        const correct = results.totalCorrect || 0;
        const incorrect = results.totalIncorrect || 0;
        const unattempted = results.totalUnattempted || 0;
        
        if (this.charts.overview) {
            this.charts.overview.destroy();
        }
        
        this.charts.overview = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Correct', 'Incorrect', 'Unattempted'],
                datasets: [{
                    data: [correct, incorrect, unattempted],
                    backgroundColor: [
                        this.colors.correct,
                        this.colors.incorrect,
                        this.colors.unattempted
                    ],
                    borderColor: [
                        this.colors.borderCorrect,
                        this.colors.borderIncorrect,
                        this.colors.borderUnattempted
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Render subject performance chart
     * @param {Array} subjectsData - Subject-wise results array
     */
    renderSubjectPerformanceChart(subjectsData) {
        const ctx = document.getElementById('subject-performance-chart');
        if (!ctx || !subjectsData || subjectsData.length === 0) return;
        
        const labels = subjectsData.map(s => s.subject);
        const correctData = subjectsData.map(s => s.correct);
        const incorrectData = subjectsData.map(s => s.incorrect);
        const unattemptedData = subjectsData.map(s => s.unattempted);
        
        if (this.charts.subjectPerformance) {
            this.charts.subjectPerformance.destroy();
        }
        
        this.charts.subjectPerformance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Correct',
                        data: correctData,
                        backgroundColor: this.colors.correct,
                        borderColor: this.colors.borderCorrect,
                        borderWidth: 1
                    },
                    {
                        label: 'Incorrect',
                        data: incorrectData,
                        backgroundColor: this.colors.incorrect,
                        borderColor: this.colors.borderIncorrect,
                        borderWidth: 1
                    },
                    {
                        label: 'Unattempted',
                        data: unattemptedData,
                        backgroundColor: this.colors.unattempted,
                        borderColor: this.colors.borderUnattempted,
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        stacked: true,
                        grid: {
                            color: isDarkMode() ? this.colors.gridDark : this.colors.grid
                        }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        grid: {
                            color: isDarkMode() ? this.colors.gridDark : this.colors.grid
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
    
    /**
     * Render time distribution graph
     * @param {Array} questionsData - Question details array
     */
    renderTimeDistributionGraph(questionsData) {
        const ctx = document.getElementById('time-distribution-chart');
        if (!ctx || !questionsData || questionsData.length === 0) return;
        
        // Sort questions by index
        const sortedQuestions = [...questionsData].sort((a, b) => a.overallIndex - b.overallIndex);
        
        const labels = sortedQuestions.map(q => `Q${q.overallIndex + 1}`);
        const timeData = sortedQuestions.map(q => q.timeSpent || 0);
        const statusColors = sortedQuestions.map(q => {
            if (q.isCorrect) return this.colors.correct;
            if (q.userAnswer && !q.isCorrect) return this.colors.incorrect;
            return this.colors.unattempted;
        });
        
        if (this.charts.timeDistribution) {
            this.charts.timeDistribution.destroy();
        }
        
        this.charts.timeDistribution = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Time Spent (seconds)',
                    data: timeData,
                    backgroundColor: statusColors,
                    borderColor: statusColors.map(c => c.replace('0.7', '1')),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        grid: {
                            color: isDarkMode() ? this.colors.gridDark : this.colors.grid
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Time (seconds)'
                        },
                        grid: {
                            color: isDarkMode() ? this.colors.gridDark : this.colors.grid
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            afterLabel: function(context) {
                                const index = context.dataIndex;
                                const question = sortedQuestions[index];
                                const status = question.isCorrect ? 'Correct' : 
                                              (question.userAnswer ? 'Incorrect' : 'Unattempted');
                                return `Status: ${status}`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Render accuracy vs time scatter plot
     * @param {Array} questionsData - Question details array
     */
    renderAccuracyTimeGraph(questionsData) {
        const ctx = document.getElementById('accuracy-time-chart');
        if (!ctx || !questionsData || questionsData.length === 0) return;
        
        // Prepare data points
        const correctPoints = [];
        const incorrectPoints = [];
        const unattemptedPoints = [];
        
        questionsData.forEach(q => {
            const point = {
                x: q.timeSpent || 0,
                y: q.overallIndex + 1
            };
            
            if (q.isCorrect) {
                correctPoints.push(point);
            } else if (q.userAnswer) {
                incorrectPoints.push(point);
            } else {
                unattemptedPoints.push(point);
            }
        });
        
        if (this.charts.accuracyTime) {
            this.charts.accuracyTime.destroy();
        }
        
        this.charts.accuracyTime = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [
                    {
                        label: 'Correct',
                        data: correctPoints,
                        backgroundColor: this.colors.correct,
                        pointRadius: 6,
                        pointHoverRadius: 8
                    },
                    {
                        label: 'Incorrect',
                        data: incorrectPoints,
                        backgroundColor: this.colors.incorrect,
                        pointRadius: 6,
                        pointHoverRadius: 8
                    },
                    {
                        label: 'Unattempted',
                        data: unattemptedPoints,
                        backgroundColor: this.colors.unattempted,
                        pointRadius: 6,
                        pointHoverRadius: 8
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Time Spent (seconds)'
                        },
                        grid: {
                            color: isDarkMode() ? this.colors.gridDark : this.colors.grid
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Question Number'
                        },
                        grid: {
                            color: isDarkMode() ? this.colors.gridDark : this.colors.grid
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const dataIndex = context.dataIndex;
                                const dataset = context.dataset;
                                const point = dataset.data[dataIndex];
                                return `Question ${point.y}: ${point.x} seconds`;
                            }
                        }
                    }
                }
            }
        });
    }
}

// Helper function to check if dark mode is active
function isDarkMode() {
    return document.body.classList.contains('dark-mode');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    window.testAnalysisGraphs = new TestAnalysisGraphs();
});
