// Country format guidelines
const countryGuidelines = {
    usa: {
        title: "🇺🇸 USA Resume Guidelines",
        content: "<ul><li><strong>Length:</strong> 1 page maximum (2 pages only for senior roles)</li><li><strong>Format:</strong> Reverse chronological order</li><li><strong>Focus:</strong> Achievements and quantifiable results</li><li><strong>Keywords:</strong> Optimize for ATS (Applicant Tracking Systems)</li><li><strong>No photo:</strong> Photos are not recommended to avoid bias</li><li><strong>Sections:</strong> Contact, Summary, Experience, Education, Skills</li></ul>"
    },
    uk: {
        title: "🇬🇧 UK CV Guidelines",
        content: "<ul><li><strong>Length:</strong> 2 pages standard (up to 3 for senior academics)</li><li><strong>Personal Statement:</strong> Include a brief career summary at the top</li><li><strong>Detail:</strong> More detailed than US resumes</li><li><strong>Chronology:</strong> Full career history with explanations for gaps</li><li><strong>Optional Photo:</strong> Can include but not required</li><li><strong>References:</strong> 'References available upon request' is standard</li></ul>"
    },
    canada: {
        title: "🇨🇦 Canada Resume Guidelines",
        content: "<ul><li><strong>Bilingual:</strong> Consider French/English if applying in Quebec</li><li><strong>Length:</strong> 1-2 pages depending on experience</li><li><strong>Focus:</strong> Competencies and transferable skills</li><li><strong>Volunteer Work:</strong> Highly valued, include if relevant</li><li><strong>Format:</strong> Combination or functional formats accepted</li><li><strong>Personal:</strong> Can include citizenship/immigration status if desired</li></ul>"
    },
    germany: {
        title: "🇩🇪 Germany Lebenslauf Guidelines",
        content: "<ul><li><strong>Photo:</strong> Professional photo expected in top-right corner</li><li><strong>Chronological:</strong> Strict chronological order (no gaps)</li><li><strong>Details:</strong> Exact dates (month/year) for all entries</li><li><strong>Personal:</strong> Include marital status, nationality, birth date</li><li><strong>Signatures:</strong> Hand-signed copy may be requested</li><li><strong>Length:</strong> 1-3 pages depending on experience level</li></ul>"
    },
    australia: {
        title: "🇦🇺 Australia CV Guidelines",
        content: "<ul><li><strong>Length:</strong> 2-4 pages comprehensive CVs standard</li><li><strong>Government Roles:</strong> Must address Key Selection Criteria separately</li><li><strong>Referees:</strong> Australian referees preferred (include contact details)</li><li><strong>Detail:</strong> Comprehensive work history with achievements</li><li><strong>Spelling:</strong> Use Australian English spelling (e.g., 'centre' not 'center')</li><li><strong>Format:</strong> Clean, professional layout with clear sections</li></ul>"
    }
};

// DOM Elements
const resumeForm = document.getElementById('resumeForm');
const previewFrame = document.getElementById('previewFrame');
const downloadBtn = document.getElementById('downloadBtn');
const printBtn = document.getElementById('printBtn');
const countrySelect = document.getElementById('country');
const countryInfo = document.getElementById('countryInfo');
const templateCards = document.querySelectorAll('.template-card');

// Update country info when selection changes
countrySelect.addEventListener('change', function() {
    const country = this.value;
    updateCountryInfo(country);
});

// Template card click events
templateCards.forEach(card => {
    card.addEventListener('click', function() {
        const country = this.getAttribute('data-country');
        countrySelect.value = country;
        updateCountryInfo(country);
        
        // Highlight selected card
        templateCards.forEach(c => c.style.borderTop = '4px solid #4a6491');
        this.style.borderTop = '4px solid #28a745';
    });
});

// Update country information display
function updateCountryInfo(country) {
    if (country && countryGuidelines[country]) {
        const guideline = countryGuidelines[country];
        countryInfo.innerHTML = `
            <h4><i class="fas fa-info-circle"></i> ${guideline.title}</h4>
            ${guideline.content}
        `;
        countryInfo.style.display = 'block';
    } else {
        countryInfo.innerHTML = `
            <h4><i class="fas fa-info-circle"></i> Country Format Guidelines</h4>
            <p>Select a country to see specific formatting guidelines.</p>
        `;
    }
}

// Form submission
resumeForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Get form values
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        summary: document.getElementById('summary').value,
        experience: document.getElementById('experience').value,
        education: document.getElementById('education').value,
        skills: document.getElementById('skills').value,
        country: document.getElementById('country').value
    };
    
    // Validate country selection
    if (!formData.country) {
        alert('Please select a country format.');
        return;
    }
    
    // Show loading state
    const generateBtn = resumeForm.querySelector('.btn-generate');
    const originalText = generateBtn.innerHTML;
    generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    generateBtn.disabled = true;
    
    try {
        // Send data to server
        const response = await fetch('/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            throw new Error('Server responded with error');
        }
        
        const result = await response.json();
        
        // Display preview
        previewFrame.srcdoc = result.html;
        
        // Enable download and print buttons
        downloadBtn.disabled = false;
        printBtn.disabled = false;
        
        // Set download functionality
        downloadBtn.onclick = () => downloadPDF(result.html, formData.name, formData.country);
        
        // Set print functionality
        printBtn.onclick = () => printResume(result.html);
        
        // Show success message
        alert('Resume generated successfully! You can now preview, download, or print.');
        
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to generate resume. Please try again.');
    } finally {
        // Reset button
        generateBtn.innerHTML = originalText;
        generateBtn.disabled = false;
    }
});

// Download PDF function
function downloadPDF(html, name, country) {
    // Create a temporary iframe for printing
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.write(html);
    iframeDoc.close();
    
    // Use browser's print to PDF functionality
    setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
    }, 250);
    
    // Clean up
    setTimeout(() => {
        document.body.removeChild(iframe);
    }, 1000);
}

// Print resume function
function printResume(html) {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
    
    setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    }, 250);
}

// Initialize with first country guidelines
updateCountryInfo('');
