// Main application logic - All batch upload functions integrated

// Global variables
let items = [];
let currentDocumentType = 'quotation';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Script loaded - initializing application');
    
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('documentDate').value = today;
    
    // Initialize items array with sample data
    items = [
        { id: 1, description: "Website Design", quantity: 1, price: 120000 },
        { id: 2, description: "Web Hosting (Annual)", quantity: 1, price: 29900 },
        { id: 3, description: "SEO Optimization", quantity: 1, price: 50000 }
    ];
    
    // Initialize tool selector
    initializeToolSelector();
    
    // Initialize items table
    renderItemsTable();
    
    // Initialize event listeners
    initializeEventListeners();
    
    // Initialize batch upload
    initializeBatchUpload();
    
    // Load saved data
    loadSavedData();
    
    // Initial preview update
    updatePreview();
});

// Format currency in KES
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-KE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

// Initialize tool selector functionality
function initializeToolSelector() {
    const toolBtns = document.querySelectorAll('.tool-btn');
    
    toolBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            toolBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentDocumentType = this.dataset.type;
            updatePreview();
        });
    });
}

// Initialize event listeners
function initializeEventListeners() {
    // Add item button
    document.getElementById('addItemBtn').addEventListener('click', addNewItem);
    
    // Update preview when any input changes
    document.querySelectorAll('input, select, textarea').forEach(input => {
        if (input.id !== 'batchItems') { // Don't trigger on batch items textarea
            input.addEventListener('input', updatePreview);
        }
    });
}

// Add a new item to the items list
function addNewItem() {
    const newId = items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1;
    items.push({ id: newId, description: "New Item", quantity: 1, price: 0 });
    renderItemsTable();
    updatePreview();
}

// Render the items table
function renderItemsTable() {
    const itemsBody = document.getElementById('itemsBody');
    itemsBody.innerHTML = '';
    
    items.forEach((item, index) => {
        const row = document.createElement('tr');
        row.className = 'item-row';
        // Add alternating row colors
        row.style.backgroundColor = index % 2 === 0 ? 'var(--row-color-odd)' : 'var(--row-color-even)';
        
        row.innerHTML = `
            <td><input type="text" class="item-no-input" data-index="${index}" value="${item.id}" readonly></td>
            <td><input type="text" class="item-desc" data-index="${index}" value="${item.description}"></td>
            <td><input type="number" class="quantity-input" data-index="${index}" min="1" value="${item.quantity}"></td>
            <td><input type="number" class="price-input" data-index="${index}" min="0" step="1" value="${item.price}"></td>
            <td class="item-total">KES ${formatCurrency(item.quantity * item.price)}</td>
            <td><button class="btn btn-danger btn-sm remove-item" data-index="${index}"><i class="fas fa-trash"></i></button></td>
        `;
        itemsBody.appendChild(row);
    });
    
    // Add event listeners to item inputs
    attachItemEventListeners();
}

// Attach event listeners to item inputs
function attachItemEventListeners() {
    // Item description, quantity, and price inputs
    document.querySelectorAll('.item-desc, .quantity-input, .price-input').forEach(input => {
        input.addEventListener('input', handleItemInputChange);
    });
    
    // Remove item buttons
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', handleRemoveItem);
    });
}

// Handle changes to item inputs
function handleItemInputChange() {
    const index = parseInt(this.dataset.index);
    if (this.classList.contains('item-desc')) {
        items[index].description = this.value;
    } else if (this.classList.contains('quantity-input')) {
        items[index].quantity = parseFloat(this.value) || 1;
    } else if (this.classList.contains('price-input')) {
        items[index].price = parseFloat(this.value) || 0;
    }
    
    // Update the item total in the table
    const row = this.closest('tr');
    const totalCell = row.querySelector('.item-total');
    totalCell.textContent = `KES ${formatCurrency(items[index].quantity * items[index].price)}`;
    
    updatePreview();
}

// Handle item removal
function handleRemoveItem() {
    const index = parseInt(this.dataset.index);
    items.splice(index, 1);
    // Reassign item numbers after deletion
    items.forEach((item, idx) => {
        item.id = idx + 1;
    });
    renderItemsTable();
    updatePreview();
}

