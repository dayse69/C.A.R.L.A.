import { PermissionFlagsBits } from "discord.js";
/**
 * Utilitário centralizado para checagem de permissões
 */
export function hasAdminOrManageGuild(member) {
    if (!member)
        return false;
    return (member.permissions.has(PermissionFlagsBits.Administrator) ||
        member.permissions.has(PermissionFlagsBits.ManageGuild));
}
export function hasPermission(member, permission) {
    if (!member)
        return false;
    return member.permissions.has(permission);
}
export function requirePermission(interaction, permission, message = "❌ Permissão insuficiente.") {
    if (interaction.member &&
        "permissions" in interaction.member &&
        !interaction.member.permissions.has(permission)) {
        throw new Error(message);
    }
}
