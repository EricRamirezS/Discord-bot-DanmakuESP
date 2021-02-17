const commando = require('discord.js-commando');
const Discord = require('discord.js');
const {guild, keys} = require('../../db/JSONSListeners');
const validateChannel = require('discord.js-commando/src/types/channel');
const validateBoolean = require('discord.js-commando/src/types/boolean');
const validateRole = require('discord.js-commando/src/types/role');

const updateDB = require('../../db/DBUpdateGuildSetting');


class SettingCommand extends commando.Command {
    constructor(client) {
        super(client, {
            name: 'configuraciones',
            group: 'admin',
            memberName: 'configuraciones',
            aliases: ['settings', 'set', 'config'],
            // TODO: Modificar descripción del comando
            description: 'Muestra las configuraciones de este servidor',
            examples: ['configuraciones', 'settings'],
            guildOnly: true,
            userPermissions: ['ADMINISTRATOR'],
            args: [
                {
                    key: 'accion',
                    prompt: '¿Qué deseas hacer?\n\n' +
                        '> ver\n' +
                        '> prefijo\n' +
                        '> canal-bienvenida\n' +
                        '> log-de-voz\n> ',
                    type: 'string',
                    oneOf: ['ver', 'see',
                        'prefijo', 'prefix',
                        'canal-bienvenida',
                        'anuncio-baneos',
                        'anuncio-baneos',
                        'log-voz',
                        'prision',
                        'comandos-touhou',
                        'comandos-danmaku',
                        'comandos-genshin',
                        'rol-agregar', 'role-agregar', 'role-add', 'rol-add',
                        'rol-eliminar', 'role-eliminar', 'rol-remove', 'role-remove',
                        'rol-ban', 'role-ban',
                    ]
                },
                {
                    key: 'valor',
                    prompt: '¿Qué valor debo asignarle a esta configuración?\n\n',
                    type: 'string',
                    default: ""
                },
            ]
        });
    }

    async run(msg, args) {

        const prefixCommand = this.client.registry.findCommands("prefix", false, msg)[0];
        let result;
        let func = null;
        try {
            switch (args.accion) {

                //Ver configuraciones
                case 'see':
                case "ver":
                    mostrarConfiguracion(msg);
                    break;

                //Cambiar Prefijo del bot
                case 'prefijo':
                case 'prefix':
                    await prefixCommand.run(msg, {prefix: args.valor});
                    break;

                //Cambiar canales a usar para ciertas funcinoes
                case 'canal-bienvenida':
                    func = func ? func : updateDB.updateWelcomeChannel;
                case 'anuncio-baneos':
                    func = func ? func : updateDB.updateBanAnnouncementChannel;
                case 'log-voz':
                    func = func ? func : updateDB.updateVoiceLogChannel;
                case 'prision':
                    func = func ? func : updateDB.updateBanChannel;

                    result = verificarCanal(args.valor, msg);
                    if (result.res) {
                        //Actualizar DB
                        actualizarCanal(func, msg, result.value);
                    } else {
                        msg.reply(result.mes);
                    }
                    break;

                case 'comandos-touhou':
                    func = func ? func : updateDB.updateTouhouCommands;
                case 'comandos-danmaku':
                    func = func ? func : updateDB.updateDanmakuCommands;
                case 'comandos-genshin':
                    func = func ? func : updateDB.updateGenshinCommands;

                    result = verificarBoleano(args.valor, msg);
                    if (result.res) {
                        //Actualizar DB
                        actualizarPermiso(func, msg, result.value);
                    } else {
                        msg.reply(result.mes);
                    }
                    break;
                case 'rol-agregar':
                case 'role-agregar':
                case 'role-add':
                case 'rol-add':
                    func = func ? func : updateDB.addRoleToManage;
                case 'rol-eliminar':
                case 'role-eliminar':
                case 'role-remove':
                case 'rol-remove':
                    func = func ? func : updateDB.removeRoleToManage;

                    result = verificarRol(args.valor, msg, false);
                    if (result.res) {
                        actualizarRol(func, msg, result.value);
                    } else {
                        msg.reply(result.mes);
                    }
                    break;
                case 'role-ban':
                case 'rol-ban':
                    func = func ? func : updateDB.updateBanRole;

                    result = verificarRol(args.valor, msg);
                    if (result.res) {
                        actualizarRol(func, msg, result.value);
                    } else {
                        msg.reply(result.mes);
                    }
                    break;
            }
        } catch (e) {
            console.log(e);
        }
    }
}

function actualizarCanal(func, msg, val) {
    func(msg.guild.id, val)
        .then(() => {
            let accion = val ? "actualizada" : "eliminada";
            msg.reply(`La configuración ha sido ${accion} con exito.`);
        })
        .catch((e) => {
            console.log(e);
            msg.reply("Por alguna razón, no he podido actualizar las configuraciones, si este problema persiste, informale al desarrollador a traves del comandos `feedback`");
        });
}

