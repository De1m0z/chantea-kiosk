<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Authenticating...</title>
</head>
<body>
<script>
        const data = {
            type: '{{ $type }}',
            @if(isset($user))
                user: @json($user),
                token: '{{ $token }}'
            @endif
            @if(isset($error))
                error: '{{ $error }}'
            @endif
        };

        if (window.opener) {
            // THIS IS THE FIX:
            // Use '*' to allow sending the message to any origin
            window.opener.postMessage(data, '*');
            window.close();
        } else {
            document.body.innerHTML = 'Authentication complete. You can close this window.';
        }
    </script>
</body>
</html>
