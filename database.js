const { default_global_cooldown, default_min_cooldown } = require("./config.json");
const mongoose                                          = require("mongoose");

//TODO: Better variable names than _inp?
//Possible TODO: Better boolean vairables names in schema?

//MongoDB Initialize
const db_url = "mongodb://localhost/babubot";
const db     = mongoose.connection;
mongoose.connect(db_url);
 
//Emote Schema and Model
const EmoteSchema = new mongoose.Schema({
	guild_id: String,
	global_cooldown: { type: Number, default: default_global_cooldown },
	min_cooldown: { type: Number, default: default_min_cooldown },
	users: [{
		user_id: String,
		_id: false,
		emotes: [{
			emote: String,
			channel_ids: [String],
			cooldown: Number,
			all_channels: { type: Boolean, default: true },
			global_cooldown: { type: Boolean, default: true },
			lock: { type: Boolean, default: false },
			_id: false
		}]
	}]
});
const Emote = new mongoose.model("Emote", EmoteSchema);

db.on("error", console.error.bind(console, "Database Error: "));

db.once("open", function() {
	console.log("Database ready!");
});

module.exports = {
	//Possible TODO: Rewrite database functions using bulkWrite Instead?
	//https://mongoosejs.com/docs/api/model.html#model_Model.bulkWrite
	add_emote_to_db(emote_inp, user_inp, guild_inp, callback) {
		//Find Emote
		const filter_find_emote = {
			guild_id: guild_inp,
			"users.user_id": user_inp,
			"users.emotes.emote": emote_inp
		};
		const callback_find_emote = function(err, res) {
			if(err) {
				return callback(err);
			}
			
			if(!res) {
				return update_emotes_fn();
			}
			
			return callback(err, res);
		};
		const find_emote_fn = function() {
			Emote.findOne(filter_find_emote, callback_find_emote);
		};
		
		//Update Emotes
		const filter_emotes = {
			guild_id: guild_inp,
			"users.user_id": user_inp,
			"users.emotes.emote": { $ne: emote_inp }
		};
		const update_emotes = {
			$addToSet: { "users.$[i].emotes": { emote: emote_inp } } 
		};
		const options_emotes = {
			arrayFilters: [
				{ "i.user_id": user_inp }
			]
		};
		const callback_emotes = function(err, res) {
			if(err) {
				return callback(err);
			}
			
			if(!res.nModified) {
				return update_users_fn();
			}
			
			return callback(err, res);
		};
		const update_emotes_fn = function() {
			Emote.updateOne(filter_emotes, update_emotes, options_emotes, callback_emotes);
		};
		
		//Update Users
		const filter_users = {
			guild_id: guild_inp,
			"users.user_id" : { $ne: user_inp }
		};
		const update_users = {
			$addToSet: {
				users: {
					user_id: user_inp,
					emotes: [{ emote: emote_inp }]
				}
			}
		};
		const options_users = { };
		const callback_users = function(err, res) {
			if(err) {
				return fn(err);
			}
			
			if(!res.nModified) {
				return update_guilds_fn();
			}
			
			return callback(err, res);
		};
		const update_users_fn = function() {
			Emote.updateOne(filter_users, update_users, options_users, callback_users);
		};
		
		//Update Guilds
		const filter_guilds = {
			guild_id: guild_inp
		};
		const update_guilds = {
			$set: {
				guild_id: guild_inp,
				users: [{
					user_id: user_inp,
					emotes: [{ emote: emote_inp }]
				}]
			}
		};
		const options_guilds = {
			new: true,
			upsert: true
		};
		const update_guilds_fn = function() {
			Emote.updateOne(filter_guilds, update_guilds, options_guilds, callback);
		};
		
		return find_emote_fn();
	},
	add_channel_ids_to_db(emote_inp, user_inp, guild_inp, channels_inp, callback) {
		//Possible TODO: When adding new channels, only show channels that actually were added instead of all channels
		
		const filter = {
			guild_id: guild_inp,
			"users.user_id": user_inp,
			"users.emotes.emote": emote_inp
		};
		const options = {
			arrayFilters: [
				{ "i.user_id": user_inp },
				{ "j.emote": emote_inp }
			]
		};
		
		if(channels_inp == "all") {
			const update = {
				"users.$[i].emotes.$[j].all_channels": true,
				"users.$[i].emotes.$[j].channel_ids": []
			};
			
			return Emote.updateOne(filter, update, options, callback);
		}
		
		const update = {
			"users.$[i].emotes.$[j].all_channels": false,
			$addToSet: { "users.$[i].emotes.$[j].channel_ids": channels_inp }
		};
		
		return Emote.updateOne(filter, update, options, callback);
	},
	find_emotes(user_inp, guild_inp, callback) {
		const filter = {
			guild_id: guild_inp,
			"users.user_id": user_inp,
		};
		
		return Emote.findOne(filter, callback);
	},
	set_cooldown_to_emote(emote_inp, user_inp, guild_inp, cooldown_inp, callback) {
		const filter = {
			guild_id: guild_inp,
			"users.user_id": user_inp,
			"users.emotes.emote": emote_inp
		};
		const options = {
			arrayFilters: [
				{ "i.user_id": user_inp },
				{ "j.emote": emote_inp }
			]
		};
		
		if(cooldown_inp == "global") {
			const update = {
				"users.$[i].emotes.$[j].global_cooldown": true
			};
			
			return Emote.updateOne(filter, update, options, callback);
		}
		
		const update = {
			"users.$[i].emotes.$[j].cooldown": cooldown_inp,
			"users.$[i].emotes.$[j].global_cooldown": false
		};
		
		return Emote.updateOne(filter, update, options, callback);
	},
	remove_emote(emote_inp, user_inp, guild_inp, callback) {
		const filter = {
			guild_id: guild_inp,
			"users.user_id": user_inp,
			"users.emotes.emote": emote_inp
		};
		const update = {
			$pull: { "users.$[i].emotes": { emote: emote_inp } }
		};
		const options = {
			arrayFilters: [
				{ "i.user_id": user_inp }
			]
		};
		
		return Emote.updateOne(filter, update, options, callback);
	},
	remove_channel_ids(emote_inp, user_inp, guild_inp, channels_inp, callback) {
		//Possible TODO: Show channels that were actually removed
		const filter = {
			guild_id: guild_inp,
			"users.user_id": user_inp,
			"users.emotes.emote": emote_inp
		};
		const update = {
			$pullAll: { "users.$[i].emotes.$[j].channel_ids": channels_inp }
		};
		const options = {
			arrayFilters: [
				{ "i.user_id": user_inp },
				{ "j.emote": emote_inp }
			]
		};
		
		return Emote.updateOne(filter, update, options, callback);
	},
	find_lock(emote_inp, user_inp, guild_inp, callback) {
		const filter = {
			guild_id: guild_inp,
			"users.user_id": user_inp,
			"users.emotes.emote": emote_inp
		};
		
		return Emote.findOne(filter, callback);
	},
	lock_emote(emote_inp, user_inp, guild_inp, callback) {
		const filter = {
			guild_id: guild_inp,
			"users.user_id": user_inp,
			"users.emotes.emote": emote_inp
		};
		const update = {
			"users.$[i].emotes.$[j].lock": true
		};
		const options = {
			arrayFilters: [
				{ "i.user_id": user_inp },
				{ "j.emote": emote_inp }
			]
		};
		
		return Emote.updateOne(filter, update, options, callback);
	},
	unlock_emote(emote_inp, user_inp, guild_inp, callback) {
		const filter = {
			guild_id: guild_inp,
			"users.user_id": user_inp,
			"users.emotes.emote": emote_inp
		};
		const update = {
			"users.$[i].emotes.$[j].lock": false
		};
		const options = {
			arrayFilters: [
				{ "i.user_id": user_inp },
				{ "j.emote": emote_inp }
			]
		};
		
		return Emote.updateOne(filter, update, options, callback);
	},
	find_cooldown(guild_inp, callback) {
		//Find global cooldown
		const filter_find = {
			guild_id: guild_inp
		};
		const callback_find = function(err, res) {
			if(err) {
				return callback(err);
			}
			
			if(!res) {
				return default_fn();
			}
			
			return callback(err, res);
		}
		const find_fn = function() {
			return Emote.findOne(filter_find, callback_find);
		}
		
		//Update global cooldown with default if not found
		const update_default = {
			guild_id: guild_inp
		};
		const options_default = {
			new: true,
			upsert: true,
			setDefaultsOnInsert: true
		};
		const callback_default = function(err, res) {
			if(err) {
				return callback(err);
			}
			
			return callback(err, res);
		};
		const default_fn = function() {
			return Emote.findOneAndUpdate({ }, update_default, options_default, callback);
		}
		
		find_fn();
	},
	set_global_cooldown(guild_inp, global_cooldown_inp, callback) {
		const filter = {
			guild_id: guild_inp
		};
		const update = {
			guild_id: guild_inp,
			global_cooldown: global_cooldown_inp
		};
		const options = {
			new: true,
			upsert: true,
		};
		
		return Emote.updateOne(filter, update, options, callback);
	},
	set_min_cooldown(guild_inp, min_cooldown_inp, callback) {
		const filter_min_cooldown = {
			guild_id: guild_inp
		};
		const update_min_cooldown = {
			guild_id: guild_inp,
			min_cooldown: min_cooldown_inp
		};
		const options_min_cooldown = {
			new: true,
			upsert: true,
		};
		
		Emote.updateOne(filter_min_cooldown, update_min_cooldown, options_min_cooldown, callback);
		
		//TODO: Enforce all cooldowns are above min cooldown value
		//MongoDB does not allow positional operator to be used twice
		//Possible fix is to use forEach?
		/*
		const filter_enforce = {
			guild_id: guild_inp,
			"users.emotes.cooldown": { $lt: min_cooldown_inp }
		};
		const update_enforce = {
			"users.$.emotes.$.cooldown": min_cooldown_inp
		};
		const callback_enforce = function(err, res) {
			if(err) {
				console.log(err);
			}
			
			console.log(res);
		}
		
		Emote.updateMany(filter_enforce, update_enforce, callback_enforce);
	*/
	}
}

