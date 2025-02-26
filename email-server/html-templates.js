const forgotPasswordTemplate = (resetLink) => `
<!DOCTYPE html>
<html>
<head>
    <title>Reset Your Password</title>
    <style>
        body {
            font-family: Arial, sans-serif;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 5px;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            margin-top: 20px;
            font-size: 16px;
            color: #fff;
            background-color: #007bff;
            text-decoration: none;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Reset Your Password</h2>
        <p>We received a request to reset your password. Click the button below to reset it:</p>
        <a href="${resetLink}" class="button">Reset Password</a>
        <p>If you did not request a password reset, please ignore this email.</p>
    </div>
</body>
</html>
`;

const verifyEmailTemplate = (verificationLink) => `
<!DOCTYPE html>
<html>
<head>
    <title>Verify Your Email</title>
    <style>
        body {
            font-family: Arial, sans-serif;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 5px;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            margin-top: 20px;
            font-size: 16px;
            color: #fff;
            background-color: #28a745;
            text-decoration: none;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Verify Your Email</h2>
        <p>Thank you for registering. Please click the button below to verify your email address:</p>
        <a href="${verificationLink}" class="button">Verify Email</a>
        <p>If you did not create an account, please ignore this email.</p>
    </div>
</body>
</html>
`;


const expirationTemplate = (name, expirationDate) => `
<!DOCTYPE html>
<html>
<head>
    <title>${name} Expiration Notice</title>
    <style>
        body {
            font-family: Arial, sans-serif;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 5px;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            margin-top: 20px;
            font-size: 16px;
            color: #fff;
            background-color: #dc3545;
            text-decoration: none;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>${name} Expiration Notice</h2>
        <p>This is a reminder that the <strong>${name}</strong> is set to expire on <strong>${expirationDate}</strong>.</p>
        <p>Please take the necessary actions to renew it before the expiration date to avoid any disruptions.</p>
        <p>If you have any questions, please contact our support team.</p>
    </div>
</body>
</html>
`;

module.exports = {
    forgotPasswordTemplate,
    verifyEmailTemplate,
    expirationTemplate
};