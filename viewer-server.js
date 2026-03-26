#!/usr/bin/env node

/**
 * File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/viewer-server.js
 * Description: Lightweight server for LLM test result viewer with file discovery API
 * Author: Libor Ballaty <libor@arionetworks.com>
 * Created: 2026-03-26
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { globSync } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 7500;

// Enable CORS for development
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Serve static files
app.use(express.static(path.join(__dirname)));

// API: Get list of available test result files and rating files
app.get('/api/files', (req, res) => {
    try {
        let files = [];

        // Find test result files in reports directory
        const reportsDir = path.join(__dirname, 'reports');
        const reportPatterns = [
            'performance/**/*.json',
            '*.json'
        ];

        for (const pattern of reportPatterns) {
            const matchedFiles = globSync(pattern, {
                cwd: reportsDir,
                absolute: false
            });

            files = files.concat(matchedFiles.map(f => ({
                name: f,
                path: `/reports/${f}`,
                dir: path.dirname(f),
                basename: path.basename(f),
                type: 'test_result',
                timestamp: getFileTimestamp(path.join(reportsDir, f))
            })));
        }

        // Find rating files in ratings directory
        const ratingsDir = path.join(__dirname, 'ratings');
        if (fs.existsSync(ratingsDir)) {
            const ratingFiles = globSync('*.json', {
                cwd: ratingsDir,
                absolute: false
            });

            files = files.concat(ratingFiles.map(f => ({
                name: f,
                path: `/ratings/${f}`,
                dir: 'ratings',
                basename: f,
                type: 'ratings',
                timestamp: getFileTimestamp(path.join(ratingsDir, f))
            })));
        }

        // Remove duplicates and sort by timestamp (newest first)
        const uniqueFiles = Array.from(
            new Map(files.map(f => [f.path, f])).values()
        );

        uniqueFiles.sort((a, b) => {
            if (!a.timestamp || !b.timestamp) return 0;
            return new Date(b.timestamp) - new Date(a.timestamp);
        });

        // Group by directory
        const grouped = {};
        uniqueFiles.forEach(file => {
            const dir = file.dir || 'root';
            if (!grouped[dir]) {
                grouped[dir] = [];
            }
            grouped[dir].push(file);
        });

        res.json({
            success: true,
            files: uniqueFiles,
            grouped,
            total: uniqueFiles.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// API: Get file content (supports both reports and ratings directories)
app.get('/api/file', (req, res) => {
    try {
        const filePath = req.query.path;
        if (!filePath) {
            return res.status(400).json({ error: 'Missing path parameter' });
        }

        let basePath;
        let cleanPath;

        // Determine which directory to serve from
        if (filePath.startsWith('/ratings/')) {
            basePath = path.join(__dirname, 'ratings');
            cleanPath = filePath.replace(/^\/ratings\//, '');
        } else if (filePath.startsWith('/reports/')) {
            basePath = path.join(__dirname, 'reports');
            cleanPath = filePath.replace(/^\/reports\//, '');
        } else {
            return res.status(400).json({ error: 'Invalid path: must start with /ratings/ or /reports/' });
        }

        // Prevent directory traversal
        const fullPath = path.resolve(basePath, cleanPath);

        if (!fullPath.startsWith(basePath)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        if (!fs.existsSync(fullPath)) {
            return res.status(404).json({ error: 'File not found' });
        }

        const content = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
        res.json({ success: true, data: content });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Helper: Get file modification time
function getFileTimestamp(filePath) {
    try {
        const stats = fs.statSync(filePath);
        return stats.mtime.toISOString();
    } catch {
        return null;
    }
}

// Serve viewer HTML
app.get('/viewer', (req, res) => {
    res.sendFile(path.join(__dirname, 'viewer/response-viewer.html'));
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', port });
});

// Start server
app.listen(port, () => {
    console.log(`
╔════════════════════════════════════════════════╗
║     LLM Test Result Viewer Server               ║
╠════════════════════════════════════════════════╣
║  🌐 Viewer:     http://localhost:${port}/viewer/response-viewer.html
║  📁 API:        http://localhost:${port}/api/files
║  📄 File API:   http://localhost:${port}/api/file?path=/reports/...
║  ✅ Health:     http://localhost:${port}/health
╚════════════════════════════════════════════════╝
    `);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down viewer server...');
    process.exit(0);
});
