const { add_emote_to_db } = require("../database.js")
const { format_user_id }  = require("../format-id.js");

module.exports = {
	name: "addemote",
	description: "Add an emote to be autoreacted",
	usage: "{ADMIN ONLY: user} <emote>",
	aliases: ["ae"],
	min_args: 1,
	execute(msg, args) {
		let emoji            = null;
		let user_id          = msg.is_valid_member(args[0]);
		let emoji_args_index = 1; //Specifies which index in args array the emoji is located
		let is_author_admin  = msg.member.hasPermission("ADMINISTRATOR");
		
		//Check if user_id is valid
		//If valid, check if admin or modifying itself, else send error message
		if(!user_id) {
			user_id          = msg.author.id;
			emoji_args_index = 0;
		} else if(!is_author_admin && msg.author.id != user_id) {
			return msg.reply_bot_msg_err("You cannot add emotes to other users because you are not an admin!");
		}
		
		emoji      = msg.is_valid_emoji(args[emoji_args_index]);
		const user = format_user_id(user_id);
		
		//If invalid emoji, send error message
		if(!emoji)
			return msg.reply_bot_msg_err("Invalid emoji!", this.name, this.usage);
		
		//Add emote to the database
		const callback = function(err, res) {
			//If unhandled error, send error message
			if(err) {
				console.error(err);
				
				return msg.reply_bot_msg_err("Something went wrong when adding the emote!");
			}
			
			//If emote not added, send error message
			if(!res.upserted && !res.nModified)
				return msg.reply_bot_msg_err(`${emoji} has already been added!`);
				
				
			//If emote updated to the database, send success message
			return msg.reply_bot_msg_suc(is_author_admin ? `Added ${emoji} to ${user}'s emote list!` : `Added ${emoji} !`);
		};
		
		return add_emote_to_db(emoji, user_id, msg.guild.id, callback);
	}
};

