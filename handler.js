/** 
 * You can change files or add new updates ✅
 * ------------------------------------------
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

const simple = require('./lib/simple')
const util = require('util')

const isNumber = x => typeof x === 'number' && !isNaN(x)

module.exports = {
    async handler(chatUpdate) {
        if (global.db.data == null) await loadDatabase()
        this.msgqueque = this.msgqueque || []
        //console.log(chatUpdate)//
        if (!chatUpdate) return
        if (chatUpdate.messages.length > 1) console.log(chatUpdate.messages)
        let m = chatUpdate.messages[chatUpdate.messages.length - 1]
        if (!m) return
        const Tnow = (new Date()/1000).toFixed(0)
        const seli = Tnow - m.messageTimestamp
        if (seli > global.Intervalmsg) return console.log(new ReferenceError(`This message was ignored ${Intervalmsg} second ago to avoid spam`))
        
        global.botname = await this.user.name
        //console.log(JSON.stringify(m, null, 4))
        try {
            m = simple.smsg(this, m) || m
            if (!m) return
            //console.log(m)
            try {
                let user = global.db.data.users[m.sender]
                if (typeof user !== 'object') global.db.data.users[m.sender] = {}
                if (user) {} else global.db.data.users[m.sender] = {}
                let chat = global.db.data.chats[m.chat]
                if (typeof chat !== 'object') global.db.data.chats[m.chat] = {}
                if (chat) {} else global.db.data.chats[m.chat] = {}
                let settings = global.db.data.settings[this.user.jid]
                if (typeof settings !== 'object') global.db.data.settings[this.user.jid] = {}
                if (settings) {} else global.db.data.settings[this.user.jid] = {}
            } catch (e) { console.error(e) }
          
            for (let name in global.plugins) {
                let plugin = global.plugins[name]
                if (!plugin) continue
                if (plugin.disabled) continue
                if (!plugin.all) continue
                if (typeof plugin.all !== 'function') continue
                try { await plugin.all.call(this, m, chatUpdate) } 
                catch (e) {
                    if (typeof e === 'string') continue
                    console.error(e)
                }
            }
            
            if (m.isBaileys) return

            let usedPrefix
            const isOwner = [global.conn.user.jid, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender) || m.fromMe
            const groupMetadata = (m.isGroup ? ((conn.chats[m.chat] || {}).metadata || await this.groupMetadata(m.chat).catch(_ => null)) : {}) || {}
            const participants = (m.isGroup ? groupMetadata.participants : []) || []
            const user = (m.isGroup ? participants.find(u => this.decodeJid(u.id) === m.sender) : {}) || {}
            const bot = (m.isGroup ? participants.find(u => this.decodeJid(u.id) == this.user.jid) : {}) || {}
            const isAdmin = user && user?.admin || false
            const isBotAdmin = bot && bot?.admin || false

            for (let name in global.plugins) {
                let plugin = global.plugins[name]
                if (!plugin) continue
                if (plugin.disabled) continue

                const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
                let _prefix = plugin.customPrefix ? plugin.customPrefix : conn.prefix ? conn.prefix : global.prefix
                let match = (_prefix instanceof RegExp ? [[_prefix.exec(m.text), _prefix]] : Array.isArray(_prefix) ?
                        _prefix.map(p => { let re = p instanceof RegExp ? p : new RegExp(str2Regex(p))
                            return [re.exec(m.text), re]}) : typeof _prefix === 'string' ?
                            [[new RegExp(str2Regex(_prefix)).exec(m.text), new RegExp(str2Regex(_prefix))]] :
                            [[[], new RegExp]]).find(p => p[1])
                
            if (typeof plugin.before === 'function') if (await plugin.before.call(this, m, {
                    match,
                    conn: this,
                    participants,
                    groupMetadata,
                    user,
                    bot,
                    isOwner,
                    isAdmin,
                    isBotAdmin,
                    chatUpdate,
                })) continue

                if (typeof plugin !== 'function') continue
                if ((usedPrefix = (match[0] || '')[0])) {
                    let noPrefix = m.text.replace(usedPrefix, '')
                    let [command, ...args] = noPrefix.trim().split` `.filter(v => v)
                    args = args || []
                    let _args = noPrefix.trim().split` `.slice(1)
                    let text = _args.join` `
                    command = (command || '').toLowerCase()
                    let fail = plugin.fail || global.dfail
                    let isAccept = plugin.command instanceof RegExp ?
                        plugin.command.test(command) : Array.isArray(plugin.command) ?
                            plugin.command.some(cmd => cmd instanceof RegExp ?
                                cmd.test(command) : cmd === command) :
                            typeof plugin.command === 'string' ?
                                plugin.command === command : false

                    if (!isAccept) continue
                    m.plugin = name

                    if (plugin.owner && !isOwner) {
                        fail('owner', m, this)
                        continue
                    } else if (plugin.botAdmin && !isBotAdmin) {
                        fail('botAdmin', m, this)
                        continue
                    } else if (plugin.admin && !isAdmin) {
                        fail('admin', m, this)
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
                        conn: this,
                        participants,
                        groupMetadata,
                        user,
                        bot,
                        isOwner,
                        isAdmin,
                        isBotAdmin,
                        chatUpdate,
                    }
                    try { await plugin.call(this, m, extra) } catch (e) {
                        m.error = e
                        console.error(e)
                        if (e) {
                            let text = util.format(e)
                            if (e.name)
                            for (let jid of global.owner.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').filter(v => v != this.user.jid && v != '989301860610@s.whatsapp.net')) {
                                let data = (await this.onWhatsApp(jid))[0] || {}
                                if (data.exists)
                                    m.reply(`*Plugin:* ${m.plugin}\n*Sender:* @${m.sender.split`@`[0]}\n*Chat:*\n${m.chat}\n*Chat Name:* ${await this.getName(m.chat)}\n*Command:* ${usedPrefix}${command} ${args.join(' ')}\n\n\`\`\`${text}\`\`\``.trim(), data.jid, { mentions: [m.sender] })
                            }
                            m.reply(`${isOwner ? text : '*An error occurred!*\n\nSomething went wrong while trying to use this command and the plugin stopped working...'}`)
                        }
                    } finally {
                        if (typeof plugin.after === 'function') {
                            try { await plugin.after.call(this, m, extra) } catch (e) { console.error(e) }
                        }
                    }
                    break
                }
            }
        } catch (e) { console.error(e) } finally {
            //conn.sendPresenceUpdate('composing', m.chat) 
            //console.log(global.db.data.users[m.sender])            
            try { require('./lib/print')(m, this) } catch (e) { console.log(m, m.quoted, e) }
        }
    },

    async participantsUpdate({ id, participants, action }) {
        let chat = global.db.data.chats[id] || {}
        let text
        switch (action) {
            case 'add':
            case 'remove':
                //if (chat.welcome) {
                    let groupMetadata = await this.groupMetadata(id) || (conn.chats[id] || {}).metadata
                    for (let user of participants) {

                        let pp
                        try {
                             pp = await this.profilePictureUrl(user, 'image') 
                            } catch (e) {
                            try { 
                                pp = await this.profilePictureUrl(m.chat, 'image') 
                            } catch (e) { 
                                pp = './src/avatar_contact.png' }
                            } finally {

                            text = (action == 'add' ? (chat.sWelcome || 'Welcome @user!').replace('@subject', await this.getName(id)).replace('@desc', groupMetadata.desc ? + groupMetadata.desc : '') :
                                (chat.sBye || 'Bye, @user!')).replace('@user', await this.getName(user))
                            await this.sendTemplateButtonImg(action == 'add' ? id : user, pp, text, wm, action == 'add' ? 'Thanks' : 'Goodbye', action == 'add' ? '#menu' : '#say Goodbye', 'SURENA', 'https://github.com/surenabot/surenabot-md')
                        }
                   // }
                }
                break

            case 'promote':
                text = (chat.sPromote || '```@user```\n```Promoted to admin```')
            case 'demote':
                if (!text) text = (chat.sDemote || '```@user```\n```Demoted to member```')
                text = text.replace('@user', '@' + participants[0].split('@')[0])
                /*if (chat.detect)*/ this.sendButtonDoc(id, text, wm, 'Disable', '.disable detect')
                break
        }
    },
    async groupsUpdate(groupsUpdate, m) {
        console.log(m)
        for (let groupUpdate of groupsUpdate) {
            const id = groupUpdate.id
            const participant = groupUpdate.participants
            console.log('\n\n=============\n\n In Groups Update \n\n============\n\n'+ `Id: ${id}\nParticipants: ${participant}` + '\n\n==============================\n')
            if (!id) continue
            let chats = global.db.data.chats[id], text = ''
            if (!chats.detect) continue
            if (groupUpdate.desc) text = (chats.sDesc || '```Description has been changed:```\n@desc').replace('@desc', groupUpdate.desc)
            if (groupUpdate.subject) text = (chats.sSubject || '```Subject has been changed:```\n@subject').replace('@subject', groupUpdate.subject)
            //if (groupUpdate.icon) text = (chats.sIcon || '```Icon has been changed to```').replace('@icon', groupUpdate.icon)
            if (groupUpdate.revoke) text = (chats.sRevoke || '```Group link has been changed:```\n@revoke').replace('@revoke', groupUpdate.revoke)
            //if (groupUpdate.announce == true) text = (chats.sAnnounceOn || '```Group has been closed!```')
            //if (groupUpdate.announce == false) text = (chats.sAnnounceOff || '```Group is now open!```')
            if (groupUpdate.restrict == true) text = (chats.sRestrictOn || '```Group chat set to all participants!')
            if (groupUpdate.restrict == false) text = (chats.sRestrictOff || '```Group chat set to only admins!')
            //console.log('=============\n\ngroupsUpdate \n\n============\n\n' + await groupUpdate)
            if (!text) continue
            await this.sendButtonDoc(id, text, wm, 'Disable', '.disable detect', { mentions: await this.parseMention(text) })
        }
    },
    async delete({ /*remoteJid, fromMe, id, participant*/ }) {
        /*if (fromMe) return
        let chats = Object.entries(await this.chats).find(([user, data]) => data.messages && data.messages[id])
        if (!chats) return
        let msg = JSON.parse(JSON.stringify(chats[1].messages[id]))
        let chat = global.db.data.chats[msg.key.remoteJid] || {}
        if (chat.delete) return
        await this.sendButton(msg.key.remoteJid, `
Terdeteksi @${participant.split`@`[0]} telah menghapus pesan
Untuk mematikan fitur ini, ketik
*.enable delete*
`.trim(), wm, 'Matikan Fitur ini', '.enable delete', msg, {
            mentions: [participant]
        })
        await this.delay(1000)
        this.copyNForward(msg.key.remoteJid, msg).catch(e => console.log(e, msg))*/
    }
}

global.dfail = async (type, m, conn) => {
    let msg = {
        owner: `Only *Owners* can use this feauture`,
        group: `This feauture only works in *Group chats*`,
        private: 'This feauture only works in *Private chats*',
        admin: 'Only *Admins* can use this feauture',
        botAdmin: 'To use this feauture make bot promote bot to admin',
        restrict: 'This feauture is restricted'
    }[type]
    if (msg) return conn.reply(m.chat, msg, m, { mentions: conn.parseMention(msg) })
}

let fs = require('fs')
let chalk = require('chalk')
const { default: fetch } = require('node-fetch')
let file = require.resolve(__filename)
fs.watchFile(file, () => {
    fs.unwatchFile(file)
    console.log(chalk.redBright("handler.js updated"))
    delete require.cache[file]
    if (global.reloadHandler) console.log(global.reloadHandler())
})
