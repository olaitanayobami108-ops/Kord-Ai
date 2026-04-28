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

async function sock() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR)
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: true,
    logger: pino({ level: "silent" }),
    browser: ["Kord Bot", "Chrome", "1.0.0"]
  })

  // save session properly
  sock.ev.on("creds.update", saveCreds)

  // connection handler
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
          sock()
        }, 3000)
      } else {
        console.log("⛔ Stopped reconnecting (logged out or limit reached)")
      }
    }
  })

  // message listener (safe hook point)
  sock.ev.on("messages.upsert", ({ messages }) => {
    const msg = messages?.[0]
    if (!msg?.message) return

    // connect your handlers here if needed
    // require("../handler/msg")(sock, msg)
  })

  return sock
}

module.exports = { sock }