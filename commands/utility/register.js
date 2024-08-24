const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const dataDirPath = path.join(__dirname, '../../data/vehicleData');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('register')
        .setDescription('Register your vehicle.')
        .addIntegerOption(option =>
            option.setName('year')
                .setDescription('Vehicle Year')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('make')
                .setDescription('Vehicle Make')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('model')
                .setDescription('Vehicle Model')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('color')
                .setDescription('Vehicle Color')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('number-plate')
                .setDescription('Vehicle Number Plate')
                .setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const year = interaction.options.getInteger('year');
            const make = interaction.options.getString('make');
            const model = interaction.options.getString('model');
            const color = interaction.options.getString('color');
            const numberPlate = interaction.options.getString('number-plate');
            const userId = interaction.user.id;

            // Ensure the data directory exists
            if (!fs.existsSync(dataDirPath)) {
                fs.mkdirSync(dataDirPath, { recursive: true });
            }

            const userFilePath = path.join(dataDirPath, `${userId}.json`);

            // Load existing vehicle data for the user
            let vehicleData = [];
            if (fs.existsSync(userFilePath)) {
                vehicleData = JSON.parse(fs.readFileSync(userFilePath, 'utf8'));
            }

            // Add the new vehicle data
            vehicleData.push({ year, make, model, color, numberPlate });

            // Save the updated vehicle data back to the file
            fs.writeFileSync(userFilePath, JSON.stringify(vehicleData, null, 2), 'utf8');

            // Create an ephemeral embed to confirm the registration to the user
            const ephemeralEmbed = new EmbedBuilder()
                .setTitle('Vehicle Registered')
                .setDescription(`Your vehicle has been successfully, excute the command /profile to view your vehicles.`)
                .setColor('#89cff0')
                .setFooter({
                    text: 'H9GVRP',
                    iconURL: 'https://cdn.discordapp.com/icons/1231665533653352500/68bd0fb834d88b198910d85cd60056ad.png?size=4096'
                });

            // Confirm the registration to the user with an ephemeral message
            await interaction.editReply({ embeds: [ephemeralEmbed] });

        } catch (error) {
            console.error('Error processing vehicle registration:', error);
            await interaction.editReply({ content: 'There was an error while processing your request.', ephemeral: true });
        }
    },
};
