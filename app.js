//Modules
const fs                                                   = require("fs");
const Discord                                              = require("discord.js");
const { token, prefix }                                    = require("./config.json");
const { reply_bot_msg_suc, reply_bot_msg_err }             = require("./reply-bot-msg.js");
const { is_valid_emoji, is_valid_member, is_valid_channel} = require("./is-valid-input.js");
const database                                             = require("./database.js");

//Create bot
const bot    = new Discord.Client();
bot.commands = new Discord.Collection();

//Bot command modules
const command_files = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));
for(const file of command_files) {
	const command = require(`./commands/${file}`);
	bot.commands.set(command.name, command);
}

//Listen for ready
bot.once("ready", () => {
	const activity_name = `${prefix}help`
	const twitch_url    = "https://twitch.tv/notavalidtwitchuser"
	
	bot.user.setActivity(activity_name, {type: "STREAMING", url: twitch_url})
	
	console.log("Babubot ready!");
});

//Listen for new messages
bot.on("message", msg => {
	//Create custom functions for msg
	msg.reply_bot_msg_suc = reply_bot_msg_suc;
	msg.reply_bot_msg_err = reply_bot_msg_err;
	msg.is_valid_emoji    = is_valid_emoji;
	msg.is_valid_member   = is_valid_member;
	msg.is_valid_channel  = is_valid_channel;
	
	//If not start with correct prefix, ignore message
	if (!msg.content.startsWith(prefix) || msg.author.bot)
		return;
	
	//Send error message, if message sent in DMs
	if (msg.channel.type !== "text")
		return msg.reply_bot_msg_err("I do not work in DMs!");
	
	//Generate args and command strings
	const args         = msg.content.slice(prefix.length).split(/ +/);
	const command_name = args.shift().toLowerCase();
	
	//Find Command
	const command = bot.commands.get(command_name) || bot.commands.find(cmd => cmd.aliases && cmd.aliases.includes(command_name));
	
	//If not valid command, send error message
	if(!command)
		return msg.reply_bot_msg_err(`Invalid command! Run \`${prefix}help\` for list of avaliable commands`);
	
	//If passed with less than the minimum amount of arguments, send error message
	if(command.min_args && command.min_args > args.length)
		return msg.reply_bot_msg_err("Not enough arguments!", command.name, command.usage)
	
	//Execute command
	try {
		command.execute(msg, args);
	} catch(err) {
		console.error(err);
		
		return msg.reply_bot_msg_err("There was an error executing the command!");
	}
});

//Login to Discord API
bot.login(token);

