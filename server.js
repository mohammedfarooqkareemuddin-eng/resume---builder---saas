const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Serve templates
app.use('/templates', express.static('templates'));

// Test route
app.get('/', (req, res) => {
    res.json({
        message: 'Resume Builder API - By Md Farooq',
        status: 'SUCCESS - Resume Generator Working!',
        endpoints: ['GET /', 'POST /generate', 'GET /templates']
    });
});

// Resume generation endpoint
app.post('/generate', (req, res) => {
    try {
        const { name, email, phone, address, summary, experience, education, skills, country } = req.body;
        
        // Validate required fields
        if (!name || !email || !country) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: name, email, and country are required'
            });
        }
        
        // Load country rules
        let countryRules = {};
        try {
            countryRules = require('./countries/country-rules.json');
        } catch (error) {
            console.log('Country rules not found, using defaults');
        }
        
        // Select template based on country
        let templateFile;
        switch(country) {
            case 'usa':
                templateFile = 'usa-resume.html';
                break;
            case 'uk':
                templateFile = 'uk-cv.html';
                break;
            case 'canada':
                templateFile = 'canada-resume.html';
                break;
            case 'germany':
                templateFile = 'germany-lebenslauf.html';
                break;
            case 'australia':
                templateFile = 'australia-cv.html';
                break;
            default:
                templateFile = 'usa-resume.html';
        }
        
        // Read the selected template
        const templatePath = path.join(__dirname, 'templates', templateFile);
        let html = fs.readFileSync(templatePath, 'utf8');
        
        // Get country-specific rules
        const countryRule = countryRules[country] || {};
        
        // Format experience
        let formattedExperience = '';
        if (experience) {
            const expItems = experience.split('\n').filter(item => item.trim());
            formattedExperience = expItems.map(item => {
                return `<div class="experience-item"><div class="job-title">${item}</div></div>`;
            }).join('');
        }
        
        // Format education
        let formattedEducation = '';
        if (education) {
            const eduItems = education.split('\n').filter(item => item.trim());
            formattedEducation = eduItems.map(item => `<p>• ${item}</p>`).join('');
        }
        
        // Replace placeholders in template
        html = html.replace(/{{name}}/g, name || 'John Doe')
                   .replace(/{{email}}/g, email || 'john@example.com')
                   .replace(/{{phone}}/g, phone || '+1 (555) 123-4567')
                   .replace(/{{address}}/g, address || '')
                   .replace(/{{summary}}/g, summary || 'Experienced professional with strong skills in relevant field.')
                   .replace(/{{experience}}/g, formattedExperience || '<p>No experience provided</p>')
                   .replace(/{{education}}/g, formattedEducation || '<p>No education provided</p>')
                   .replace(/{{skills}}/g, skills || 'JavaScript, React, Node.js, Project Management')
                   .replace(/{{personalDetails}}/g, address ? `<p><strong>Address:</strong> ${address}</p>` : '')
                   .replace(/{{photoSection}}/g, '');
        
        // Special handling for Germany (photo)
        if (country === 'germany') {
            const photoSection = '<div class="photo-container"><img src="https://via.placeholder.com/120x160/e0e0e0/333?text=Professional+Photo" alt="Professional Photo"></div>';
            html = html.replace(/{{photoSection}}/g, photoSection);
        }
        
        res.json({ 
            success: true, 
            html: html, 
            country: country, 
            template: templateFile,
            message: 'Resume generated successfully'
        });
        
    } catch (error) {
        console.error('Error generating resume:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to generate resume', 
            message: error.message 
        });
    }
});

// Get available templates
app.get('/templates', (req, res) => {
    const templates = [
        { id: 'usa', name: 'USA Resume', file: 'usa-resume.html' },
        { id: 'uk', name: 'UK CV', file: 'uk-cv.html' },
        { id: 'canada', name: 'Canada Resume', file: 'canada-resume.html' },
        { id: 'germany', name: 'Germany Lebenslauf', file: 'germany-lebenslauf.html' },
        { id: 'australia', name: 'Australia CV', file: 'australia-cv.html' }
    ];
    res.json({ success: true, templates });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        service: 'Resume Generator API'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Resume Generator Server running on port ${PORT}`);
    console.log(`🌐 API available at: http://localhost:${PORT}`);
    console.log(`📄 Endpoints:`);
    console.log(`   GET  /           - API info`);
    console.log(`   POST /generate   - Generate resume`);
    console.log(`   GET  /templates  - List templates`);
    console.log(`   GET  /health     - Health check`);
});
