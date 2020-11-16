const { remove_channel_ids ,find_lock}      = require("../database.js");
const { format_user_id, format_channel_id } = require("../format-id.js");

module.exports = {
	name: "removechannels",
	description: "Remove channels to your emote",
	usage: "{ADMIN ONLY: user} <emote> <all, channel1 channel2 channel3...>",
	aliases: ["rc"],
	min_args: 2,
	execute(msg, args) {
		let emoji            = null;
		let user_id          = msg.is_valid_member(args[0]);
		let channel_ids      = null;
		let emoji_args_index = 1; //Specifies which index in args array the emoji is located
		let is_author_admin  = msg.member.hasPermission("ADMINISTRATOR");
		
		//Check if user_id is valid
		//If valid, check if admin or modifying itself, else send error message
		if(!user_id) {
			user_id          = msg.author.id;
			emoji_args_index = 0;
		} else if(!is_author_admin && msg.author.id != user_id) {
			return msg.reply_bot_msg_err("You cannot set other users channels because you are not an admin!");
		} 
		
		emoji          = msg.is_valid_emoji(args[emoji_args_index]);
		//Channel IDs can be "all" or an array of valid IDs
		channel_ids    = args[emoji_args_index + 1].toLowerCase() == "all" ? "all" : null || args.map(channel_id => msg.is_valid_channel(channel_id)).slice(emoji_args_index + 1);
		const user     = format_user_id(user_id);
		const channels = channel_ids.map(channel_id => format_channel_id(channel_id));
		
		//If emoji or channel is invalid, send error message
		if(!emoji || (channel_ids.includes && channel_ids.includes(null)))
			return msg.reply_bot_msg_err(!emoji ? "Invalid Emoji!" : "Invalid Channel(s)!", this.name, this.usage);
		
		//Remove channel from the database
		const callback = function(err, res) {
			//If unhandled error, send error message
			if(err) {
				console.error(err);
				
				return msg.reply_bot_msg_err("Something went wrong when removing the channel(s)!");
			}
			
			//If channel(s) not removed, send error message
			if(!res.nModified)
				return msg.reply_bot_msg_err("Channel(s) not found!");
			
			//If channel(s) removed, send success message
			return msg.reply_bot_msg_suc(is_author_admin ? `Removed ${channels} from ${user}'s ${emoji} !` : `Removed ${channels} from ${emoji}!`);
		};
		
		return remove_channel_ids(emoji, user_id, msg.guild.id, channel_ids, callback);
	}
};

