'use client';

import { useEffect, useState } from 'react';

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [newUserName, setNewUserName] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const [editingId, setEditingId] = useState(null);
    const [editingUserName, setEditingUserName] = useState('');
    const [editingPassword, setEditingPassword] = useState('');

    async function fetchUsers() {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/users', { cache: 'no-store' });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || `목록 조회 실패 (${res.status})`);
            }
            const data = await res.json();
            setUsers(Array.isArray(data) ? data : []);
        } catch (e) {
            setError(e?.message || '에러가 발생했습니다');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchUsers();
    }, []);

    async function handleCreate(e) {
        e.preventDefault();
        if (!newUserName.trim() || !newPassword.trim()) return;
        setError('');
        try {
            const nextId = (users?.reduce((m, u) => Math.max(m, u?.id || 0), 0) || 0) + 1;
            const body = {
                id: nextId,
                userName: newUserName.trim(),
                password: newPassword.trim(),
            };
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || `생성 실패 (${res.status})`);
            }
            setNewUserName('');
            setNewPassword('');
            fetchUsers();
        } catch (e) {
            setError(e?.message || '에러가 발생했습니다');
        }
    }

    function startEdit(user) {
        setEditingId(user.id);
        setEditingUserName(user.userName || '');
        setEditingPassword('');
    }

    function cancelEdit() {
        setEditingId(null);
        setEditingUserName('');
        setEditingPassword('');
    }

    async function saveEdit(id) {
        setError('');
        try {
            const original = users.find((u) => u.id === id) || {};
            const body = {
                id,
                userName: editingUserName.trim(),
                password: editingPassword.trim() || original.password,
            };
            const res = await fetch(`/api/users/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || `수정 실패 (${res.status})`);
            }
            cancelEdit();
            fetchUsers();
        } catch (e) {
            setError(e?.message || '에러가 발생했습니다');
        }
    }

    async function handleDelete(id) {
        setError('');
        try {
            const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || `삭제 실패 (${res.status})`);
            }
            fetchUsers();
        } catch (e) {
            setError(e?.message || '에러가 발생했습니다');
        }
    }

    return (
        <main style={{ maxWidth: 720, margin: '0 auto', padding: 24 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Users</h1>

            <form onSubmit={handleCreate} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <input
                    type="text"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="사용자명"
                    style={{ flex: 1, padding: 8 }}
                />
                <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="비밀번호"
                    style={{ flex: 1, padding: 8 }}
                />
                <button type="submit" style={{ padding: '8px 12px' }}>
                    추가
                </button>
            </form>

            {loading && <p>불러오는 중...</p>}
            {error && <p style={{ color: 'crimson' }}>{error}</p>}

            <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 8 }}>
                {users.map((user) => (
                    <li key={user.id} style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8 }}>
                        {editingId === user.id ? (
                            <div style={{ display: 'grid', gap: 8 }}>
                                <input
                                    type="text"
                                    value={editingUserName}
                                    onChange={(e) => setEditingUserName(e.target.value)}
                                    placeholder="사용자명"
                                    style={{ padding: 8 }}
                                />
                                <input
                                    type="password"
                                    value={editingPassword}
                                    onChange={(e) => setEditingPassword(e.target.value)}
                                    placeholder="새 비밀번호 (선택사항)"
                                    style={{ padding: 8 }}
                                />
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button
                                        type="button"
                                        onClick={() => saveEdit(user.id)}
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
                                <div style={{ fontWeight: 600 }}>{user.userName}</div>
                                <div style={{ fontSize: 12, color: '#666' }}>id: {user.id}</div>
                                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                    <button
                                        type="button"
                                        onClick={() => startEdit(user)}
                                        style={{ padding: '6px 10px' }}
                                    >
                                        수정
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(user.id)}
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