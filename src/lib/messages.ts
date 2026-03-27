export type MessageRole = "host" | "client"

export type MessageThread = {
  id: string
  role: MessageRole
  name: string
  username: string
  lastMessage: string
  timestamp: string
}

export type ChatMessage = {
  id: string
  from: "host" | "client"
  text: string
  timestamp: string
}

const ACTIVE_ROLE_KEY = "messagesActiveRole"

export const MESSAGES: MessageThread[] = [
  {
    id: "host-msg-1",
    role: "host",
    name: "Mary Onyango",
    username: "maryo",
    lastMessage: "Thanks for confirming. I will arrive at 3 PM and call if I need anything.",
    timestamp: "Mar 20, 2026 4:12 PM",
  },
  {
    id: "host-msg-2",
    role: "host",
    name: "James Otieno",
    username: "jameso",
    lastMessage: "We loved the apartment. Could you share late checkout options?",
    timestamp: "Mar 19, 2026 9:05 AM",
  },
  {
    id: "host-msg-3",
    role: "host",
    name: "Aisha Njeri",
    username: "aishan",
    lastMessage: "Is there parking available overnight?",
    timestamp: "Mar 18, 2026 6:40 PM",
  },
  {
    id: "client-msg-1",
    role: "client",
    name: "Samuel Wanjala",
    username: "samwan",
    lastMessage: "Your booking is confirmed. Let me know if you need anything before check-in.",
    timestamp: "Mar 20, 2026 10:30 AM",
  },
  {
    id: "client-msg-2",
    role: "client",
    name: "Grace Mwangi",
    username: "gracem",
    lastMessage: "Happy to host you. The key will be with the guard by 2 PM.",
    timestamp: "Mar 19, 2026 8:14 PM",
  },
  {
    id: "client-msg-3",
    role: "client",
    name: "Brian Kamau",
    username: "briank",
    lastMessage: "Do you have recommendations for nearby restaurants?",
    timestamp: "Mar 18, 2026 1:55 PM",
  },
]

export const MESSAGE_LOGS: Record<string, ChatMessage[]> = {
  "host-msg-1": [
    { id: "hm1-1", from: "client", text: "Hi, is early check-in possible?", timestamp: "Mar 20, 2026 2:10 PM" },
    { id: "hm1-2", from: "host", text: "Yes, you can check in from 2 PM.", timestamp: "Mar 20, 2026 2:25 PM" },
    { id: "hm1-3", from: "client", text: "Thanks for confirming. I will arrive at 3 PM and call if I need anything.", timestamp: "Mar 20, 2026 4:12 PM" },
  ],
  "host-msg-2": [
    { id: "hm2-1", from: "client", text: "We loved the apartment.", timestamp: "Mar 19, 2026 8:50 AM" },
    { id: "hm2-2", from: "client", text: "Could you share late checkout options?", timestamp: "Mar 19, 2026 9:05 AM" },
    { id: "hm2-3", from: "host", text: "Late checkout is possible for an extra fee. I can share details.", timestamp: "Mar 19, 2026 9:20 AM" },
  ],
  "host-msg-3": [
    { id: "hm3-1", from: "client", text: "Is there parking available overnight?", timestamp: "Mar 18, 2026 6:40 PM" },
    { id: "hm3-2", from: "host", text: "Yes, secure parking is available at the property.", timestamp: "Mar 18, 2026 6:55 PM" },
  ],
  "client-msg-1": [
    { id: "cm1-1", from: "host", text: "Your booking is confirmed.", timestamp: "Mar 20, 2026 10:30 AM" },
    { id: "cm1-2", from: "host", text: "Let me know if you need anything before check-in.", timestamp: "Mar 20, 2026 10:31 AM" },
    { id: "cm1-3", from: "client", text: "Thank you! Looking forward to it.", timestamp: "Mar 20, 2026 10:40 AM" },
  ],
  "client-msg-2": [
    { id: "cm2-1", from: "host", text: "Happy to host you. The key will be with the guard by 2 PM.", timestamp: "Mar 19, 2026 8:14 PM" },
    { id: "cm2-2", from: "client", text: "Perfect, see you tomorrow.", timestamp: "Mar 19, 2026 8:20 PM" },
  ],
  "client-msg-3": [
    { id: "cm3-1", from: "client", text: "Do you have recommendations for nearby restaurants?", timestamp: "Mar 18, 2026 1:55 PM" },
    { id: "cm3-2", from: "host", text: "Yes. Try the coastal grill and the rooftop cafe downtown.", timestamp: "Mar 18, 2026 2:05 PM" },
  ],
}

export const getMessagesForRole = (role: MessageRole) =>
  MESSAGES.filter((item) => item.role === role)

export const getMessageThread = (id: string) =>
  MESSAGES.find((item) => item.id === id)

export const getMessageLog = (id: string) => MESSAGE_LOGS[id] ?? []

export const setActiveMessageRole = (role: MessageRole) => {
  if (typeof window === "undefined") return
  window.localStorage.setItem(ACTIVE_ROLE_KEY, role)
}

export const getActiveMessageRole = (): MessageRole | null => {
  if (typeof window === "undefined") return null
  const stored = window.localStorage.getItem(ACTIVE_ROLE_KEY)
  if (stored === "host" || stored === "client") return stored
  return null
}

