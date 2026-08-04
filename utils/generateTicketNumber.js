// Generates a unique ticket number
// Format: SN-{YEAR}-{5 random alphanumeric chars}
// Example: SN-2026-A7X9K

const generateTicketNumber = () => {
  const year  = new Date().getFullYear()
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let suffix  = ""

  for (let i = 0; i < 5; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)]
  }

  return `SN-${year}-${suffix}`
}

export default generateTicketNumber