const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason
} = require("@whiskeysockets/baileys")

const pino = require("pino")

let reconnectCount = 0
const MAX_RECONNECT = 10

const AUTH_DIR = "./session"

async function startSock() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR)
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: true,
    logger: pino({ level: "silent" }),
    browser: ["Kord Bot", "Chrome", "1.0.0"]
  })

  sock.ev.on("creds.update", saveCreds)

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update

    if (connection === "open") {
      console.log("✅ Bot connected successfully")
      reconnectCount = 0
    }

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode

      const shouldReconnect =
        statusCode !== DisconnectReason.loggedOut

      console.log("❌ Connection closed. Code:", statusCode)

      if (shouldReconnect && reconnectCount < MAX_RECONNECT) {
        reconnectCount++

        console.log(`🔄 Reconnecting... (${reconnectCount})`)

        setTimeout(() => {
          startSock()
        }, 3000)
      } else {
        console.log("⛔ Stopped reconnecting")
      }
    }
  })

  sock.ev.on("messages.upsert", ({ messages }) => {
    const msg = messages?.[0]
    if (!msg?.message) return
  })

  return sock
}

module.exports = { startSock }