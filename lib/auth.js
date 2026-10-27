export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Mihir@282878';

export function verifyAdmin(request) {
  const authHeader = request.headers.get('authorization') || '';
  let token = '';
  if (authHeader.toLowerCase().startsWith('bearer ')) {
    token = authHeader.slice(7).trim();
  }
  return token === ADMIN_PASSWORD;
}

export function unauthorizedResponse() {
  return new Response(JSON.stringify({ detail: 'Unauthorized' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });
}
