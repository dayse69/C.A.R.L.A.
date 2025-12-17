import { GuildMember, Interaction, PermissionFlagsBits, PermissionsBitField } from "discord.js";

/**
 * Utilitário centralizado para checagem de permissões
 */
export function hasAdminOrManageGuild(member: GuildMember | null | undefined): boolean {
    if (!member) return false;
    return (
        member.permissions.has(PermissionFlagsBits.Administrator) ||
        member.permissions.has(PermissionFlagsBits.ManageGuild)
    );
}

export function hasPermission(member: GuildMember | null | undefined, permission: bigint): boolean {
    if (!member) return false;
    return member.permissions.has(permission);
}

export function requirePermission(
    interaction: Interaction,
    permission: bigint,
    message = "❌ Permissão insuficiente."
) {
    if (
        interaction.member &&
        "permissions" in interaction.member &&
        !(interaction.member.permissions as PermissionsBitField).has(permission)
    ) {
        throw new Error(message);
    }
}
