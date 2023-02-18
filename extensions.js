const extensions = {
  add: async (m, { sock, args, participants, command }) => {
    let person = m.quoted?.sender || m.mentionedJid?.[0] || args?.[0] || null
    if (!person) throw 'Please enter user\'s phone number'

    let [result] = await sock.onWhatsApp(person)
    if (!result) throw 'The user does not exist in WhatsApp!'
    else person = result.jid

    let isMember = participants.some(P => P.id.includes(person))

    switch (command) {
      case 'add':
        if (isMember) throw `@${person.split`@`[0]} Is already added to group.!`
        await sock.groupParticipantsUpdate(m.chat, [person], 'add')
      break
      case 'kick':
        if (!isMember) throw `@${person.split`@`[0]} Does not exist in group!`
        await sock.groupParticipantsUpdate(m.chat, [person], 'remove')
      break
    }

    await sock.react({ chat: m.chat, text: '✅', key: m.key })
  },
  block: async (m, { args, command }) => {
    let person = m.quoted?.sender || m.mentionedJid?.[0] || args?.[0] || (m.isGroup ? null : m.chat)
    if (!person) throw 'Please enter user\'s phone number'

    let [result] = await sock.onWhatsApp(person)
    if (!result) throw 'The user does not exist in WhatsApp!'
    else person = result.jid

    let blocklist = await sock.fetchBlocklist()
    let isBlocked = blocklist.some(item => item.includes(person))

    switch (command) {
      case 'block':
        if (isBlocked) throw 'You already blocked @' + person.split`@`[0]
        await sock.updateBlockStatus(person, 'block')
        await sock.react({ chat: m.chat, text: '🔒', key: m.key })
      break
        case 'unblock':
        if (!isBlocked) throw 'You did not blocked @' + person.split`@`[0]
        await sock.updateBlockStatus(person, 'unblock')
        await sock.react({ chat: m.chat, text: '🔓', key: m.key })
      break
    }
  },
  blocklist: async (m) => {
    let blocklist = await sock.fetchBlocklist()
    if (blocklist.length <= 0) throw 'You have no blocked contacts'
  
    let result = []
    for (let contact of blocklist) result += '\n○ wa.me/' + contact.split`@`[0]
    if (m.isGroup) m.reply('*Your block list has been sent to your private chat*')
    sock.sendText({ chat: m.sender, text: `*Total blocked contacts: ${blocklist.length}*\n${result}`, quoted: m })
  },
  calculator: async (m, { text }) => {
    if (!text) throw 'Please enter the math equation to solve'
    text = text
    .replace(/[^0-9\-\/+*×÷πEe()piPI/]/g, '')
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/π|pi/gi, 'Math.PI')
    .replace(/e/gi, 'Math.E')
    .replace(/\/+/g, '/')
    .replace(/\++/g, '+')
    .replace(/-+/g, '-')

    let format = text.replace(/Math\.PI/g, 'π').replace(/Math\.E/g, 'e').replace(/\//g, '÷').replace(/\*/g, '×')

    try {
      let result = new Function('return ' + text)()
      let caption = format + ' *=* ' + result

      m.isGroup ? m.reply(caption) : sock.sendCopy({ chat: m.chat, caption: caption, footer: wm, display: 'Copy Result', text: result })
    } catch(e) { throw 'Format is incorrect. Please use only -, +, *, /, ×, ÷, π, e, (, ) symbols.' }
  },
  contact: async (m, { args }) => {
    let person = m.quoted?.sender || m.mentionedJid?.[0] || args?.[0] || m.sender

    let [result] = await sock.onWhatsApp(person)
    if (!result) throw 'The user does not exist in WhatsApp!'
    else person = result.jid

    let name = await sock.getName(person)
    let phonenum = person.split`@`[0]

    await sock.sendContact({ chat: m.chat, number: phonenum, name: name, quoted: m })
  },
  device: async (m) => {  
    let device = (m.quoted || m).device
    await sock.sendText({ chat: m.chat, text: `Message was sent from *${device}* WhatsApp version!` })
    await sock.react({ chat: m.chat, text: { android: '📱', ios: '🍎', web: '🖥' }[device], key: (m.quoted?.obj.key || m.key) })
  },
  enable: async (m, { sock, usedPrefix, command, args, isOwner, isAdmin }) => {
    let isEnable = /enable/i.test(command)
    let chat = db.data.chats[m.chat]
    let setting = db.data.settings[sock.user.jid]
    let type = (args[0] || '').toLowerCase()
    let isAll = false

    switch (type) {
      case 'public':
        if (!isOwner) return global.dfail('owner', m, sock)
        isAll = true
        setting.self = !isEnable
      break
      case 'grouponly':
        if (!isOwner) return global.dfail('owner', m, sock)
        isAll = true
        setting.groupOnly = isEnable
      break
      case 'antilink':
        if (!m.isGroup) return global.dfail('group', m, sock)
        if (!isAdmin) return global.dfail('admin', m, sock)
        chat.antiLink = isEnable
      break
      case 'detect':
        if (!m.isGroup) return global.dfail('group', m, sock)
        if (!isAdmin) return global.dfail('admin', m, sock)
        chat.detect = isEnable
      break
      case 'welcome':
        if (!m.isGroup) return global.dfail('group', m, sock)
        if (!isAdmin) return global.dfail('admin', m, sock)
        chat.welcome = isEnable
      break
      case 'autoread':
        if (!m.isGroup) return global.dfail('group', m, sock)
        if (!isOwner) return global.dfail('owner', m, sock)
        chat.autoread = isEnable
      break
      default: if (!/[01]/.test(command)) throw `┌〔 Options 〕\n│ ${isOwner ? '\n├○ public\n├○ grouponly\n├○ autoread' : ''}\n├○ detect\n├○ welcome\n├○ antilink\n└───────\n\nFor example:\n\n${usedPrefix}enable welcome\n${usedPrefix}disable welcome`
    }
    m.reply(`*${type}* successfully *${isEnable ? 'enabled' : 'disabled'}*${isAll ? ' for bot' : ' for this chat'}`)
  },
  extensions: async(m, { usedPrefix }) => {
    let Result = ''
    for (let i of global.extentions) {
      try{
        let o = global.extentionsdata
        let extn_help = o[i.name].help ? `○ *Help:* ${Array.isArray(o[i.name].help) ? o[i.name].help : [o[i.name].help]}\n` : '' 
        let extn_tags = o[i.name].tags ? `○ *Tags:* ${Array.isArray(o[i.name].tags) ? o[i.name].tags : [o[i.name].tags]}\n` : ''
        let extn_desc = o[i.name].desc ? `○ *Description:* ${Array.isArray(o[i.name].desc) ? o[i.name].desc : [o[i.name].desc]}\n` : '' 
        let extn_command = o[i.name].command ? `○ *Command:* ${usedPrefix + Array.isArray(o[i.name].command) ? o[i.name].command : [o[i.name].command]}\n` : '' 
        Result += `\n● *${i.name}*\n` + extn_help + extn_tags + extn_desc + extn_command + '──────•'
      } catch(e) {}
    } m.reply(`*● Total Extentions:* ${global.extentions.length}\n${Result}`)
  },
  invite: async (m, { sock, args }) => {
    let person = m.quoted?.sender || m.mentionedJid?.[0] || args?.[0] || null
    if (!person) throw 'Please enter user\'s phone number'
  
    let [result] = await sock.onWhatsApp(person)
    if (!result) throw 'The user does not exist in WhatsApp!'
    else person = result.jid
  
    let maincap = 'Follow this link to join my WhatsApp group:'
    let caption = m.quoted ? args.length > 0 ? args.join(' ') : maincap : args[1] ? args.slice(1).join(' ') : maincap

    await sock.sendText({ chat: person, text: caption + ' https://chat.whatsapp.com/' + await sock.groupInviteCode(m.chat) })
    await m.reply('*Group invitation link has been sent to* @' + person.split`@`[0])
  },
  leave: async (m) => { 
    await sock.groupLeave(m.chat) 
  },
  menu: async (m, { sock, usedPrefix: _p, args }) => {
    let item = `${args[0]}`.toLowerCase()
    let menu = ['all', 'main', 'sticker', 'administrator', 'group', 'internet', 'logo', 'downloader', 'tools', 'fun', 'database', 'audio', 'info', 'owner']
    item = menu.includes(item) ? item : '404'
    let tags
    if (item == 'all') {
      tags = {
        'main': 'Main',
        'sticker': 'Sticker',
        'administrator': 'Administrator',
        'group': 'Group',
        'internet': 'Internet',
        'logo': 'Logo & Img',
        'downloader': 'Downloader',
        'tools': 'Tools',
        'fun': 'Fun',
        'database': 'Database',
        'audio': 'Audio',
        'info': 'Info',
        'owner': 'Owner'
      }
    } else tags = { [item]: menu.includes(item) ? `${item[0].toUpperCase()}${item.slice(1)}` : '404'}

    try {
      let date = (new Date).toLocaleDateString('us', { day: 'numeric', month: 'numeric', year: 'numeric' })
      let res = await fetch('https://raw.githubusercontent.com/SURENABOT/SURENA-DATA/main/json/quotes.json')
      let json = await res.json()
      let quote = sock.pickRandom(json)
      let message = `*_${quote.text}_*\n\n_from: ${quote.from}_\n\n● *ᴜsᴇʀ ɴᴀᴍᴇ:* ${sock.getName(m.sender)}\n● *ʙᴏᴛ ɴᴀᴍᴇ:* ${global.botname}\n● *ᴛᴏᴛᴀʟ ᴇxᴛᴇɴᴛɪᴏɴs:* ${global.extentions.length}\n● *ᴅᴀᴛᴇ:* ${date}\n● *ᴜᴘᴛɪᴍᴇ:* ${clockString(process.uptime() * 1000)}\n● *ᴠᴇʀsɪᴏɴ:* ${version}`

      if (item == '404') {
        const rows = [
          { title: 'All Comands', rowId: `${_p}menu all` },
          { title: 'Main', rowId: `${_p}menu main` },
          { title: 'Sticker', rowId: `${_p}menu sticker` },
          { title: 'Administrator', rowId: `${_p}menu administrator` },
          { title: 'Group', rowId: `${_p}menu group` },
          { title: 'Internet', rowId: `${_p}menu internet` },
          { title: 'Logo & Img', rowId: `${_p}menu logo` },
          { title: 'Downloader', rowId: `${_p}menu downloader` },
          { title: 'Tools', rowId: `${_p}menu tools` },
          { title: 'Fun', rowId: `${_p}menu fun`},
          { title: 'Database', rowId: `${_p}menu database` },
          { title: 'Audio', rowId: `${_p}menu audio` },
          { title: 'Info', rowId: `${_p}menu info` },
          { title: 'Owner', rowId: `${_p}menu owner` }
        ]

        const listMessage = {
          description: message,
          footerText: '',
          buttonText: 'List',
          title: 'Menu List'
        }

        return sock.sendListM(m.chat, listMessage, rows)
      }

      let o = global.extentionsdata
      let help = global.extentions.map(i => ({
        help: Array.isArray(o[i.name].help) ? o[i.name].help : [o[i.name].help], 
        tags: Array.isArray(o[i.name].tags) ? o[i.name].tags : [o[i.name].tags]
      }))

      let text = [message + '\n']

      Object.keys(tags).forEach(tag => {
        let category = `┌─( *${tags[tag]}* )`
        let categoryHelp = help.filter(menu => menu.tags && menu.tags.includes(tag) && menu.help).map(menu => menu.help).flat().map(cmdHelp => `│ ○ ${cmdHelp}`).join`\n`
        text.push(`${category}\n${categoryHelp ? categoryHelp + '\n' : ''}└──•\n`)
      })

      text.push('𝟷. ᴅᴏɴ\'ᴛ ғᴏʀɢᴇᴛ ᴛᴏ ɢɪᴠᴇ ᴀ sᴛᴀʀ ᴏɴ ᴏᴜʀ ɢɪᴛʜᴜʙ ᴘᴀɢᴇ ғᴏʀ ᴛʜɪs ʀᴇᴘᴏsɪᴛʏ\n\n𝟸. ʏᴏᴜ ᴄᴀɴ ᴜsᴇ ᴀɴᴅ ᴄᴜsᴛᴏᴍɪᴢᴇ sᴜʀᴇɴᴀ ғᴏʀ ʏᴏᴜʀ ᴘᴇʀsᴏɴᴀʟ ᴏʀ ʙᴜsɪɴᴇss ɴᴇᴇᴅs\n\n𝟹. sᴜʀᴇɴᴀ ɪs ʙᴇsᴛ ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ ᴡɪᴛʜ ғᴜʟʟ ᴄᴜsᴛᴏᴍɪᴢᴀᴛɪᴏɴ')

      await sock.sendButtonImg(m.chat, await (await fetch(global.logo)).buffer(), text.join('\n'), wm, 'Extensions', _p + 'extensions', m, {
        jpegThumbnail: await (await fetch(global.logo)).buffer(),
        contextInfo: global.adReply
      })
    } catch(e) { throw e }

    function clockString(ms) {
      let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
      let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
      let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
      return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
    }
  },
  pin: async (m, { command }) => {
    switch (command) {
      case 'pin': await sock.chatModify({ pin: 1 }, m.chat); break
      case 'unpin': await sock.chatModify({ pin: 0 }, m.chat); break
    }
  
    await sock.react({ chat: m.chat, text: '📌', key: m.key })
  },
  profile: async (m, { args }) => {
    let person = m.quoted?.sender || m.mentionedJid?.[0] || args?.[0] || m.sender
    if (!person) throw 'Please enter user\'s phone number'
  
    let [result] = await sock.onWhatsApp(person)
    if (!result) throw 'The user does not exist in WhatsApp!'
    else person = result.jid
  
    let pp = await sock.profilePictureUrl(person, 'image').catch(() => 'https://telegra.ph/file/24fa902ead26340f3df2c.png')
    let status = await sock.fetchStatus(person)
    let name = await sock.getName(person)
    let phonenum = await person.split`@`[0]
  
    let caption =`○ *Name:* ${name}\n○ *Phone number:* ${phonenum}\n○ *Link:* wa.me/${phonenum}\n\n○ *Status:*\n${status.status}\n\n○ *Status SetAt:*\n${status.setAt}`
    sock.sendMedia({ chat: m.chat, file: pp, contextInfo: global.contextInfo, caption: caption, quoted: m })
  },
  promote: async (m, { sock, args, participants, command }) => {
    let person = m.quoted?.sender || m.mentionedJid?.[0] || args?.[0] || null
    if (!person) throw 'Please enter user\'s phone number'

    let [result] = await sock.onWhatsApp(person)
    if (!result) throw 'The user does not exist in WhatsApp!'
    else person = result.jid
  
    let isMember = participants.some(P => P.id.includes(person))
    if (!isMember) throw `The user does not exist in this group!`
    let isAdmin = participants.find(P => P.id == person).admin
  
    switch (command) {
      case 'promote':
        if (isAdmin) throw `@${person.split`@`[0]} Is an admin!`
        await sock.groupParticipantsUpdate(m.chat, [person], 'promote')
        await sock.react({ chat: m.chat, text: '🔺', key: m.key })
        await m.reply(`*@${person.split`@`[0]} Promoted to admin!*`)
      break
      case 'demote':
        if (!isAdmin) throw `@${person.split`@`[0]} Is not an admin!`
        await sock.groupParticipantsUpdate(m.chat, [person], 'demote')
        await sock.react({ chat: m.chat, text: '🔻', key: m.key })
        await m.reply(`*@${person.split`@`[0]} Demoted to participant!*`)
      break
    }
  },
  readmore: async (m, { text }) => { 
    const more = String.fromCharCode(8206)
    const readMore = more.repeat(3075)
    m.reply(text ? text.replace(/\+/g, readMore) : readMore) 
  },
  say: async (m, { text }) => {
    m.reply(text ? text : 'Please enter text to say') 
  },
  setgpp: async (m) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
  
    if (!/image\/(png|jpe?g|gif|webp)/.test(mime)) throw 'Reply to the image you want to set as the group profile picture'
    let media = await q.download()
  
    await sock.updateProfilePicture(m.chat, media)
    await sock.react({ chat: m.chat, text: '✅', key: m.key })
  },
  sticker: async (m, { sock }) => {
    const { Sticker, StickerTypes } = require('./lib/sticker')

    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || null
  
    if (!mime || !/image|webp|video/.test(mime)) throw 'Reply to the video/image file to create new sticker'
    //if(/video/.test(mime)) throw 'Creating animated stickers is not supported yet'
    if (/video/.test(mime) && (q.msg || q).seconds > 11) throw 'Maximum video duration is 11 seconds!'
  
    let file = await q.download()
    let sticker = new Sticker(file, {
      pack: global.botname,
      author: 'github: surenabot',
      type: StickerTypes.DEFAULT // Types: DEFAULT, FULL, CROPPED
    })

    await sock.sendSticker({ chat: m.chat, sticker: await sticker.get(), quoted: m })
  },
  tomedia: async (m, { sock }) => {
    let { topng, tomp4 } = require('./lib/sconverter')

    if (!/webp/.test(m.quoted ? m.quoted.mimetype : null)) throw 'Please reply to sticker'
    let media = await m.quoted.download()
    let output = (m.quoted.isAnimated ? await tomp4(media) : await topng(media))

    sock.sendFile(m.chat, output, m.quoted.isAnimated ? 'stovideo.mp4' : 'stoimage.png', null, m, false, { 
      jpegThumbnail: await (await fetch(output)).buffer(), 
      contextInfo: global.adReply 
    })
  },
  translate: async (m, { args, usedPrefix, command }) => {
    const translate = require('./lib/translate')

    let tfromlang = 'cn'
  
    let lang = args[0]
    let content = args.slice(1).join(' ')
    if ((args[0] || '').length != 2)  {
      lang = 'en'
      content = args.join(' ')
    }

    if (!content && m.quoted && m.quoted.text) content = m.quoted.text
    if (!content && !m.quoted) throw `Please enter lang & text to translate!\n\nFor example:\n\n${usedPrefix + command} ar Hello world!\n${usedPrefix + command} en مرحبا بالعالم`

    try { 
      m.reply(`${await translate(content, tfromlang, lang)}`)
    } catch(e) { throw e }
  },
  tts: async (m, { sock, args, usedPrefix, command }) => {
    const gtts = require('./lib/tts')

    let lang = args[0]
    let content = args.slice(1).join(' ')
    if ((args[0] || '').length != 2) {
      lang = 'en'
      content = args.join(' ')
    }

    if (!content && m.quoted && m.quoted.text) content = m.quoted.text
    if (!content && !m.quoted) {
      let text = `\`\`\`Please enter lang & text to speech!\n\nFor example:\n\n${usedPrefix + command} en Hello world!\n${usedPrefix + command} ar مرحبا بالعالم\`\`\``
      let link = 'https://github.com/SURENABOT/SURENABOT-MD/wiki/GTTS'
      return m.isGroup ? m.reply(`${text}\n\nLanguages:\n${link}`) : sock.sendLink(m.chat, text, wm, 'Languages', link, m)
    }

    let filePath = './tmp/' + 1 * new Date
    gtts(lang).save(filePath, content, () => {
      sock.sendFile(m.chat, filePath, 'tts.opus', null, m, true, { contextInfo: global.adReply, seconds: 3600 }) 
    })
  },
  upload: async (m) => {
    const upload = require('./lib/upload')

    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''

    if (!mime) throw 'Reply to the media file you want to upload'

    let media = await q.download()
    let isMedia = /image\/(png|jpe?g|gif|webp)|video\/mp4/.test(mime)
    let link = await (isMedia ? upload.image : upload.file)(media)

    const i = parseInt(Math.floor(Math.log(media.length) / Math.log(1024)))
    m.reply(`*File uploaded to servers:*\n\n${link}\n\n○ *Size:* ${(media.length / Math.pow(1024, i)).toFixed(1) + ' ' + ['Bytes', 'KB', 'MB'][i]}\n○ *Expire:* ${isMedia ? 'none' : '24 hours'}`)
  }
}

