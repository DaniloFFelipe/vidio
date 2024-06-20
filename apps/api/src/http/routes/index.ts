import type { FastifyInstance } from 'fastify'

import { authenticateWithPassword } from './auth/authenticate-with-password'
import { createAccount } from './auth/create-account'
import { getProfile } from './auth/get-profile'
import { requestPasswordRecover } from './auth/request-password-recover'
import { resetPassword } from './auth/reset-password'
import { registerCallback } from './callbacks/register-callback'
import { uploadImages } from './images/upload-images'
import { acceptInvite } from './invites/accept-invite'
import { createInvite } from './invites/create-invite'
import { getInvite } from './invites/get-invite'
import { getPendingInvites } from './invites/get-pending-invites'
import { rejectInvite } from './invites/reject-invite'
import { revokeInvite } from './invites/revoke-invite'
import { createApplicationKey } from './keys/create-application-key'
import { getApplicationKeys } from './keys/get-application-keys'
import { removeApplicationKeys } from './keys/remove-application-keys'
import { getMembers } from './members/get-members'
import { removeMember } from './members/remove-member'
import { updateMember } from './members/update-member'
import { createOrganization } from './orgs/create-organization'
import { getMembership } from './orgs/get-membership'
import { getOrganization } from './orgs/get-organization'
import { getOrganizations } from './orgs/get-organizations'
import { shutdownOrganization } from './orgs/shutdown-organization'
import { updateOrganization } from './orgs/update-organization'
import { streamMedia } from './stream/stream'
import { uploadFileBYKey } from './upload/upload-file-by-key'
import { uploadFile } from './upload/upload-file-by-user'
import { createVideoByUser } from './videos/create-video'
import { createVideoByKey } from './videos/create-video-by-key'
import { getOrganizationVideo } from './videos/get-organization-video'
import { getOrganizationVideos } from './videos/get-organization-videos'
import { updateVideoByUser } from './videos/update-video'

export async function routes(app: FastifyInstance) {
  app.register(createAccount)
  app.register(authenticateWithPassword)
  app.register(getProfile)
  app.register(requestPasswordRecover)
  app.register(resetPassword)

  app.register(createOrganization)
  app.register(getMembership)
  app.register(getOrganization)
  app.register(getOrganizations)
  app.register(updateOrganization)
  app.register(shutdownOrganization)

  app.register(getMembers)
  app.register(updateMember)
  app.register(removeMember)

  app.register(createInvite)
  app.register(getInvite)
  app.register(acceptInvite)
  app.register(rejectInvite)
  app.register(revokeInvite)
  app.register(getPendingInvites)

  app.register(createApplicationKey)
  app.register(getApplicationKeys)
  app.register(removeApplicationKeys)

  app.register(registerCallback)

  app.register(uploadImages)

  app.register(streamMedia)

  app.register(uploadFile)
  app.register(uploadFileBYKey)

  app.register(createVideoByKey)
  app.register(createVideoByUser)
  app.register(getOrganizationVideo)
  app.register(getOrganizationVideos)
  app.register(updateVideoByUser)
}
