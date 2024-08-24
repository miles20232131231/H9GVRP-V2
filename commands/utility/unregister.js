const { SlashCommandBuilder, EmbedBuilder, StringSelectMenuBuilder, ActionRowBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const path = require('path');
const fs = require('fs');

const dataFolderPath = path.join(__dirname, '../../data/vehicleData');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unregister')
        .setDescription('Unregister a vehicle from your profile.'),

    async execute(interaction) {
        const user = interaction.user;
        const userId = user.id;

        const userFilePath = path.join(dataFolderPath, `${userId}.json`);

        try {
            let userVehicles = [];
            if (fs.existsSync(userFilePath)) {
                userVehicles = JSON.parse(fs.readFileSync(userFilePath, 'utf8'));
            }

            if (userVehicles.length === 0) {
                return interaction.reply({ content: 'You have no vehicles registered to unregister.', ephemeral: true });
            }

            const selectMenuOptions = userVehicles.map((vehicle, index) =>
                new StringSelectMenuOptionBuilder()
                    .setLabel(`Vehicle ${index + 1}`)
                    .setValue(index.toString())
                    .setDescription(`Year: ${vehicle.year}, Make: ${vehicle.make}, Model: ${vehicle.model}`)
            );

            selectMenuOptions.push(
                new StringSelectMenuOptionBuilder()
                    .setLabel('Remove All Vehicles')
                    .setValue('remove_all')
                    .setDescription('Remove all registered vehicles')
            );

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('select_vehicle')
                .setPlaceholder('Select a vehicle to unregister or remove all vehicles')
                .addOptions(selectMenuOptions);

            const row = new ActionRowBuilder()
                .addComponents(selectMenu);

            const embed = new EmbedBuilder()
                .setTitle('Your Registered Vehicles')
                .setColor(0x2B2D31);

            userVehicles.forEach((vehicle, index) => {
                embed.addFields({
                    name: `Vehicle ${index + 1}`,
                    value: `**Year:** ${vehicle.year}\n**Make:** ${vehicle.make}\n**Model:** ${vehicle.model}\n**Color:** ${vehicle.color}\n**Number Plate:** ${vehicle.numberPlate}`,
                    inline: true
                });
            });

            embed.setDescription('Please select the vehicle you want to unregister or choose to remove all vehicles from the dropdown below.');

            await interaction.reply({
                embeds: [embed],
                components: [row],
                ephemeral: true
            });

            const filter = i => i.customId === 'select_vehicle' && i.user.id === interaction.user.id;
            const collector = interaction.channel.createMessageComponentCollector({ filter, time: 30000 });

            collector.on('collect', async i => {
                if (i.customId === 'select_vehicle') {
                    const selectedValue = i.values[0];

                    if (selectedValue === 'remove_all') {
                        fs.unlinkSync(userFilePath);

                        const confirmationEmbed = new EmbedBuilder()
                            .setTitle('Vehicle Gone')
                            .setDescription('All your registered vehicles have been successfully removed.')
                            .setColor('#fa7878');

                        await i.update({
                            content: null, // Remove previous content
                            embeds: [confirmationEmbed],
                            components: [],
                            ephemeral: true
                        });
                    } else {
                        const selectedIndex = parseInt(selectedValue, 10);
                        const removedVehicle = userVehicles.splice(selectedIndex, 1)[0];

                        if (userVehicles.length > 0) {
                            fs.writeFileSync(userFilePath, JSON.stringify(userVehicles, null, 2), 'utf8');
                        } else {
                            fs.unlinkSync(userFilePath); 
                        }

                        const confirmationEmbed = new EmbedBuilder()
                            .setTitle('Vehicle Gone')
                            .setDescription(`Vehicle:\n**Year:** ${removedVehicle.year}\n**Make:** ${removedVehicle.make}\n**Model:** ${removedVehicle.model}\n**Color:** ${removedVehicle.color}\n**Number Plate:** ${removedVehicle.numberPlate}\n\nhas been successfully unregistered.`)
                            .setColor('#fa7878');

                        await i.update({
                            content: null, // Remove previous content
                            embeds: [confirmationEmbed],
                            components: [],
                            ephemeral: true
                        });
                    }
                }
            });

            collector.on('end', (collected, reason) => {
                if (reason === 'time') {
                    interaction.editReply({ components: [] }).catch(console.error);
                }
            });

        } catch (error) {
            console.error('Error unregistering vehicle:', error);
            await interaction.reply({ content: 'Failed to unregister vehicle.', ephemeral: true });
        }
    },
};
