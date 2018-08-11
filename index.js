const Discord = require("discord.js");
const BotConfig = require("./botconfig.json");
const Bot = new Discord.Client({disableEveryone: true});
const fs = require("fs");
Bot.commands = new Discord.Collection();
let Cooldown = new Set();
let CDSeconds = 2;

fs.readdir("./commands/", (err, files) => {
  if(err) console.log(err);
  let jsfile = files.filter(f => f.split(".").pop() === "js")
  if(jsfile.length <= 0){
    console.log("No commands found.");
    return;
  }
  jsfile.forEach((f, i) =>{
    let props = require(`./commands/${f}`);
    console.log(`${f} loaded.`);
    Bot.commands.set(props.help.name, props);
  });
});

Bot.on("ready", async () => {
  console.log(`${Bot.user.username} is online.`);
  Bot.user.setActivity(`/help | ${Bot.guilds.size} servers`);
  Bot.user.setStatus("idle");
});

Bot.on("message", async message => {
  if(message.author.Bot) return;
  if(message.author.type === "dm") return;

  let Prefix = BotConfig.Prefix;

  if(!message.content.startsWith(Prefix)) return;
  if(Cooldown.has(message.author.id)){
    message.delete();
    return message.channel.send("You need to wait 2 seconds between using commands.")
  }
    Cooldown.add(message.author.id);

  let messageArray = message.content.split(" ");
  let Command = messageArray[0];
  let args = messageArray.slice(1);
  let CommandFile = Bot.commands.get(Command.slice(Prefix.length));
  if(CommandFile) CommandFile.run(Bot, message, args);

  setTimeout(() => {
    Cooldown.delete(message.author.id)
  }, CDSeconds * 1000)
});

Bot.login(BotConfig.Token);
