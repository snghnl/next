'use client';

import { useEffect, useState } from 'react';

export default function Home() {
    return (
        <main style={{ maxWidth: 720, margin: '0 auto', padding: 24 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 16 }}>Swagger Practice</h1>
            <p style={{ marginBottom: 16 }}>리소스를 선택하세요.</p>
            <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 12 }}>
                <li>
                    <a href="/activities" style={{ color: '#0070f3' }}>
                        Activities
                    </a>
                </li>
                <li>
                    <a href="/books" style={{ color: '#0070f3' }}>
                        Books
                    </a>
                </li>
                <li>
                    <a href="/authors" style={{ color: '#0070f3' }}>
                        Authors
                    </a>
                </li>
                <li>
                    <a href="/users" style={{ color: '#0070f3' }}>
                        Users
                    </a>
                </li>
            </ul>
        </main>
    );
}