// Update the document preview
function updatePreview() {
    const preview = document.getElementById('documentPreview');
    
    // Get form values
    const formData = getFormData();
    
    // Calculate totals
    const { subtotal, tax, total } = calculateTotals();
    
    // Generate preview HTML
    preview.innerHTML = generatePreviewHTML(formData, subtotal, tax, total);
}

// Get form data
function getFormData() {
    return {
        companyName: document.getElementById('companyName').value,
        companyEmail: document.getElementById('companyEmail').value,
        companyPhone: document.getElementById('companyPhone').value,
        companyAddress: document.getElementById('companyAddress').value,
        clientName: document.getElementById('clientName').value,
        clientEmail: document.getElementById('clientEmail').value,
        clientAddress: document.getElementById('clientAddress').value,
        documentNumber: document.getElementById('documentNumber').value,
        documentDate: document.getElementById('documentDate').value,
        terms: document.getElementById('terms').value,
        logoUrl: document.getElementById('logoPreviewImg') ? document.getElementById('logoPreviewImg').src : ''
    };
}

// Calculate totals
function calculateTotals() {
    let subtotal = 0;
    items.forEach(item => {
        subtotal += item.quantity * item.price;
    });
    
    const taxRate = 0; // 16% VAT for Kenya will change to on and off
    const tax = subtotal * taxRate;
    const total = subtotal + tax;
    
    return { subtotal, tax, total };
}

// Generate preview HTML
function generatePreviewHTML(formData, subtotal, tax, total) {
    const { companyName, companyEmail, companyPhone, companyAddress, 
            clientName, clientEmail, clientAddress, documentNumber, 
            documentDate, terms, logoUrl } = formData;
    
    // Format date
    const formattedDate = documentDate ? new Date(documentDate).toLocaleDateString('en-KE', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    }) : 'Not set';
    
    // Document type title
    const documentTitle = getDocumentTitle();
    
    // Generate items HTML with alternating row colors
    const itemsHtml = generateItemsHTML();
    
    return `
        <div class="document-header">
            <div class="company-info">
                ${logoUrl && logoUrl.length > 10 ? `<img src="${logoUrl}" alt="Company Logo" class="preview-logo">` : ''}
                <div class="company-details">
                    <h2>${companyName}</h2>
                    <p>${companyAddress.replace(/\n/g, '<br>')}</p>
                    <p>Email: ${companyEmail} | Phone: ${companyPhone}</p>
                </div>
            </div>
            <div class="document-type">${documentTitle}</div>
        </div>
        
        <div class="document-details">
            <div class="client-info">
                <h3>Bill To:</h3>
                <p><strong>${clientName}</strong></p>
                <p>${clientAddress.replace(/\n/g, '<br>')}</p>
                <p>Email: ${clientEmail}</p>
            </div>
            <div class="document-info">
                <p><strong>${documentTitle} #:</strong> <span class="document-id">${documentNumber}</span></p>
                <p><strong>Date:</strong> ${formattedDate}</p>
                ${currentDocumentType === 'invoice' ? '<p><strong>Due Date:</strong> ' + new Date(new Date(documentDate).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' }) + '</p>' : ''}
            </div>
        </div>
        
        <table class="document-table">
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
        
        <div class="totals-section">
            <div class="total-line">
                <div class="total-label">Subtotal:</div>
                <div class="total-amount"><span class="currency-symbol">KES</span> ${formatCurrency(subtotal)}</div>
            </div>
            <div class="total-line">
                <div class="total-label">VAT (16%):</div>
                <div class="total-amount"><span class="currency-symbol">KES</span> ${formatCurrency(tax)}</div>
            </div>
            <div class="total-line grand-total">
                <div class="total-label">Total Amount:</div>
                <div class="total-amount"><span class="currency-symbol">KES</span> ${formatCurrency(total)}</div>
            </div>
        </div>
        
        <div class="terms-section">
            <h3>Terms & Notes</h3>
            <p>${terms.replace(/\n/g, '<br>')}</p>
            <p style="margin-top: 10px; font-weight: 600;">All amounts are in Kenya Shillings (KES).</p>
        </div>
        
        ${currentDocumentType === 'receipt' ? 
        `<div class="payment-section" style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <h3>Payment Received</h3>
            <p>Payment of <strong>KES ${formatCurrency(total)}</strong> was received on ${formattedDate}. Thank you for your business!</p>
            <p style="margin-top: 10px;"><strong>Payment Method:</strong> M-Pesa / Bank Transfer</p>
        </div>` : ''}
    `;
}

