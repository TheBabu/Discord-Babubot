const { set_cooldown_to_emote, find_lock } = require("../database.js");
const { format_user_id }                   = require("../format-id.js");

module.exports = {
	name: "cooldown",
	description: "Set cooldown for your emotes",
	usage: "{ADMIN ONLY: user} <emote> <time, global>",
	aliases: ["cd"],
	min_args: 2,
	execute(msg, args) {
		let emoji            = null;
		let user_id          = msg.is_valid_member(args[0]);
		let time             = null;
		let emoji_args_index = 1; //Specifies which index in args array the emoji is located
		let is_author_admin  = msg.member.hasPermission("ADMINISTRATOR");
		
		//Check if user_id is valid
		//If valid, check if admin or modifying itself, else send error message
		if(!user_id) {
			user_id          = msg.author.id;
			emoji_args_index = 0;
		} else if(!is_author_admin && msg.author.id != user_id) {
			return msg.reply_bot_msg_err("You cannot set cooldown to other users because you are not an admin!");
		}
		
		emoji      = msg.is_valid_emoji(args[emoji_args_index]);
		//Time can be "global" or a valid positive number
		time       = args[emoji_args_index + 1].toLowerCase() == "global" ? "global" : null || (isNaN(args[1]) || args[1] < 0) ? null : args[emoji_args_index + 1];
		const user = format_user_id(user_id);
		
		//If invalid emoji, send error message
		if(!emoji)
			return msg.reply_bot_msg_err("Invalid emoji!", this.name, this.usage);
		
		//If invalid time, send error message
		if(!time)
			return msg.reply_bot_msg_err("Invalid time!", this.name, this.usage);
		
		//Set cooldown to an emote in the database
		const callback = function(err, res) {
			//If unhandled error, send error message
			if(err) {
				console.error(err);
				
				return msg.reply_bot_msg_err("Something went wrong when setting the cooldown!");
			}
			
			//If cooldown not set, send error message
			if(!res.nModified)
				return msg.reply_bot_msg_err("Either invalid emoji or time already set!");
			
			//If cooldown set, send success message
			return msg.reply_bot_msg_suc(is_author_admin ? `Set cooldown to ${time} for ${user}'s ${emoji} !` : `Set cooldown to ${time} for ${emoji} !`);
		}
		
		return set_cooldown_to_emote(emoji, user_id, msg.guild.id, time, callback);
	}
};

