import React from 'react'

export default function InviteBanner({ invites }: { invites: any[] }) {
  if (!invites || invites.length === 0) return null
  return (
    <div className="mb-6 border-l-4 border-yellow-400 bg-yellow-50 p-4 rounded">
      <div className="font-semibold">Pending Invitations</div>
      <div className="text-sm text-gray-700">
        You have {invites.length} pending invitation{invites.length>1?'s':''}. <button className="underline">View</button>
      </div>
    </div>
  )
}