// Get document title based on current document type
function getDocumentTitle() {
    switch(currentDocumentType) {
        case 'quotation':
            return 'QUOTATION';
        case 'invoice':
            return 'INVOICE';
        case 'receipt':
            return 'RECEIPT';
        default:
            return 'DOCUMENT';
    }
}

// Generate items HTML for preview
function generateItemsHTML() {
    let itemsHtml = '';
    items.forEach((item, index) => {
        const rowColor = index % 2 === 0 ? 'background-color: var(--row-color-odd);' : 'background-color: var(--row-color-even);';
        itemsHtml += `
            <tr style="${rowColor}">
                <td>${item.id}</td>
                <td>${item.description}</td>
                <td>${item.quantity}</td>
                <td>KES ${formatCurrency(item.price)}</td>
                <td>KES ${formatCurrency(item.quantity * item.price)}</td>
            </tr>
        `;
    });
    return itemsHtml;
}

// Load saved data from localStorage
function loadSavedData() {
    try {
        const savedData = localStorage.getItem('quickbill_document');
        if (savedData) {
            const data = JSON.parse(savedData);
            applySavedData(data);
            console.log('Previous document data loaded successfully!');
            return true;
        }
    } catch (error) {
        console.error('Error loading saved data:', error);
    }
    return false;
}

// Apply saved data to form
function applySavedData(data) {
    if (data.company) {
        document.getElementById('companyName').value = data.company.name || '';
        document.getElementById('companyEmail').value = data.company.email || '';
        document.getElementById('companyPhone').value = data.company.phone || '';
        document.getElementById('companyAddress').value = data.company.address || '';
        
        if (data.company.logo && data.company.logo.length > 10) {
            const logoPreview = document.getElementById('logoPreview');
            const logoPreviewImg = document.getElementById('logoPreviewImg');
            if (logoPreview && logoPreviewImg) {
                logoPreviewImg.src = data.company.logo;
                logoPreview.style.display = 'block';
            }
        }
    }
    
    if (data.client) {
        document.getElementById('clientName').value = data.client.name || '';
        document.getElementById('clientEmail').value = data.client.email || '';
        document.getElementById('clientAddress').value = data.client.address || '';
    }
    
    if (data.document) {
        document.getElementById('documentNumber').value = data.document.number || `QB-${new Date().getFullYear()}-001`;
        document.getElementById('documentDate').value = data.document.date || new Date().toISOString().split('T')[0];
    }
    
    if (data.items && data.items.length > 0) {
        items = data.items;
        renderItemsTable();
    }
    
    if (data.terms) {
        document.getElementById('terms').value = data.terms;
    }
    
    if (data.type) {
        // Set the document type
        const toolBtns = document.querySelectorAll('.tool-btn');
        toolBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.type === data.type) {
                btn.classList.add('active');
                currentDocumentType = data.type;
            }
        });
    }
}

// BATCH UPLOAD FUNCTIONS

function initializeBatchUpload() {
    // Process batch button
    const processBatchBtn = document.getElementById('processBatchBtn');
    const clearBatchBtn = document.getElementById('clearBatchBtn');
    const downloadTemplateBtn = document.getElementById('downloadTemplateBtn');
    const batchItemsTextarea = document.getElementById('batchItems');
    const fileUploadArea = document.getElementById('fileUploadArea');
    const fileInput = document.getElementById('fileInput');
    const selectFileBtn = document.getElementById('selectFileBtn');
    
    if (processBatchBtn) {
        processBatchBtn.addEventListener('click', processBatchUpload);
    }
    
    if (clearBatchBtn) {
        clearBatchBtn.addEventListener('click', clearBatchUpload);
    }
    
    if (downloadTemplateBtn) {
        downloadTemplateBtn.addEventListener('click', downloadTemplate);
    }
    
    if (batchItemsTextarea) {
        // Auto-preview as user types
        batchItemsTextarea.addEventListener('input', previewBatchItems);
        
        // Handle paste event
        batchItemsTextarea.addEventListener('paste', function(e) {
            setTimeout(previewBatchItems, 100); // Wait for paste to complete
        });
    }
    
    // File upload functionality
    if (fileUploadArea && fileInput) {
        // Click file upload area
        fileUploadArea.addEventListener('click', function() {
            fileInput.click();
        });
        
        if (selectFileBtn) {
            selectFileBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                fileInput.click();
            });
        }
        
        // Handle file selection
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                processFileUpload(file);
            }
        });
        
        // Drag and drop
        fileUploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.stopPropagation();
            fileUploadArea.classList.add('dragover');
        });
        
        fileUploadArea.addEventListener('dragleave', function(e) {
            e.preventDefault();
            e.stopPropagation();
            fileUploadArea.classList.remove('dragover');
        });
        
        fileUploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            e.stopPropagation();
            fileUploadArea.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                processFileUpload(files[0]);
            }
        });
    }
}

