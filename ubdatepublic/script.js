document.addEventListener('DOMContentLoaded', function() {
    console.log('Resume Generator JS loaded');
    
    // Form elements
    const form = document.getElementById('resumeForm');
    const previewFrame = document.getElementById('previewFrame');
    const countrySelect = document.getElementById('country');
    const countryInfo = document.getElementById('countryInfo');
    const downloadBtn = document.getElementById('downloadBtn');
    const printBtn = document.getElementById('printBtn');
    
    if (!form) {
        console.error('ERROR: Form not found! Check HTML structure.');
        return;
    }
    
    // Country guidelines
    const countryGuidelines = {
        usa: "🇺🇸 USA: 1-page max, achievement-focused, no photo",
        uk: "🇬🇧 UK: 2 pages, personal statement, detailed history",
        canada: "🇨🇦 Canada: Bilingual options, volunteer work emphasized",
        germany: "🇩🇪 Germany: Photo required, chronological with exact dates",
        australia: "🇦🇺 Australia: 2-4 pages, include key selection criteria"
    };
    
    // Update country info
    if (countrySelect && countryInfo) {
        countrySelect.addEventListener('change', function() {
            const country = this.value;
            if (country && countryGuidelines[country]) {
                countryInfo.innerHTML = `<p><strong>${countryGuidelines[country]}</strong></p>`;
            } else {
                countryInfo.innerHTML = '<p>Select a country to see guidelines</p>';
            }
        });
    }
    
    // Template card clicks
    document.querySelectorAll('.template-card').forEach(card => {
        card.addEventListener('click', function() {
            const country = this.getAttribute('data-country');
            if (country && countrySelect) {
                countrySelect.value = country;
                countrySelect.dispatchEvent(new Event('change'));
            }
        });
    });
    
    // Form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log('Form submitted');
        
        // Get form data
        const formData = {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim() || '',
            address: document.getElementById('address').value.trim() || '',
            summary: document.getElementById('summary').value.trim() || '',
            experience: document.getElementById('experience').value.trim() || '',
            education: document.getElementById('education').value.trim() || '',
            skills: document.getElementById('skills').value.trim() || '',
            country: document.getElementById('country').value
        };
        
        // Validation
        if (!formData.name || !formData.email || !formData.country) {
            alert('❌ Please fill in: Name, Email, and select Country');
            return;
        }
        
        // Show loading
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '⏳ Generating...';
        submitBtn.disabled = true;
        
        try {
            console.log('Sending data:', formData);
            
            // Send to backend
            const response = await fetch('/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('Result:', result);
            
            if (result.success && result.html) {
                // Show preview
                if (previewFrame) {
                    previewFrame.srcdoc = result.html;
                }
                
                // Enable buttons
                if (downloadBtn) {
                    downloadBtn.disabled = false;
                    downloadBtn.onclick = function() {
                        if (previewFrame) {
                            previewFrame.contentWindow.print();
                        }
                    };
                }
                
                if (printBtn) {
                    printBtn.disabled = false;
                    printBtn.onclick = function() {
                        if (previewFrame) {
                            previewFrame.contentWindow.print();
                        }
                    };
                }
                
                alert('✅ Resume generated successfully!');
            } else {
                alert('❌ Error: ' + (result.error || 'Generation failed'));
            }
            
        } catch (error) {
            console.error('Fetch error:', error);
            alert('❌ Network error. Please check console and try again.');
        } finally {
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
    
    // Initialize
    console.log('Resume Generator ready');
    if (countrySelect) {
        countrySelect.dispatchEvent(new Event('change'));
    }
});
