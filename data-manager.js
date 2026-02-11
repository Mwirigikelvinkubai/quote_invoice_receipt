// Data management and storage - Simplified version

// Save document data
document.addEventListener('DOMContentLoaded', function() {
    // Save document button
    document.getElementById('saveDocumentBtn').addEventListener('click', saveDocument);
    
    // Clear all button
    document.getElementById('clearAllBtn').addEventListener('click', clearAllData);
    
    // Download PDF button - use the function from main script
    document.getElementById('downloadPdfBtn').addEventListener('click', function() {
        if (typeof window.downloadPdf === 'function') {
            window.downloadPdf();
        } else {
            alert('PDF download function not available. Please refresh the page.');
        }
    });
});

// Save document to localStorage
function saveDocument() {
    try {
        const documentData = gatherDocumentData();
        localStorage.setItem('quickbill_document', JSON.stringify(documentData));
        
        if (typeof window.showNotification === 'function') {
            window.showNotification('Document saved successfully!', 'success');
        } else {
            alert('Document saved successfully!');
        }
        console.log('Document saved:', documentData);
    } catch (error) {
        console.error('Error saving document:', error);
        if (typeof window.showNotification === 'function') {
            window.showNotification('Error saving document', 'error');
        } else {
            alert('Error saving document');
        }
    }
}

// Gather all document data (simplified version)
function gatherDocumentData() {
    // Use the function from main script if available
    if (typeof window.gatherDocumentData === 'function') {
        return window.gatherDocumentData();
    }
    
    // Fallback if main function not available
    return {
        type: window.currentDocumentType || 'quotation',
        company: {
            name: document.getElementById('companyName').value,
            email: document.getElementById('companyEmail').value,
            phone: document.getElementById('companyPhone').value,
            address: document.getElementById('companyAddress').value,
            logo: document.getElementById('logoPreviewImg') ? document.getElementById('logoPreviewImg').src : ''
        },
        client: {
            name: document.getElementById('clientName').value,
            email: document.getElementById('clientEmail').value,
            address: document.getElementById('clientAddress').value
        },
        document: {
            number: document.getElementById('documentNumber').value,
            date: document.getElementById('documentDate').value
        },
        items: window.items || [],
        terms: document.getElementById('terms').value,
        currency: 'KES',
        lastSaved: new Date().toISOString()
    };
}

// Clear all data
function clearAllData() {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
        // Clear form fields
        document.getElementById('companyName').value = '';
        document.getElementById('companyEmail').value = '';
        document.getElementById('companyPhone').value = '';
        document.getElementById('companyAddress').value = '';
        document.getElementById('clientName').value = '';
        document.getElementById('clientEmail').value = '';
        document.getElementById('clientAddress').value = '';
        document.getElementById('documentNumber').value = `QB-${new Date().getFullYear()}-001`;
        document.getElementById('documentDate').value = new Date().toISOString().split('T')[0];
        document.getElementById('terms').value = '';
        
        // Clear logo
        if (typeof window.clearLogo === 'function') {
            window.clearLogo();
        }
        
        // Reset items
        window.items = [{ id: 1, description: "New Item", quantity: 1, price: 0 }];
        
        // Re-render items table
        if (typeof window.renderItemsTable === 'function') {
            window.renderItemsTable();
        }
        
        // Clear localStorage
        localStorage.removeItem('quickbill_document');
        
        // Update preview
        if (typeof window.updatePreview === 'function') {
            window.updatePreview();
        }
        
        // Show notification
        if (typeof window.showNotification === 'function') {
            window.showNotification('All data cleared successfully!', 'success');
        } else {
            alert('All data cleared successfully!');
        }
    }
}