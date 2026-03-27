// app/api/vercel-debug/route.js
export async function GET() {
  const dbUrl = process.env.DATABASE_URL || '';
  
  // Extract host to see where it's trying to connect
  let host = 'unknown';
  let database = 'unknown';
  
  try {
    if (dbUrl) {
      const match = dbUrl.match(/@([^:]+)/);
      host = match ? match[1] : 'unknown';
      
      const dbMatch = dbUrl.match(/\/([^?]+)/);
      database = dbMatch ? dbMatch[1] : 'unknown';
    }
  } catch (e) {
    // ignore parsing errors
  }
  
  return Response.json({
    hasDbUrl: !!process.env.DATABASE_URL,
    urlLength: dbUrl.length,
    urlPrefix: dbUrl.split('://')[0],
    host: host,
    database: database,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    vercel: !!process.env.VERCEL
  });
}
