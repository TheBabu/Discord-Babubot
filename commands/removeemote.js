const { remove_emote, find_lock } = require("../database.js");
const { format_user_id }          = require("../format-id.js");

module.exports = {
	name: "removeemote",
	description: "Remove an emote to be autoreacted",
	usage: "{ADMIN ONLY: user} <emote>",
	aliases: ["re"],
	min_args: 1,
	execute(msg, args) {
		let emoji            = null;
		let user_id          = msg.is_valid_member(args[0]);
		let emoji_args_index = 1; //Specifies which index in args array the emoji is located
		let is_author_admin  = true;
		
		//Check if user_id is valid
		//If valid, check if admin or modifying itself, else send error message
		if(!user_id) {
			user_id          = msg.author.id;
			emoji_args_index = 0;
		} else if(!msg.member.hasPermission("ADMINISTRATOR") && msg.author.id != user_id) {
			return msg.reply_bot_msg_err("You cannot remove emotes to other users because you are not an admin!");
		}
		
		emoji      = msg.is_valid_emoji(args[emoji_args_index]);
		const user = msg.is_valid_member(user_id);
		
		//If invalid emoji, send error message
		if(!emoji)
			return msg.reply_bot_msg_err("Invalid emoji!", this.name, this.usage);
		
		//Remove emote from the database
		const callback = function(err, res) {
			//If unhandled error, send error message
			if(err) {
				console.error(err);
				
				return msg.reply_bot_msg_err("Something went wrong when removing the emote!");
			}
			
			//If emoji not removed, send error message
			if(!res.nModified)
				return msg.reply_bot_msg_err("Emoji not found!");
			
			//If emoji removed, send success message
			return msg.reply_bot_msg_suc(is_author_admin ? `Removed ${user}'s ${emoji}` : `Removed ${emoji} !`);
		};
		
		return remove_emote(emoji, user_id, msg.guild.id, callback);
	}
};