const options = {
  add: {
    help: ['add', 'kick'].map(cmd => cmd + ' [user]'),
    tags: ['administrator'],
    desc: ['Add/remove group\'s participants'],
    command: ['add', 'kick']
  },
  block: {
    help: ['block', 'unblock'].map(cmd => cmd + ' [user]'),
    tags: ['main'],
    desc: ['Block/unblock someone'],
    command: ['block', 'unblock'],
    owner: true
  },
  blocklist: {
    help: ['blocklist'],
    tags: ['main'],
    desc: ['Check your block list'],
    command: ['blocklist'],
    owner: true
  },
  calculator: {
    help: ['calculate'],
    tags: ['tools'],
    desc: ['This is a calculator'],
    command: ['calculate']
  },
  contact: {
    help: ['contact [user]'],
    tags: ['tools'],
    desc: ['Phone number to contact'],
    command: ['contact']
  },
  device: {
    help: ['device (message)'],
    tags: ['tools'],
    desc: ['Check what device, message was sent from'],
    command: ['device']
  },
  enable: {
    help: ['disable', 'enable'].map(cmd => cmd + ' [option]'),
    tags: ['administrator', 'owner'],
    desc: ['You can access Surena\'s global options'],
    command: ['enable', 'disable']
  },
  extensions: {
    help: ['extensions'],
    tags: ['info'],
    desc: ['It will give you a list of all Surena plugins'],
    command: ['extensions']
  },
  invite: {
    help: ['invite [user]'],
    tags: ['administrator'],
    desc: ['Invite users to your group'],
    command: ['invite'],
    admin: true,
    group: true,
    botAdmin: true
  },
  leave: {
    help: ['leave'],
    tags: ['main'],
    desc: ['To leave a group'],
    command: ['leave'],
    group: true
  },
  menu: {
    help: ['menu'],
    tags: ['main'],
    desc: ['This is surena\'s menu'],
    command: ['menu']
  },
  pin: {
    help: ['pin, unpin'],
    tags: ['main'],
    desc: ['Pin/unpin a chat'],
    command: ['pin', 'unpin'],
    owner: true
  },
  profile: {
    help: ['profile [phone]'],
    tags: ['tools'],
    desc: ['You can get information of WhatsApp users! Such as: status, name, profile'],
    command: ['profile']
  },
  promote: {
    help: ['promote', 'demote'].map(cmd => cmd + ' [user]'),
    tags: ['administrator'],
    desc: ['Promote/demote your group\'s participants'],
    command: ['promote', 'demote'],
    admin: true,
    group: true,
    botAdmin: true
  },
  readmore: {
    help: ['readmore [text] + [text]'],
    tags: ['tools'],
    desc: ['Create ReadMore texts'],
    command: ['readmore']
  },
  say: {
    help: ['say [text]'],
    tags: ['tools'],
    desc: ['Surena says your text'],
    command: ['say']
  },
  setgpp: {
    help: ['setgpp (media)'],
    tags: ['group'],
    desc: ['Set group\'s profile picture'],
    command: ['setgpp'],
    admin: true,
    group: true,
    botAdmin: true
  },
  sticker: {
    help: ['sticker (media)'],
    tags: ['sticker'],
    desc: ['You can create WhatsApp stickers using Surena'],
    command: ['sticker']
  },
  tomedia: {
    help: ['tomedia (sticker)'],
    tags: ['sticker'],
    desc: ['Sticker to image/mp4 converter'],
    command: ['tomedia']
  },
  translate: {
    help: ['translate [lang] [text]'],
    tags: ['tools'],
    desc: ['You can translate texts or sentences!'],
    command: ['translate']
  },
  tts: {
    help: ['tts [lang] [text]'],
    tags: ['tools'],
    desc: ['This is google\'s text-to-speech feature in WhatsApp!'],
    command: ['tts']
  },
  upload: {
    help: ['upload (media)'],
    tags: ['tools'],
    desc: ['File and image uploader'],
    command: ['upload']
  }
}

module.exports = { extensions, options }
