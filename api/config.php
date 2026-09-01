<?php
declare(strict_types=1);

// Database connection settings and the reusable database() function.
// Every PHP handler uses this file to connect to the Prof Consult MySQL database.

/* Update these settings only if your MySQL credentials differ from XAMPP's defaults. */
const DB_HOST = '127.0.0.1';
const DB_NAME = 'prof_consult';
const DB_USER = 'root';
const DB_PASS = '';

// SMTP settings used by PHPMailer to send password-reset OTP emails.
// For Gmail, use smtp.gmail.com, port 587, tls, and an app password.
const SMTP_HOST = 'smtp-relay.brevo.com';
const SMTP_PORT = 587;
const SMTP_USERNAME = 'b6a3e7001@smtp-brevo.com';
const SMTP_PASSWORD = 'xsmtpsib-65b818cbbe3cf1ebbe412048c2e4bcc83bc512751d6b25d5d10694d507af508c-Fm0gXCRTsupS9KHa';
const SMTP_ENCRYPTION = 'tls';
const SMTP_FROM_EMAIL = 'profconsult2026@gmail.com';
const SMTP_FROM_NAME = 'Prof Consult';

function database(): PDO {
    static $pdo;
    if (!$pdo) {
        $pdo = new PDO('mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4', DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    }
    return $pdo;
}
