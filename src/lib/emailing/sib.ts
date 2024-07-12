

export async function sendVerificationEmail(name:string, email:string, code:string, key: string) {
    const year = new Date().getFullYear();
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "api-key": key,
            "accept": "application/json"
        },
        body: JSON.stringify({
            "sender": {
                "email": "no-reply@attendora.com",
                "name": "Petbox"
            },
            "to": [
                {
                    "email": email,
                    "name": name
                }
            ],
            "subject": "Petbox Verification Code",
            "htmlContent": `<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Your Code</title><style>body{font-family:Arial,sans-serif;font-size:16px;background-color:#f4f4f4;margin:0;padding:0}.email-container{max-width:600px;margin:40px auto;background:#fff;border:1px solid #ddd}.email-header{background-color:#007bff;color:#fff;padding:20px;text-align:center}.email-body{padding:20px;text-align:center}.code{font-size:24px;color:#007bff;margin:20px 0;padding:10px;border:1px dashed #007bff;display:inline-block}.footer{text-align:center;color:#777;font-size:14px;padding:20px}</style></head><body><div class="email-container"><div class="email-header"><h1>Verification code</h1></div><div class="email-body"><p>Hello,${name}</p><p>Thank you for choosing petbox! Here is your verification code:</p><div class="code">${code}</div><p>Use this code at signup to verify your email</p><p>If you have any questions, feel free to contact us.</p><a href="mailto:questions@attendora.com" style="color:#007bff">questions@attendora.com</a></div><div class="footer">&copy; ${year} petbox. All rights reserved.</div></div></body></html>`
        })
    });
    return response.status === 200;
}