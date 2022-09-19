let handler = async (m) => {
    await m.reply('Restarting bot...')
    process.send('reset')
}
handler.command = /^(restart)$/i

module.exports = handler