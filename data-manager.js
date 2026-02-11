// Data management and storage

// Save document data
document.addEventListener('DOMContentLoaded', function() {
    // Save document button
    document.getElementById('saveDocumentBtn').addEventListener('click', saveDocument);
    
    // Clear all button
    document.getElementById('clearAllBtn').addEventListener('click', clearAllData);
    
    // Download PDF button
    document.getElementById('downloadPdfBtn').addEventListener('click', downloadPdf);
});

// Format currency in KES
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-KE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

// Save document to localStorage
function saveDocument() {
    try {
        const documentData = gatherDocumentData();
        localStorage.setItem('quickbill_document', JSON.stringify(documentData));
        
        showNotification('Document saved successfully!', 'success');
        console.log('Document saved:', documentData);
    } catch (error) {
        console.error('Error saving document:', error);
        showNotification('Error saving document', 'error');
    }
}

// Gather all document data
function gatherDocumentData() {
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
        if (typeof clearLogo === 'function') {
            clearLogo();
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
        
        showNotification('All data cleared successfully!', 'success');
    }
}

// Download PDF (simulated)
function downloadPdf() {
    // In a real application, this would generate a PDF
    // For now, we'll create a downloadable HTML file that can be converted to PDF
    
    const documentData = gatherDocumentData();
    const { subtotal, tax, total } = calculateTotalsFromData(documentData);
    
    const pdfContent = generatePdfContent(documentData, subtotal, tax, total);
    
    // Create a blob and download link
    const blob = new Blob([pdfContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${documentData.document.number || 'document'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Document downloaded as HTML. Open in browser and print as PDF.', 'info');
}

// Calculate totals from data
function calculateTotalsFromData(documentData) {
    let subtotal = 0;
    documentData.items.forEach(item => {
        subtotal += item.quantity * item.price;
    });
    
    const taxRate = 0.16;
    const tax = subtotal * taxRate;
    const total = subtotal + tax;
    
    return { subtotal, tax, total };
}

// Generate PDF content
function generatePdfContent(documentData, subtotal, tax, total) {
    const formattedDate = documentData.document.date ? 
        new Date(documentData.document.date).toLocaleDateString('en-KE', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        }) : 'Not set';
    
    let itemsHtml = '';
    documentData.items.forEach((item, index) => {
        itemsHtml += `
            <tr>
                <td>${item.id}</td>
                <td>${item.description}</td>
                <td>${item.quantity}</td>
                <td>KES ${formatCurrency(item.price)}</td>
                <td>KES ${formatCurrency(item.quantity * item.price)}</td>
            </tr>
        `;
    });
    
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>${documentData.document.number} - ${documentData.type.toUpperCase()}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
                .header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 2px solid #3a86ff; padding-bottom: 20px; }
                .company-info { flex: 1; }
                .company-name { font-size: 24px; font-weight: bold; color: #3a86ff; margin-bottom: 10px; }
                .document-type { font-size: 28px; font-weight: bold; color: #8338ec; text-align: right; }
                .details { display: flex; justify-content: space-between; margin-bottom: 30px; }
                .client-info, .document-info { flex: 1; }
                .client-info h3, .document-info h3 { margin-bottom: 10px; }
                table { width: 100%; border-collapse: collapse; margin: 30px 0; }
                th { background-color: #f5f7fb; padding: 12px; text-align: left; font-weight: bold; }
                td { padding: 12px; border-bottom: 1px solid #eee; }
                .totals { text-align: right; margin-top: 30px; }
                .total-line { display: flex; justify-content: flex-end; margin-bottom: 8px; }
                .total-label { width: 150px; text-align: right; padding-right: 15px; }
                .total-amount { width: 150px; font-weight: bold; }
                .grand-total { font-size: 18px; border-top: 2px solid #eee; padding-top: 10px; }
                .terms { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; }
                .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="company-info">
                    <div class="company-name">${documentData.company.name}</div>
                    <div>${documentData.company.address.replace(/\n/g, '<br>')}</div>
                    <div>Email: ${documentData.company.email} | Phone: ${documentData.company.phone}</div>
                </div>
                <div class="document-type">${documentData.type.toUpperCase()}</div>
            </div>
            
            <div class="details">
                <div class="client-info">
                    <h3>Bill To:</h3>
                    <div><strong>${documentData.client.name}</strong></div>
                    <div>${documentData.client.address.replace(/\n/g, '<br>')}</div>
                    <div>Email: ${documentData.client.email}</div>
                </div>
                <div class="document-info">
                    <h3>Document Details:</h3>
                    <div><strong>${documentData.type.toUpperCase()} #:</strong> ${documentData.document.number}</div>
                    <div><strong>Date:</strong> ${formattedDate}</div>
                </div>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Description</th>
                        <th>Quantity</th>
                        <th>Unit Price (KES)</th>
                        <th>Amount (KES)</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>
            
            <div class="totals">
                <div class="total-line">
                    <div class="total-label">Subtotal:</div>
                    <div class="total-amount">KES ${formatCurrency(subtotal)}</div>
                </div>
                <div class="total-line">
                    <div class="total-label">VAT (16%):</div>
                    <div class="total-amount">KES ${formatCurrency(tax)}</div>
                </div>
                <div class="total-line grand-total">
                    <div class="total-label">Total Amount:</div>
                    <div class="total-amount">KES ${formatCurrency(total)}</div>
                </div>
            </div>
            
            <div class="terms">
                <h3>Terms & Notes:</h3>
                <p>${documentData.terms.replace(/\n/g, '<br>')}</p>
                <p><strong>All amounts are in Kenya Shillings (KES).</strong></p>
            </div>
            
            <div class="footer">
                <p>Generated by QuickBill KES - Kenya Billing Tool</p>
                <p>Document generated on ${new Date().toLocaleDateString('en-KE')}</p>
            </div>
        </body>
        </html>
    `;
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: 600;
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-width: 300px;
        max-width: 400px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease-out;
    `;
    
    // Set background color based on type
    if (type === 'success') {
        notification.style.backgroundColor = '#38b000';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#ff006e';
    } else if (type === 'info') {
        notification.style.backgroundColor = '#3a86ff';
    }
    
    // Add close button styles
    const closeButton = notification.querySelector('.notification-close');
    closeButton.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        margin-left: 15px;
        padding: 0;
        line-height: 1;
    `;
    
    // Add close functionality
    closeButton.addEventListener('click', function() {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
    
    // Add keyframes for animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
}