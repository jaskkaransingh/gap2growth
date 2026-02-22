const { analyzeResume } = require('../services/llmService');
const { getMarketTrends } = require('../services/marketDataService');
const User = require('../models/User');

/**
 * Extract text from a PDF buffer using multiple parser fallback strategy.
 * Tries pdf-parse first (handles most PDFs including non-standard XRef),
 * falls back to pdf2json if that fails.
 */
const extractTextFromPDF = async (buffer) => {
    // ── Attempt 1: pdf-parse ──────────────────────────────────────────────
    try {
        // Suppress stdout noise from pdf-parse internal pdf.js initialization
        const originalStdoutWrite = process.stdout.write.bind(process.stdout);
        process.stdout.write = (chunk, ...args) => {
            if (typeof chunk === 'string' && chunk.includes('UnknownError')) return true;
            return originalStdoutWrite(chunk, ...args);
        };

        const pdfParse = require('pdf-parse');
        const data = await pdfParse(buffer);
        process.stdout.write = originalStdoutWrite;

        if (data && data.text && data.text.length > 50) {
            console.log(`[PDF] pdf-parse extracted ${data.text.length} chars`);
            return data.text;
        }
        throw new Error('pdf-parse returned empty text');
    } catch (err) {
        console.warn(`[PDF] pdf-parse failed: ${err.message}. Trying pdf2json...`);
    }

    // ── Attempt 2: pdf2json ───────────────────────────────────────────────
    try {
        const PDFParser = require('pdf2json');
        const text = await new Promise((resolve, reject) => {
            const parser = new PDFParser(null, 1);
            const timeout = setTimeout(() => reject(new Error('pdf2json timeout')), 15000);

            parser.on('pdfParser_dataError', (e) => {
                clearTimeout(timeout);
                reject(new Error(e.parserError || 'pdf2json parse error'));
            });
            parser.on('pdfParser_dataReady', () => {
                clearTimeout(timeout);
                resolve(
                    parser.getRawTextContent()
                        .replace(/\r\n/g, ' ')
                        .replace(/\n/g, ' ')
                        .replace(/\s+/g, ' ')
                        .trim()
                );
            });
            parser.parseBuffer(buffer);
        });

        if (text && text.length > 50) {
            console.log(`[PDF] pdf2json extracted ${text.length} chars`);
            return text;
        }
        throw new Error('pdf2json returned empty text');
    } catch (err) {
        console.warn(`[PDF] pdf2json also failed: ${err.message}`);
        throw new Error(`Could not read PDF. Please ensure the file is not password-protected or corrupted. (${err.message})`);
    }
};

const uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        if (req.file.mimetype !== 'application/pdf') {
            return res.status(400).json({ message: 'Only PDF files are supported' });
        }

        console.log(`[Resume] Processing for user: ${req.user.id}, file size: ${req.file.size} bytes`);

        // ── 1. Extract text ───────────────────────────────────────────────
        let resumeText;
        try {
            resumeText = await extractTextFromPDF(req.file.buffer);
        } catch (parseErr) {
            return res.status(400).json({
                message: parseErr.message
            });
        }

        if (!resumeText || resumeText.length < 50) {
            return res.status(400).json({
                message: 'This PDF appears to be empty or image-based (scanned). Please use a text-based PDF.'
            });
        }

        // ── 2. Best-effort market data fetch (never blocks) ───────────────
        let marketData = {};
        try {
            const commonTech = ['React', 'Node.js', 'Python', 'Java', 'AWS', 'Docker', 'Kubernetes', 'TypeScript', 'JavaScript', 'Go', 'Rust', 'C++'];
            const foundSkills = commonTech.filter(t => new RegExp(t, 'i').test(resumeText));
            if (foundSkills.length > 0) {
                marketData = await getMarketTrends(foundSkills);
                console.log(`[Resume] Market data fetched for ${foundSkills.length} skills`);
            }
        } catch (marketErr) {
            console.warn('[Resume] Market data skipped:', marketErr.message);
        }

        // ── 3. LLM analysis ───────────────────────────────────────────────
        console.log('[Resume] Sending to LLM...');
        let analysisResult;
        try {
            analysisResult = await analyzeResume(resumeText, marketData);
        } catch (llmErr) {
            console.error('[Resume] LLM failed:', llmErr.message);
            return res.status(500).json({
                message: 'AI analysis failed. Please try again.',
                error: llmErr.message
            });
        }

        if (!analysisResult || typeof analysisResult !== 'object') {
            return res.status(500).json({ message: 'AI returned an invalid response. Please retry.' });
        }

        console.log('[Resume] Metrics:', JSON.stringify(analysisResult.metrics));

        // ── 4. Save to DB ─────────────────────────────────────────────────
        const user = await User.findById(req.user.id);
        if (!user) throw new Error('User not found');

        user.careerProfile = analysisResult;
        user.resumeProcessed = true;
        user.lastResumeUpload = new Date();
        user.markModified('careerProfile');
        await user.save();

        console.log('[Resume] ✅ Saved. Skills:', {
            languages: analysisResult?.skills?.languages?.length ?? 0,
            frameworks: analysisResult?.skills?.frameworks?.length ?? 0,
            tools: analysisResult?.skills?.tools?.length ?? 0,
        });

        res.json({ message: 'Resume processed successfully', profile: analysisResult });

    } catch (error) {
        console.error('[Resume] Controller error:', error.message);
        require('fs').appendFileSync('upload_error_test.log', (error.stack || error.message) + '\n');
        res.status(500).json({ message: 'Server error processing resume', error: error.message });
    }
};

module.exports = { uploadResume };
