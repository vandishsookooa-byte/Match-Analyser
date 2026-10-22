import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { pitchApiService } from './src/services/pitchApiServer.ts';
import { 
  selectTopTwoTeamsPerCompetition, 
  rankSelectedTeamsGlobally, 
  filterTeamRecords 
} from './src/utils/rankings.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: '10mb' }));

  // Endpoint: Discovered Competitions Catalogue (Powered by PitchAPI)
  app.get('/api/football/competitions', (req, res) => {
    const competitions = pitchApiService.getCompetitions();
    res.json({
      competitions,
      total: competitions.length,
      activeCount: competitions.filter(c => c.status === 'active').length,
      unavailableCount: competitions.filter(c => c.status === 'unavailable').length,
      provider: 'PitchAPI'
    });
  });

  // Endpoint: Global Team Rankings (Defaults to Top Two Teams per Competition)
  app.get('/api/football/rankings', (req, res) => {
    const { 
      country = 'All', 
      tierCategory = 'All', 
      competitionId = 'All', 
      season = 'All', 
      search = '',
      sortBy = 'winPercentage',
      sortDirection = 'desc',
      topTwo = 'true'
    } = req.query;

    const competitions = pitchApiService.getCompetitions();
    const records = pitchApiService.getRecords();
    const coverage = pitchApiService.getCoverage();

    const filtered = filterTeamRecords(records, {
      country: String(country),
      tierCategory: tierCategory as any,
      competitionId: String(competitionId),
      season: String(season),
      searchQuery: String(search)
    });

    let pool = filtered;
    let selectionSummary = null;

    if (topTwo !== 'false') {
      const topTwoResult = selectTopTwoTeamsPerCompetition(filtered, competitions);
      pool = topTwoResult.selectedTeams;
      selectionSummary = topTwoResult.summary;
    }

    const ranked = rankSelectedTeamsGlobally(pool, sortBy as any, sortDirection as any);

    res.json({
      total: ranked.length,
      rankings: ranked,
      selectionSummary,
      lastRefresh: coverage.lastSuccessfulRefresh,
      isStale: coverage.isStale,
      provider: 'PitchAPI'
    });
  });

  // Endpoint: Data Coverage & Transparency Report
  app.get('/api/football/coverage', (req, res) => {
    res.json(pitchApiService.getCoverage());
  });

  // Endpoint: PitchAPI Provider & Credentials Status
  app.get('/api/football/provider-status', (req, res) => {
    res.json(pitchApiService.getProviderStatus());
  });

  // Endpoint: Trigger Data Refresh from PitchAPI
  app.post('/api/football/refresh', async (req, res) => {
    const result = await pitchApiService.syncWithPitch();
    const coverage = pitchApiService.getCoverage();

    res.json({
      success: result.success,
      message: result.message,
      timestamp: coverage.lastSuccessfulRefresh,
      isStale: coverage.isStale,
      queueStatus: coverage.refreshQueue
    });
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Global Football Rankings API — Powered by PitchAPI',
      discoveredCompetitions: pitchApiService.getCompetitions().length,
      activeTeams: pitchApiService.getRecords().length
    });
  });

  // In development, mount Vite dev server middleware
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve compiled static files from dist
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Global Football Rankings server listening on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
