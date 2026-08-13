<?php
declare(strict_types=1);

// Receives the password-reset token and six-digit code from verification-code.html.
// It checks that the code is valid and unexpired, then redirects to the new-password page.

require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: verification-code.html');
    exit;
}

$token = trim($_POST['token'] ?? '');
$code = trim($_POST['code'] ?? '');

if ($token === '' || !preg_match('/^\d{6}$/', $code)) {
    header('Location: verification-code.html?token=' . urlencode($token) . '&error=' . urlencode('Please enter the 6-digit verification code.'));
    exit;
}

try {
    $statement = database()->prepare(
        'SELECT * FROM password_resets
         WHERE reset_token = ? AND reset_code = ? AND used = 0 AND expires_at > NOW()'
    );
    $statement->execute([$token, $code]);
    $reset = $statement->fetch();

    if (!$reset) {
        header('Location: verification-code.html?token=' . urlencode($token) . '&error=' . urlencode('Invalid or expired code.'));
        exit;
    }

    $db = database();
    $db->prepare('UPDATE password_resets SET used = 1 WHERE id = ?')->execute([$reset['id']]);

    $newToken = bin2hex(random_bytes(16));
    $db->prepare('UPDATE password_resets SET reset_token = ? WHERE id = ?')->execute([$newToken, $reset['id']]);

    header(
        'Location: create-new-password.html?token=' . urlencode($newToken)
        . '&type=' . urlencode($reset['user_type'])
        . '&id=' . urlencode($reset['identifier'])
    );
    exit;
} catch (PDOException $exception) {
    error_log($exception->getMessage());
    header('Location: verification-code.html?token=' . urlencode($token) . '&error=' . urlencode('Unable to verify the code. Please try again.'));
    exit;
}
