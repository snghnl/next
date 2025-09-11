import { NextResponse } from 'next/server';

const BASE_URL = process.env.UPSTREAM || 'https://fakerestapi.azurewebsites.net/api/v1/Activities';
/**
 * getIdFromUrl 사용 이유
 * - Next.js App Router의 동적 API 핸들러에서 드물게 "params should be awaited" 경고가 발생합니다.
 * - request.url 에서 id를 직접 파싱하면 동기적으로 안전하게 꺼낼 수 있어 경고를 회피할 수 있습니다.
 * - 또한 핸들러 시그니처(GET/PUT/DELETE)가 단순해져(두 번째 인자 미사용) 공통 패턴 유지에 유리합니다.
 * - 전제: 경로의 마지막 세그먼트가 항상 숫자 id.
 */
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

// ---------------- GET ----------------
// 클라이언트가 GET /api/activities/:id 요청하면
// → 여기서 id를 추출해서 FakeREST API 서버로 그대로 전달
// → 응답 JSON과 상태코드를 그대로 반환
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

// ---------------- PUT ----------------
// 클라이언트가 PUT /api/activities/:id 요청하면
// → body(JSON)를 받아 업스트림 서버에 그대로 전달
// → 업스트림 응답을 그대로 반환
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

// ---------------- DELETE ----------------
// 클라이언트가 DELETE /api/activities/:id 요청하면
// → URL에서 id를 추출 후 FakeREST API에 DELETE 요청 전달
// → 응답 상태와 JSON을 그대로 반환
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
