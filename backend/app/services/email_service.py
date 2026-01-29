"""
Asynchronous Communication Layer: SMTP Email Service.
Integrates via Gmail SMTP with modern security protocols (STARTTLS).
Supports templated system emails for authentication and analytical notifications.
"""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import os
from dotenv import load_dotenv
import logging

load_dotenv()
logger = logging.getLogger(__name__)

class EmailService:
    """
    High-level orchestrator for dispatched communications.
    Safely handles SMTP connection lifecycles and HTML template rendering.
    """
    
    def __init__(self):
        # Environment-driven configuration for flexibility across dev/prod environments
        self.smtp_host = os.getenv('SMTP_HOST', 'smtp.gmail.com')
        self.smtp_port = int(os.getenv('SMTP_PORT', 587))
        self.smtp_username = os.getenv('SMTP_USERNAME')
        self.smtp_password = os.getenv('SMTP_PASSWORD')
        self.from_email = os.getenv('SMTP_FROM_EMAIL')
        self.from_name = os.getenv('SMTP_FROM_NAME', 'Moskalti FinAI Agent')
        
    def send_email(
        self,
        to_email: str,
        subject: str,
        body_html: str,
        body_text: Optional[str] = None
    ) -> bool:
        """
        The primary internal driver for email delivery.
        Encapsulates SMTP handshake, login, and message transmission.
        Returns Boolean success status for handling retry logic or logging.
        """
        if not all([self.smtp_username, self.smtp_password, self.from_email]):
            logger.error("Critical: SMTP credentials missing from environment configuration.")
            return False
        
        try:
            # Construct multi-part message (HTML with plain-text fallback)
            message = MIMEMultipart('alternative')
            message['Subject'] = subject
            message['From'] = f"{self.from_name} <{self.from_email}>"
            message['To'] = to_email
            
            if body_text:
                message.attach(MIMEText(body_text, 'plain'))
            
            message.attach(MIMEText(body_html, 'html'))
            
            # Encapsulated SMTP Context Manager
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls() # Enforce Transport Layer Security
                server.login(self.smtp_username, self.smtp_password)
                server.send_message(message)
            
            logger.info(f"Dispatched email to {to_email} successfully.")
            return True
        except Exception as e:
            logger.error(f"Operational failure in send_email dispatch: {str(e)}", exc_info=True)
            return False
    
    def send_password_reset_email(self, to_email: str, reset_token: str, reset_url: str) -> bool:
        """
        Dispatches a security recovery email.
        Uses single-use URL tokens with 1-hour expiration enforced at the API level.
        """
        subject = "Reset Your Password - Moskalti FinAI"
        full_link = f"{reset_url}?token={reset_token}"
        
        body_html = f"""
        <!DOCTYPE html>
        <html>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f6f7f8; color: #172b4d;">
            <div style="width: 100%; background-color: #f6f7f8; padding: 40px 0;">
                <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 3px; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">
                    <div style="background-color: #253746; padding: 25px 20px; text-align: center;">
                        <span style="color: #ffffff; font-size: 26px; font-weight: bold;">MOSKALTI</span>
                    </div>
                    <div style="padding: 40px 30px;">
                        <h2 style="font-size: 22px; color: #172b4d; margin-top: 0; margin-bottom: 24px;">Security: Password Reset</h2>
                        <p style="font-size: 16px; line-height: 1.6; color: #172b4d; margin-bottom: 24px;">
                            A password recovery process was initiated for your account. Please follow the secure link below to proceed.
                        </p>
                        <div style="text-align: center; margin: 35px 0;">
                            <a href="{full_link}" style="display: inline-block; background-color: #5aac44; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 18px;">Reset Password</a>
                        </div>
                        <div style="font-size: 13px; color: #5e6c84; border-top: 1px solid #ebecf0; padding-top: 25px; margin-top: 25px;">
                            Link validity: 60 minutes. If you did not request this, please ignore this email.
                        </div>
                    </div>
                </div>
                <div style="text-align: center; margin-top: 25px; font-size: 12px; color: #97a0af;">
                    <p style="margin: 0;">&copy; 2026 Moskalti Capital. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        body_text = f"Secure Password Reset:\n\nFollow the link to set a new password: {full_link}\n\nExpires in 1 hour."
        return self.send_email(to_email, subject, body_html, body_text)
    
    def send_analysis_complete_email(
        self,
        to_email: str,
        company_name: str,
        credit_score: float,
        recommendation: str,
        analysis_url: str
    ) -> bool:
        """
        Dispatches a clinical report completion notification.
        Includes a result summary (Score & Approval Status) with a deep link to the portal.
        """
        subject = f"Analysis Complete - {company_name}"
        
        # Qualitative status mapping for visual feedback
        if recommendation == "APPROVE":
            status_color, status_text = "#5aac44", "Approved"
        elif "CONDITIONAL" in recommendation:
            status_color, status_text = "#f2d600", "Conditional Approval"
        else:
            status_color, status_text = "#eb5a46", "Rejected"
        
        body_html = f"""
        <!DOCTYPE html>
        <html>
        <body style="margin: 0; padding: 0; font-family: sans-serif; background-color: #f6f7f8;">
            <div style="width: 100%; padding: 40px 0;">
                <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 4px; overflow: hidden; border: 1px solid #ebecf0;">
                    <div style="background-color: #253746; padding: 25px; text-align: center;">
                        <span style="color: #ffffff; font-size: 24px; font-weight: bold;">MOSKALTI FINAI</span>
                    </div>
                    <div style="padding: 40px 30px;">
                        <h2 style="margin: 0 0 20px; color: #172b4d;">Credit Review Finished</h2>
                        <p style="color: #444; line-height: 1.5;">The automated financial analysis for <strong>{company_name}</strong> has been finalized.</p>
                        
                        <div style="background-color: #f4f5f7; border-radius: 4px; padding: 30px; text-align: center; margin: 25px 0;">
                            <div style="font-size: 48px; font-weight: bold; color: #0079bf;">{credit_score:.1f} <small style="font-size: 16px;">/ 100</small></div>
                            <div style="display: inline-block; padding: 8px 20px; background-color: {status_color}; color: white; border-radius: 3px; font-weight: bold; margin-top: 15px;">{status_text}</div>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="{analysis_url}" style="background-color: #5aac44; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 4px; font-weight: bold;">Access Full Analysis</a>
                        </div>
                    </div>
                </div>
                <div style="text-align: center; margin-top: 25px; font-size: 11px; color: #999;">
                    &copy; 2026 Moskalti Capital. Highly Confidential.
                </div>
            </div>
        </body>
        </html>
        """
        
        body_text = f"Report: {company_name}\nScore: {credit_score:.1f}\nStatus: {status_text}\nAccess: {analysis_url}"
        return self.send_email(to_email, subject, body_html, body_text)
