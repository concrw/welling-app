import type { AdSlot } from './types'
import { useMessages } from '../../i18n'

interface AdSlotCardProps {
  origSlot: AdSlot
  slot: AdSlot
  isOpen: boolean
  update: (id: string, patch: Partial<AdSlot>) => void
  startEdit: (id: string) => void
  cancelEdit: (id: string) => void
  save: (id: string) => void
}

export function AdSlotCard({ origSlot, slot, isOpen, update, startEdit, cancelEdit, save }: AdSlotCardProps) {
  const M = useMessages()
  const typeLabel = { link: M.adminAds.typeLink, modal: M.adminAds.typeModal, page: M.adminAds.typePage }
  const actionBtnStyle = (active: boolean) => ({
    padding: '6px 14px', borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: 'pointer',
    background: active ? '#111111' : 'transparent', color: active ? '#fff' : '#111111', border: `1px solid ${active ? '#111111' : '#EBEBEB'}`
  } as React.CSSProperties)

  return (
    <div style={{ borderRadius: 12, background: '#FAFAFA', border: '1px solid #EBEBEB', overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #EBEBEB' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#111111' }}>{origSlot.slotName}</span>
        {isOpen ? (
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => cancelEdit(origSlot.id)} style={{ padding: '5px 11px', borderRadius: 6, background: 'transparent', color: '#AAAAAA', fontSize: 11, fontWeight: 600, border: '1px solid #EBEBEB', cursor: 'pointer' }}>{M.common.cancel}</button>
            <button onClick={() => save(origSlot.id)} style={{ padding: '5px 11px', borderRadius: 6, background: '#111111', color: '#fff', fontSize: 11, fontWeight: 600, border: 'none', cursor: 'pointer' }}>{M.common.save}</button>
          </div>
        ) : (
          <button onClick={() => startEdit(origSlot.id)} style={{ padding: '5px 11px', borderRadius: 6, background: 'transparent', color: '#111111', fontSize: 11, fontWeight: 600, border: '1px solid #EBEBEB', cursor: 'pointer' }}>{M.common.edit}</button>
        )}
      </div>

      {!isOpen && (
        <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: '0 0 2px', fontSize: 12, fontWeight: 700, color: '#111111' }}>{slot.brand || '—'}</p>
            <p style={{ margin: 0, fontSize: 11, color: '#AAAAAA', fontWeight: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{slot.desc || '—'}</p>
          </div>
          <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 4, background: '#F0F0F0', color: '#666666', fontWeight: 600, flexShrink: 0, letterSpacing: '.04em' }}>{typeLabel[slot.clickAction]}</span>
        </div>
      )}

      {isOpen && (
        <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: 10, fontWeight: 700, color: '#AAAAAA', letterSpacing: '.08em', textTransform: 'uppercase' }}>{M.adminAds.fieldBrand}</p>
            <input value={slot.brand} onChange={(e) => update(origSlot.id, { brand: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #EBEBEB', fontSize: 13, background: '#fff', color: '#111111', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: 10, fontWeight: 700, color: '#AAAAAA', letterSpacing: '.08em', textTransform: 'uppercase' }}>{M.adminAds.fieldDesc}</p>
            <input value={slot.desc} onChange={(e) => update(origSlot.id, { desc: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #EBEBEB', fontSize: 13, background: '#fff', color: '#111111', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <p style={{ margin: '0 0 6px', fontSize: 10, fontWeight: 700, color: '#AAAAAA', letterSpacing: '.08em', textTransform: 'uppercase' }}>{M.adminAds.fieldClickAction}</p>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => update(origSlot.id, { clickAction: 'link' })} style={actionBtnStyle(slot.clickAction === 'link')}>{M.adminAds.actionLink}</button>
              <button onClick={() => update(origSlot.id, { clickAction: 'modal' })} style={actionBtnStyle(slot.clickAction === 'modal')}>{M.adminAds.actionModal}</button>
              <button onClick={() => update(origSlot.id, { clickAction: 'page' })} style={actionBtnStyle(slot.clickAction === 'page')}>{M.adminAds.actionPage}</button>
            </div>
          </div>
          {slot.clickAction === 'link' && (
            <div>
              <p style={{ margin: '0 0 4px', fontSize: 10, fontWeight: 700, color: '#AAAAAA', letterSpacing: '.08em', textTransform: 'uppercase' }}>{M.adminAds.fieldUrl}</p>
              <input value={slot.url} onChange={(e) => update(origSlot.id, { url: e.target.value })} placeholder={M.adminAds.urlPlaceholder} style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #EBEBEB', fontSize: 13, background: '#fff', color: '#111111', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          )}
          {slot.clickAction === 'modal' && (
            <>
              <div>
                <p style={{ margin: '0 0 4px', fontSize: 10, fontWeight: 700, color: '#AAAAAA', letterSpacing: '.08em', textTransform: 'uppercase' }}>{M.adminAds.fieldModalTitle}</p>
                <input value={slot.modalTitle} onChange={(e) => update(origSlot.id, { modalTitle: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #EBEBEB', fontSize: 13, background: '#fff', color: '#111111', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <p style={{ margin: '0 0 4px', fontSize: 10, fontWeight: 700, color: '#AAAAAA', letterSpacing: '.08em', textTransform: 'uppercase' }}>{M.adminAds.fieldModalBody}</p>
                <textarea value={slot.modalBody} onChange={(e) => update(origSlot.id, { modalBody: e.target.value })} rows={3} style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #EBEBEB', fontSize: 13, background: '#fff', color: '#111111', outline: 'none', boxSizing: 'border-box', resize: 'none', lineHeight: 1.6, fontFamily: 'inherit' }} />
              </div>
            </>
          )}
          {slot.clickAction === 'page' && (
            <div>
              <p style={{ margin: '0 0 4px', fontSize: 10, fontWeight: 700, color: '#AAAAAA', letterSpacing: '.08em', textTransform: 'uppercase' }}>{M.adminAds.fieldPageId}</p>
              <input value={slot.pageId} onChange={(e) => update(origSlot.id, { pageId: e.target.value })} placeholder={M.adminAds.pageIdPlaceholder} style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #EBEBEB', fontSize: 13, background: '#fff', color: '#111111', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
