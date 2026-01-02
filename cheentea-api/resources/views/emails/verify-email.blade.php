<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <style>
        /* Base Reset */
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #F5F0E8;
            margin: 0;
            padding: 0;
            width: 100%;
            -webkit-text-size-adjust: none;
        }
        
        /* Container */
        .email-wrapper {
            width: 100%;
            background: linear-gradient(180deg, #FDFBF7 0%, #F5F0E8 100%);
            padding: 50px 20px;
        }
        
        .email-content {
            max-width: 520px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(63, 48, 40, 0.12);
        }
        
        /* Header */
        .email-header {
            background: linear-gradient(135deg, #5B7F5F 0%, #4A6B4E 50%, #3F3028 100%);
            padding: 50px 40px;
            text-align: center;
        }
        
        .logo-text {
            color: #ffffff;
            font-size: 36px;
            font-weight: 700;
            font-family: Georgia, 'Times New Roman', serif;
            margin: 0 0 8px 0;
            letter-spacing: 1px;
        }
        
        .logo-tagline {
            color: rgba(255, 255, 255, 0.85);
            font-size: 14px;
            margin: 0;
            letter-spacing: 2px;
            text-transform: uppercase;
        }
        
        /* Body */
        .email-body {
            padding: 50px 40px;
            text-align: center;
        }
        
        .icon-container {
            width: 90px;
            height: 90px;
            background: linear-gradient(135deg, rgba(91, 127, 95, 0.15) 0%, rgba(212, 168, 83, 0.1) 100%);
            border-radius: 24px;
            margin: 0 auto 30px;
            display: table;
        }
        
        .icon-inner {
            display: table-cell;
            vertical-align: middle;
            font-size: 42px;
        }
        
        h1 {
            color: #3F3028;
            font-size: 28px;
            font-weight: 700;
            font-family: Georgia, 'Times New Roman', serif;
            margin: 0 0 20px 0;
        }
        
        .greeting {
            color: #3F3028;
            font-size: 18px;
            margin: 0 0 12px 0;
            font-weight: 600;
        }
        
        .message-text {
            color: #7A726D;
            font-size: 16px;
            line-height: 1.7;
            margin: 0 0 35px 0;
        }
        
        /* Button */
        .button-container {
            margin: 0 0 40px 0;
        }
        
        .action-button {
            display: inline-block;
            background: linear-gradient(135deg, #5B7F5F 0%, #4A6B4E 100%);
            color: #ffffff !important;
            font-size: 16px;
            font-weight: 700;
            text-decoration: none;
            padding: 18px 48px;
            border-radius: 14px;
            box-shadow: 0 8px 20px rgba(91, 127, 95, 0.35);
        }
        
        /* Divider */
        .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent 0%, #E5E7EB 50%, transparent 100%);
            margin: 0 0 30px 0;
        }
        
        /* Link fallback */
        .link-fallback {
            background-color: #FDFBF7;
            border-radius: 12px;
            padding: 20px;
            margin: 0;
        }
        
        .link-label {
            color: #9CA3AF;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin: 0 0 10px 0;
        }
        
        .link-url {
            color: #5B7F5F;
            font-size: 13px;
            word-break: break-all;
            line-height: 1.5;
            margin: 0;
        }
        
        /* Footer */
        .email-footer {
            background-color: #FDFBF7;
            padding: 30px 40px;
            text-align: center;
            border-top: 1px solid #E5E7EB;
        }
        
        .footer-text {
            color: #9CA3AF;
            font-size: 13px;
            line-height: 1.6;
            margin: 0;
        }
        
        .footer-brand {
            color: #5B7F5F;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="email-content">
            <!-- Header -->
            <div class="email-header">
                <p class="logo-text">CheenTea</p>
                <p class="logo-tagline">Rewards Program</p>
            </div>
            
            <!-- Body -->
            <div class="email-body">
                <!-- Icon -->
                <div class="icon-container">
                    <div class="icon-inner">🎁</div>
                </div>
                
                <h1>Verify Your Email</h1>
                
                <p class="greeting">Hello, {{ $name }}!</p>
                
                <p class="message-text">
                    Welcome to CheenTea Rewards! You're just one step away from earning stamps with every drink you purchase. Click the button below to verify your email address.
                </p>
                
                <!-- Action Button -->
                <div class="button-container">
                    <a href="{{ $actionUrl }}" class="action-button" target="_blank">
                        ✓ &nbsp;Verify My Email
                    </a>
                </div>
            </div>
            
            <!-- Footer -->
            <div class="email-footer">
                <p class="footer-text">
                    &copy; {{ date('Y') }} <span class="footer-brand">CheenTea</span>. All rights reserved.
                    <br><br>
                    If you didn't create an account, you can safely ignore this email.
                </p>
            </div>
        </div>
    </div>
</body>
</html>
