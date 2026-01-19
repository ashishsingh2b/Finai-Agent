"""
Test email sending functionality
Run this to diagnose SMTP issues
"""
import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.email_service import EmailService

def test_smtp_config():
    """Test SMTP configuration"""
    print("=" * 60)
    print("TESTING SMTP CONFIGURATION")
    print("=" * 60)
    
    smtp_host = os.getenv('SMTP_HOST')
    smtp_port = os.getenv('SMTP_PORT')
    smtp_username = os.getenv('SMTP_USERNAME')
    smtp_password = os.getenv('SMTP_PASSWORD')
    smtp_from = os.getenv('SMTP_FROM_EMAIL')
    
    print(f"SMTP Host: {smtp_host}")
    print(f"SMTP Port: {smtp_port}")
    print(f"SMTP Username: {smtp_username}")
    print(f"SMTP Password: {'*' * len(smtp_password) if smtp_password else 'NOT SET'}")
    print(f"From Email: {smtp_from}")
    print()
    
    if not all([smtp_host, smtp_port, smtp_username, smtp_password, smtp_from]):
        print("❌ ERROR: Missing SMTP configuration!")
        return False
    
    print("✅ All SMTP configuration present")
    return True

def test_smtp_connection():
    """Test SMTP connection"""
    import smtplib
    
    print("\n" + "=" * 60)
    print("TESTING SMTP CONNECTION")
    print("=" * 60)
    
    smtp_host = os.getenv('SMTP_HOST', 'smtp.gmail.com')
    smtp_port = int(os.getenv('SMTP_PORT', 587))
    smtp_username = os.getenv('SMTP_USERNAME')
    smtp_password = os.getenv('SMTP_PASSWORD')
    
    try:
        print(f"Connecting to {smtp_host}:{smtp_port}...")
        server = smtplib.SMTP(smtp_host, smtp_port, timeout=10)
        print("✅ Connected to SMTP server")
        
        print("Starting TLS...")
        server.starttls()
        print("✅ TLS started")
        
        print(f"Logging in as {smtp_username}...")
        server.login(smtp_username, smtp_password)
        print("✅ Login successful")
        
        server.quit()
        print("✅ SMTP connection test PASSED")
        return True
        
    except smtplib.SMTPAuthenticationError as e:
        print(f"❌ AUTHENTICATION FAILED: {e}")
        print("\nPossible causes:")
        print("1. Incorrect app password")
        print("2. App password has spaces (should be removed)")
        print("3. 2-Step Verification not enabled on Gmail")
        print("4. App password was revoked")
        return False
        
    except smtplib.SMTPConnectError as e:
        print(f"❌ CONNECTION FAILED: {e}")
        print("\nPossible causes:")
        print("1. Firewall blocking port 587")
        print("2. Incorrect SMTP host/port")
        return False
        
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return False

def test_send_email():
    """Test sending actual email"""
    print("\n" + "=" * 60)
    print("TESTING EMAIL SENDING")
    print("=" * 60)
    
    test_email = os.getenv('SMTP_USERNAME')  # Send to yourself
    
    print(f"Sending test email to: {test_email}")
    
    try:
        email_service = EmailService()
        
        success = email_service.send_password_reset_email(
            to_email=test_email,
            reset_token="test_token_123",
            reset_url="http://localhost:5173/reset-password"
        )
        
        if success:
            print("✅ EMAIL SENT SUCCESSFULLY")
            print(f"\nCheck your inbox: {test_email}")
            print("Also check SPAM folder if not in inbox")
            return True
        else:
            print("❌ EMAIL SENDING FAILED (returned False)")
            return False
            
    except Exception as e:
        print(f"❌ ERROR sending email: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("\n🔍 EMAIL SERVICE DIAGNOSTIC TEST\n")
    
    # Test 1: Configuration
    config_ok = test_smtp_config()
    
    if not config_ok:
        print("\n❌ Configuration test failed. Fix .env file and try again.")
        sys.exit(1)
    
    # Test 2: Connection
    connection_ok = test_smtp_connection()
    
    if not connection_ok:
        print("\n❌ Connection test failed. Check credentials and network.")
        sys.exit(1)
    
    # Test 3: Send email
    send_ok = test_send_email()
    
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    print(f"Configuration: {'✅ PASS' if config_ok else '❌ FAIL'}")
    print(f"Connection:    {'✅ PASS' if connection_ok else '❌ FAIL'}")
    print(f"Send Email:    {'✅ PASS' if send_ok else '❌ FAIL'}")
    print("=" * 60)
    
    if all([config_ok, connection_ok, send_ok]):
        print("\n🎉 ALL TESTS PASSED! Email service is working.")
    else:
        print("\n⚠️  Some tests failed. Check errors above.")
