require("dotenv").config();
const { token } = process.env;
const { Client, Collection, GatewayIntentBits } = require("discord.js");
const fs = require("fs");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
client.commands = new Collection();
client.commandArray = [];

const handleEvents = async () => {
  const eventFiles = fs.readdirSync(`./events`).filter((file) => file.endsWith(".js"));
  for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) client.once(event.name, (...args) => event.execute(...args, client));
    else client.on(event.name, (...args) => event.execute(...args, client));
  }
};

const handleCommands = async () => {
  const commandFolders = fs.readdirSync(`./commands`);
  for (const folder of commandFolders) {
    const commandFiles = fs.readdirSync(`./commands/${folder}`).filter((file) => file.endsWith(".js"));

    for (const file of commandFiles) {
      const command = require(`./commands/${folder}/${file}`);
      client.commands.set(command.data.name, command);
      client.commandArray.push(command.data.toJSON());
    }
  }

  const clientId = "1260251429294047243"; 
  const guildId = "1231665533653352500"; 
  const rest = new REST({ version: "9" }).setToken(token);

  try {
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: client.commandArray,
    });
    console.log("Slash commands uploaded");
  } catch (error) {
    console.error(error);
  }
};

client.handleEvents = handleEvents;
client.handleCommands = handleCommands;

(async () => {
  await client.handleEvents();
  await client.handleCommands();
})();

client.login(token);
