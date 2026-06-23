import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import useLangStore from '../../i18n';
import { Spinner } from '../components/AdminUI';
import { Icon } from '../components/AdminIcons';
import toast from 'react-hot-toast';

export default function BadWordsTab({ lang }) {
  const isAr = lang === 'ar';
  const [list, setList] = useState({ en: [], ar: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newEn, setNewEn] = useState('');
  const [newAr, setNewAr] = useState('');
  const [activeTab, setActiveTab] = useState('en');

  // ── Load list ──────────────────────────────────────
  const loadList = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/bad-words');
      setList(data.data?.list || { en: [], ar: [] });
    } catch {
      toast.error(isAr ? 'فشل تحميل القائمة' : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadList(); }, [loadList]);

  // ── Add word ───────────────────────────────────────
  const addWord = (lang) => {
    const word = lang === 'en' ? newEn.trim() : newAr.trim();
    if (!word) return;
    if (list[lang].includes(word)) {
      toast.error(isAr ? 'الكلمة موجودة مسبقاً' : 'Word already exists');
      return;
    }
    setList(p => ({ ...p, [lang]: [...p[lang], word] }));
    if (lang === 'en') setNewEn('');
    else setNewAr('');
  };

  // ── Remove word ────────────────────────────────────
  const removeWord = (lang, word) => {
    setList(p => ({ ...p, [lang]: p[lang].filter(w => w !== word) }));
  };

  // ── Save ───────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/admin/bad-words', { en: list.en, ar: list.ar });
      toast.success(isAr ? '✅ تم حفظ القائمة' : '✅ List saved');
    } catch {
      toast.error(isAr ? '❌ فشل الحفظ' : '❌ Save failed');
    } finally {
      setSaving(false);
    }
  };

  // ── Test word ──────────────────────────────────────
  const [testWord, setTestWord] = useState('');
  const [testResult, setTestResult] = useState(null);

  const handleTest = () => {
    if (!testWord.trim()) return;
    const normalized = testWord.toLowerCase().trim();
    
    let found = false;
    let matchedWord = '';
    
    // Check English
    for (const word of list.en) {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      if (regex.test(normalized)) {
        found = true;
        matchedWord = word;
        break;
      }
    }
    
    // Check Arabic
    if (!found) {
      for (const word of list.ar) {
        if (normalized.includes(word)) {
          found = true;
          matchedWord = word;
          break;
        }
      }
    }

    setTestResult({ found, matchedWord, word: testWord });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
        <Spinner size={28} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      
      {/* ════════════════════════════════════════════════
         TEST PANEL
      ════════════════════════════════════════════════ */}
      <div style={{
        background: 'var(--bg-primary)', border: '1px solid var(--border)',
        borderRadius: 14, padding: 20,
      }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 12px', color: 'var(--text-primary)' }}>
          {isAr ? '🔍 اختبار كلمة' : '🔍 Test Word'}
        </h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={testWord}
            onChange={e => setTestWord(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleTest(); }}
            placeholder={isAr ? 'اكتب كلمة للاختبار...' : 'Type a word to test...'}
            style={{
              flex: 1, padding: '10px 14px', borderRadius: 10,
              border: '1px solid var(--border)', background: 'var(--bg-secondary)',
              color: 'var(--text-primary)', fontSize: 14, outline: 'none',
            }}
          />
          <button onClick={handleTest} style={{
            padding: '10px 20px', borderRadius: 10, border: 'none',
            background: 'var(--text-primary)', color: 'var(--bg-primary)',
            cursor: 'pointer', fontSize: 13, fontWeight: 700,
          }}>
            {isAr ? 'فحص' : 'Test'}
          </button>
        </div>

        {/* Result */}
        {testResult && (
          <div style={{
            marginTop: 12, padding: '12px 16px', borderRadius: 10,
            background: testResult.found ? '#EF444410' : '#22C55E10',
            border: `1px solid ${testResult.found ? '#EF444440' : '#22C55E40'}`,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            {testResult.found ? (
              <>
                <span style={{ fontSize: 20 }}>🚫</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#EF4444' }}>
                    {isAr ? 'سيتم حظرها!' : 'Will be blocked!'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                    {isAr
                      ? `الكلمة المطابقة: "${testResult.matchedWord}"`
                      : `Matched word: "${testResult.matchedWord}"`
                    }
                  </div>
                </div>
              </>
            ) : (
              <>
                <span style={{ fontSize: 20 }}>✅</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#22C55E' }}>
                    {isAr ? 'آمنة — لن تُحظر' : 'Safe — will not be blocked'}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════
         WORD LISTS
      ════════════════════════════════════════════════ */}
      <div style={{
        background: 'var(--bg-primary)', border: '1px solid var(--border)',
        borderRadius: 14, overflow: 'hidden',
      }}>
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
          {[
            { key: 'en', label: ' English', ar: ' إنجليزي' },
            { key: 'ar', label: ' Arabic', ar: ' عربي' },
          ].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
              flex: 1, padding: '12px 16px', border: 'none',
              background: activeTab === t.key ? 'var(--bg-primary)' : 'var(--bg-secondary)',
              cursor: 'pointer', fontWeight: activeTab === t.key ? 700 : 400,
              color: activeTab === t.key ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontSize: 13, borderBottom: activeTab === t.key ? '2px solid var(--text-primary)' : '2px solid transparent',
              transition: 'all .15s',
            }}>
              {isAr ? t.ar : t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ padding: 20 }}>
          {/* Add input */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input
              type="text"
              value={activeTab === 'en' ? newEn : newAr}
              onChange={e => activeTab === 'en' ? setNewEn(e.target.value) : setNewAr(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addWord(activeTab); }}
              placeholder={activeTab === 'en' 
                ? (isAr ? 'أضف كلمة إنجليزية...' : 'Add English word...')
                : (isAr ? 'أضف كلمة عربية...' : 'Add Arabic word...')
              }
              dir={activeTab === 'ar' ? 'rtl' : 'ltr'}
              style={{
                flex: 1, padding: '10px 14px', borderRadius: 10,
                border: '1px solid var(--border)', background: 'var(--bg-secondary)',
                color: 'var(--text-primary)', fontSize: 14, outline: 'none',
              }}
            />
            <button onClick={() => addWord(activeTab)} style={{
              padding: '10px 20px', borderRadius: 10, border: 'none',
              background: 'var(--text-primary)', color: 'var(--bg-primary)',
              cursor: 'pointer', fontSize: 13, fontWeight: 700,
            }}>
              <Icon name="plus" size={14} /> {isAr ? 'إضافة' : 'Add'}
            </button>
          </div>

          {/* Count */}
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 12 }}>
            {isAr ? 'عدد الكلمات' : 'Total words'}: {list[activeTab]?.length || 0}
          </div>

          {/* Words list */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {list[activeTab]?.map((word, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', borderRadius: 8,
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                fontSize: 13, color: '#EF4444', fontWeight: 600,
                transition: 'all .15s',
              }}>
                <span>{word}</span>
                <button onClick={() => removeWord(activeTab, word)} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-secondary)', display: 'flex',
                  padding: 0, fontSize: 16, lineHeight: 1,
                }}>
                  ×
                </button>
              </div>
            ))}
            {(!list[activeTab] || list[activeTab].length === 0) && (
              <div style={{ color: 'var(--text-secondary)', fontSize: 13, padding: '20px 0', width: '100%', textAlign: 'center' }}>
                {isAr ? 'لا توجد كلمات. أضف كلمات جديدة.' : 'No words yet. Add some words above.'}
              </div>
            )}
          </div>
        </div>

        {/* Footer — Save button */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={handleSave} disabled={saving} style={{
            padding: '10px 28px', borderRadius: 10, border: 'none',
            background: saving ? 'var(--bg-secondary)' : '#22C55E',
            color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700,
            opacity: saving ? 0.7 : 1,
          }}>
            {saving ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? '💾 حفظ القائمة' : '💾 Save List')}
          </button>
        </div>
      </div>

    </div>
  );
}