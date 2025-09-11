'use client';

import { useEffect, useState } from 'react';

export default function ActivitiesPage() {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [newTitle, setNewTitle] = useState('');

    const [editingId, setEditingId] = useState(null);
    const [editingTitle, setEditingTitle] = useState('');
    const [editingCompleted, setEditingCompleted] = useState(false);

    async function fetchActivities() {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/activities', { cache: 'no-store' });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || `목록 조회 실패 (${res.status})`);
            }
            const data = await res.json();
            setActivities(Array.isArray(data) ? data : []);
        } catch (e) {
            setError(e?.message || '에러가 발생했습니다');
            setActivities([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchActivities();
    }, []);

    async function handleCreate(e) {
        e.preventDefault();
        if (!newTitle.trim()) return;
        setError('');
        try {
            const nextId = (activities?.reduce((m, a) => Math.max(m, a?.id || 0), 0) || 0) + 1;
            const body = {
                id: nextId,
                title: newTitle.trim(),
                dueDate: new Date().toISOString(),
                completed: false,
            };
            const res = await fetch('/api/activities', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || `생성 실패 (${res.status})`);
            }
            // 업스트림이 비영속일 수 있으므로 재조회
            setNewTitle('');
            fetchActivities();
        } catch (e) {
            setError(e?.message || '에러가 발생했습니다');
        }
    }

    function startEdit(act) {
        setEditingId(act.id);
        setEditingTitle(act.title || '');
        setEditingCompleted(!!act.completed);
    }

    function cancelEdit() {
        setEditingId(null);
        setEditingTitle('');
        setEditingCompleted(false);
    }

    async function saveEdit(id) {
        setError('');
        try {
            const original = activities.find((a) => a.id === id) || {};
            const body = {
                id,
                title: editingTitle.trim(),
                dueDate: original.dueDate || new Date().toISOString(),
                completed: editingCompleted,
            };
            const res = await fetch(`/api/activities/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || `수정 실패 (${res.status})`);
            }
            cancelEdit();
            fetchActivities();
        } catch (e) {
            setError(e?.message || '에러가 발생했습니다');
        }
    }

    async function handleDelete(id) {
        setError('');
        try {
            const res = await fetch(`/api/activities/${id}`, { method: 'DELETE' });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || `삭제 실패 (${res.status})`);
            }
            fetchActivities();
        } catch (e) {
            setError(e?.message || '에러가 발생했습니다');
        }
    }

    return (
        <main style={{ maxWidth: 720, margin: '0 auto', padding: 24 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Activities</h1>

            <form onSubmit={handleCreate} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="새 Activity 제목"
                    style={{ flex: 1, padding: 8 }}
                />
                <button type="submit" style={{ padding: '8px 12px' }}>
                    추가
                </button>
            </form>

            {loading && <p>불러오는 중...</p>}
            {error && <p style={{ color: 'crimson' }}>{error}</p>}

            <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 8 }}>
                {activities.map((act) => (
                    <li key={act.id} style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8 }}>
                        {editingId === act.id ? (
                            <div style={{ display: 'grid', gap: 8 }}>
                                <input
                                    type="text"
                                    value={editingTitle}
                                    onChange={(e) => setEditingTitle(e.target.value)}
                                    placeholder="제목"
                                    style={{ padding: 8 }}
                                />
                                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                    <input
                                        type="checkbox"
                                        checked={editingCompleted}
                                        onChange={(e) => setEditingCompleted(e.target.checked)}
                                    />
                                    완료 여부
                                </label>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button
                                        type="button"
                                        onClick={() => saveEdit(act.id)}
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
                                <div style={{ fontWeight: 600 }}>{act.title}</div>
                                <div style={{ fontSize: 12, color: '#666' }}>id: {act.id}</div>
                                <div style={{ fontSize: 12, color: '#666' }}>completed: {String(act.completed)}</div>
                                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                    <button
                                        type="button"
                                        onClick={() => startEdit(act)}
                                        style={{ padding: '6px 10px' }}
                                    >
                                        수정
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(act.id)}
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
