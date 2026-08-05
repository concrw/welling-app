import type { RoutineItem } from './types'
import { useMessages } from '../../i18n'

const AVAIL_IMGS = [
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&q=80',
  'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=200&q=80',
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=200&q=80',
  'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=200&q=80',
]

export function RoutineItemRow({
  item,
  onUpdate,
  onDelete,
}: {
  item: RoutineItem
  onUpdate: (patch: Partial<RoutineItem>) => void
  onDelete: () => void
}) {
  const M = useMessages()
  return (
    <div style={{ padding: '10px 16px', borderBottom: '1px solid #F5F5F5' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div onClick={() => onUpdate({ isPicking: !item.isPicking })} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, cursor: 'pointer', flexShrink: 0 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, overflow: 'hidden', background: '#F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px dashed #C8973A', position: 'relative' }}>
            {item.imgUrl ? (
              <div style={{ width: '100%', height: '100%', backgroundSize: 'cover', backgroundPosition: 'center', backgroundImage: `url(${item.imgUrl})` }} />
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="10" rx="2" stroke="#C8973A" strokeWidth="1.4"/><circle cx="6" cy="6.5" r="1" fill="#C8973A"/><path d="M2 10l3-3 2.5 2.5L10 7l4 4" stroke="#C8973A" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            )}
          </div>
          <span style={{ fontSize: 9, color: '#C8973A', fontWeight: 600, letterSpacing: '.04em' }}>{M.routineEdit.imageLabel}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#333333', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</span>
            <span style={{ fontSize: 11, color: '#BBBBBB', flexShrink: 0 }}>{item.time}</span>
          </div>
          {item.desc && <p style={{ margin: '2px 0 0', fontSize: 11, color: '#AAAAAA', lineHeight: 1.4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.desc}</p>}
        </div>
        <button onClick={() => onUpdate({ isEditingItem: true, editDraftName: item.name, editDraftTime: item.time, editDraftDesc: item.desc })} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z" stroke="#AAAAAA" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <button onClick={() => onUpdate({ isConfirmingDelete: true })} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><line x1="3" y1="3" x2="11" y2="11" stroke="#CCCCCC" strokeWidth="1.6" strokeLinecap="round"/><line x1="11" y1="3" x2="3" y2="11" stroke="#CCCCCC" strokeWidth="1.6" strokeLinecap="round"/></svg>
        </button>
      </div>

      {item.isConfirmingDelete && (
        <div style={{ marginTop: 8, padding: '10px 12px', background: '#FFF5F5', borderRadius: 10, border: '1px solid #FFDDDD', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, color: '#CC3333', fontWeight: 600 }}>{M.routineEdit.deleteConfirm}</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={onDelete} style={{ padding: '5px 12px', borderRadius: 7, background: '#CC3333', color: '#fff', fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer' }}>{M.common.delete}</button>
            <button onClick={() => onUpdate({ isConfirmingDelete: false })} style={{ padding: '5px 10px', borderRadius: 7, background: 'transparent', color: '#AAAAAA', fontSize: 11, border: '1px solid #EBEBEB', cursor: 'pointer' }}>{M.common.cancel}</button>
          </div>
        </div>
      )}

      {item.isEditingItem && (
        <div style={{ marginTop: 10, padding: 12, background: '#FFFFFF', borderRadius: 10, border: '1px solid #E8E0D0', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={item.editDraftName} onChange={(e) => onUpdate({ editDraftName: e.target.value })} placeholder={M.routineEdit.namePlaceholder} style={{ flex: 2, padding: '8px 10px', borderRadius: 8, border: '1px solid #EBEBEB', fontSize: 13, outline: 'none', background: '#FAFAFA' }} />
            <input value={item.editDraftTime} onChange={(e) => onUpdate({ editDraftTime: e.target.value })} placeholder={M.routineEdit.timePlaceholder} style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '1px solid #EBEBEB', fontSize: 13, outline: 'none', background: '#FAFAFA' }} />
          </div>
          <textarea value={item.editDraftDesc} onChange={(e) => onUpdate({ editDraftDesc: e.target.value })} placeholder={M.routineEdit.descPlaceholder} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #EBEBEB', fontSize: 13, outline: 'none', background: '#FAFAFA', resize: 'none', height: 72, fontFamily: "'Plus Jakarta Sans','Noto Sans KR',sans-serif", lineHeight: 1.6 }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => onUpdate({ name: item.editDraftName, time: item.editDraftTime, desc: item.editDraftDesc, isEditingItem: false })} style={{ flex: 1, padding: '8px 0', borderRadius: 8, background: '#111111', color: '#fff', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer' }}>{M.common.save}</button>
            <button onClick={() => onUpdate({ isEditingItem: false })} style={{ flex: 1, padding: '8px 0', borderRadius: 8, background: 'transparent', color: '#AAAAAA', fontSize: 12, border: '1px solid #EBEBEB', cursor: 'pointer' }}>{M.common.cancel}</button>
          </div>
        </div>
      )}

      {item.isPicking && (
        <div style={{ marginTop: 10, padding: 10, background: '#FAFAFA', borderRadius: 10, border: '1px solid #EBEBEB' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#AAAAAA', letterSpacing: '.06em', textTransform: 'uppercase' }}>{M.routineEdit.pickImage}</span>
            <button onClick={() => onUpdate({ isPicking: false })} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: '#AAAAAA', padding: 0 }}>{M.common.close}</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
            {AVAIL_IMGS.map((url) => (
              <div key={url} onClick={() => onUpdate({ imgUrl: url, isPicking: false })} style={{ aspectRatio: '1', borderRadius: 8, overflow: 'hidden', cursor: 'pointer', backgroundSize: 'cover', backgroundPosition: 'center', backgroundImage: `url(${url})`, border: '1.5px solid #EBEBEB' }} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
