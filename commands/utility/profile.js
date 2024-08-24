const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const path = require('path');
const fs = require('fs');

const dataFolderPath = path.join(__dirname, '../../data/vehicleData');
const policeRecordsDirPath = path.join(__dirname, '../../data/policeRecords');
const licensesDirPath = path.join(__dirname, '../../data/licenses');
const ticketsDirPath = path.join(__dirname, '../../data/tickets');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Displays your or another user\'s profile.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Select a user to view their profile. If not selected, shows your profile.')),

    async execute(interaction) {
        const selectedUser = interaction.options.getUser('user') || interaction.user;
        const userId = selectedUser.id;
        const userTag = selectedUser.tag;

        const userFilePath = path.join(dataFolderPath, `${userId}.json`);
        const policeRecordFilePath = path.join(policeRecordsDirPath, `${userId}.json`);
        const licenseFilePath = path.join(licensesDirPath, `${userId}.json`);
        const ticketFilePath = path.join(ticketsDirPath, `${userId}.json`);

        try {
            let userVehicles = [];
            if (fs.existsSync(userFilePath)) {
                userVehicles = JSON.parse(fs.readFileSync(userFilePath, 'utf8'));
            }

            let policeRecords = [];
            if (fs.existsSync(policeRecordFilePath)) {
                policeRecords = JSON.parse(fs.readFileSync(policeRecordFilePath, 'utf8'));
            }

            let licenseStatus = 'No license records found.';
            if (fs.existsSync(licenseFilePath)) {
                const licenses = JSON.parse(fs.readFileSync(licenseFilePath, 'utf8'));
                if (licenses.length > 0) {
                    const latestLicense = licenses[licenses.length - 1];
                    licenseStatus = `**Status:** ${latestLicense.status}\n**Date:** ${new Date(latestLicense.date).toLocaleString()}`;
                }
            }

            const profileEmbed = new EmbedBuilder()
                .setTitle(`${userTag}'s Profile`)
                .setDescription('Police records and vehicles information can be accessed using the buttons below.')
                .setColor('#89cff0')
                .setThumbnail(selectedUser.displayAvatarURL());

            const viewVehiclesButton = new ButtonBuilder()
                .setCustomId(`view_vehicles_${userId}`)
                .setLabel('View Vehicles')
                .setStyle(ButtonStyle.Primary);

            const viewPoliceRecordsButton = new ButtonBuilder()
                .setCustomId(`view_police_records_${userId}`)
                .setLabel('Police Records')
                .setStyle(ButtonStyle.Primary);

            const row = new ActionRowBuilder()
                .addComponents(viewVehiclesButton, viewPoliceRecordsButton);

            const replyMessage = await interaction.reply({ embeds: [profileEmbed], components: [row], fetchReply: true });

            // Collect button interactions
            const filter = i => i.customId.startsWith('view_vehicles_') || i.customId.startsWith('view_police_records_');
            const collector = replyMessage.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async i => {
                if (i.customId.startsWith('view_vehicles_')) {
                    const vehiclesList = userVehicles.length > 0
                        ? userVehicles.map((v, index) =>
                            `**${index + 1}.** Year: ${v.year}, Make: ${v.make}, Model: ${v.model}, Color: ${v.color}, Number Plate: ${v.numberPlate}`).join('\n')
                        : 'No vehicles registered.';

                    const vehiclesEmbed = new EmbedBuilder()
                        .setTitle(`${selectedUser.tag}'s Registered Vehicles`)
                        .setDescription(vehiclesList)
                        .setColor(0x2B2D31);

                    await i.reply({ embeds: [vehiclesEmbed], ephemeral: true });
                } else if (i.customId.startsWith('view_police_records_')) {
                    const arrestsList = policeRecords.length > 0
                        ? policeRecords.map((r, index) =>
                            `**${index + 1}.** Reason: ${r.reason}\nOffenses: ${r.offenses}\nPrice: ${r.price}\nExecuted By: ${r.executedBy}\nDate: ${new Date(r.date).toLocaleString()}`).join('\n\n')
                        : 'No arrests found.';

                    let ticketsList = 'No tickets found.';
                    if (fs.existsSync(ticketFilePath)) {
                        const tickets = JSON.parse(fs.readFileSync(ticketFilePath, 'utf8'));
                        if (tickets.length > 0) {
                            ticketsList = tickets.map((t, index) =>
                                `**${index + 1}.** Offense: ${t.offense}\nPrice: ${t.price}\nCount: ${t.count}\nDate: ${new Date(t.date).toLocaleString()}`).join('\n\n');
                        }
                    }

                    const policeRecordsEmbed = new EmbedBuilder()
                        .setTitle(`${selectedUser.tag}'s Police Records and Tickets`)
                        .addFields(
                            { name: 'Arrests', value: arrestsList || 'No arrests found.', inline: false },
                            { name: 'Tickets', value: ticketsList || 'No tickets found.', inline: false },
                            { name: 'License Status', value: licenseStatus, inline: false } // License status included here
                        )
                        .setColor('#FF0000');

                    await i.reply({ embeds: [policeRecordsEmbed], ephemeral: true });
                }
            });

            collector.on('end', collected => {
                if (collected.size === 0) {
                    interaction.editReply({ content: 'No interaction received.', components: [] });
                }
            });

        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'An error occurred while fetching the profile.', ephemeral: true });
        }
    },
};
