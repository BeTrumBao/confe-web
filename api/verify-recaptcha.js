const https = require('https');

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    const { token } = req.body;
    if (!token) {
        return res.status(400).send({ success: false, error: "Missing reCAPTCHA token" });
    }

    const secret = "6LegiZssAAAAAPyKOVD1CF470QP8fs3T-zT95Xs1";
    const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${token}`;

    https.get(url, (googleRes) => {
        let data = '';
        googleRes.on('data', (chunk) => { data += chunk; });
        googleRes.on('end', () => {
            try {
                const result = JSON.parse(data);
                if (result.success) {
                    res.status(200).send({ success: true });
                } else {
                    console.warn('reCAPTCHA fail:', result);
                    res.status(200).send({ success: false, error: "reCAPTCHA verification failed", details: result['error-codes'] });
                }
            } catch (e) {
                res.status(500).send({ success: false, error: "Failed to parse Google response" });
            }
        });
    }).on('error', (err) => {
        console.error('reCAPTCHA API Error:', err);
        res.status(500).send({ success: false, error: err.message });
    });
};
