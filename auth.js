const { google } = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];

async function getAccessToken() {
    const auth = new google.auth.OAuth2(
        'clientID',
        'secret',
        'https://doyboy.github.io/'
    );

    const authUrl = auth.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });

    console.log('Authorize this app by visiting this URL:', authUrl);

    // After visiting the URL, paste the authorization code here
    const code = '4/0AeanS0bC6-UXGduWG5OkS-76st32d7KnkaOCAMTOYEUvAb4kWm22mJf8sPSmNjBIsDNlWA';
    const { tokens } = await auth.getToken(code);
    auth.setCredentials(tokens);

    console.log('Access Token:', tokens.access_token);
    return tokens.access_token;
}

getAccessToken();
