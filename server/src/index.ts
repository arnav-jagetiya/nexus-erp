import app from './app.js';
import { env } from './config/env.js';

const PORT = env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 NEXUS ERP Server listening on http://localhost:${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
});
