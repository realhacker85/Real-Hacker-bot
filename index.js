import makeWASocket, { useMultiFileAuthState } from '@whiskeysockets/baileys'
import P from 'pino'
import { config } from './config.js'
import { menu } from './plugins/menu.js'

async function startBot() {

const { state, saveCreds } = await useMultiFileAuthState("session")

const sock = makeWASocket({
logger: P({ level: "silent" }),
auth: state,
printQRInTerminal: false
})

sock.ev.on("creds.update", saveCreds)

if (!sock.authState.creds.registered) {
let number = config.owner
let code = await sock.requestPairingCode(number)
console.log("PAIR CODE:", code)
}

sock.ev.on("messages.upsert", async ({ messages }) => {

let m = messages[0]
if (!m.message) return

let text = m.message.conversation || ""
let prefix = config.prefix

if (!text.startsWith(prefix)) return

let command = text.slice(prefix.length).split(" ")[0]

if (command === "menu") {
await sock.sendMessage(m.key.remoteJid, {
text: menu("User")
})
}

})

}

startBot()
