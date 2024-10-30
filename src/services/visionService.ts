import { BoardGame } from '../types/boardgame';
import { searchGames } from './boardGameService';

const API_URL = import.meta.env.VITE_API_URL;

export interface DetectedGame {
  title: string;
  confidence: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export async function analyzeShelfImage(base64Image: string): Promise<DetectedGame[]> {
  try {
    const response = await fetch(`${API_URL}/api/vision/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: base64Image }),
    });

    if (!response.ok) {
      throw new Error('Failed to analyze image');
    }

    const { detectedGames } = await response.json();
    return detectedGames;
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw new Error('Failed to analyze image');
  }
}

export async function findMatchingGames(detectedGames: DetectedGame[]): Promise<Map<string, BoardGame[]>> {
  const matches = new Map<string, BoardGame[]>();
  
  // Process games in parallel with rate limiting
  const batchSize = 3;
  for (let i = 0; i < detectedGames.length; i += batchSize) {
    const batch = detectedGames.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(async (game) => {
        try {
          const { items } = await searchGames(game.title);
          return { title: game.title, matches: items };
        } catch (error) {
          console.error(`Error finding matches for ${game.title}:`, error);
          return { title: game.title, matches: [] };
        }
      })
    );
    
    results.forEach(({ title, matches: gameMatches }) => {
      matches.set(title, gameMatches);
    });

    // Add small delay between batches to avoid rate limiting
    if (i + batchSize < detectedGames.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return matches;
}