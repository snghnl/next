import { NextResponse } from 'next/server';

// -------------------------------------------------------------
// 쉬운 용어 정리
// - 프록시(Proxy): "전달자" 역할의 서버. 사용자가 보낸 요청을 대신 받아서
//   진짜 서버(업스트림)로 보내고, 그 응답을 다시 사용자에게 돌려줍니다.
// - 업스트림(Upstream): 실제로 데이터를 가지고 있는 외부 API 서버.
// - 엔드포인트(Endpoint): API 주소(URL). 예) /api/activities
// - 상태 코드(Status Code): 서버가 요청 처리 결과를 숫자로 알려주는 방식.
//   200(성공), 201(생성됨), 400(요청 오류), 404(없음), 502(중간 서버 오류) 등.
// - JSON: 데이터를 주고받기 위한 표준 형식. { "key": "value" } 같은 구조.
// -------------------------------------------------------------
// 이 파일은 프록시입니다. 즉, 우리 서버의 /api/activities 로 들어온 요청을
// 외부의 Fake REST API(업스트림)로 그대로 전달하고, 그 결과(상태 코드/JSON)를
// 가능한 그대로 사용자에게 돌려줍니다.
// 업스트림 주소는 환경변수(UPSTREAM)로 바꿀 수 있고, 설정이 없으면 기본값을 씁니다.
const BASE_URL = process.env.UPSTREAM || 'https://fakerestapi.azurewebsites.net/api/v1/Activities';

/**
 * GET /api/activities
 * - 무슨 일? 목록을 요청합니다.
 * - 어떻게? 업스트림(BASE_URL)로 GET을 그대로 전달하고, 받은 JSON/상태코드를 그대로 응답합니다.
 */
export async function GET() {
    try {
        const res = await fetch(BASE_URL, { cache: 'no-store' });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (err) {
        // 업스트림에 연결하지 못한 경우 등: 우리 프록시 단계에서의 문제 → 502
        return NextResponse.json({ error: 'Upstream fetch failed' }, { status: 502 });
    }
}

/**
 * POST /api/activities
 * - 무슨 일? 새 항목을 추가합니다.
 * - 어떻게? 사용자가 보낸 JSON 바디를 업스트림에 그대로 전달하고,
 *   업스트림에서 돌려준 상태코드/JSON을 그대로 응답합니다.
 */
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
