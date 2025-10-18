// Función para crear estrellas que caen
function createStars() {
    const container = document.querySelector('.numero-container');
    const numStars = 50;
    
    for (let i = 0; i < numStars; i++) {
        const star = document.createElement('div');
        star.classList.add('estrella');
        
        // Random size
        const size = Math.random() * 4 + 1;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        
        // Random initial position
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * -100}px`;
        
        // Random animation duration and delay
        const duration = Math.random() * 5 + 3;
        const delay = Math.random() * 5;
        star.style.animationDuration = `${duration}s`;
        star.style.animationDelay = `${delay}s`;
        
        // Random opacity
        star.style.opacity = Math.random() * 0.7 + 0.3;
        
        container.appendChild(star);
    }
}

// Function to get current date from API
async function getCurrentDate() {
    try {
        const response = await fetch('https://worldtimeapi.org/api/ip');
        const data = await response.json();
        const date = new Date(data.datetime);
        return {
            day: date.getDate(),
            month: date.getMonth() + 1, // January is 0
            year: date.getFullYear(),
            datetime: data.datetime
        };
    } catch (error) {
        console.error('Error getting date from API, using local date:', error);
        // Fallback to local date
        const now = new Date();
        return {
            day: now.getDate(),
            month: now.getMonth() + 1,
            year: now.getFullYear(),
            datetime: now.toISOString()
        };
    }
}

// Function to calculate special number (corrected)
function calculateSpecialNumber(day, month, year) {
    // Calculate: day × 15 - month × year
    const calculatedVar = (day * 15) - (month * year);
    
    // Convert to positive and to string
    const strVar = Math.abs(calculatedVar).toString();
    
    // Get first and last digit
    let firstDigit = strVar.charAt(0);
    let lastDigit = strVar.charAt(strVar.length - 1);
    
    // The final number is: last digit + first digit
    const finalNumber = lastDigit + firstDigit;
    
    return {
        date: `${day}/${month}/${year}`,
        day_number: finalNumber,
        timestamp: new Date().toISOString()
    };
}

// API endpoint for JSON response
function apiResponse() {
    return getCurrentDate().then(date => {
        const result = calculateSpecialNumber(date.day, date.month, date.year);
        return {
            current_date: result.date,
            special_number: result.day_number,
            timestamp: result.timestamp
        };
    });
}

// Detect if request is from API client or browser
function isApiRequest() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Check for JSON format parameter
    if (urlParams.get('format') === 'json') {
        return true;
    }
    
    // Check if request is likely from curl/wget/api client
    const userAgent = navigator.userAgent.toLowerCase();
    const isCurl = userAgent.includes('curl') || 
                   userAgent.includes('wget') || 
                   userAgent.includes('python') ||
                   userAgent.includes('java') ||
                   userAgent.includes('node') ||
                   userAgent.includes('fetch') ||
                   userAgent.includes('axios');
    
    // Check if Accept header would prefer JSON (simulated)
    if (window.location.pathname.includes('/api') || 
        window.location.pathname.endsWith('.json')) {
        return true;
    }
    
    return isCurl;
}

// Main function for web interface
async function initWebInterface() {
    try {
        // Get date
        const date = await getCurrentDate();
        
        // Display date
        document.getElementById('fecha').textContent = 
            `${date.day}/${date.month}/${date.year}`;
        
        // Calculate number
        const result = calculateSpecialNumber(date.day, date.month, date.year);
        
        // Display number
        document.getElementById('numero').textContent = result.day_number;
        
        // Display timestamp
        document.getElementById('timestamp').textContent = 
            `Actualizado: ${new Date().toLocaleString()}`;
        
        // Create stars
        createStars();
        
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('numero').textContent = 'Error';
    }
}

// Handle different types of requests
if (typeof window !== 'undefined') {
    // Check if this is an API request
    if (isApiRequest()) {
        // API mode - return JSON
        apiResponse().then(data => {
            // Set content type to JSON
            if (document.contentType === 'text/html') {
                document.body.innerHTML = '';
                const pre = document.createElement('pre');
                pre.textContent = JSON.stringify(data, null, 2);
                document.body.appendChild(pre);
                document.title = 'API Response';
            }
        }).catch(error => {
            document.body.innerHTML = JSON.stringify({
                error: 'Internal server error',
                timestamp: new Date().toISOString()
            }, null, 2);
        });
    } else {
        // Web interface mode
        document.addEventListener('DOMContentLoaded', initWebInterface);
    }
}

// Server-side detection for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getCurrentDate,
        calculateSpecialNumber,
        apiResponse
    };
}
