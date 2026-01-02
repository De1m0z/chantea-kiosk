<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Email Verified - CheenTea</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background: linear-gradient(135deg, #FDFBF7 0%, #F5F0E8 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .card {
            background: #ffffff;
            border-radius: 24px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
            max-width: 420px;
            width: 100%;
            overflow: hidden;
            text-align: center;
        }
        
        .header {
            background: linear-gradient(135deg, #5B7F5F 0%, #4A6B4E 100%);
            padding: 40px 30px;
        }
        
        .icon-circle {
            width: 80px;
            height: 80px;
            background: rgba(255,255,255,0.2);
            border-radius: 50%;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .checkmark {
            font-size: 40px;
        }
        
        .header h1 {
            color: #ffffff;
            font-size: 28px;
            font-family: Georgia, serif;
            margin-bottom: 8px;
        }
        
        .header p {
            color: rgba(255,255,255,0.85);
            font-size: 16px;
        }
        
        .body {
            padding: 40px 30px;
        }
        
        .username-box {
            background: #F9EED9;
            border: 2px solid #D4A853;
            border-radius: 12px;
            padding: 16px 24px;
            margin-bottom: 24px;
        }
        
        .username-box .label {
            color: #7A726D;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
        }
        
        .username-box .username {
            color: #8C7335;
            font-size: 24px;
            font-family: monospace;
            font-weight: bold;
        }
        
        .info-text {
            color: #7A726D;
            font-size: 15px;
            line-height: 1.6;
            margin-bottom: 30px;
        }
        
        .cta-button {
            display: inline-block;
            background: #5B7F5F;
            color: #ffffff;
            text-decoration: none;
            padding: 16px 40px;
            border-radius: 12px;
            font-size: 16px;
            font-weight: bold;
            transition: background 0.2s;
        }
        
        .cta-button:hover {
            background: #4A6B4E;
        }
        
        .footer {
            padding: 20px 30px;
            background: #FDFBF7;
            border-top: 1px solid #E5E7EB;
        }
        
        .footer p {
            color: #9CA3AF;
            font-size: 12px;
        }
        
        .already-verified {
            background: #FEF3C7;
            border-left: 4px solid #F59E0B;
            padding: 12px 16px;
            margin-bottom: 24px;
            text-align: left;
            border-radius: 0 8px 8px 0;
        }
        
        .already-verified p {
            color: #92400E;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="card">
        <div class="header">
            <div class="icon-circle">
                <span class="checkmark">✓</span>
            </div>
            <h1>Email Verified!</h1>
            <p>Your account is now active</p>
        </div>
        
        <div class="body">
            @if($alreadyVerified ?? false)
            <div class="already-verified">
                <p>Your email was already verified. You're all set!</p>
            </div>
            @endif
            
            <div class="username-box">
                <div class="label">Your Kiosk Username</div>
                <div class="username">{{ $username }}</div>
            </div>
            
            <p class="info-text">
                You can now use this username at the CheenTea kiosk to earn stamps and redeem free drinks!
            </p>
            
            <p class="info-text" style="font-size: 13px; color: #9CA3AF;">
                You may close this page.
            </p>
        </div>
        
        <div class="footer">
            <p>&copy; {{ date('Y') }} CheenTea. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
