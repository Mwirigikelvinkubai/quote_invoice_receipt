// Logo upload functionality
document.addEventListener('DOMContentLoaded', function() {
    const logoUpload = document.getElementById('logoUpload');
    const logoFile = document.getElementById('logoFile');
    const logoPreview = document.getElementById('logoPreview');
    const logoPreviewImg = document.getElementById('logoPreviewImg');
    
    // Load saved logo from localStorage
    loadSavedLogo();
    
    // Logo upload click handler
    if (logoUpload) {
        logoUpload.addEventListener('click', function() {
            logoFile.click();
        });
    }
    
    // Logo file change handler
    if (logoFile) {
        logoFile.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                // Validate file type
                if (!file.type.match('image.*')) {
                    alert('Please select an image file (JPEG, PNG, etc.)');
                    return;
                }
                
                // Validate file size (max 2MB)
                if (file.size > 2 * 1024 * 1024) {
                    alert('File size should be less than 2MB');
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = function(event) {
                    logoPreviewImg.src = event.target.result;
                    logoPreview.style.display = 'block';
                    
                    // Save to localStorage
                    saveLogoToStorage(event.target.result);
                    
                    // Trigger preview update
                    if (typeof window.updatePreview === 'function') {
                        window.updatePreview();
                    }
                }
                reader.readAsDataURL(file);
            }
        });
    }
});

// Save logo to localStorage
function saveLogoToStorage(logoData) {
    try {
        const savedData = JSON.parse(localStorage.getItem('quickbill_document')) || {};
        savedData.company = savedData.company || {};
        savedData.company.logo = logoData;
        localStorage.setItem('quickbill_document', JSON.stringify(savedData));
    } catch (error) {
        console.error('Error saving logo:', error);
    }
}

// Load saved logo from localStorage
function loadSavedLogo() {
    try {
        const savedData = JSON.parse(localStorage.getItem('quickbill_document'));
        if (savedData && savedData.company && savedData.company.logo) {
            const logoPreview = document.getElementById('logoPreview');
            const logoPreviewImg = document.getElementById('logoPreviewImg');
            
            if (logoPreview && logoPreviewImg) {
                logoPreviewImg.src = savedData.company.logo;
                logoPreview.style.display = 'block';
            }
        }
    } catch (error) {
        console.error('Error loading logo:', error);
    }
}

// Clear logo
function clearLogo() {
    const logoPreview = document.getElementById('logoPreview');
    const logoPreviewImg = document.getElementById('logoPreviewImg');
    const logoFile = document.getElementById('logoFile');
    
    if (logoPreview) logoPreview.style.display = 'none';
    if (logoPreviewImg) logoPreviewImg.src = '';
    if (logoFile) logoFile.value = '';
    
    // Remove from localStorage
    try {
        const savedData = JSON.parse(localStorage.getItem('quickbill_document')) || {};
        if (savedData.company) {
            delete savedData.company.logo;
            localStorage.setItem('quickbill_document', JSON.stringify(savedData));
        }
    } catch (error) {
        console.error('Error clearing logo:', error);
    }
}

// Make clearLogo available globally
window.clearLogo = clearLogo;