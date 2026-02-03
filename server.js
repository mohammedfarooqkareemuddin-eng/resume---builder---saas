
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('.'));

// CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        service: 'resume-builder',
        timestamp: new Date().toISOString(),
        endpoints: ['GET /api/health', 'POST /api/generate']
    });
});

// Generate resume
app.post('/api/generate', (req, res) => {
    try {
        console.log("📝 Resume generation request:", req.body);
        
        const { template, name, email, ...otherData } = req.body;
        
        if (!name) {
            return res.status(400).json({ 
                success: false, 
                message: 'Name is required' 
            });
        }
        
        // Success response
        res.json({
            success: true,
            message: `Resume for ${name} generated successfully!`,
            downloadUrl: `https://${req.headers.host}/download/resume-${Date.now()}.txt`,
            previewUrl: `https://${req.headers.host}/preview/resume-${Date.now()}.html`,
            resumeId: `res-${Date.now()}`,
            template: template,
            data: req.body,
            generatedAt: new Date().toISOString()
        });
        
    } catch (error) {
        console.error("❌ Server error:", error);
        res.status(500).json({
            success: false,
            message: 'Server error: ' + error.message
        });
    }
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
    res.sendFile('index.html', { root: '.' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log('🔗 Endpoints:');
    console.log('   GET  /api/health');
    console.log('   POST /api/generate');
    console.log('📁 Serving static files from current directory');
    console.log(`🌐 Open: http://localhost:${PORT}`);
});
