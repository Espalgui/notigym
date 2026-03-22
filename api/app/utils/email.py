import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.config import settings

logger = logging.getLogger(__name__)


def send_email(to: str, subject: str, html_body: str) -> bool:
    """Send an email via SMTP. Returns True on success."""
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        logger.warning("SMTP not configured, skipping email to %s", to)
        return False

    msg = MIMEMultipart("alternative")
    msg["From"] = f"NotiGym <{settings.SMTP_FROM}>"
    msg["To"] = to
    msg["Subject"] = subject
    msg.attach(MIMEText(html_body, "html", "utf-8"))

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_FROM, to, msg.as_string())
        return True
    except Exception:
        logger.exception("Failed to send email to %s", to)
        return False


def send_verification_email(to: str, username: str, token: str) -> bool:
    verify_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
    html = f"""
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #e8364e; margin: 0; font-size: 28px;">NotiGym</h1>
        </div>
        <div style="background: #1a1a2e; border-radius: 16px; padding: 32px; color: #e8e8ed;">
            <h2 style="margin: 0 0 16px; font-size: 20px;">Confirme ton adresse email</h2>
            <p style="color: #8e8ea0; line-height: 1.6; margin: 0 0 24px;">
                Salut <strong style="color: #e8e8ed;">{username}</strong>, bienvenue sur NotiGym !
                Clique sur le bouton ci-dessous pour activer ton compte.
            </p>
            <div style="text-align: center; margin: 32px 0;">
                <a href="{verify_url}"
                   style="display: inline-block; background: #e8364e; color: white; text-decoration: none;
                          padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">
                    Vérifier mon email
                </a>
            </div>
            <p style="color: #8e8ea0; font-size: 13px; line-height: 1.5; margin: 0;">
                Ce lien expire dans 24 heures. Si tu n'as pas créé de compte, ignore cet email.
            </p>
        </div>
    </div>
    """
    return send_email(to, "Confirme ton email — NotiGym", html)


def send_login_notification_email(to: str, username: str) -> bool:
    html = f"""
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #e8364e; margin: 0; font-size: 28px;">NotiGym</h1>
        </div>
        <div style="background: #1a1a2e; border-radius: 16px; padding: 32px; color: #e8e8ed;">
            <h2 style="margin: 0 0 16px; font-size: 20px;">Nouvelle connexion</h2>
            <p style="color: #8e8ea0; line-height: 1.6; margin: 0 0 16px;">
                Salut <strong style="color: #e8e8ed;">{username}</strong>, une connexion vient d'être
                effectuée sur ton compte NotiGym.
            </p>
            <p style="color: #8e8ea0; font-size: 13px; line-height: 1.5; margin: 0;">
                Si ce n'est pas toi, change immédiatement ton mot de passe dans les paramètres de ton profil.
            </p>
        </div>
    </div>
    """
    return send_email(to, "Nouvelle connexion — NotiGym", html)
