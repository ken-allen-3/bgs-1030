import { BOARD_GAME_API } from '../config/constants';
import { BoardGame } from '../types/boardgame';
import { makeApiRequest } from './apiService';

// Cache for storing game search results
const searchCache = new Map<string, BoardGame[]>();
const gameCache = new Map<string, BoardGame>();

async function parseXML(text: string): Promise<Document> {
  const parser = new DOMParser();
  return parser.parseFromString(text, 'text/xml');
}

export async function searchGames(query: string, page: number = 1): Promise<{ items: BoardGame[], hasMore: boolean }> {
  // Check cache first
  const cacheKey = `${query.toLowerCase()}-${page}`;
  if (searchCache.has(cacheKey)) {
    console.log('Returning cached search results for:', query, 'page:', page);
    return {
      items: searchCache.get(cacheKey)!,
      hasMore: page < 3 // Limit to 3 pages total
    };
  }

  try {
    const xmlText = await makeApiRequest(BOARD_GAME_API.SEARCH_ENDPOINT, {
      query,
      type: 'boardgame'
    });
    
    const doc = await parseXML(xmlText);
    const items = Array.from(doc.getElementsByTagName('item'));
    const gameIds = items.map(item => item.getAttribute('id')).filter(Boolean);
    
    if (gameIds.length === 0) {
      return { items: [], hasMore: false };
    }
    
    // Get detailed info for games in the current page (10 per page)
    const startIdx = (page - 1) * 10;
    const endIdx = startIdx + 10;
    const pageGameIds = gameIds.slice(startIdx, endIdx);
    
    if (pageGameIds.length === 0) {
      return { items: [], hasMore: false };
    }
    
    const games = await Promise.all(
      pageGameIds.map(id => getGameById(id!))
    );
    
    // Sort by BGG rank, putting unranked games at the end
    const validGames = games.filter(Boolean).sort((a, b) => {
      if (a.rank === 0 && b.rank === 0) return 0;
      if (a.rank === 0) return 1;
      if (b.rank === 0) return -1;
      return a.rank - b.rank;
    });
    
    // Cache the results
    searchCache.set(cacheKey, validGames);
    
    return {
      items: validGames,
      hasMore: endIdx < gameIds.length && page < 3 // Limit to 3 pages total
    };
  } catch (error: any) {
    console.error('Error searching games:', {
      error: error.message,
      query
    });
    throw error;
  }
}

export async function getGameById(id: string): Promise<BoardGame> {
  // Check cache first
  if (gameCache.has(id)) {
    console.log('Returning cached game details for ID:', id);
    return gameCache.get(id)!;
  }

  try {
    const xmlText = await makeApiRequest(BOARD_GAME_API.THING_ENDPOINT, {
      id,
      stats: '1'
    });
    
    const doc = await parseXML(xmlText);
    const item = doc.querySelector('item');

    if (!item) {
      throw new Error('Game not found');
    }

    const name = item.querySelector('name[type="primary"]')?.getAttribute('value') || '';
    const yearPublished = item.querySelector('yearpublished')?.getAttribute('value');
    const image = item.querySelector('image')?.textContent || '/board-game-placeholder.png';
    const thumbnail = item.querySelector('thumbnail')?.textContent || '/board-game-placeholder.png';
    const description = item.querySelector('description')?.textContent || '';
    const minPlayers = item.querySelector('minplayers')?.getAttribute('value');
    const maxPlayers = item.querySelector('maxplayers')?.getAttribute('value');
    
    // Get ranking information
    const rankNode = item.querySelector('rank[type="subtype"][name="boardgame"]');
    const rank = rankNode?.getAttribute('value');
    const numericRank = rank && rank !== 'Not Ranked' ? parseInt(rank) : 0;

    const game: BoardGame = {
      id,
      name,
      year_published: yearPublished ? parseInt(yearPublished) : undefined,
      min_players: minPlayers ? parseInt(minPlayers) : 1,
      max_players: maxPlayers ? parseInt(maxPlayers) : 4,
      thumb_url: thumbnail,
      image_url: image,
      description,
      rank: numericRank,
      mechanics: [],
      categories: [],
      publishers: [],
      designers: [],
      developers: [],
      artists: [],
      names: [],
      num_user_ratings: 0,
      average_user_rating: 0,
      historical_low_prices: [],
      primary_publisher: { id: "", score: 0, url: "" },
      primary_designer: { id: "", score: 0, url: "" },
      related_to: [],
      related_as: [],
      weight_amount: 0,
      weight_units: "",
      size_height: 0,
      size_depth: 0,
      size_units: "",
      active: true,
      num_user_complexity_votes: 0,
      average_learning_complexity: 0,
      average_strategy_complexity: 0,
      visits: 0,
      lists: 0,
      mentions: 0,
      links: 0,
      plays: 0,
      type: "boardgame",
      sku: "",
      upc: "",
      price: "",
      price_ca: "",
      price_uk: "",
      price_au: "",
      msrp: 0,
      discount: "",
      handle: "",
      url: `https://boardgamegeek.com/boardgame/${id}`,
      rules_url: "",
      official_url: "",
      commentary: "",
      faq: ""
    };

    gameCache.set(id, game);
    return game;
  } catch (error: any) {
    console.error('Error fetching game details:', error);
    throw error;
  }
}

// Mock data for testing camera capture feature
const mockGames: BoardGame[] = [
  {
    id: "13",
    name: "Catan",
    year_published: 1995,
    min_players: 3,
    max_players: 4,
    thumb_url: "https://cf.geekdo-images.com/W3Bsga_uLP9kO91gZ7H8yw__thumb/img/8a9HeqFydO7Uun_le9bXWPnidcA=/fit-in/200x150/filters:strip_icc()/pic2419375.jpg",
    image_url: "https://cf.geekdo-images.com/W3Bsga_uLP9kO91gZ7H8yw__original/img/A-0yDJkve0avEicYQ4HoNO-HkK8=/0x0/filters:format(jpeg)/pic2419375.jpg",
    description: "Classic game of resource management and trading",
    rank: 374,
    mechanics: [],
    categories: [],
    publishers: [],
    designers: [],
    developers: [],
    artists: [],
    names: [],
    num_user_ratings: 0,
    average_user_rating: 0,
    historical_low_prices: [],
    primary_publisher: { id: "1", score: 0, url: "" },
    primary_designer: { id: "1", score: 0, url: "" },
    related_to: [],
    related_as: [],
    weight_amount: 0,
    weight_units: "",
    size_height: 0,
    size_depth: 0,
    size_units: "",
    active: true,
    num_user_complexity_votes: 0,
    average_learning_complexity: 0,
    average_strategy_complexity: 0,
    visits: 0,
    lists: 0,
    mentions: 0,
    links: 0,
    plays: 0,
    type: "",
    sku: "",
    upc: "",
    price: "",
    price_ca: "",
    price_uk: "",
    price_au: "",
    msrp: 0,
    discount: "",
    handle: "",
    url: "https://boardgamegeek.com/boardgame/13",
    rules_url: "",
    official_url: "",
    commentary: "",
    faq: "",
  }
];

export async function searchGamesByImage(imageUrl: string): Promise<BoardGame[]> {
  // For testing, return mock data instead of making API call
  return Promise.resolve(mockGames);
}