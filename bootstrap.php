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
        'id' => (int) $row['id'],
        'role' => $row['role'],
        'name' => $row['full_name'],
        'identifier' => $row['identifier'],
    ];
}

function currentUser(): array
{
    if (empty($_SESSION['user'])) {
        fail('Please log in first.', 401);
    }

    return $_SESSION['user'];
}
