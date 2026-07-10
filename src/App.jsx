import React, { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Package, Check, X, User, Shield, Plus, Trash2, ArrowRightLeft, Clock, Settings, Boxes, Loader2, Lock, LogOut, KeyRound } from 'lucide-react';

const DOC_REF = doc(db, 'assetManager', 'data');
const ADMIN_PASSWORD = '130320';

const defaultData = () => {
  const models = [
    { id: 'wpuiac414', name: 'wpuiac414', qty: 10 },
    { id: 'wpuiac403', name: 'wpuiac403', qty: 10 },
  ];
  const items = [];
  models.forEach(m => {
    for (let i = 1; i <= m.qty; i++) {
      items.push({ id: `${m.name}-${i}`, modelId: m.id, status: 'available', assignedTo: null });
    }
  });
  return { employees: [], models, items, requests: [] };
};

export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState('employee');

  const [adminAuthed, setAdminAuthed] = useState(false);
  const [adminPwInput, setAdminPwInput] = useState('');
  const [adminError, setAdminError] = useState('');

  const [loginName, setLoginName] = useState('');
  const [loginPw, setLoginPw] = useState('');
  const [loginError, setLoginError] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');

  const [bulkNames, setBulkNames] = useState('');
  const [newModelName, setNewModelName] = useState('');
  const [newModelQty, setNewModelQty] = useState('');
  const [expandedModel, setExpandedModel] = useState(null);
  const [toast, setToast] = useState(null);
  const [pwEditId, setPwEditId] = useState(null);
  const [pwEditValue, setPwEditValue] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  // realtime listener: every connected device updates automatically
  useEffect(() => {
    const unsub = onSnapshot(
      DOC_REF,
      async (snap) => {
        if (snap.exists()) {
          setData(snap.data());
        } else {
          const d = defaultData();
          await setDoc(DOC_REF, d);
          setData(d);
        }
        setLoading(false);
      },
      (err) => {
        console.error(err);
        showToast('데이터를 불러오지 못했어요. Firebase 설정을 확인해주세요.');
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const persist = async (next) => {
    setData(next);
    setSaving(true);
    try {
      await setDoc(DOC_REF, next);
    } catch (e) {
      console.error(e);
      showToast('저장에 실패했어요. 다시 시도해주세요.');
    }
    setSaving(false);
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex items-center gap-2 text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">불러오는 중...</span>
        </div>
      </div>
    );
  }

  const { employees, models, items, requests } = data;
  const getEmpName = (id) => employees.find(e => e.id === id)?.name || '알 수 없음';

  const handleAdminLogin = () => {
    if (adminPwInput === ADMIN_PASSWORD) {
      setAdminAuthed(true);
      setAdminError('');
      setAdminPwInput('');
    } else {
      setAdminError('비밀번호가 올바르지 않아요.');
    }
  };

  const handleEmployeeLogin = () => {
    const emp = employees.find(e => e.name === loginName);
    if (!emp) { setLoginError('이름을 선택해주세요.'); return; }
    if (emp.password && emp.password !== loginPw) { setLoginError('비밀번호가 올바르지 않아요.'); return; }
    setSelectedEmployee(emp.id);
    setLoginError('');
    setLoginPw('');
  };

  const handleEmployeeLogout = () => {
    setSelectedEmployee('');
    setLoginName('');
    setLoginPw('');
  };

  const addEmployees = async () => {
    const lines = bulkNames.split('\n').map(s => s.trim()).filter(Boolean);
    if (lines.length === 0) return;
    const existing = new Set(employees.map(e => e.name));
    const toAdd = [];
    for (const line of lines) {
      const [namePart, pwPart] = line.split(',').map(s => s.trim());
      if (!namePart || existing.has(namePart)) continue;
      toAdd.push({ id: `emp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, name: namePart, password: pwPart || '' });
      existing.add(namePart);
    }
    if (toAdd.length === 0) { showToast('추가할 새 이름이 없어요.'); return; }
    await persist({ ...data, employees: [...employees, ...toAdd] });
    setBulkNames('');
    showToast(`직원 ${toAdd.length}명 추가됨`);
  };

  const removeEmployee = async (id) => {
    const stillHolding = items.some(it => it.assignedTo === id && it.status !== 'available');
    if (stillHolding) { showToast('보유 중인 자재가 있어 삭제할 수 없어요.'); return; }
    await persist({ ...data, employees: employees.filter(e => e.id !== id) });
  };

  const resizeImage = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const size = 160;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        const scale = Math.max(size / img.width, size / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.75));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handlePhotoChange = async (empId, file) => {
    if (!file) return;
    try {
      const dataUrl = await resizeImage(file);
      await persist({ ...data, employees: employees.map(e => e.id === empId ? { ...e, photo: dataUrl } : e) });
      showToast('사진이 등록됐어요.');
    } catch (e) {
      showToast('사진 처리에 실패했어요. 다른 사진으로 시도해주세요.');
    }
  };

  const startPwEdit = (emp) => { setPwEditId(emp.id); setPwEditValue(emp.password || ''); };
  const savePwEdit = async (id) => {
    await persist({ ...data, employees: employees.map(e => e.id === id ? { ...e, password: pwEditValue.trim() } : e) });
    setPwEditId(null);
    setPwEditValue('');
    showToast('비밀번호가 변경됐어요.');
  };

  const addModel = async () => {
    const name = newModelName.trim();
    const qty = parseInt(newModelQty, 10);
    if (!name || !qty || qty < 1) { showToast('모델명과 수량을 확인해주세요.'); return; }
    if (models.some(m => m.name === name)) { showToast('이미 존재하는 모델명이에요.'); return; }
    const model = { id: name, name, qty };
    const newItems = [];
    for (let i = 1; i <= qty; i++) newItems.push({ id: `${name}-${i}`, modelId: name, status: 'available', assignedTo: null });
    await persist({ ...data, models: [...models, model], items: [...items, ...newItems] });
    setNewModelName(''); setNewModelQty('');
    showToast(`${name} 모델 추가됨 (${qty}대)`);
  };

  const removeModel = async (id) => {
    const inUse = items.some(it => it.modelId === id && it.status !== 'available');
    if (inUse) { showToast('사용 중인 자재가 있어 모델을 삭제할 수 없어요.'); return; }
    await persist({ ...data, models: models.filter(m => m.id !== id), items: items.filter(it => it.modelId !== id) });
  };

  const requestCheckout = async (itemId) => {
    if (!selectedEmployee) { showToast('먼저 로그인해주세요.'); return; }
    const item = items.find(i => i.id === itemId);
    if (!item || item.status !== 'available') return;
    const req = { id: `req_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, type: 'checkout', itemId, employeeId: selectedEmployee, status: 'pending', ts: Date.now() };
    const newItems = items.map(i => i.id === itemId ? { ...i, status: 'pending_checkout' } : i);
    await persist({ ...data, items: newItems, requests: [...requests, req] });
    showToast(`${itemId} 신청 완료 · 승인 대기 중`);
  };

  const requestReturn = async (itemId) => {
    const item = items.find(i => i.id === itemId);
    if (!item || item.status !== 'assigned') return;
    const req = { id: `req_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, type: 'return', itemId, employeeId: item.assignedTo, status: 'pending', ts: Date.now() };
    const newItems = items.map(i => i.id === itemId ? { ...i, status: 'pending_return' } : i);
    await persist({ ...data, items: newItems, requests: [...requests, req] });
    showToast(`${itemId} 반납 신청 완료`);
  };

  const approveRequest = async (reqId) => {
    const req = requests.find(r => r.id === reqId);
    if (!req) return;
    const newItems = items.map(it => {
      if (it.id !== req.itemId) return it;
      if (req.type === 'checkout') return { ...it, status: 'assigned', assignedTo: req.employeeId };
      if (req.type === 'return') return { ...it, status: 'available', assignedTo: null };
      return it;
    });
    const newRequests = requests.map(r => r.id === reqId ? { ...r, status: 'approved' } : r);
    await persist({ ...data, items: newItems, requests: newRequests });
    showToast('승인 완료');
  };

  const rejectRequest = async (reqId) => {
    const req = requests.find(r => r.id === reqId);
    if (!req) return;
    const newItems = items.map(it => {
      if (it.id !== req.itemId) return it;
      if (req.type === 'checkout') return { ...it, status: 'available' };
      if (req.type === 'return') return { ...it, status: 'assigned' };
      return it;
    });
    const newRequests = requests.map(r => r.id === reqId ? { ...r, status: 'rejected' } : r);
    await persist({ ...data, items: newItems, requests: newRequests });
    showToast('거절 처리됨');
  };

  const pendingRequests = requests.filter(r => r.status === 'pending').sort((a, b) => a.ts - b.ts);
  const myItems = selectedEmployee ? items.filter(it => it.assignedTo === selectedEmployee && it.status !== 'available') : [];
  const myRequests = selectedEmployee ? requests.filter(r => r.employeeId === selectedEmployee).sort((a, b) => b.ts - a.ts).slice(0, 8) : [];

  const statusBadge = (status) => {
    const map = {
      available: { label: '대기중', cls: 'bg-slate-100 text-slate-500' },
      assigned: { label: '지급됨', cls: 'bg-emerald-50 text-emerald-700' },
      pending_checkout: { label: '신청 승인대기', cls: 'bg-amber-50 text-amber-700' },
      pending_return: { label: '반납 승인대기', cls: 'bg-amber-50 text-amber-700' },
    };
    const s = map[status] || map.available;
    return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.cls}`}>{s.label}</span>;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="bg-slate-900 text-white px-5 py-4 sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Boxes className="w-5 h-5 text-sky-400" />
            <h1 className="font-semibold text-base tracking-tight">사무실 자재 관리</h1>
          </div>
          <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
            <button onClick={() => setMode('employee')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${mode === 'employee' ? 'bg-sky-500 text-white' : 'text-slate-300 hover:text-white'}`}>
              <User className="w-3.5 h-3.5" /> 직원
            </button>
            <button onClick={() => setMode('admin')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${mode === 'admin' ? 'bg-sky-500 text-white' : 'text-slate-300 hover:text-white'}`}>
              <Shield className="w-3.5 h-3.5" /> 관리자
            </button>
          </div>
        </div>
        {saving && <div className="text-[11px] text-slate-400 mt-1">저장 중...</div>}
      </div>

      <div className="max-w-3xl mx-auto p-4 space-y-4">
        {mode === 'employee' && !selectedEmployee && employees.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-500 mb-3">우리 팀</h2>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
              {employees.map(e => (
                <div key={e.id} className="flex flex-col items-center gap-1">
                  {e.photo ? (
                    <img src={e.photo} alt={e.name} className="w-12 h-12 rounded-full object-cover border border-slate-200" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-sm font-semibold border border-slate-200">
                      {e.name.slice(0, 1)}
                    </div>
                  )}
                  <span className="text-[11px] text-slate-600 truncate max-w-[56px]">{e.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {mode === 'employee' && !selectedEmployee && (
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold flex items-center gap-1.5 mb-4"><Lock className="w-4 h-4 text-sky-500" /> 직원 로그인</h2>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">이름</label>
            <select value={loginName} onChange={e => { setLoginName(e.target.value); setLoginError(''); }} className="mt-1.5 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-400">
              <option value="">이름을 선택하세요</option>
              {employees.map(e => <option key={e.id} value={e.name}>{e.name}</option>)}
            </select>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-3 block">비밀번호</label>
            <input type="password" value={loginPw} onChange={e => { setLoginPw(e.target.value); setLoginError(''); }} onKeyDown={e => e.key === 'Enter' && handleEmployeeLogin()} className="mt-1.5 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" placeholder="비밀번호 입력" />
            {loginError && <p className="text-xs text-red-500 mt-2">{loginError}</p>}
            <button onClick={handleEmployeeLogin} className="mt-3 w-full bg-sky-500 text-white text-sm font-medium py-2 rounded-lg hover:bg-sky-600">로그인</button>
            {employees.length === 0 && <p className="text-xs text-slate-400 mt-3">등록된 직원이 없어요. 관리자 모드에서 먼저 직원을 추가해주세요.</p>}
          </div>
        )}

        {mode === 'employee' && selectedEmployee && (
          <>
            <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between">
              <span className="text-sm font-medium">{getEmpName(selectedEmployee)}님</span>
              <button onClick={handleEmployeeLogout} className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800">
                <LogOut className="w-3.5 h-3.5" /> 로그아웃
              </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h2 className="text-sm font-semibold flex items-center gap-1.5 mb-3"><Package className="w-4 h-4 text-sky-500" /> 자재 신청</h2>
              <div className="space-y-2">
                {models.map(m => {
                  const modelItems = items.filter(it => it.modelId === m.id);
                  const availCount = modelItems.filter(it => it.status === 'available').length;
                  const isOpen = expandedModel === m.id;
                  return (
                    <div key={m.id} className="border border-slate-200 rounded-lg overflow-hidden">
                      <button onClick={() => setExpandedModel(isOpen ? null : m.id)} className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-slate-50 text-left">
                        <span className="text-sm font-medium">{m.name}</span>
                        <span className="text-xs text-slate-500">{availCount}/{m.qty} 대기중</span>
                      </button>
                      {isOpen && (
                        <div className="px-3 pb-3 flex flex-wrap gap-1.5">
                          {modelItems.map(it => {
                            const disabled = it.status !== 'available';
                            return (
                              <button key={it.id} disabled={disabled} onClick={() => requestCheckout(it.id)} title={disabled ? it.status : '신청하기'} className={`text-xs px-2.5 py-1.5 rounded-md border font-medium transition-colors ${disabled ? 'bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed' : 'bg-white border-sky-300 text-sky-700 hover:bg-sky-50'}`}>
                                {it.id}
                              </button>
                            );
                          })}
                          {modelItems.length === 0 && <span className="text-xs text-slate-400">등록된 항목 없음</span>}
                        </div>
                      )}
                    </div>
                  );
                })}
                {models.length === 0 && <p className="text-xs text-slate-400">등록된 모델이 없어요.</p>}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h2 className="text-sm font-semibold flex items-center gap-1.5 mb-3"><ArrowRightLeft className="w-4 h-4 text-emerald-500" /> 내 보유 자재</h2>
              {myItems.length === 0 ? (
                <p className="text-xs text-slate-400">현재 보유 중인 자재가 없어요.</p>
              ) : (
                <div className="space-y-2">
                  {myItems.map(it => (
                    <div key={it.id} className="flex items-center justify-between px-3 py-2 border border-slate-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{it.id}</span>
                        {statusBadge(it.status)}
                      </div>
                      <button disabled={it.status !== 'assigned'} onClick={() => requestReturn(it.id)} className={`text-xs px-3 py-1.5 rounded-md font-medium ${it.status === 'assigned' ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}>
                        반납 신청
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h2 className="text-sm font-semibold flex items-center gap-1.5 mb-3"><Clock className="w-4 h-4 text-slate-400" /> 내 신청 내역</h2>
              {myRequests.length === 0 ? (
                <p className="text-xs text-slate-400">신청 내역이 없어요.</p>
              ) : (
                <div className="space-y-1.5">
                  {myRequests.map(r => (
                    <div key={r.id} className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">{r.itemId} · {r.type === 'checkout' ? '신청' : '반납'}</span>
                      <span className={r.status === 'pending' ? 'text-amber-600' : r.status === 'approved' ? 'text-emerald-600' : 'text-red-500'}>
                        {r.status === 'pending' ? '대기중' : r.status === 'approved' ? '승인됨' : '거절됨'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {mode === 'admin' && !adminAuthed && (
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold flex items-center gap-1.5 mb-4"><Shield className="w-4 h-4 text-slate-700" /> 관리자 로그인</h2>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">비밀번호</label>
            <input type="password" value={adminPwInput} onChange={e => { setAdminPwInput(e.target.value); setAdminError(''); }} onKeyDown={e => e.key === 'Enter' && handleAdminLogin()} className="mt-1.5 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" placeholder="비밀번호 입력" />
            {adminError && <p className="text-xs text-red-500 mt-2">{adminError}</p>}
            <button onClick={handleAdminLogin} className="mt-3 w-full bg-slate-800 text-white text-sm font-medium py-2 rounded-lg hover:bg-slate-700">로그인</button>
          </div>
        )}

        {mode === 'admin' && adminAuthed && (
          <>
            <div className="flex justify-end">
              <button onClick={() => setAdminAuthed(false)} className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800">
                <LogOut className="w-3.5 h-3.5" /> 로그아웃
              </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h2 className="text-sm font-semibold flex items-center gap-1.5 mb-3"><Clock className="w-4 h-4 text-amber-500" /> 승인 대기 ({pendingRequests.length})</h2>
              {pendingRequests.length === 0 ? (
                <p className="text-xs text-slate-400">대기 중인 요청이 없어요.</p>
              ) : (
                <div className="space-y-2">
                  {pendingRequests.map(r => (
                    <div key={r.id} className="flex items-center justify-between px-3 py-2.5 border border-slate-200 rounded-lg">
                      <div className="text-sm">
                        <span className="font-medium">{getEmpName(r.employeeId)}</span>
                        <span className="text-slate-400 mx-1.5">·</span>
                        <span>{r.itemId}</span>
                        <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${r.type === 'checkout' ? 'bg-sky-50 text-sky-700' : 'bg-orange-50 text-orange-700'}`}>
                          {r.type === 'checkout' ? '신청' : '반납'}
                        </span>
                      </div>
                      <div className="flex gap-1.5">
                        <button onClick={() => approveRequest(r.id)} className="p-1.5 rounded-md bg-emerald-500 text-white hover:bg-emerald-600"><Check className="w-3.5 h-3.5" /></button>
                        <button onClick={() => rejectRequest(r.id)} className="p-1.5 rounded-md bg-red-50 text-red-500 hover:bg-red-100"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h2 className="text-sm font-semibold flex items-center gap-1.5 mb-3"><Boxes className="w-4 h-4 text-sky-500" /> 재고 현황</h2>
              <div className="space-y-2">
                {models.map(m => {
                  const modelItems = items.filter(it => it.modelId === m.id);
                  const avail = modelItems.filter(it => it.status === 'available').length;
                  const assigned = modelItems.filter(it => it.status === 'assigned').length;
                  const pending = modelItems.filter(it => it.status.startsWith('pending')).length;
                  return (
                    <div key={m.id} className="border border-slate-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{m.name}</span>
                        <span className="text-xs text-slate-400">총 {m.qty}대</span>
                      </div>
                      <div className="flex gap-3 text-xs">
                        <span className="text-slate-500">대기중 {avail}</span>
                        <span className="text-emerald-600">지급됨 {assigned}</span>
                        {pending > 0 && <span className="text-amber-600">처리중 {pending}</span>}
                      </div>
                      {assigned > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-500 space-y-0.5">
                          {modelItems.filter(it => it.status === 'assigned').map(it => (
                            <div key={it.id}>{it.id} → {getEmpName(it.assignedTo)}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
                {models.length === 0 && <p className="text-xs text-slate-400">등록된 모델이 없어요.</p>}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h2 className="text-sm font-semibold flex items-center gap-1.5 mb-3"><User className="w-4 h-4 text-slate-500" /> 직원 관리</h2>
              <div className="space-y-1.5 mb-3">
                {employees.map(e => (
                  <div key={e.id} className="flex items-center justify-between text-sm px-3 py-2 border border-slate-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      {e.photo ? (
                        <img src={e.photo} alt={e.name} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-semibold border border-slate-200">
                          {e.name.slice(0, 1)}
                        </div>
                      )}
                      <span>{e.name}</span>
                      <label className="text-[11px] text-sky-600 hover:underline cursor-pointer">
                        사진 등록
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={ev => { const f = ev.target.files?.[0]; if (f) handlePhotoChange(e.id, f); ev.target.value = ''; }}
                        />
                      </label>
                    </div>
                    {pwEditId === e.id ? (
                      <div className="flex items-center gap-1">
                        <input value={pwEditValue} onChange={ev => setPwEditValue(ev.target.value)} className="w-24 border border-slate-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-sky-400" placeholder="새 비밀번호" />
                        <button onClick={() => savePwEdit(e.id)} className="p-1 bg-emerald-500 text-white rounded"><Check className="w-3 h-3" /></button>
                        <button onClick={() => setPwEditId(null)} className="p-1 bg-slate-100 rounded"><X className="w-3 h-3 text-slate-400" /></button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button onClick={() => startPwEdit(e)} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700">
                          <KeyRound className="w-3.5 h-3.5" /> 비밀번호
                        </button>
                        <button onClick={() => removeEmployee(e.id)} className="p-1 hover:bg-slate-100 rounded-md">
                          <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {employees.length === 0 && <span className="text-xs text-slate-400">등록된 직원 없음</span>}
              </div>
              <label className="text-xs text-slate-500">이름,비밀번호 형식으로 한 줄에 한 명씩 입력하세요</label>
              <textarea value={bulkNames} onChange={e => setBulkNames(e.target.value)} placeholder={'예)\n김철수,1234\n이영희,5678'} rows={3} className="w-full mt-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
              <button onClick={addEmployees} className="mt-2 flex items-center gap-1 text-xs font-medium bg-slate-800 text-white px-3 py-1.5 rounded-md hover:bg-slate-700">
                <Plus className="w-3.5 h-3.5" /> 일괄 추가
              </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h2 className="text-sm font-semibold flex items-center gap-1.5 mb-3"><Settings className="w-4 h-4 text-slate-500" /> 모델 관리</h2>
              <div className="space-y-1.5 mb-3">
                {models.map(m => (
                  <div key={m.id} className="flex items-center justify-between text-sm px-3 py-2 border border-slate-200 rounded-lg">
                    <span>{m.name} <span className="text-slate-400 text-xs">({m.qty}대)</span></span>
                    <button onClick={() => removeModel(m.id)} className="p-1 hover:bg-slate-100 rounded-md">
                      <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={newModelName} onChange={e => setNewModelName(e.target.value)} placeholder="모델명 (예: wpuiac414)" className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
                <input type="number" min="1" value={newModelQty} onChange={e => setNewModelQty(e.target.value)} placeholder="수량" className="w-24 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
                <button onClick={addModel} className="flex items-center gap-1 text-xs font-medium bg-sky-500 text-white px-3 py-2 rounded-lg hover:bg-sky-600">
                  <Plus className="w-3.5 h-3.5" /> 추가
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-4 py-2 rounded-full shadow-lg z-30">
          {toast}
        </div>
      )}
    </div>
  );
}