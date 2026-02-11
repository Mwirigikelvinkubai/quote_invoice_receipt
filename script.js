// Main application logic - Simplified version without ES6 modules

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
        input.addEventListener('input', updatePreview);
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
    
    const taxRate = 0.16; // 16% VAT for Kenya
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

// Export functions to global scope for other modules to use
window.items = items;
window.currentDocumentType = currentDocumentType;
window.addNewItem = addNewItem;
window.renderItemsTable = renderItemsTable;
window.updatePreview = updatePreview;
window.formatCurrency = formatCurrency;
window.loadSavedData = loadSavedData;