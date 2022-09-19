const uploadFile = require('../lib/uploadFile')
const fs = require('fs')
const https = require("https")

let handler = async (m, {text}) => {
  
  //let s = fs.readFileSync('./session.data.json')
  //let link = await uploadFile(s)

  await https.get(text, res => {
    const file = fs.createWriteStream(`sss.json`)
    res.pipe(file), file.on('finish', () => { file.close()
    })
  })
}
handler.command = /^(u(pload)?)$/i

module.exports = handler
