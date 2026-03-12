import makeWASocket, { useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys'
import P from 'pino'
import chalk from 'chalk'
import express from 'express'
import { config } from './config.js'
import { menu } from './plugins/menu.js'

const app = express()
app.get("/", (req,res)=> res.send("REAL HACKER BOT RUNNING"))
app.listen(3000)

async function startBot(){

const { state, saveCreds } = await useMultiFileAuthState("session")

const sock = makeWASocket({
logger: P({ level: "silent" }),
auth: state,
printQRInTerminal: false
})

sock.ev.on("creds.update", saveCreds)

sock.ev.on("connection.update", async (update)=>{

const { connection, lastDisconnect } = update

if(connection === "close"){

let reason = lastDisconnect?.error?.output?.statusCode

if(reason !== DisconnectReason.loggedOut){
console.log("Reconnecting...")
startBot()
}

}else if(connection === "open"){
console.log(chalk.green("BOT CONNECTED"))
}

})

if(!sock.authState.creds.registered){

const code = await sock.requestPairingCode(config.owner)
console.log("PAIR CODE:", code)

}

sock.ev.on("messages.upsert", async ({ messages })=>{

const m = messages[0]
if(!m.message) return

const text = m.message.conversation || ""
const prefix = config.prefix

if(!text.startsWith(prefix)) return

const cmd = text.slice(prefix.length).trim().split(" ")[0]

if(cmd === "menu"){
await sock.sendMessage(m.key.remoteJid,{text: menu("User")})
}

if(cmd === "ping"){
await sock.sendMessage(m.key.remoteJid,{text:"Bot is alive ✅"})
}

})

}

startBot()
