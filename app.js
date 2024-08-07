require('dotenv').config();
require('./tracer'); // Ensure this path is correct

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const { exec } = require('child_process');
const logger = require('./logger'); // Use the correct relative path
const { Pool } = require('pg');

const app = express();
const upload = multer({
  limits: { fileSize: 100 * 1024 * 1024 } 
});

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use(cors({
  origin: ['http://key-finder-web:3000', 'http://localhost:3000', 'http://172.21.0.4:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 600,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));
const msafScriptPath = path.join(__dirname, 'test.py');

app.post('/sections/api/process-audio', upload.single('file'), (req, res) => {
  console.log('Received request to /api/process-audio');
  console.log('Request headers:', req.headers);
  console.log('Request body:', req.body);
  console.log('Request file:', req.file);

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  logger.info('Received audio file', { file: req.file });
  console.log('Received audio file:', req.file);

  const audioContent = req.file.buffer;

  const tempDir = path.join(__dirname, 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }

  const tempFilePath = path.join(tempDir, req.file.originalname);
  fs.writeFileSync(tempFilePath, audioContent);
  fs.chmodSync(tempFilePath, 0o644);
  console.log('File size:', fs.statSync(tempFilePath).size);
  console.log('File exists:', fs.existsSync(tempFilePath));
  logger.info('Audio file written to', { tempFilePath });
  console.log('Audio file written to:', tempFilePath);

  if (fs.existsSync(tempFilePath)) {
    console.log('File exists at:', tempFilePath);
  } else {
    console.error('File does not exist at:', tempFilePath);
    return res.status(500).json({ error: 'File not found' });
  }


  const command = `python3 "${msafScriptPath}" "${tempFilePath}"`;
  console.log('Executing command:', command);

  const childProcess = exec(command, (error, stdout, stderr) => {
    if (error) {
        logger.error('Error executing MSAF script', { error, module: 'process_audio', funcName: 'exec' });
        console.error('Error executing MSAF script:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }

    if (stderr) {
        logger.warn('Python script stderr', { stderr, module: 'process_audio', funcName: 'exec' });
        console.warn('Python script stderr:', stderr);
    }

    console.log('Python script stdout:', stdout);

    try {
        const result = JSON.parse(stdout.trim());
        if (result.error) {
            throw new Error(result.error);
        }
        const boundaries = result.boundaries;
        logger.info('Parsed boundaries', { boundaries });
        console.log('Parsed boundaries:', boundaries);
        res.json({ sections: boundaries });

        // ... (rest of the code for file deletion)

    } catch (parseError) {
        logger.error('Error parsing output', { parseError, stdout, module: 'process_audio', funcName: 'JSON.parse' });
        console.error('Error parsing output:', parseError);
        console.error('Raw stdout:', stdout);
        res.status(500).json({ error: 'Error parsing boundaries' });

      fs.unlink(tempFilePath, (err) => {
        if (err) {
          logger.error('Failed to delete the audio file', { err, module: 'process_audio', funcName: 'unlink' });
          console.error('Failed to delete the audio file:', err);
        } else {
          logger.info('Audio file deleted successfully', { tempFilePath });
          console.log('Audio file deleted successfully:', tempFilePath);
        }
      });
    }
  });

  childProcess.stdout.on('data', (data) => {
    console.log('Python script real-time stdout:', data);
  });

  childProcess.stderr.on('data', (data) => {
    console.error('Python script real-time stderr:', data);
  });
});

app.get('/', (req, res) => {
  res.send('Server is running');
});

const port = process.env.PORT || 4000; // Use PORT env variable if set, otherwise default to 4000
app.listen(port, '0.0.0.0', () => {
  logger.info(`Server is running on http://0.0.0.0:${port}`);
  console.log(`Server is running on http://0.0.0.0:${port}`);
});
