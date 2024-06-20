import { AbilityBuilder } from '@casl/ability'

import { AppAbility } from '.'
import { User } from './models/user'
import { Role } from './roles'

type PermissionsByRole = (
  user: User,
  builder: AbilityBuilder<AppAbility>,
) => void

export const permissions: Record<Role, PermissionsByRole> = {
  ADMIN(user, { can, cannot }) {
    can('manage', 'all')
    can(['create', 'update', 'delete', 'get'], 'Key')
    cannot(['delete'], 'Organization')
    can(['delete'], 'Organization', {
      ownerId: { $eq: user.id },
    })
  },
  MEMBER(user, { can }) {
    can('get', 'User')
    can('create', 'Video')
    can(['update', 'delete', 'get'], 'Video', { organizationId: user.organizationId })
  }
}
