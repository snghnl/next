import { NextResponse } from 'next/server';

const BASE_URL = process.env.UPSTREAM || 'https://fakerestapi.azurewebsites.net/api/v1/Users';

function getIdFromUrl(url) {
    try {
        const u = new URL(url);
        const parts = u.pathname.split('/');
        const id = parseInt(parts[parts.length - 1], 10);
        return Number.isNaN(id) ? NaN : id;
    } catch {
        return NaN;
    }
}

export async function GET(request) {
    try {
        const id = getIdFromUrl(request.url);
        if (Number.isNaN(id)) {
            return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
        }
        const res = await fetch(`${BASE_URL}/${id}`, { cache: 'no-store' });
        const data = await res.json().catch(() => ({}));
        return NextResponse.json(data, { status: res.status });
    } catch (err) {
        return NextResponse.json({ error: 'Upstream fetch failed' }, { status: 502 });
    }
}

export async function PUT(request) {
    try {
        const body = await request.json();
        const id = getIdFromUrl(request.url);
        if (Number.isNaN(id)) {
            return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
        }
        const upstream = await fetch(`${BASE_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        const data = await upstream.json().catch(() => ({}));
        return NextResponse.json(data, { status: upstream.status });
    } catch (err) {
        return NextResponse.json({ error: 'Upstream put failed' }, { status: 502 });
    }
}

export async function DELETE(request) {
    try {
        const id = getIdFromUrl(request.url);
        if (Number.isNaN(id)) {
            return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
        }
        const upstream = await fetch(`${BASE_URL}/${id}`, { method: 'DELETE' });
        const data = await upstream.json().catch(() => ({}));
        return NextResponse.json(data, { status: upstream.status });
    } catch (err) {
        return NextResponse.json({ error: 'Upstream delete failed' }, { status: 502 });
    }
}