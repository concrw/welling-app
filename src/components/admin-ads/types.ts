export type ClickAction = 'link' | 'modal' | 'page'

export interface AdSlot {
  id: string
  slotName: string
  brand: string
  desc: string
  clickAction: ClickAction
  url: string
  modalTitle: string
  modalBody: string
  pageId: string
}
