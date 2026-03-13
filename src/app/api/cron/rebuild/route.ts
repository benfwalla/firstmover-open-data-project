export async function GET() {
  const hookUrl = process.env.VERCEL_DEPLOY_HOOK;
  if (!hookUrl) {
    return Response.json({ error: 'VERCEL_DEPLOY_HOOK not configured' }, { status: 500 });
  }

  const res = await fetch(hookUrl, { method: 'GET' });
  const data = await res.json();

  return Response.json({ ok: true, deploy: data });
}
