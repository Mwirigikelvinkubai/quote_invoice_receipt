// Print functionality management

// Initialize print functionality
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('printBtn').addEventListener('click', printDocument);
});

// Format currency in KES
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-KE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

// Print document
function printDocument() {
    // Get current preview content
    const previewContent = document.getElementById('documentPreview').innerHTML;
    
    // Create a print window
    const printWindow = window.open('', '_blank');
    
    // Get document data for print
    const documentData = gatherPrintData();
    
    // Generate print HTML
    printWindow.document.write(generatePrintHTML(previewContent, documentData));
    printWindow.document.close();
    
    // Wait for content to load, then print
    printWindow.onload = function() {
        printWindow.focus();
        printWindow.print();
        // Optional: close after printing
        // printWindow.close();
    };
}

// Gather data for print
function gatherPrintData() {
    return {
        companyName: document.getElementById('companyName').value,
        documentNumber: document.getElementById('documentNumber').value,
        documentType: window.currentDocumentType || 'quotation',
        items: window.items || [],
        date: document.getElementById('documentDate').value
    };
}

// Generate print HTML
function generatePrintHTML(previewContent, documentData) {
    const formattedDate = documentData.date ? 
        new Date(documentData.date).toLocaleDateString('en-KE', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        }) : 'Not set';
    
    // Calculate totals for print
    let subtotal = 0;
    documentData.items.forEach(item => {
        subtotal += item.quantity * item.price;
    });
    const tax = subtotal * 0.16;
    const total = subtotal + tax;
    
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Print - ${documentData.documentNumber}</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                /* Reset and base styles */
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: 'Arial', sans-serif;
                    line-height: 1.6;
                    color: #333;
                    padding: 20px;
                    background: white;
                    max-width: 1000px;
                    margin: 0 auto;
                }
                
                /* Hide buttons and unnecessary elements in print */
                button, .action-buttons, .tool-selector, header .document-actions,
                .editor-panel, .panel-title:last-of-type, .logo-upload-container {
                    display: none !important;
                }
                
                /* Document styling */
                .document-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 2px solid #3a86ff;
                }
                
                .company-info {
                    flex: 1;
                }
                
                .company-details h2 {
                    color: #3a86ff;
                    font-size: 24px;
                    margin-bottom: 10px;
                }
                
                .document-type {
                    font-size: 28px;
                    font-weight: bold;
                    color: #8338ec;
                    text-align: right;
                }
                
                .document-details {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 30px;
                }
                
                .client-info h3, .document-info h3 {
                    margin-bottom: 10px;
                    color: #333;
                }
                
                .document-id {
                    font-weight: bold;
                    color: #3a86ff;
                }
                
                /* Table styling */
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 25px 0;
                    page-break-inside: avoid;
                }
                
                th {
                    background-color: #f5f7fb;
                    padding: 12px 10px;
                    text-align: left;
                    font-weight: bold;
                    border-bottom: 2px solid #ddd;
                }
                
                td {
                    padding: 12px 10px;
                    border-bottom: 1px solid #eee;
                }
                
                /* Alternating row colors for better readability */
                tbody tr:nth-child(odd) {
                    background-color: #f8f9fa;
                }
                
                tbody tr:nth-child(even) {
                    background-color: white;
                }
                
                /* Totals section */
                .totals-section {
                    text-align: right;
                    margin: 30px 0;
                    page-break-inside: avoid;
                }
                
                .total-line {
                    display: flex;
                    justify-content: flex-end;
                    margin-bottom: 8px;
                }
                
                .total-label {
                    width: 150px;
                    text-align: right;
                    padding-right: 15px;
                }
                
                .total-amount {
                    width: 150px;
                    font-weight: bold;
                }
                
                .grand-total {
                    font-size: 18px;
                    border-top: 2px solid #eee;
                    padding-top: 10px;
                    margin-top: 10px;
                }
                
                .currency-symbol {
                    font-weight: bold;
                    color: #3a86ff;
                }
                
                /* Terms section */
                .terms-section {
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 1px solid #eee;
                    page-break-inside: avoid;
                }
                
                .terms-section h3 {
                    margin-bottom: 10px;
                    color: #333;
                }
                
                /* Footer */
                .print-footer {
                    margin-top: 50px;
                    padding-top: 20px;
                    border-top: 1px solid #ddd;
                    text-align: center;
                    font-size: 12px;
                    color: #666;
                }
                
                /* Page breaks */
                @media print {
                    @page {
                        margin: 15mm;
                    }
                    
                    body {
                        padding: 0;
                    }
                    
                    .page-break {
                        page-break-before: always;
                    }
                    
                    /* Ensure tables don't break across pages */
                    table {
                        page-break-inside: avoid;
                    }
                    
                    /* Hide print button in print */
                    .no-print {
                        display: none !important;
                    }
                    
                    /* Improve readability in print */
                    * {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                }
                
                /* Watermark for drafts */
                .watermark {
                    display: none;
                }
                
                /* Print-specific adjustments */
                @media print {
                    .watermark.draft {
                        display: block;
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%) rotate(-45deg);
                        font-size: 80px;
                        color: rgba(0,0,0,0.1);
                        z-index: 1000;
                        pointer-events: none;
                    }
                }
            </style>
        </head>
        <body>
            ${previewContent}
            
            <div class="print-footer">
                <p>${documentData.companyName} | ${documentData.documentNumber}</p>
                <p>Printed on ${new Date().toLocaleDateString('en-KE', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}</p>
                <p>Thank you for your business!</p>
            </div>
            
            <!-- Watermark for drafts if needed -->
            ${documentData.documentType === 'quotation' ? '<div class="watermark draft">DRAFT</div>' : ''}
            
            <script>
                // Auto-print when page loads
                window.onload = function() {
                    window.focus();
                    setTimeout(function() {
                        window.print();
                    }, 500);
                };
                
                // Close window after printing (optional)
                window.onafterprint = function() {
                    // window.close();
                };
            <\/script>
        </body>
        </html>
    `;
}