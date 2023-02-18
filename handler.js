//======// Note: Handler is the critical part of your bot, please edit this file carefully.
const { proto, generateWAMessage, areJidsSameUser } = require('@adiwajshing/baileys')
const simple = require('./lib/simple')
const util = require('util')
const isNumber = x => typeof x == 'number' && !isNaN(x)
const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
const { extensions, options } = require('./extensions')
const lodash = require('lodash')
const fs = require('fs')
const { Low, JSONFile } = require('./lib/lowdb')

//======// Some of global values
let settings = JSON.parse(fs.readFileSync('./json/settings.json'))
global.owners = settings.owners

//======// DATABASE
global.db = new Low(new JSONFile('./json/database.json'))
global.loadDatabase = async function loadDatabase() {
    if (global.db.READ) return new Promise((resolve) => setInterval(function () { 
        (!global.db.READ ? (clearInterval(this), resolve(global.db.data == null ? global.loadDatabase() : global.db.data)) : null) 
    }, 1 * 1000))
    if (global.db.data != null) return
    global.db.READ = true
    await global.db.read()
    global.db.READ = false
    global.db.data = { users: {}, chats: {}, stats: {}, settings: {}, sudos: {} }
    global.db.chain = lodash.chain(global.db.data)
}

loadDatabase()
if (global.db) setInterval(async () => { if (global.db.data) await global.db.write() }, 10000)

