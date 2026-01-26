
cat > package.json << 'EOF'
{
  "name": "resume-builder-saas",
  "version": "1.0.0",
  "description": "Backend API for Resume Builder",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.0",
    "cors": "^2.8.5"
  },
  "keywords": ["resume", "builder", "saas", "api"],
  "author": "Md Farooq",
  "license": "MIT"
}
EOF
