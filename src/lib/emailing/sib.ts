

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
                "email": "no-reply@weblion.pro",
                "name": "Weblion"
            },
            "replyTo":{
                "email": "questions@weblion.pro",
                "name": "Weblion"
            },
            "to": [
                {
                    "email": email,
                    "name": name
                }
            ],
            "subject": "Weblion Chat Verification Code",
            "htmlContent": `<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Verify Your Email - WebLion Chat</title></head><body style="margin:0;padding:0;font-family:Arial,sans-serif;background-color:#e8e8e8"><table role="presentation" style="width:100%;border-collapse:collapse"><tr><td align="center" style="padding:0"><table role="presentation" style="width:600px;border-collapse:collapse;text-align:center;background-color:#fff"><tr><td style="padding:40px 0;background:linear-gradient(135deg,#335c4c 0,#4a8372 100%)"><h1 style="color:#e8e8e8;font-size:28px;margin:0">WebLion Chat</h1></td></tr><tr><td style="padding:40px 30px"><h2 style="color:#181818;font-size:24px;margin-bottom:20px">Verify Your Email</h2><p style="color:#181818;font-size:16px;line-height:1.5;margin-bottom:30px">Thank you for choosing WebLion AI Chat. To complete your login and start chatting, please use the confirmation code below:</p><div style="background-color:#e8e8e8;padding:20px;border-radius:5px;margin-bottom:30px"><h3 style="color:#181818;font-size:20px;margin:0 0 10px 0">Your Confirmation Code:</h3><p style="color:#335c4c;font-size:32px;font-weight:700;letter-spacing:5px;margin:0">${code}</p></div><p style="color:#181818;font-size:16px;line-height:1.5;margin-bottom:20px">To verify your email address Go back to the login page and enter the code above</p><p style="color:#181818;font-size:14px;margin-top:30px">If you didn't request this verification, please ignore this email.</p></td></tr><tr><td style="padding:30px;background-color:#e8e8e8;border-top:1px solid #335c4c"><p style="color:#181818;font-size:14px;margin-bottom:10px">© 2023 Weblion. All rights reserved.</p><p style="color:#181818;font-size:14px;margin-bottom:10px"><a href="https://weblion.pro" style="color:#335c4c;text-decoration:none">Visit our website</a>|<a href="#" style="color:#335c4c;text-decoration:none">Privacy Policy</a>|<a href="#" style="color:#335c4c;text-decoration:none">Terms of Service</a></p></td></tr></table></td></tr></table></body></html>`
        })
    });
    return response.status === 200;
}