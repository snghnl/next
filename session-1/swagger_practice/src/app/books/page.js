'use client';

import { useEffect, useState } from 'react';

export default function BooksPage() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [newTitle, setNewTitle] = useState('');

    const [editingId, setEditingId] = useState(null);
    const [editingTitle, setEditingTitle] = useState('');

    async function fetchBooks() {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/books', { cache: 'no-store' });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || `목록 조회 실패 (${res.status})`);
            }
            const data = await res.json();
            setBooks(Array.isArray(data) ? data : []);
        } catch (e) {
            setError(e?.message || '에러가 발생했습니다');
            setBooks([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchBooks();
    }, []);

    async function handleCreate(e) {
        e.preventDefault();
        if (!newTitle.trim()) return;
        setError('');
        try {
            const nextId = (books?.reduce((m, b) => Math.max(m, b?.id || 0), 0) || 0) + 1;
            const body = {
                id: nextId,
                title: newTitle.trim(),
                description: `Description for ${newTitle.trim()}`,
                pageCount: Math.floor(Math.random() * 500) + 100,
                excerpt: `This is an excerpt from ${newTitle.trim()}`,
                publishDate: new Date().toISOString(),
            };
            const res = await fetch('/api/books', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || `생성 실패 (${res.status})`);
            }
            setNewTitle('');
            fetchBooks();
        } catch (e) {
            setError(e?.message || '에러가 발생했습니다');
        }
    }

    function startEdit(book) {
        setEditingId(book.id);
        setEditingTitle(book.title || '');
    }

    function cancelEdit() {
        setEditingId(null);
        setEditingTitle('');
    }

    async function saveEdit(id) {
        setError('');
        try {
            const original = books.find((b) => b.id === id) || {};
            const body = {
                id,
                title: editingTitle.trim(),
                description: original.description || `Description for ${editingTitle.trim()}`,
                pageCount: original.pageCount || 200,
                excerpt: original.excerpt || `This is an excerpt from ${editingTitle.trim()}`,
                publishDate: original.publishDate || new Date().toISOString(),
            };
            const res = await fetch(`/api/books/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || `수정 실패 (${res.status})`);
            }
            cancelEdit();
            fetchBooks();
        } catch (e) {
            setError(e?.message || '에러가 발생했습니다');
        }
    }

    async function handleDelete(id) {
        setError('');
        try {
            const res = await fetch(`/api/books/${id}`, { method: 'DELETE' });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || `삭제 실패 (${res.status})`);
            }
            fetchBooks();
        } catch (e) {
            setError(e?.message || '에러가 발생했습니다');
        }
    }

    return (
        <main style={{ maxWidth: 720, margin: '0 auto', padding: 24 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Books</h1>

            <form onSubmit={handleCreate} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="새 Book 제목"
                    style={{ flex: 1, padding: 8 }}
                />
                <button type="submit" style={{ padding: '8px 12px' }}>
                    추가
                </button>
            </form>

            {loading && <p>불러오는 중...</p>}
            {error && <p style={{ color: 'crimson' }}>{error}</p>}

            <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 8 }}>
                {books.map((book) => (
                    <li key={book.id} style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8 }}>
                        {editingId === book.id ? (
                            <div style={{ display: 'grid', gap: 8 }}>
                                <input
                                    type="text"
                                    value={editingTitle}
                                    onChange={(e) => setEditingTitle(e.target.value)}
                                    placeholder="제목"
                                    style={{ padding: 8 }}
                                />
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button
                                        type="button"
                                        onClick={() => saveEdit(book.id)}
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
                                <div style={{ fontWeight: 600 }}>{book.title}</div>
                                <div style={{ fontSize: 12, color: '#666' }}>id: {book.id}</div>
                                <div style={{ fontSize: 12, color: '#666' }}>pages: {book.pageCount}</div>
                                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                    <button
                                        type="button"
                                        onClick={() => startEdit(book)}
                                        style={{ padding: '6px 10px' }}
                                    >
                                        수정
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(book.id)}
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