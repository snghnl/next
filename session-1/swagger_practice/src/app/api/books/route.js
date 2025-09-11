import { NextResponse } from 'next/server';

const BASE_URL = process.env.UPSTREAM || 'https://fakerestapi.azurewebsites.net/api/v1/Books';

export async function GET() {
    try {
        const res = await fetch(BASE_URL, { cache: 'no-store' });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (err) {
        return NextResponse.json({ error: 'Upstream fetch failed' }, { status: 502 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const upstream = await fetch(BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        const data = await upstream.json().catch(() => ({}));
        return NextResponse.json(data, { status: upstream.status });
    } catch (err) {
        return NextResponse.json({ error: 'Upstream post failed' }, { status: 502 });
    }
}