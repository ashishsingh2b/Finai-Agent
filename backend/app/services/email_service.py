"""
Email Service for sending notifications and password reset emails
Uses Gmail SMTP with app password
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
    """Handle email sending via SMTP"""
    
    def __init__(self):
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
        """Send an email via SMTP"""
        
        if not all([self.smtp_username, self.smtp_password, self.from_email]):
            logger.error("SMTP configuration missing in environment variables")
            return False
        
        try:
            # Create message
            message = MIMEMultipart('alternative')
            message['Subject'] = subject
            message['From'] = f"{self.from_name} <{self.from_email}>"
            message['To'] = to_email
            
            # Add plain text version (fallback)
            if body_text:
                part1 = MIMEText(body_text, 'plain')
                message.attach(part1)
            
            # Add HTML version
            part2 = MIMEText(body_html, 'html')
            message.attach(part2)
            
            # Connect to SMTP server and send
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()  # Secure the connection
                server.login(self.smtp_username, self.smtp_password)
                server.send_message(message)
            
            logger.info(f"Email sent successfully to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            return False
    
    def send_password_reset_email(self, to_email: str, reset_token: str, reset_url: str) -> bool:
        """Send password reset email with 100% inline CSS for maximum compatibility"""
        
        subject = "Reset Your Password - Moskalti FinAI"
        full_link = f"{reset_url}?token={reset_token}"
        
        # Using 100% inline styles because many email clients strip <style> blocks
        body_html = f"""
        <!DOCTYPE html>
        <html>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f6f7f8; color: #172b4d;">
            <div style="width: 100%; background-color: #f6f7f8; padding: 40px 0;">
                <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 3px; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <div style="background-color: #253746; padding: 25px 20px; text-align: center;">
                        <span style="color: #ffffff; font-size: 26px; font-weight: bold; letter-spacing: -0.5px;">MOSKALTI</span>
                    </div>
                    
                    <!-- Content -->
                    <div style="padding: 40px 30px;">
                        <h2 style="font-size: 22px; color: #172b4d; margin-top: 0; margin-bottom: 24px;">Hello,</h2>
                        <p style="font-size: 16px; line-height: 1.6; color: #172b4d; margin-bottom: 24px;">
                            We heard you need a password reset. Click the button below and you'll be redirected to a secure site from which you can set a new password.
                        </p>
                        
                        <!-- Button -->
                        <div style="text-align: center; margin: 35px 0;">
                            <a href="{full_link}" style="display: inline-block; background-color: #5aac44; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 18px;">Reset Password</a>
                        </div>
                        
                        <!-- Footer Info -->
                        <div style="font-size: 13px; color: #5e6c84; border-top: 1px solid #ebecf0; padding-top: 25px; margin-top: 25px;">
                            If you didn't try to reset your password, <a href="#" style="color: #0079bf; text-decoration: underline;">click here</a> and we'll forget this ever happened.
                        </div>
                    </div>
                </div>
                
                <!-- Institutional Footer -->
                <div style="text-align: center; margin-top: 25px; font-size: 12px; color: #97a0af;">
                    <p style="margin: 0;">&copy; 2026 Moskalti Capital. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        body_text = f"Hello,\n\nWe heard you need a password reset. Click the link below to set a new password:\n\n{full_link}\n\nThis link is valid for 1 hour.\n\nBest regards,\nMoskalti FinAI Team"
        
        return self.send_email(to_email, subject, body_html, body_text)
    
    def send_analysis_complete_email(
        self,
        to_email: str,
        company_name: str,
        credit_score: float,
        recommendation: str,
        analysis_url: str
    ) -> bool:
        """Send notification when analysis is complete with 100% inline CSS"""
        
        subject = f"Analysis Complete - {company_name}"
        
        # Color logic
        if recommendation == "APPROVE":
            status_color = "#5aac44" # Success Green
            status_text = "Approved"
        elif "CONDITIONAL" in recommendation:
            status_color = "#f2d600" # Warning Yellow
            status_text = "Approved with Conditions"
        else:
            status_color = "#eb5a46" # Danger Red
            status_text = "Rejected"
        
        body_html = f"""
        <!DOCTYPE html>
        <html>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f6f7f8; color: #172b4d;">
            <div style="width: 100%; background-color: #f6f7f8; padding: 40px 0;">
                <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 3px; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <div style="background-color: #253746; padding: 25px 20px; text-align: center;">
                        <span style="color: #ffffff; font-size: 26px; font-weight: bold;">MOSKALTI</span>
                    </div>
                    
                    <!-- Content -->
                    <div style="padding: 40px 30px;">
                        <h2 style="font-size: 22px; color: #172b4d; margin-top: 0; margin-bottom: 24px;">Analysis Complete: {company_name}</h2>
                        <p style="font-size: 16px; line-height: 1.6; color: #172b4d; margin-bottom: 24px;">
                            The AI-powered credit analysis for <strong>{company_name}</strong> has been completed. Here are the key results:
                        </p>
                        
                        <!-- Score Card -->
                        <div style="background-color: #f4f5f7; border-radius: 4px; padding: 30px; text-align: center; margin: 25px 0;">
                            <div style="font-size: 56px; font-weight: bold; color: #0079bf; line-height: 1;">{credit_score:.1f}</div>
                            <div style="display: inline-block; padding: 6px 16px; background-color: {status_color}; color: white; border-radius: 3px; font-size: 14px; font-weight: bold; text-transform: uppercase; margin-top: 15px;">{status_text}</div>
                        </div>
                        
                        <!-- Button -->
                        <div style="text-align: center; margin: 35px 0;">
                            <a href="{analysis_url}" style="display: inline-block; background-color: #5aac44; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 18px;">View Full Report</a>
                        </div>
                    </div>
                </div>
                
                <!-- Institutional Footer -->
                <div style="text-align: center; margin-top: 25px; font-size: 12px; color: #97a0af;">
                    <p style="margin: 0;">&copy; 2026 Moskalti Capital. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        body_text = f"Analysis Complete: {company_name}\n\nCredit Score: {credit_score:.1f}/100\nRecommendation: {status_text}\n\nView at: {analysis_url}"
        
        return self.send_email(to_email, subject, body_html, body_text)
