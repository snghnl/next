'use client';

import { useEffect, useState } from 'react';

export default function AuthorsPage() {
    const [authors, setAuthors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [newFirstName, setNewFirstName] = useState('');
    const [newLastName, setNewLastName] = useState('');

    const [editingId, setEditingId] = useState(null);
    const [editingFirstName, setEditingFirstName] = useState('');
    const [editingLastName, setEditingLastName] = useState('');

    async function fetchAuthors() {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/authors', { cache: 'no-store' });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || `목록 조회 실패 (${res.status})`);
            }
            const data = await res.json();
            setAuthors(Array.isArray(data) ? data : []);
        } catch (e) {
            setError(e?.message || '에러가 발생했습니다');
            setAuthors([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchAuthors();
    }, []);

    async function handleCreate(e) {
        e.preventDefault();
        if (!newFirstName.trim() || !newLastName.trim()) return;
        setError('');
        try {
            const nextId = (authors?.reduce((m, a) => Math.max(m, a?.id || 0), 0) || 0) + 1;
            const body = {
                id: nextId,
                idBook: Math.floor(Math.random() * 100) + 1,
                firstName: newFirstName.trim(),
                lastName: newLastName.trim(),
            };
            const res = await fetch('/api/authors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || `생성 실패 (${res.status})`);
            }
            setNewFirstName('');
            setNewLastName('');
            fetchAuthors();
        } catch (e) {
            setError(e?.message || '에러가 발생했습니다');
        }
    }

    function startEdit(author) {
        setEditingId(author.id);
        setEditingFirstName(author.firstName || '');
        setEditingLastName(author.lastName || '');
    }

    function cancelEdit() {
        setEditingId(null);
        setEditingFirstName('');
        setEditingLastName('');
    }

    async function saveEdit(id) {
        setError('');
        try {
            const original = authors.find((a) => a.id === id) || {};
            const body = {
                id,
                idBook: original.idBook || 1,
                firstName: editingFirstName.trim(),
                lastName: editingLastName.trim(),
            };
            const res = await fetch(`/api/authors/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || `수정 실패 (${res.status})`);
            }
            cancelEdit();
            fetchAuthors();
        } catch (e) {
            setError(e?.message || '에러가 발생했습니다');
        }
    }

    async function handleDelete(id) {
        setError('');
        try {
            const res = await fetch(`/api/authors/${id}`, { method: 'DELETE' });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || `삭제 실패 (${res.status})`);
            }
            fetchAuthors();
        } catch (e) {
            setError(e?.message || '에러가 발생했습니다');
        }
    }

    return (
        <main style={{ maxWidth: 720, margin: '0 auto', padding: 24 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Authors</h1>

            <form onSubmit={handleCreate} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <input
                    type="text"
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                    placeholder="First Name"
                    style={{ flex: 1, padding: 8 }}
                />
                <input
                    type="text"
                    value={newLastName}
                    onChange={(e) => setNewLastName(e.target.value)}
                    placeholder="Last Name"
                    style={{ flex: 1, padding: 8 }}
                />
                <button type="submit" style={{ padding: '8px 12px' }}>
                    추가
                </button>
            </form>

            {loading && <p>불러오는 중...</p>}
            {error && <p style={{ color: 'crimson' }}>{error}</p>}

            <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 8 }}>
                {authors.map((author) => (
                    <li key={author.id} style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8 }}>
                        {editingId === author.id ? (
                            <div style={{ display: 'grid', gap: 8 }}>
                                <input
                                    type="text"
                                    value={editingFirstName}
                                    onChange={(e) => setEditingFirstName(e.target.value)}
                                    placeholder="First Name"
                                    style={{ padding: 8 }}
                                />
                                <input
                                    type="text"
                                    value={editingLastName}
                                    onChange={(e) => setEditingLastName(e.target.value)}
                                    placeholder="Last Name"
                                    style={{ padding: 8 }}
                                />
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button
                                        type="button"
                                        onClick={() => saveEdit(author.id)}
                                        style={{ padding: '6px 10px' }}
                                    >
                                        저장
                                    </button>
                                    <button type="button" onClick={cancelEdit} style={{ padding: '6px 10px' }}>
                                        취소
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gap: 4 }}>
                                <div style={{ fontWeight: 600 }}>{author.firstName} {author.lastName}</div>
                                <div style={{ fontSize: 12, color: '#666' }}>id: {author.id}</div>
                                <div style={{ fontSize: 12, color: '#666' }}>idBook: {author.idBook}</div>
                                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                    <button
                                        type="button"
                                        onClick={() => startEdit(author)}
                                        style={{ padding: '6px 10px' }}
                                    >
                                        수정
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(author.id)}
                                        style={{ padding: '6px 10px' }}
                                    >
                                        삭제
                                    </button>
                                </div>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </main>
    );
}