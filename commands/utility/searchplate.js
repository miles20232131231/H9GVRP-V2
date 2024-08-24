const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const path = require('path');
const fs = require('fs');

const dataFolderPath = path.join(__dirname, '../../data/vehicleData');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('search-plate')
        .setDescription('Search for vehicles by their number plate.')
        .addStringOption(option =>
            option.setName('plate')
                .setDescription('The number plate of the vehicles to search for')
                .setRequired(true)),

    async execute(interaction) {
        const plate = interaction.options.getString('plate');
        const vehicleFiles = fs.readdirSync(dataFolderPath);
        const foundVehicles = [];

        try {
            for (const file of vehicleFiles) {
                const filePath = path.join(dataFolderPath, file);
                if (fs.existsSync(filePath)) {
                    const vehicleData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                    for (const vehicle of vehicleData) {
                        if (vehicle.numberPlate === plate) {
                            foundVehicles.push({
                                userId: path.basename(file, '.json'),
                                ...vehicle
                            });
                        }
                    }
                }
            }

            if (foundVehicles.length > 0) {
                let description = `Here are the details of the vehicles with plate ${plate}:\n`;

                for (const vehicle of foundVehicles) {
                    try {
                        const user = await interaction.client.users.fetch(vehicle.userId);

                        description += `**Owner:** ${user.tag}\n` +
                            `**Make:** ${vehicle.make}\n` +
                            `**Model:** ${vehicle.model}\n` +
                            `**Color:** ${vehicle.color}\n` +
                            `**Year:** ${vehicle.year}\n` +
                            `**Number Plate:** ${vehicle.numberPlate}\n\n`;

                    } catch (userFetchError) {
                        console.error('Error fetching user data:', userFetchError);
                        description += `**Owner:** Unknown\n`;
                    }
                }

                const embed = new EmbedBuilder()
                    .setTitle('Vehicles Found')
                    .setDescription(description)
                    .setColor(0x2B2D31);

                await interaction.reply({ embeds: [embed] });
            } else {
                await interaction.reply({ content: 'No vehicles found with that number plate.', ephemeral: true });
            }
        } catch (error) {
            console.error('Error searching for vehicles:', error);
            await interaction.reply({ content: 'There was an error while processing your request.', ephemeral: true });
        }
    },
};
