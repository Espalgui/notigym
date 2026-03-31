import json
import logging

from pywebpush import WebPushException, webpush
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.push_subscription import PushSubscription

logger = logging.getLogger(__name__)


async def send_push_to_user(db: AsyncSession, user_id, title: str, body: str, url: str = "/") -> int:
    """Send a web push notification to all devices of a user. Returns count sent."""
    if not getattr(settings, "VAPID_PRIVATE_KEY", None):
        return 0

    result = await db.execute(
        select(PushSubscription).where(PushSubscription.user_id == user_id)
    )
    subs = result.scalars().all()
    sent = 0

    for sub in subs:
        try:
            webpush(
                subscription_info={
                    "endpoint": sub.endpoint,
                    "keys": {"p256dh": sub.p256dh, "auth": sub.auth},
                },
                data=json.dumps({"title": title, "body": body, "url": url}),
                vapid_private_key=settings.VAPID_PRIVATE_KEY,
                vapid_claims={"sub": f"mailto:{settings.VAPID_MAILTO}"},
            )
            sent += 1
        except WebPushException as e:
            if e.response and e.response.status_code in (404, 410):
                # Subscription expired, clean up
                await db.execute(delete(PushSubscription).where(PushSubscription.id == sub.id))
            else:
                logger.warning("Push failed for sub %s: %s", sub.id, e)

    return sent
