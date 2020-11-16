const { find_emotes }                       = require("../database.js");
const { format_user_id, format_channel_id } = require("../format-id.js");

//Reply message with emotes data of a user
//Possible TODO: Make emotes formatting better
function reply_emotes_msg(msg, res, user_id) {
	const emotes          = res.users.find(u => u.user_id == user_id).emotes;
	const global_cooldown = res.global_cooldown;
	const user            = format_user_id(user_id);
	
	if(!emotes.length)
		return msg.reply_bot_msg_err(`Found no emotes for ${user}!`);
	
	const fields = emotes.map(function(emote_obj) { 
		const emote_entry = [];
		const channels    = emote_obj.channel_ids.length ? emote_obj.channel_ids.map(channel_id => format_channel_id(channel_id)) : "None";
		
		emote_entry.push({ name: "Emote", value: emote_obj.emote });
		emote_entry.push({ name: "Channel(s)", value: emote_obj.all_channels ? "All" : channels, inline: true });
		emote_entry.push({ name: "Cooldown", value: emote_obj.global_cooldown ? global_cooldown : emote_obj.cooldown, inline: true });
		emote_entry.push({ name: "Lock", value: emote_obj.lock ? ":lock:" : ":unlock:", inline: true });
		
		return emote_entry;
	}).flat();
	
	
	return msg.reply_bot_msg_suc(`${user}'s Emotes`, fields);
}

module.exports = {
	name: "emotes",
	description: "List emotes that will be autoreacted",
	usage: "[user]",
	aliases: ["e"],
	execute(msg, args) {
		//If argument found, try to extract user ID, else use user ID of the author 
		const user_id = args.length ? msg.is_valid_member(args[0]) : msg.author.id;
		const user    = format_user_id(user_id);
		
		//If invalid user ID, send error message
		if(!user_id)
			return msg.reply_bot_msg_err("Invalid user!", this.name, this.usage)
		
		//Find emote data of the user in the database
		const callback = function(err, res) {
			//If unhandled error, send error message
			if(err) {
				console.error(err);
				
				return msg.reply_bot_msg_err(args.length ? `Something when wrong when fetching ${user}'s emotes!` : "Something when wrong when fetching your emotes!");
			}
			
			//If no match, send error message
			if(!res)
				return msg.reply_bot_msg_err(args.length ? `${user} hasn't added any emotes yet!` : "You haven't added any emotes yet!");
			
			//If recieved a match, send emotes data
			return reply_emotes_msg(msg, res, user_id);
		};
		
		return find_emotes(user_id, msg.guild.id, callback);
	}
};

