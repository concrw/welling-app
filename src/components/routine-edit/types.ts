export interface RoutineItem {
  id: string
  name: string
  time: string
  desc: string
  imgUrl?: string
  isEditingItem: boolean
  isConfirmingDelete: boolean
  isPicking: boolean
  editDraftName: string
  editDraftTime: string
  editDraftDesc: string
}

export interface RoutineGroup {
  id: string
  name: string
  items: RoutineItem[]
  isAdding: boolean
  newItemText: string
}
