/**
 * Netlify Function: get-frames
 *
 * Returns the current frame configurations.
 * In a full production setup, this would read from a database.
 * For now, it returns the static config with cache headers.
 *
 * GET /api/get-frames
 */

const frames = require('../../src/config/frames.json')

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type':                'application/json',
    'Cache-Control':               'public, max-age=300, stale-while-revalidate=60',
  }

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ frames, count: frames.length }),
  }
}
