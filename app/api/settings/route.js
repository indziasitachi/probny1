/* eslint-disable no-undef */
import { promises as fs } from 'fs';
const file = process.cwd() + '/app/settings.json';

export async function GET() {
  const data = await fs.readFile(file, 'utf-8');
  return new Response(data, { status: 200 });
}

export async function POST(req) {
  const body = await req.json();
  await fs.writeFile(file, JSON.stringify(body, null, 2));
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
}
