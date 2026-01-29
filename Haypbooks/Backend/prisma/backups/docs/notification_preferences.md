Notification Preferences

Purpose
- Store notification channel configuration per workspace/company/user scope.
- Channels are stored as JSON to allow flexible settings (email, SMS, webhook details, batching rules).

Model example
- `NotificationPreference.channels` JSON example:
```
{
  "email": { "enabled": true, "address": "billing@example.com" },
  "sms": { "enabled": false, "phone": "+11234567890" },
  "webhooks": [
    { "id": "wh_1", "enabled": true, "url": "https://hooks.example.com/notify", "headers": { "x-secret": "..." } }
  ]
}
```

Processing worker (pseudocode)
- Query preferences for the target scope (user -> company -> practice -> workspace fallback).
- For each reminder job, resolve preference for the nearest scoped object (user preference, then company, then practice, then workspace default).
- Send over enabled channels, record success/failure in reminder job (`attempts`, `sentAt`, `errorMessage`).

Security & privacy
- Store webhook secrets encrypted in application config (do not store plaintext secrets in the DB unless encrypted).
- Respect user-level opt-out flags and global workspace notification settings.

Integration
- Worker should support retries, backoff, and idempotency keys for external webhook calls.
- Consider exposing a UI to preview and test channels (send test email/webhook).