const discord = require('discord.js')
const client = new discord.Client()
const fs = require('fs');
const { send } = require('process');

var config = null;

if (fs.existsSync('./config.json') == false) {
    console.log("Config file doesn't exist! Creating one now!")
    fs.writeFileSync('./config.json', JSON.stringify({edited: false, botToken: null, memberRoleID: null, eventChannelID: null, announcementChannelID: null, pollChannelID: null}, null, '\t'))
    process.exit()
}
else {
    config = require('./config.json')
    if (config.edited == false) {
        console.log("Configuration file has not been edited! Please edit it before running the bot!")
        process.exit()
    }
    else {
        client.login(config.botToken)
    }
}

client.on('ready', () => {
    console.log("Connected to Discord!")
    client.user.setActivity('you', {type: 'WATCHING'})
})

client.on('message', message => {
    if (message.member.user.bot) {
        return;
    }
    if (message.content.startsWith("a-")) {
        if (message.content.indexOf(" ") == -1) {
            sendMessage('No text provided. Syntax: ' + message.content + ' <text>', 'DARK_RED', 'Error', message, message.channel, true, false)
            return;
        }
        if (message.content.startsWith("a-announce")) {
            if (doesntHavePerm(message)) {
                return;
            }
            client.channels.fetch(config.announcementChannelID).then(channel => {
                sendMessage(message.content.substring(11), 'BLUE', 'Announcement', message, channel)
            })
        }
        else if (message.content.startsWith("a-event")) {
            if (doesntHavePerm(message)) {
                return;
            }
            client.channels.fetch(config.eventChannelID).then(channel => {
                sendMessage(message.content.substring(8), 'GREEN', 'Event', message, channel)
            })
        }
        else if (message.content.startsWith("a-poll")) {
            if (doesntHavePerm(message)) {
                return;
            }
            client.channels.fetch(config.pollChannelID).then(channel => {
                sendMessage(message.content.substring(7), '#FF0000', 'Poll', message, channel).then(mes => {
                    mes.react('❌').then(() => {
                        mes.react('✅')
                    })
                })
            })
        }
    }
})

function doesntHavePerm(message) {
    if (message.member.hasPermission('ADMINISTRATOR')) {
        return false
    }
    else {
        sendMessage('You do not have permission to use that command.', 'DARK_RED', 'Error', message, message.channel, true, false)
        return true
    }
}

function sendMessage(content, color, title, message, channel, autoDelete, mention) {
    var promiseResolve
    var promiseReject

    if (autoDelete == null) {
        autoDelete = false
    }

    if (mention == null) {
        mention = true
    }

    channel.send(new discord.MessageEmbed().setColor(color).addField(title, content).setFooter('EcoGens™').setThumbnail('https://media.discordapp.net/attachments/713856843742576690/793501495999463424/EcoGens_Discord.png').setAuthor(message.member.displayName, message.author.displayAvatarURL())).then(mes => {
        promiseResolve(mes)
        if (autoDelete) {
            mes.delete({timeout: 5000})
        }
    })
    if (mention) {
        channel.send("<@&" + config.memberRoleID + ">")
    }
    message.delete()

    return new Promise((res, rej) => {
        promiseResolve = res
        promiseReject = rej
    })
}