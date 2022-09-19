let fs = require('fs')

let handler = async (m, { conn, args, isOwner }) => {
    if (!isOwner) return
    const json = JSON.parse(fs.readFileSync('./settings/owner.json'))

    let who
    if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : m.sender
    else who = args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : m.chat
    if (who == m.sender) {
        conn.sendMessage(m.chat, {
            text: 'Please insert new owner\'s phone number', templateButtons: [{ index: 1, urlButton: {
            displayText: 'Documents', url: 'https://www.github.com' }}], footer: 'Read documents' })
        return
    }

    const [result] = await conn.onWhatsApp(who)
    if (!result) {
        conn.sendMessage(m.chat, {
            text: 'This whatsapp account doesn\'t exist', templateButtons: [{ index: 1, urlButton: {
            displayText: 'Documents', url: 'https://www.github.com' }}], footer: 'Read documents' })
        return
    }

    if (json.includes(who.split`@`[0])) throw `${await conn.getName(who)} Already is an owner`
    json.push(`${who.split`@`[0]}`)
    fs.writeFileSync('./settings/owner.json', JSON.stringify(json))
    m.reply(`${await conn.getName(who)} Now is an owner!`)

    delete require.cache[require.resolve('../config')]
    require('../config')
}
handler.command = /^(addowner)$/i

module.exports = handler