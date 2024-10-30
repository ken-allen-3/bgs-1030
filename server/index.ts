import express from 'express';
import cors from 'cors';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

try {
  console.log('🔄 Initializing Vision API server...');
  
  // Initialize Vision client with credentials from environment variable
  const credentials = JSON.parse(process.env.GOOGLE_CLOUD_VISION_CREDENTIALS || '{}');
  
  // Initialize Vision client
  const visionClient = new ImageAnnotatorClient({
    credentials,
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
  });

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));

  app.post('/api/vision/analyze', async (req, res) => {
    try {
      console.log('📸 Processing image analysis request...');
      const { image } = req.body;
      
      // Remove data URL prefix if present
      const imageData = image.replace(/^data:image\/\w+;base64,/, '');
      
      // Perform text detection
      const [result] = await visionClient.textDetection({
        image: { content: imageData }
      });

      const detectedGames = [];
      const textAnnotations = result.textAnnotations || [];
      
      // Skip the first annotation as it contains all text
      for (const text of textAnnotations.slice(1)) {
        if (!text.boundingPoly?.vertices || !text.description?.length) continue;

        // Calculate bounding box
        const vertices = text.boundingPoly.vertices;
        const x = Math.min(...vertices.map(v => v.x || 0));
        const y = Math.min(...vertices.map(v => v.y || 0));
        const width = Math.max(...vertices.map(v => v.x || 0)) - x;
        const height = Math.max(...vertices.map(v => v.y || 0)) - y;

        detectedGames.push({
          title: text.description,
          confidence: 0.95, // Vision API doesn't provide confidence for text detection
          boundingBox: { x, y, width, height }
        });
      }

      console.log(`✅ Detected ${detectedGames.length} potential games in image`);
      res.json({ detectedGames });
    } catch (error) {
      console.error('❌ Vision API Error:', error);
      res.status(500).json({ error: 'Failed to analyze image' });
    }
  });

  app.listen(port, () => {
    console.log(`
🚀 Vision API server started successfully!
🌍 Server running at http://localhost:${port}
📝 Endpoints available:
   - POST /api/vision/analyze
    `);
  });

} catch (error) {
  console.error('❌ Failed to start Vision API server:', error);
  process.exit(1);
}