function actualizarRol(func, msg, val) {
    func(msg.guild.id, val)
        .then(() => {
            let accion = val ? "actualizado" : "eliminado";
            msg.reply(`El rol ha sido ${accion} con exito.`);
        })
        .catch((e) => {
            console.log(e);
            msg.reply("Por alguna razón, no he podido actualizar las configuraciones, si este problema persiste, informale al desarrollador a traves del comandos `feedback`");
        });
}

function actualizarPermiso(func, msg, val) {
    func(msg.guild.id, val)
        .then(() => {
            msg.reply(`La configuración ha sido actualizada con exito.`);
        })
        .catch((e) => {
            console.log(e);
            msg.reply("Por alguna razón, no he podido actualizar las configuraciones, si este problema persiste, informale al desarrollador a traves del comandos `feedback`");
        });
}

// Verifica que el parametro ingresado corresponda al nombre o mencion de un canal en el servidor
function verificarCanal(val, msg) {
    let data = {
        res: false,
        value: null,
        mes: null
    }
    data.res = new validateChannel(this, 'channel').validate(val, msg, {});
    if (val === "") data.res = true;
    if (typeof data.res === "boolean") {
        if (data.res) {
            data.value = val ? new validateChannel(this, 'channel').parse(val, msg).id : null;
        } else {
            data.mes = "No se ha encontrado ningun canal con ese nombre";
            data.res = false;
        }
    } else {
        data.mes = data.res;
        data.res = false;
    }
    return data;
}

function verificarBoleano(val, msg) {
    let data = {
        res: false,
        value: null,
        mes: null
    }
    data.res = new validateBoolean(this, 'boolean').validate(val, msg, {});
    if (val === "") data.res = false;
    if (typeof data.res === "boolean") {
        if (data.res) {
            data.value = new validateBoolean(this, 'boolean').parse(val, msg);
        } else {
            data.mes = "Esta configuración no puede quedar en blanco.";
        }
    } else {
        data.mes = data.res;
        data.res = false;
    }
    return data;
}

function verificarRol(val, msg, nullable = true) {
    let data = {
        res: false,
        value: null,
        mes: null
    }
    data.res = new validateRole(this, 'role').validate(val, msg, {});
    console.log(data.res);
    if (nullable) {
        if (val === "") data.res = true;
    }

    if (typeof data.res === "boolean") {
        if (data.res) {
            data.value = val ? new validateRole(this, 'role').parse(val, msg).id : null;
        } else {
            data.mes = "No se ha encontrado ningun rol con ese nombre";
            data.res = false;
        }
    } else {
        data.mes = data.res;
        data.res = false;
    }
    return data;
}

async function mostrarConfiguracion(msg) {
    let guild_data = await guild(msg.guild.id);
    if (guild_data) {
        let embed = new Discord.MessageEmbed();
        embed.setTitle("CONFIGURACIÓN ACTUAL");
        let channel_chache = msg.guild.channels.cache;
        let welcome_channel = elementToString(channel_chache, guild_data[keys.welcome_channel_id]);
        let voice_log = elementToString(channel_chache, guild_data[keys.voice_log_id]);
        let ban_channel = elementToString(channel_chache, guild_data[keys.ban_channel_id]);
        let ban_public_noti_channel = elementToString(channel_chache, guild_data[keys.ban_public_notification_channel]);
        let touhou_commands = guild_data[keys.allow_touhou_commands] ? 'Sí' : 'No';
        let danmaku_commands = guild_data[keys.allow_danmaku_commands] ? 'Sí' : 'No';
        let genshin_commands = guild_data[keys.allow_genshin_commands] ? 'Sí' : 'No';
        let prefix = guild_data[keys.prefix];
        let ban_role = elementToString(msg.guild.roles.cache, guild_data[keys.ban_role_id]);
        let roles = [];
        if (guild_data[keys.roles_bot_can_add]) {
            for (let i = 0; i < guild_data[keys.roles_bot_can_add].length; i++) {
                let role = msg.guild.roles.cache.find(x => x.id === guild_data[keys.roles_bot_can_add][i]);
                if (role)
                    roles.push(role.toString());
            }
        }

        if (!roles.length) roles = ["No definido"];

        embed.addField("Prefijo del bot", prefix, true);
        embed.addField("Canal de Bienvenida:", welcome_channel, true);
        embed.addField("Log de voz:", voice_log, true);
        embed.addField("Canal de baneos:", ban_channel, true);
        embed.addField("Notificación pública de baneo:", ban_public_noti_channel, true);
        embed.addField("Permitir comandos de Touhou", touhou_commands, true);
        embed.addField("Permitir comandos de Danmaku!! Card Game", danmaku_commands, true);
        embed.addField("Permitir comandos de Genshin Impact", genshin_commands, true);
        embed.addField("Rol para baneos", ban_role, true);
        embed.addField("Roles que los usuarios pueden autoagregar", roles.join("\n"), true);
        msg.channel.send(embed);
    }
}

function elementToString(cache, id) {
    let element = cache.find(x => x.id === id);
    return element ? element.toString() : "No definido";
}

module.exports = SettingCommand;