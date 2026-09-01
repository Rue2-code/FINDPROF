<?php
declare(strict_types=1);

// Shared backend setup for PHP form handlers.
// Starts the user session, loads the database connection, and provides validation/JSON helper functions.

session_start();
require __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');

function reply(array $data, int $status = 200): never
{
    http_response_code($status);
    echo json_encode($data);
    exit;
}

function input(): array
{
    $data = json_decode(file_get_contents('php://input'), true);
    return is_array($data) ? $data : $_POST;
}

function fail(string $message, int $status = 422): never
{
    reply(['ok' => false, 'message' => $message], $status);
}

function requirePost(): void
{
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        fail('Only POST requests are allowed.', 405);
    }
}

function clean(string $value): string
{
    return trim($value);
}

function validPassword(string $password): bool
{
    return strlen($password) >= 8 && preg_match('/[A-Z]/', $password) && preg_match('/\d/', $password);
}

function publicUser(array $row): array
{
    return [
        'id' => (int) ($row['User_ID'] ?? $row['id']),
        'role' => $row['Role'] ?? $row['role'],
        'name' => $row['Full_Name'] ?? $row['full_name'] ?? '',
        'username' => $row['Username'] ?? $row['username'] ?? '',
        'email' => $row['Email'] ?? $row['email'] ?? '',
    ];
}

function currentUser(): array
{
    if (empty($_SESSION['user'])) {
        fail('Please log in first.', 401);
    }

    return $_SESSION['user'];
}

function requireRole(string $role): array
{
    $user = currentUser();
    if ($user['role'] !== $role) {
        fail('You are not allowed to perform this action.', 403);
    }

    return $user;
}

function userProfile(PDO $db, int $userId, string $role): ?array
{
    if ($role === 'student') {
        $statement = $db->prepare(
            'SELECT Student_ID AS profile_id, Program, Year_Level, Section
             FROM students WHERE User_ID = ? LIMIT 1'
        );
    } elseif ($role === 'faculty') {
        $statement = $db->prepare(
            'SELECT Faculty_ID AS profile_id, Department, Office, Consultation_Hours
             FROM faculty WHERE User_ID = ? LIMIT 1'
        );
    } else {
        return null;
    }

    $statement->execute([$userId]);
    $profile = $statement->fetch();
    return $profile ?: null;
}

function preferredTimeStart(string $value): string
{
    if (preg_match('/^\d{2}:\d{2}(:\d{2})?$/', $value)) {
        return strlen($value) === 5 ? $value . ':00' : $value;
    }

    if (!preg_match('/(\d{1,2}):(\d{2})\s*(AM|PM)/i', $value, $matches)) {
        fail('Please provide a valid preferred time.');
    }

    $hour = (int) $matches[1];
    $minute = (int) $matches[2];
    $period = strtoupper($matches[3]);

    if ($period === 'PM' && $hour < 12) {
        $hour += 12;
    }
    if ($period === 'AM' && $hour === 12) {
        $hour = 0;
    }

    return sprintf('%02d:%02d:00', $hour, $minute);
}
