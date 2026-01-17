const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Load country rules
const countryRules = require('./countries/country-rules.json');

// API Endpoint: Get country formats
app.get('/api/countries', (req, res) => {
    res.json({
        success: true,
        countries: countryRules
    });
});

// API Endpoint: Generate resume
app.post('/api/generate-resume', async (req, res) => {
    try {
        const { userData, country, template } = req.body;
        
        // Get country-specific rules
        const countryRule = countryRules[country] || countryRules['usa'];
        
        // Generate HTML with country-specific template
        const htmlContent = generateResumeHTML(userData, countryRule, template);
        
        // Generate PDF using Puppeteer
        const pdfBuffer = await generatePDF(htmlContent, countryRule);
        
        // Send PDF as response
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${userData.name}-${country}-resume.pdf`);
        res.send(pdfBuffer);
        
    } catch (error) {
        console.error('Error generating resume:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Function to generate HTML
function generateResumeHTML(userData, countryRule, templateType) {
    // Load template based on country
    let template = '';
    
    switch(countryRule.countryCode) {
        case 'usa':
            template = fs.readFileSync('./templates/usa-resume.html', 'utf8');
            break;
        case 'uk':
            template = fs.readFileSync('./templates/uk-cv.html', 'utf8');
            break;
        case 'canada':
            template = fs.readFileSync('./templates/canada-resume.html', 'utf8');
            break;
        case 'germany':
            template = fs.readFileSync('./templates/germany-lebenslauf.html', 'utf8');
            break;
        case 'australia':
            template = fs.readFileSync('./templates/australia-cv.html', 'utf8');
            break;
        default:
            template = fs.readFileSync('./templates/usa-resume.html', 'utf8');
    }
    
    // Replace placeholders with actual data
    return template
        .replace(/{{name}}/g, userData.name || '')
        .replace(/{{email}}/g, userData.email || '')
        .replace(/{{phone}}/g, userData.phone || '')
        .replace(/{{summary}}/g, userData.summary || '')
        .replace(/{{experience}}/g, formatExperience(userData.experience, countryRule))
        .replace(/{{education}}/g, formatEducation(userData.education, countryRule))
        .replace(/{{skills}}/g, userData.skills || '')
        .replace(/{{countryName}}/g, countryRule.countryName)
        .replace(/{{photoSection}}/g, countryRule.includePhoto ? 
            `<div class="photo-section"><img src="${userData.photo || ''}" alt="Profile Photo"></div>` : '')
        .replace(/{{personalDetails}}/g, formatPersonalDetails(userData, countryRule));
}

// Function to generate PDF
async function generatePDF(htmlContent, countryRule) {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set page size based on country rules
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    // Generate PDF with country-specific settings
    const pdf = await page.pdf({
        format: countryRule.pageSize || 'A4',
        margin: countryRule.margins || { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
        printBackground: true
    });
    
    await browser.close();
    return pdf;
}

// Helper functions
function formatExperience(experience, countryRule) {
    if (!experience) return '';
    
    const experiences = Array.isArray(experience) ? experience : [experience];
    let html = '<div class="experience-section">';
    
    experiences.forEach(exp => {
        html += `
        <div class="experience-item">
            <h3>${exp.title || ''}</h3>
            <p class="company">${exp.company || ''} | ${exp.dates || ''}</p>
            <p>${exp.description || ''}</p>
        </div>`;
    });
    
    html += '</div>';
    return html;
}

function formatEducation(education, countryRule) {
    // Similar formatting for education
    return education || '';
}

function formatPersonalDetails(userData, countryRule) {
    let details = '';
    
    if (countryRule.includeDateOfBirth && userData.dateOfBirth) {
        details += `<p><strong>Date of Birth:</strong> ${userData.dateOfBirth}</p>`;
    }
    
    if (countryRule.includeNationality && userData.nationality) {
        details += `<p><strong>Nationality:</strong> ${userData.nationality}</p>`;
    }
    
    if (countryRule.includeMaritalStatus && userData.maritalStatus) {
        details += `<p><strong>Marital Status:</strong> ${userData.maritalStatus}</p>`;
    }
    
    return details;
}

app.listen(PORT, () => {
    console.log(`🚀 ResumeRocket Server running on port ${PORT}`);
    console.log(`🌍 Country-specific formats enabled for: ${Object.keys(countryRules).join(', ')}`);
});