// Process batch upload
function processBatchUpload() {
    const batchItemsText = document.getElementById('batchItems').value.trim();
    
    if (!batchItemsText) {
        showNotification('Please paste some items first', 'error');
        return;
    }
    
    const parsedItems = parseBatchItems(batchItemsText);
    
    if (parsedItems.length === 0) {
        showNotification('No valid items found. Please check your format.', 'error');
        return;
    }
    
    // Ask user if they want to replace or append
    const importOption = document.querySelector('input[name="importOption"]:checked')?.value || 'append';
    
    if (importOption === 'replace' && items && items.length > 0) {
        if (!confirm('This will replace all existing items. Continue?')) {
            return;
        }
    }
    
    // Process items based on selected option
    if (importOption === 'replace') {
        // Clear existing items and add new ones
        items = parsedItems.map((item, index) => ({
            id: index + 1,
            description: item.description || 'Item',
            quantity: item.quantity || 1,
            price: item.price || 0
        }));
    } else {
        // Append to existing items
        const nextId = items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1;
        
        parsedItems.forEach((item, index) => {
            items.push({
                id: nextId + index,
                description: item.description || 'Item',
                quantity: item.quantity || 1,
                price: item.price || 0
            });
        });
    }
    
    // Re-render items table
    renderItemsTable();
    
    // Update preview
    updatePreview();
    
    // Show success message
    showNotification(`Successfully added ${parsedItems.length} items`, 'success');
    
    // Clear batch textarea
    document.getElementById('batchItems').value = '';
    document.getElementById('batchStats').style.display = 'none';
}

// Parse batch items from text
function parseBatchItems(text) {
    const lines = text.split('\n');
    const parsedItems = [];
    let errors = [];
    
    lines.forEach((line, index) => {
        line = line.trim();
        if (!line) return; // Skip empty lines
        
        // Try different delimiters: tab, comma, semicolon, or multiple spaces
        let parts;
        if (line.includes('\t')) {
            parts = line.split('\t');
        } else if (line.includes(',')) {
            parts = line.split(',').map(part => part.trim());
        } else if (line.includes(';')) {
            parts = line.split(';').map(part => part.trim());
        } else {
            // Split by multiple spaces
            parts = line.split(/\s{2,}/);
        }
        
        // Clean each part
        parts = parts.map(part => part.trim());
        
        // We need at least description and price
        if (parts.length >= 2) {
            const description = parts[0];
            let quantity = 1;
            let price = 0;
            
            // Try to parse quantity and price
            if (parts.length === 2) {
                // Format: Description Price
                price = parseFloat(parts[1].replace(/[^\d.-]/g, ''));
            } else if (parts.length >= 3) {
                // Format: Description Quantity Price
                quantity = parseFloat(parts[1].replace(/[^\d.-]/g, '')) || 1;
                price = parseFloat(parts[2].replace(/[^\d.-]/g, ''));
            }
            
            if (isNaN(price) || price < 0) {
                errors.push(`Line ${index + 1}: Invalid price - "${parts[parts.length - 1]}"`);
                return;
            }
            
            if (isNaN(quantity) || quantity <= 0) {
                errors.push(`Line ${index + 1}: Invalid quantity - "${parts[1]}"`);
                return;
            }
            
            parsedItems.push({
                description,
                quantity,
                price
            });
        } else {
            errors.push(`Line ${index + 1}: Invalid format - "${line}"`);
        }
    });
    
    // Show errors if any
    if (errors.length > 0) {
        showNotification(`Found ${errors.length} error(s) in batch. Check console for details.`, 'error');
        console.error('Batch import errors:', errors);
    }
    
    return parsedItems;
}

