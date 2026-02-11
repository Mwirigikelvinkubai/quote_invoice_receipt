// Batch Upload functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeBatchUpload();
});

function initializeBatchUpload() {
    // Process batch button
    const processBatchBtn = document.getElementById('processBatchBtn');
    const clearBatchBtn = document.getElementById('clearBatchBtn');
    const downloadTemplateBtn = document.getElementById('downloadTemplateBtn');
    const batchItemsTextarea = document.getElementById('batchItems');
    
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
    
    // Initialize file upload if needed
    initializeFileUpload();
}

// Process batch upload
function processBatchUpload() {
    const batchItemsText = document.getElementById('batchItems').value.trim();
    
    if (!batchItemsText) {
        showNotification('Please paste some items first', 'error');
        return;
    }
    
    const items = parseBatchItems(batchItemsText);
    
    if (items.length === 0) {
        showNotification('No valid items found. Please check your format.', 'error');
        return;
    }
    
    // Ask user if they want to replace or append
    const importOption = document.querySelector('input[name="importOption"]:checked')?.value || 'append';
    
    if (importOption === 'replace' && window.items && window.items.length > 0) {
        if (!confirm('This will replace all existing items. Continue?')) {
            return;
        }
    }
    
    // Process items based on selected option
    if (importOption === 'replace') {
        // Clear existing items and add new ones
        window.items = items.map((item, index) => ({
            id: index + 1,
            description: item.description || 'Item',
            quantity: item.quantity || 1,
            price: item.price || 0
        }));
    } else {
        // Append to existing items
        const nextId = window.items.length > 0 ? Math.max(...window.items.map(item => item.id)) + 1 : 1;
        
        items.forEach((item, index) => {
            window.items.push({
                id: nextId + index,
                description: item.description || 'Item',
                quantity: item.quantity || 1,
                price: item.price || 0
            });
        });
    }
    
    // Re-render items table
    if (typeof window.renderItemsTable === 'function') {
        window.renderItemsTable();
    }
    
    // Update preview
    if (typeof window.updatePreview === 'function') {
        window.updatePreview();
    }
    
    // Show success message
    showNotification(`Successfully added ${items.length} items`, 'success');
    
    // Clear batch textarea
    document.getElementById('batchItems').value = '';
    document.getElementById('batchStats').style.display = 'none';
}

// Parse batch items from text
function parseBatchItems(text) {
    const lines = text.split('\n');
    const items = [];
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
            
            items.push({
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
    
    return items;
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
    
    const items = parseBatchItems(text);
    
    if (items.length === 0) {
        batchStats.style.display = 'none';
        return;
    }
    
    // Update count
    itemsCount.textContent = items.length;
    
    // Create preview table
    let previewHtml = '<table class="batch-preview-table">';
    previewHtml += '<thead><tr><th>#</th><th>Description</th><th>Qty</th><th>Price (KES)</th><th>Total (KES)</th></tr></thead>';
    previewHtml += '<tbody>';
    
    items.forEach((item, index) => {
        const total = item.quantity * item.price;
        previewHtml += `
            <tr>
                <td>${index + 1}</td>
                <td>${item.description}</td>
                <td>${item.quantity}</td>
                <td>KES ${window.formatCurrency ? window.formatCurrency(item.price) : item.price.toFixed(2)}</td>
                <td>KES ${window.formatCurrency ? window.formatCurrency(total) : total.toFixed(2)}</td>
            </tr>
        `;
    });
    
    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const tax = subtotal * 0.16;
    const total = subtotal + tax;
    
    previewHtml += `
        <tr style="background-color: #e9ecef; font-weight: bold;">
            <td colspan="4" style="text-align: right;">Subtotal:</td>
            <td>KES ${window.formatCurrency ? window.formatCurrency(subtotal) : subtotal.toFixed(2)}</td>
        </tr>
        <tr style="background-color: #e9ecef; font-weight: bold;">
            <td colspan="4" style="text-align: right;">VAT (16%):</td>
            <td>KES ${window.formatCurrency ? window.formatCurrency(tax) : tax.toFixed(2)}</td>
        </tr>
        <tr style="background-color: #d4edda; font-weight: bold;">
            <td colspan="4" style="text-align: right;">Total:</td>
            <td>KES ${window.formatCurrency ? window.formatCurrency(total) : total.toFixed(2)}</td>
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

// Initialize file upload (optional feature)
function initializeFileUpload() {
    const fileUploadArea = document.getElementById('fileUploadArea');
    const fileInput = document.getElementById('fileInput');
    
    if (!fileUploadArea || !fileInput) {
        // Create file upload elements if they don't exist
        const batchContainer = document.querySelector('.batch-upload-container');
        if (batchContainer) {
            const fileUploadHtml = `
                <div class="file-upload-area" id="fileUploadArea">
                    <div class="upload-area-content">
                        <div class="upload-area-icon">
                            <i class="fas fa-file-excel"></i>
                        </div>
                        <div class="upload-area-text">Or upload a file</div>
                        <div class="upload-area-subtext">CSV, TSV, Excel, or text files</div>
                        <button type="button" class="btn btn-outline" id="selectFileBtn">
                            <i class="fas fa-folder-open"></i> Select File
                        </button>
                    </div>
                </div>
                <input type="file" id="fileInput" accept=".csv,.txt,.tsv,.xlsx,.xls" style="display: none;">
            `;
            
            batchContainer.insertAdjacentHTML('afterbegin', fileUploadHtml);
            
            // Re-initialize with new elements
            setupFileUpload();
        }
    } else {
        setupFileUpload();
    }
}

function setupFileUpload() {
    const fileUploadArea = document.getElementById('fileUploadArea');
    const fileInput = document.getElementById('fileInput');
    const selectFileBtn = document.getElementById('selectFileBtn');
    
    if (!fileUploadArea || !fileInput) return;
    
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

function processFileUpload(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const content = e.target.result;
        let textContent;
        
        // Handle different file types
        if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
            // For Excel files, we'd need a library like SheetJS
            // For now, show message
            showNotification('Excel files require additional library. Please save as CSV first.', 'info');
            return;
        } else {
            // For text-based files
            textContent = content;
        }
        
        // Set the content in the textarea
        document.getElementById('batchItems').value = textContent;
        
        // Trigger preview
        previewBatchItems();
        
        showNotification(`File "${file.name}" loaded successfully`, 'success');
    };
    
    reader.onerror = function() {
        showNotification('Error reading file', 'error');
    };
    
    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        // Can't read Excel without library
        showNotification('Please convert Excel files to CSV first', 'info');
    } else {
        reader.readAsText(file);
    }
}

// Show notification (reuse from data-manager.js or create standalone)
function showNotification(message, type = 'info') {
    // Reuse existing notification function or create simple one
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, type);
    } else {
        // Simple fallback
        alert(`${type.toUpperCase()}: ${message}`);
    }
}