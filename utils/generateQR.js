import QRCode from "qrcode"
import crypto from "crypto"

// generateQR takes a ticketNumber and returns:
//   qrToken — a secure random string stored in DB and encoded in QR
//   qrData  — a base64 PNG image of the QR code shown to the user
//
// The QR encodes qrToken only — never personal details.
// At the door the scanner reads qrToken → sends to backend → backend validates.

const generateQR = async (ticketNumber) => {
  // 1. Create a secure random token tied to this ticket
  const qrToken = crypto
    .randomBytes(32)
    .toString("hex")

  // 2. Build the payload string encoded inside the QR
  //    Format: "SN:{ticketNumber}:{qrToken}"
  const payload = `SN:${ticketNumber}:${qrToken}`

  // 3. Render the QR code as a base64 PNG data URL
  const qrData = await QRCode.toDataURL(payload, {
    errorCorrectionLevel: "H",  // highest error correction
    width:                300,   // 300x300 px
    margin:               2,
    color: {
      dark:  "#000000",
      light: "#ffffff",
    },
  })

  return { qrToken, qrData }
}

export default generateQR