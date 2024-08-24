const { Events, PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        const logChannelId = '1270777175485976586'; // Log channel ID
        const logChannel = interaction.guild.channels.cache.get(logChannelId);

        try {
            if (interaction.isStringSelectMenu()) {
                await interaction.deferReply({ ephemeral: true });

                if (interaction.customId === 'ticket_select') {
                    const selectedOption = interaction.values[0];
                    let ticketChannel;
                    let ticketDescription = '';

                    const generalStaffRoleId = '1250786185677242463'; 
                    const staffReportRoleId = '1248940668252979292'; 

                    const generalStaffRole = interaction.guild.roles.cache.get(generalStaffRoleId);
                    const staffReportRole = interaction.guild.roles.cache.get(staffReportRoleId);

                    if (!generalStaffRole || !staffReportRole) {
                        throw new Error(`One of the roles with IDs ${generalStaffRoleId} or ${staffReportRoleId} not found`);
                    }

                    const categoryID = '1271377613084037182'; 
                    const openTime = Math.floor(Date.now() / 1000);

                    switch (selectedOption) {
                        case 'staff_report':
                            ticketChannel = await interaction.guild.channels.create({
                                name: `staff-report-${interaction.user.username}`,
                                type: ChannelType.GuildText,
                                parent: categoryID,
                                topic: `Created by: ${interaction.user.id} | Opened at: ${openTime}`, 
                                permissionOverwrites: [
                                    {
                                        id: interaction.guild.id,
                                        deny: [PermissionsBitField.Flags.ViewChannel],
                                    },
                                    {
                                        id: interaction.user.id,
                                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                                    },
                                    {
                                        id: staffReportRole.id,
                                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                                    },
                                ],
                            });
                            ticketDescription = 'Thank you for submitting a staff report ticket. Our staff team will reach back to you shortly. While you wait, please provide information about the staff and proof of their actions.';
                            break;
                        case 'civ_report':
                            ticketChannel = await interaction.guild.channels.create({
                                name: `civ-report-${interaction.user.username}`,
                                type: ChannelType.GuildText,
                                parent: categoryID,
                                topic: `Created by: ${interaction.user.id} | Opened at: ${openTime}`, 
                                permissionOverwrites: [
                                    {
                                        id: interaction.guild.id,
                                        deny: [PermissionsBitField.Flags.ViewChannel],
                                    },
                                    {
                                        id: interaction.user.id,
                                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                                    },
                                    {
                                        id: generalStaffRole.id,
                                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                                    },
                                ],
                            });
                            ticketDescription = 'Thank you for submitting a civilian report ticket. Our staff team will reach back to you shortly. While you wait, please provide information about the civilian and evidence of their actions.';
                            break;
                        case 'general_support':
                            ticketChannel = await interaction.guild.channels.create({
                                name: `general-support-${interaction.user.username}`,
                                type: ChannelType.GuildText,
                                parent: categoryID,
                                topic: `Created by: ${interaction.user.id} | Opened at: ${openTime}`, 
                                permissionOverwrites: [
                                    {
                                        id: interaction.guild.id,
                                        deny: [PermissionsBitField.Flags.ViewChannel],
                                    },
                                    {
                                        id: interaction.user.id,
                                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                                    },
                                    {
                                        id: generalStaffRole.id,
                                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                                    },
                                ],
                            });
                            ticketDescription = 'Thank you for submitting a general support ticket. Our staff team will reach back to you shortly. While you wait, please provide details about why you opened this ticket.';
                            break;
                        default:
                            return;
                    }

                    const ticketEmbed = new EmbedBuilder()
                        .setTitle('H9GVRP | Server Support')
                        .setDescription(ticketDescription)
                        .setColor(`#89cff0`);

                    const claimButton = new ButtonBuilder()
                        .setCustomId('claim_ticket')
                        .setLabel('🙋‍♂️ Claim Ticket')
                        .setStyle(ButtonStyle.Primary);

                    const closeButton = new ButtonBuilder()
                        .setCustomId('close_ticket')
                        .setLabel('🔒 Close Ticket')
                        .setStyle(ButtonStyle.Danger);

                    const buttonRow = new ActionRowBuilder()
                        .addComponents(claimButton, closeButton);

                    await ticketChannel.send({ 
                        content: `${interaction.user}, <@&${selectedOption === 'staff_report' ? staffReportRoleId : generalStaffRoleId}>`, 
                        embeds: [ticketEmbed], 
                        components: [buttonRow] 
                    });

                    if (logChannel) {
                        const logEmbed = new EmbedBuilder()
                            .setTitle('Ticket Created')
                            .setDescription(`Ticket created by ${interaction.user} (${interaction.user.id})`)
                            .addFields(
                                { name: 'Ticket Type', value: selectedOption },
                                { name: 'Ticket Channel', value: ticketChannel.toString() },
                                { name: 'Open Time', value: `<t:${openTime}:f>` }
                            )
                            .setColor(`#89cff0`);
                        await logChannel.send({ embeds: [logEmbed] });
                    }

                    await interaction.editReply({ content: `Ticket created: ${ticketChannel}` });
                }
            } else if (interaction.isButton()) {
                if (interaction.customId === 'claim_ticket') {
                    const staffRoleId = '1250786185677242463'; 
                    const staffReportRoleId = '1248940668252979292'; 

                    const roleToCheck = interaction.channel.name.startsWith('staff-report') ? staffReportRoleId : staffRoleId;

                    if (!interaction.member.roles.cache.has(roleToCheck)) {
                        return interaction.reply({ content: 'You do not have permission to claim this ticket.', ephemeral: true });
                    }

                    await interaction.channel.permissionOverwrites.edit(interaction.user.id, { 
                        ViewChannel: true, 
                        SendMessages: true 
                    });

                    await interaction.channel.permissionOverwrites.edit(roleToCheck, { 
                        SendMessages: false 
                    });

                    await interaction.reply({ content: `Ticket claimed by ${interaction.user}.`, ephemeral: false });

                    if (logChannel) {
                        const logEmbed = new EmbedBuilder()
                            .setTitle('Ticket Claimed')
                            .setDescription(`Ticket claimed by ${interaction.user} (${interaction.user.id})`)
                            .addFields(
                                { name: 'Ticket Channel', value: interaction.channel.toString() },
                                { name: 'Claim Time', value: `<t:${Math.floor(Date.now() / 1000)}:f>` }
                            )
                            .setColor(`#89cff0`);
                        await logChannel.send({ embeds: [logEmbed] });
                    }
                }

                if (interaction.customId === 'close_ticket') {
                    const channelTopic = interaction.channel.topic || '';
                    const openTimeStr = channelTopic.split(' | ')[1]?.split('Opened at: ')[1];
                    const openTime = openTimeStr ? parseInt(openTimeStr) : Math.floor(Date.now() / 1000); 
                    const closeTime = Math.floor(Date.now() / 1000);

                    const ticketCloseEmbed = new EmbedBuilder()
                        .setTitle('H9GVRP| Ticket Closed')
                        .setDescription(`Dear <@${channelTopic.split('Created by: ')[1]?.split(' | ')[0]}>, your ticket has now been closed.`)
                        .addFields(
                            { name: 'Ticket Open time', value: `<t:${openTime}:f>` }, 
                            { name: 'Ticket Close time', value: `<t:${closeTime}:f>` }
                        )
                        .setColor(`#89cff0`);

                    const ticketCreatorId = channelTopic.split('Created by: ')[1]?.split(' | ')[0];
                    const ticketCreator = interaction.guild.members.cache.get(ticketCreatorId);
                    if (ticketCreator) {
                        try {
                            await ticketCreator.send({ embeds: [ticketCloseEmbed] });
                        } catch (error) {
                            console.error(`Failed to send DM to ticket creator: ${error.message}`);
                        }
                    } else {
                        console.error('Ticket creator not found.');
                    }

                    await interaction.channel.send('This ticket is now closed.');

                    if (logChannel) {
                        const logEmbed = new EmbedBuilder()
                            .setTitle('Ticket Closed')
                            .setDescription(`Ticket closed by ${interaction.user} (${interaction.user.id})`)
                            .addFields(
                                { name: 'Ticket Channel', value: interaction.channel.toString() },
                                { name: 'Close Time', value: `<t:${closeTime}:f>` }
                            )
                            .setColor(`#89cff0`);
                        await logChannel.send({ embeds: [logEmbed] });
                    }

                    setTimeout(async () => {
                        await interaction.channel.delete();
                    }, 5000);
                }
            }
        } catch (error) {
            console.error(`Error handling interaction: ${error}`);
            if (!interaction.replied) {
                try {
                    await interaction.reply({ content: 'An error occurred while handling your request.', ephemeral: true });
                } catch (replyError) {
                    console.error(`Failed to send error reply: ${replyError}`);
                }
            } else {
                try {
                    await interaction.followUp({ content: 'An error occurred while handling your request.', ephemeral: true });
                } catch (followUpError) {
                    console.error(`Failed to send error follow-up: ${followUpError}`);
                }
            }
        }
    },
};
