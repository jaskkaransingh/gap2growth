const fs = require('fs');

async function testFlow() {
    const baseUrl = 'http://localhost:5000/api';

    // 1. Login to get token (using a known user or creating one)
    // We'll try to register a temp user, if exists then login.
    const user = { username: 'testuser_' + Date.now(), email: 'test_' + Date.now() + '@example.com', password: 'password123' };

    console.log('1. Registering/Logging in...');
    let token;

    try {
        const regRes = await fetch(`${baseUrl}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });

        if (regRes.status === 201) {
            console.log('Registered successfully.');
            // Need to login to get token? Or register returns proper message?
            // Our register controller only returns message.

            const loginRes = await fetch(`${baseUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email, password: user.password })
            });
            const loginData = await loginRes.json();
            token = loginData.token;
            console.log('Logged in. Token obtained.');
        } else {
            console.error('Registration failed:', await regRes.text());
            return;
        }

    } catch (e) {
        console.error('Auth failed:', e);
        return;
    }

    // 2. Create dummy PDF
    const pdfPath = './valid_dummy.pdf';
    // fs.writeFileSync(pdfPath, '%PDF-1.4\\n%Dummy PDF Content');
    // Note: This is an invalid PDF structure, so pdf-parse WILL fail to parse it,
    // BUT it should fail with "Invalid PDF" or similar from the library, 
    // NOT "pdf is not a function".
    // If we see "pdf is not a function", the fix failed.
    // If we see "Error parsing PDF" inside the controller logic, the fix worked (function was called).

    // 3. Upload
    console.log('2. Uploading resume...');
    const formData = new FormData();
    const fileBlob = new Blob([fs.readFileSync(pdfPath)], { type: 'application/pdf' });
    formData.append('resume', fileBlob, 'dummy.pdf');

    try {
        const uploadRes = await fetch(`${baseUrl}/resume/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const text = await uploadRes.text();
        console.log('Upload Response Status:', uploadRes.status);
        console.log('Upload Response Body:', text);

        if (text.includes('pdf is not a function')) {
            console.error('FAIL: "pdf is not a function" error detected!');
        } else if (text.includes('Could not extract text') || text.includes('internal error')) {
            console.log('SUCCESS: "pdf is not a function" error GONE. (Parsing error expected for dummy file)');
        } else {
            console.log('Response received.');
        }

    } catch (e) {
        console.error('Upload request failed:', e);
    }

    // Cleanup
    if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
}

testFlow();
