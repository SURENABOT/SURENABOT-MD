/** 
 * Dont't edit or remove this file
 * -------------------------------
 * 
 * Special thanks to adiwajshing/Baileys for Baileys (library)
 *
 * GITHUB 😺
 * 
 * 
 * Surena: https://github.com/SURENABOT
 * Creator: https://github.com/nextamir
 * Baileys: https://github.com/adiwajshing/Baileys
 * -----------------------------------------------
 * 
 * Surena is the first and best Iranian WhatsApp bot with full customization
 * You can use and customize Surena for your personal or business needs
 * Don't forget to give a star on our github page for this reposity
 * ---------------------------------------------------------------
 * 
 * Creator WaLink: https://wa.me/989301860610
 * Surena Instagram: https://instagram.com/surenabot
 * -------------------------------------------------
 * 
 * © SURENABOT (GNU General Public License v3.0)
 * 
 * ┌─────────────────────────────────────────────────────────────────────────────────────┐
 * │┌───────────────────────────────────────────────────────────────────────────────────┐│
 * ││                                                                                   ││
 * ││  ┌───────────┐   ┌─┐     ┌─┐   ┌─────────┐  ┌───────┐ ┌───     ┌─┐        /\      ││
 * ││  │    ────┌─┐│   │ │     │ │   │ ┌─────┐ │  │ ┌─────┘ │   \    │ │       /  \     ││
 * ││  \     ───┘ └┘   │ │     │ │   │ └─────┘ │  │ │       │ │\ \   │ │      / /\ \    ││
 * ││   \     \        │ │     │ │   │ ┌──- -──┘  │ └─────┐ │ │ \ \  │ │     / /──\ \   ││
 * ││    \     \       │ │     │ │   │ │   \ \    │ ┌─────┘ │ │  \ \ │ │    / ────── \  ││
 * ││ ┌────     \      │ └─────┘ │   │ │    \ \   │ └─────┐ │ │   \ \│ │   / /      \ \ ││
 * ││ └──────────┘     └─────────┘   └─┘     \_\  └───────┘ └─┘    ────┘   ──        ── ││
 * ││                                                                                   ││
 * │└─────────────────────────────────── WHATSAPP BOT ──────────────────────────────────┘│
 * └─────────────────────────────────────────────────────────────────────────────────────┘
 * */

let fs = require('fs')

// ====== Bot setting ====== \\
global.bot = "SURENA"
global.wm = "BOT"

// ====== Stickers WM ====== \\
global.packname = bot
global.author = wm

// ====== Dont touch ====== \\
global.owner = JSON.parse(fs.readFileSync('./settings/owner.json'))
global.Intervalmsg = 1800

let chalk = require('chalk')
let file = require.resolve(__filename)
fs.watchFile(file, () => {
  fs.unwatchFile(file)
  console.log(chalk.redBright("config.js updated"))
  delete require.cache[file]
  require(file)
})