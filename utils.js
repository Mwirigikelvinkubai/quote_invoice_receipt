// Utility functions (optional - functions are already in main script)

// Format currency in KES
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-KE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

// Generate a unique document number
function generateDocumentNumber(prefix = 'QB') {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${year}-${randomNum}`;
}

// Make functions available globally
window.formatCurrency = formatCurrency;
window.generateDocumentNumber = generateDocumentNumber;