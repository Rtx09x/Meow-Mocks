/**
 * Configuration module for the NTA Mock Test Platform
 * Handles global configuration settings and constants
 */
const CONFIG = {
    // Default test duration in minutes (fallback if not specified in JSON)
    DEFAULT_TEST_DURATION: 180, // 3 hours
    
    // Default subject settings if not in JSON
    DEFAULT_SUBJECT: 'General',
    
    // Default marking scheme if not in JSON
    DEFAULT_MARKING_SCHEME: {
        single_choice_general: {
            marks_correct: 2,
            marks_incorrect: 0
        },
        single_choice_subject: {
            marks_correct: 3,
            marks_incorrect: -1
        },
        multiple_choice_subject: {
            marks_correct: 4,
            marks_incorrect: -1
        }
    },
    
    // Button status classes
    BUTTON_STATUS: {
        NOT_VISITED: 'not-visited',
        NOT_ANSWERED: 'not-answered',
        ANSWERED: 'answered',
        MARKED_REVIEW: 'marked-review'
    },
    
    // UI themes
    THEMES: {
        NTA: 'nta-theme',
        MATERIAL_YOU: 'material-you-theme'
    },
    
    // Storage keys
    STORAGE_KEYS: {
        THEME: 'nta-mock-theme',
        UI_STYLE: 'nta-mock-ui-style',
        DARK_MODE: 'nta-mock-dark-mode'
    },
    
    // API endpoints if needed
    API: {
        BASE_URL: '',
        TEST_DATA: ''
    }
};

/**
 * Helper function to replace image paths in test data
 * @param {string} text - The text content that may contain image placeholders
 * @param {string} imagePathPrefix - The prefix to use for image paths
 * @returns {string} - Text with image paths properly set
 */
function replaceImagePaths(text, imagePathPrefix) {
    if (!text) return '';
    return text.replace(/\{IMAGE_PATH_PREFIX\}/g, imagePathPrefix || '');
}

/**
 * Helper function to format time as HH:MM:SS
 * @param {number} seconds - Time in seconds
 * @returns {string} - Formatted time string
 */
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return [
        hours.toString().padStart(2, '0'),
        minutes.toString().padStart(2, '0'),
        secs.toString().padStart(2, '0')
    ].join(':');
}

/**
 * Helper function to shuffle an array
 * @param {Array} array - Array to shuffle
 * @returns {Array} - Shuffled array
 */
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

/**
 * Helper function to get available test files
 * @returns {Promise<Array>} - Array of test file objects
 */
async function getAvailableTests() {
    // This would typically fetch from a server, but for now we'll use a static list
    // In a real implementation, this could be a fetch request to an API endpoint
    return [
        { id: 'sample_test_jee.json', name: 'JEE Main 2023 Paper' }
        // Add more test files as needed
    ];
}

/**
 * Helper function to load test data from a JSON file
 * @param {string} url - URL of the JSON file
 * @returns {Promise<Object>} - Test data object
 */
async function loadTestData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to load test data: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error loading test data:', error);
        throw error;
    }
}
