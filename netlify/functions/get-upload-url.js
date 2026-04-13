/**
 * Netlify Function: get-upload-url
 *
 * Generates a Cloudinary signed upload URL for direct browser upload.
 * Includes rate limiting (5 uploads per IP per day).
 *
 * POST /api/get-upload-url
 * Body: { folder?: string, tags?: string[] }
 */

const crypto = require('crypto')

// Simple in-memory rate limiter (resets on function cold-start)
// For production, use Redis or Netlify Blobs for persistence
const uploadCounts = new Map() // ip → { count, resetAt }

function getRateLimit() {
  return parseInt(process.env.MAX_UPLOADS_PER_IP_PER_DAY || '5', 10)
}

function checkRateLimit(ip) {
  const now    = Date.now()
  const dayMs  = 24 * 60 * 60 * 1000
  const entry  = uploadCounts.get(ip)

  if (!entry || now > entry.resetAt) {
    uploadCounts.set(ip, { count: 1, resetAt: now + dayMs })
    return { allowed: true, remaining: getRateLimit() - 1 }
  }

  if (entry.count >= getRateLimit()) {
    return { allowed: false, remaining: 0 }
  }

  entry.count++
  return { allowed: true, remaining: getRateLimit() - entry.count }
}

exports.handler = async (event) => {
  // CORS
  const headers = {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  // Rate limiting
  const ip       = event.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown'
  const rateLimitResult = checkRateLimit(ip)

  if (!rateLimitResult.allowed) {
    return {
      statusCode: 429,
      headers,
      body: JSON.stringify({
        error: 'Rate limit exceeded. Please try again tomorrow.',
        remaining: 0,
      }),
    }
  }

  // Ensure Cloudinary credentials are set
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey    = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    return {
      statusCode: 503,
      headers,
      body: JSON.stringify({ error: 'Cloud storage not configured.' }),
    }
  }

  // Parse body
  let body = {}
  try { body = JSON.parse(event.body || '{}') } catch { /* ignore */ }

  const folder    = body.folder || 'snapfromhome'
  const timestamp = Math.round(Date.now() / 1000)
  const tags      = ['snapfromhome', ...(body.tags || [])].join(',')

  // Generate signature
  const paramsToSign = `folder=${folder}&tags=${tags}&timestamp=${timestamp}`
  const signature    = crypto
    .createHash('sha256')
    .update(paramsToSign + apiSecret)
    .digest('hex')

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      signature,
      timestamp,
      apiKey,
      cloudName,
      folder,
      tags,
      uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      remaining: rateLimitResult.remaining,
    }),
  }
}