// Preview batch items
function previewBatchItems() {
    const text = document.getElementById('batchItems').value.trim();
    const batchStats = document.getElementById('batchStats');
    const itemsCount = document.getElementById('itemsCount');
    const batchPreview = document.getElementById('batchPreview');
    
    if (!text) {
        batchStats.style.display = 'none';
        return;
    }
    
    const parsedItems = parseBatchItems(text);
    
    if (parsedItems.length === 0) {
        batchStats.style.display = 'none';
        return;
    }
    
    // Update count
    itemsCount.textContent = parsedItems.length;
    
    // Create preview table
    let previewHtml = '<table class="batch-preview-table">';
    previewHtml += '<thead><tr><th>#</th><th>Description</th><th>Qty</th><th>Price (KES)</th><th>Total (KES)</th></tr></thead>';
    previewHtml += '<tbody>';
    
    parsedItems.forEach((item, index) => {
        const total = item.quantity * item.price;
        previewHtml += `
            <tr>
                <td>${index + 1}</td>
                <td>${item.description}</td>
                <td>${item.quantity}</td>
                <td>KES ${formatCurrency(item.price)}</td>
                <td>KES ${formatCurrency(total)}</td>
            </tr>
        `;
    });
    
    // Calculate totals
    const subtotal = parsedItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const tax = subtotal * 0.16;
    const grandTotal = subtotal + tax;
    
    previewHtml += `
        <tr style="background-color: #e9ecef; font-weight: bold;">
            <td colspan="4" style="text-align: right;">Subtotal:</td>
            <td>KES ${formatCurrency(subtotal)}</td>
        </tr>
        <tr style="background-color: #e9ecef; font-weight: bold;">
            <td colspan="4" style="text-align: right;">VAT (16%):</td>
            <td>KES ${formatCurrency(tax)}</td>
        </tr>
        <tr style="background-color: #d4edda; font-weight: bold;">
            <td colspan="4" style="text-align: right;">Total:</td>
            <td>KES ${formatCurrency(grandTotal)}</td>
        </tr>
    `;
    
    previewHtml += '</tbody></table>';
    batchPreview.innerHTML = previewHtml;
    batchStats.style.display = 'block';
}

// Clear batch upload
function clearBatchUpload() {
    document.getElementById('batchItems').value = '';
    document.getElementById('batchStats').style.display = 'none';
    showNotification('Batch upload cleared', 'info');
}

// Download template
function downloadTemplate() {
    const templateContent = `Description\tQuantity\tPrice (KES)\nWebsite Design\t1\t120000\nWeb Hosting\t1\t29900\nSEO Optimization\t1\t50000\nDomain Registration\t2\t1500`;
    
    const blob = new Blob([templateContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quickbill-items-template.tsv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Template downloaded successfully', 'success');
}
// PDF Download Functions
function gatherDocumentData() {
    return {
        type: currentDocumentType || 'quotation',
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
        items: items,
        terms: document.getElementById('terms').value,
        currency: 'KES',
        lastSaved: new Date().toISOString()
    };
}

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
                @media print {
                    body { padding: 20px; }
                    .no-print { display: none; }
                }
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

// Make downloadPdf available globally
window.downloadPdf = downloadPdf;
// Process file upload
function processFileUpload(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const content = e.target.result;
        
        // Set the content in the textarea
        document.getElementById('batchItems').value = content;
        
        // Trigger preview
        previewBatchItems();
        
        showNotification(`File "${file.name}" loaded successfully`, 'success');
    };
    
    reader.onerror = function() {
        showNotification('Error reading file', 'error');
    };
    
    reader.readAsText(file);
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

// Export functions to global scope for other modules to use
// Export functions to global scope for other modules to use
window.items = items;
window.currentDocumentType = currentDocumentType;
window.addNewItem = addNewItem;
window.renderItemsTable = renderItemsTable;
window.updatePreview = updatePreview;
window.formatCurrency = formatCurrency;
window.loadSavedData = loadSavedData;
window.showNotification = showNotification;
window.downloadPdf = downloadPdf;
window.gatherDocumentData = gatherDocumentData;
