const commando = require('discord.js-commando');
const safebooru = require('../../metodosInternos/safebooruImage2Channel').safebooruImageToChannel;
const {syncGuild, keys} = require('../../db/JSONSListeners');

class HonkCommand extends commando.Command {
    constructor(client){
        super(client, {
            name: 'honk',
            group: 'touhou',
            memberName: 'honk',
            description: 'Enviaré una imagen de Chen al azar.',
            clientPermissions: ['ATTACH_FILES']
        });
    }

    hasPermission(msg) {
        let guild_data = syncGuild(msg.guild.id);
        if (guild_data) return guild_data[keys.allow_touhou_commands];
        return false;
    }

    async run(message, args) {
        safebooru(message, "chen+touhou");
    }
}

module.exports = HonkCommand    ;