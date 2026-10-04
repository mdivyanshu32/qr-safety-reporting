# Multiple Email Setup

The portal accepts multiple notification emails. Separate addresses with commas, semicolons, or new lines.

## SMTP environment variables

- MAIL_HOST=smtp.gmail.com (or your company SMTP server)
- MAIL_PORT=587
- MAIL_USERNAME=your-sender@company.com
- MAIL_PASSWORD=your-app-password-or-smtp-password
- MAIL_SMTP_AUTH=true
- MAIL_SMTP_STARTTLS=true
- SAFETY_EMAIL_RECIPIENT=safety1@company.com,safety2@company.com
- SAFETY_EMAIL_CC=manager@company.com,head@company.com

The Admin Portal can also save the default recipient list in the database.

Do not commit real passwords, app passwords, API keys, or .env files to GitHub.
