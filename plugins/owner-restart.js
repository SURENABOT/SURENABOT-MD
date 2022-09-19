let handler = async (m) => {
    await m.reply('Restarting bot...')
    process.send('reset')
}
handler.command = /^(restart)$/i
handler.owner = true

module.exports = handler
