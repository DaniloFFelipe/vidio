import { defineAbilityFor, type Role, userSchema } from '@vidio/auth'

export function getUserPermissions(
  userId: string,
  role: Role,
  organizationId: string,
) {
  const authUser = userSchema.parse({
    id: userId,
    role,
    organizationId,
  })

  const ability = defineAbilityFor(authUser)

  return ability
}
