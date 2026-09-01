<?php
declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

$user = currentUser();

try {
    $db = database();
    $profile = userProfile($db, $user['id'], $user['role']);
    reply(['ok' => true, 'user' => $user, 'profile' => $profile]);
} catch (PDOException $exception) {
    error_log($exception->getMessage());
    fail('Unable to load the current session.', 500);
}