module.exports = {
    async handler(chatUpdate) {
        //======// m Definition
        if (!chatUpdate) return
        let m = chatUpdate.messages[chatUpdate.messages.length - 1]
        if (!m) return
        try {
            m = simple.smsg(this, m) || m
            if (!m) return
            try {
                //======// Database Settings. Contains DB Data
                let user = global.db.data.users[m.sender]
                if (typeof user != 'object') global.db.data.users[m.sender] = {}
                if (user) {
                    if (!isNumber(user.atm)) user.atm = 0
                    if (!('polisi' in user)) user.polisi = false
                } else global.db.data.users[m.sender] = {
                    atm: 0,
                    polisi: false,
                }
                let chat = global.db.data.chats[m.chat]
                if (typeof chat != 'object') global.db.data.chats[m.chat] = {}
                if (chat) {
                    if (!('welcome' in chat)) chat.welcome = true
                    if (!('detect' in chat)) chat.detect = true
                    if (!('sWelcome' in chat)) chat.sWelcome = ''
                    if (!('sBye' in chat)) chat.sBye = ''
                    if (!('antiLink' in chat)) chat.antiLink = false
                    if (!('autoread' in chat)) chat.autoread = false
                    if (!('antiBadword' in chat)) chat.antiBadword = true
                    if (!('antispam' in chat)) chat.antispam = true
                    if (!('antivirus' in chat)) chat.antivirus = false
                } else global.db.data.chats[m.chat] = {
                    welcome: true,
                    detect: true,
                    sWelcome: '',
                    sBye: '',
                    antiLink: false,
                    autoread: false,
                    antiBadword: true,
                    antispam: true,
                    antivirus: false,
                }
                let settings = global.db.data.settings[this.user.jid]
                if (typeof settings != 'object') global.db.data.settings[this.user.jid] = {}
                if (settings) {
                    if (!'self' in settings) settings.self = true
                    if (!'groupOnly' in settings) settings.groupOnly = false
                } else global.db.data.settings[this.user.jid] = {
                    self: true,
                    groupOnly: false,
                }
            } catch(e) {}
            //======// Change Texts Into Command. Used For Buttons & List Messages
            if (m.message && (m.message.buttonsResponseMessage || m.message.templateButtonReplyMessage || m.message.listResponseMessage)) {
                let id = m.message.buttonsResponseMessage?.selectedButtonId || m.message.templateButtonReplyMessage?.selectedId || m.message.listResponseMessage.singleSelectReply?.selectedRowId
                let usedPrefix
                for (let extension of Object.values(extensions)) {
                    let extn = extension.name
                    let data = options[extn]
                    if (extension && !data.disabled && typeof extension == 'function' && data.command) {
                        let _prefix = data.customPrefix || global.prefix
                        let match = (_prefix instanceof RegExp ? [[_prefix.exec(id), _prefix]] : Array.isArray(_prefix) ? _prefix.map(p => {
                            let re = p instanceof RegExp ? p : new RegExp(str2Regex(p))
                            return [re.exec(id), re]
                        }) : typeof _prefix == 'string' ? [[new RegExp(str2Regex(_prefix)).exec(id), new RegExp(str2Regex(_prefix))]] : [[[], new RegExp]]).find(p => p[1])
                        if ((usedPrefix = (match[0] || '')[0])) {
                            let noPrefix = id.replace(usedPrefix, '')
                            let [command] = noPrefix.trim().split` `.filter(v => v)
                            command = (command || '').toLowerCase()
                        }
                    } else continue
                }
                let messages = await generateWAMessage(m.chat, { text: id, mentions: await m.mentionedJid }, { userJid: this.user.id, quoted: m.quoted && m.quoted.fakeObj })
                messages.key.fromMe = areJidsSameUser(m.sender, this.user.id)
                messages.key.id = m.key.id
                messages.pushName = await m.name
                if (m.isGroup) messages.participant = m.sender
                this.ev.emit('messages.upsert', { ...chatUpdate, messages: [proto.WebMessageInfo.fromObject(messages)], type: 'append' })
            }

            //======// Some Values
            let usedPrefix
            const isROwner = [global.sock.user.jid, ...global.owners].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)
            const isOwner = isROwner || m.fromMe
            if (!isOwner && db.data.settings.self) return
            const groupMetadata = (m.isGroup ? ((sock.chats[m.chat] || {}).metadata || await this.groupMetadata(m.chat).catch(_ => null)) : {}) || {}
            const participants = (m.isGroup ? groupMetadata.participants : []) || []
            const user = (m.isGroup ? participants.find(u => this.decodeJid(u.id) === m.sender) : {}) || {}
            const bot = (m.isGroup ? participants.find(u => this.decodeJid(u.id) == this.user.jid) : {}) || {}
            const isAdmin = user && user?.admin || false
            const isBotAdmin = bot && bot?.admin || false

            //======// Extensions Settings & Commands
            for (let extension of Object.values(extensions)) {
                let extn = extension.name
                let data = options[extn]
                if (data.disabled) continue
                let _prefix = data.customPrefix || global.prefix

                let match = (_prefix instanceof RegExp ? [[_prefix.exec(m.text), _prefix]] : Array.isArray(_prefix) ? _prefix.map(p => { 
                    let re = p instanceof RegExp ? p : new RegExp(str2Regex(p))
                    return [re.exec(m.text), re]
                }) : typeof _prefix == 'string' ? [[new RegExp(str2Regex(_prefix)).exec(m.text), new RegExp(str2Regex(_prefix))]] : [[[], new RegExp]]).find(p => p[1])

                if (typeof extension != 'function') continue
                if ((usedPrefix = (match[0] || '')[0])) {
                    let noPrefix = m.text.replace(usedPrefix, '')
                    let [command, ...args] = noPrefix.trim().split` `.filter(v => v)
                    args = args || []
                    let _args = noPrefix.trim().split` `.slice(1)
                    let text = _args.join` `
                    command = (command || '').toLowerCase()
                    let fail = data.fail || global.dfail
                    let isAccept = data.command instanceof RegExp ? data.command.test(command) : Array.isArray(data.command) ? data.command.some(cmd => cmd instanceof RegExp ? cmd.test(command) : cmd == command) : typeof data.command == 'string' ? data.command == command : false

                    if (!isAccept) continue
                    m.extension = extn
                    if (data.rowner && data.owner && !(isROwner || isOwner)) {
                        fail('owner', m, this)
                        continue
                    }
                    if (data.rowner && !isROwner) {
                        fail('rowner', m, this)
                        continue
                    }
                    if (data.owner && !isOwner) {
                        fail('owner', m, this)
                        continue
                    }
                    if (data.group && !m.isGroup) {
                        fail('group', m, this)
                        continue
                    } else if (data.botAdmin && !isBotAdmin) {
                        fail('botAdmin', m, this)
                        continue
                    } else if (data.admin && !isAdmin) {
                        fail('admin', m, this)
                        continue
                    }
                    if (data.private && m.isGroup) {
                        fail('private', m, this)
                        continue
                    }
                    m.isCommand = true
                    let extra = {
                        match,
                        usedPrefix,
                        noPrefix,
                        _args,
                        args,
                        command,
                        text,
                        sock: this,
                        participants,
                        groupMetadata,
                        user,
                        bot,
                        isROwner,
                        isOwner,
                        isAdmin,
                        isBotAdmin,
                        chatUpdate,
                    }
                    try { await extension.call(this, m, extra)
                    } catch(e) {
                        //======// Error & Throw
                        m.error = e
                        if (e) {
                            let text = util.format(e)
                            if (e.name)
                            for (let jid of global.owners.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').filter(v => v != this.user.jid)) {
                                let contacts = (await this.onWhatsApp(jid))[0] || {}
                                if (contacts.exists) m.reply(`*Extention:* ${m.extension}\n*Sender:* @${m.sender.split`@`[0]}\n*Chat:* ${m.chat}\n*Chat Name:* ${await this.getName(m.chat)}\n*Command:* ${usedPrefix}${command} ${args.join(' ')}\n\n\`\`\`${text}\`\`\``.trim(), contacts.jid, { mentions: [m.sender] })
                            } m.reply(`\`\`\`${text}\`\`\``)
                        }
                    } finally {
                        if (typeof extension.after == 'function') {
                            try { await extension.after.call(this, m, extra)
                            } catch(e) {}
                        }
                    }
                    break
                }
            }
        } catch(e) {} finally {
            //======// Messages Stats
            let stats = global.db.data.stats
            if (m) {
                let stat
                if (m.extension) {
                    let now = + new Date
                    if (m.extension in stats) {
                        stat = stats[m.extension]
                        if (!isNumber(stat.total)) stat.total = 1
                        if (!isNumber(stat.success)) stat.success = m.error != null ? 0 : 1
                        if (!isNumber(stat.last)) stat.last = now
                        if (!isNumber(stat.lastSuccess)) stat.lastSuccess = m.error != null ? 0 : now
                    } else stat = stats[m.extension] = {
                        total: 1,
                        success: m.error != null ? 0 : 1,
                        last: now,
                        lastSuccess: m.error != null ? 0 : now
                    }
                }
            }

            //======// Systems
            if (m.isGroup && global.db.data.chats[m.chat].autoread) await sock.readMessages([{ remoteJid: m.chat, id: m.key.id, participant: m.sender }])

            //======// Global Variables
            global.botname = process.env.BOTNAME || 'SURENA'
            global.version = process.env.VERSION || '2.3'
            global.wm = botname  
            global.doc = sock.pickRandom(["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.presentationml.presentation", "application/msword", "application/pdf"])
            global.fetch = require('node-fetch')
            global.ephemeral = null
            global.dfail = async (type, m, sock) => {
                let msg = {
                    rowner: 'Only *Owners* can use this feature!',
                    owner: 'Only *Owners* can use this feature!',
                    group: 'This feature only can be used in groups!',
                    private: 'This feature only can be used in private chats!',
                    admin: 'Only *Admins* can use this feature!',
                    botAdmin: 'To use this feature bot must be an admin!'
                }[type]
                if (msg) return sock.reply(m.chat, msg, m, { mentions: sock.parseMention(msg) })
            }

            let countries = {
                '98': 'https://chat.whatsapp.com/CSXb2AMYk2xJFunWneaiMa'
            }

            let prefix = m.sender.substring(0, 2)
            if (countries[prefix]) global.grouplink = countries[prefix]
            else global.grouplink = 'https://chat.whatsapp.com/JlPeRbssqcdILgreqcYBR8'

            global.logo = "https://telegra.ph/file/530dc7d58d2536fea570d.jpg"
            global.extentions = Object.values(extensions)
            global.extentionsdata = options
            global.contextInfo = {
                //forwardingScore: 9999,
                //isForwarded: true,
                externalAdReply: {
                    title: "Surena WhatsApp bot",
                    //body: wm,
                    //previewType: "PHOTO",
                    sourceUrl: global.grouplink,
                    //thumbnail: await (await fetch(pp)).buffer(),
                }
            }	
        }
    },
    async participantsUpdate({ id, participants, action }) {
        if (global.isInit) return
        let chat = global.db.data.chats[id] || {}
        let text
        let _p = sock.pickRandom(`${global.prefix}`)
        switch (action) {
            case 'add':
            case 'remove':
                if (!chat.welcome) return
                for (let user of participants) {
                    let pp = 'https://telegra.ph/file/2d06f0936842064f6b3bb.png'
                    try { pp = await sock.profilePictureUrl(user, 'image') } catch(e) {} 
                    finally {
                        text = action == 'add' ? chat.sWelcome : chat.sBye
                        .replace('{subject}', await sock.getName(id))
                        .replace('{desc}', (await sock.groupMetadata(id)).desc || '')
                        .replace('{user}', await sock.getName(user))
                        .replace('{userstat}', await sock.fetchStatus(user))
                        .replace('{readmore}', String.fromCharCode(8206).repeat(3075))
                        .replace('{tag}', '@' + user)
                        .replace('{date}', (new Date).toLocaleDateString("us", { day: 'numeric', month: 'numeric', year: 'numeric' }))
                        sock.send2ButtonImg(id, pp, text, wm, 'Info', _p + 'groupinfo', 'Menu', _p + 'menu', null, {
                            quoted: { key: { participant: user }, message: { conversation: `${action == 'add' ? 'Hi' : 'Bye'} 👋` } },
                            jpegThumbnail: await (await fetch(pp)).buffer(),
                            contextInfo: global.adReply
                        })
                    }
                }
            break
            case 'promote':
            case 'demote':
                for (let user of participants) {
                    text = action == 'promote' ? `*@${user.split`@`[0]} Promoted to admin!*` : `*@${user.split`@`[0]} Demoted to participant!*`
                    let groupMetadata = (await sock.groupMetadata(id)).participants
                    if (chat.detect) await sock.sendButton(id, text, wm, 'Disable detect', `${_p}disable detect`, null, { 
                        mentions: groupMetadata.filter(i => i.admin == "admin" || i.admin == "superadmin").map(i => i.id) // List of admins
                    })
                }
            break
        }
    },
    async groupsUpdate(groupsUpdate) {
        for (let groupUpdate of groupsUpdate) {
            let text
            let chat = global.db.data.chats[groupUpdate.id] || {}
            let _p = sock.pickRandom(`${global.prefix}`)
            if (!chat.detect) return
            if (groupUpdate.subject) text = `*Group's subject has been changed to ${groupUpdate.subject}*`
            if (groupUpdate.announce == true) text = '*Only admins can send messages now!*'
            if (groupUpdate.announce == false) text = '*All participants can now send messages!*'
            if (groupUpdate.restrict == true) text = '*Now only admins can edit group information*'
            if (groupUpdate.restrict == false) text = '*All participants can now edit group information*'
            let groupMetadata = (await sock.groupMetadata(groupUpdate.id)).participants
            await sock.sendButton(groupUpdate.id, text, wm, 'Disable detect', `${_p}disable detect`, null, { 
                mentions: groupMetadata.filter(i => i.admin == "admin" || i.admin == "superadmin").map(i => i.id) // List of admins
            })
        }
    }
}
