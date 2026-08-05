const ko = {
  messagesTitle: '메시지',
  inputPlaceholder: '메시지를 입력하세요',
  messageTime: (d: Date) => d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
}

const en: typeof ko = {
  messagesTitle: 'Messages',
  inputPlaceholder: 'Type a message',
  messageTime: (d: Date) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
}

export const chat = { ko, en }
