<?php
declare(strict_types=1);

// Receives login form data, checks the student's or faculty member's password,
// and saves the logged-in user's information in the PHP session.

require __DIR__ . '/bootstrap.php';
requirePost();

$data = input();
$role = $data['role'] ?? '';
$identifier = strtolower(clean((string) ($data['identifier'] ?? '')));
$password = (string) ($data['password'] ?? '');

if (!in_array($role, ['student', 'faculty'], true) || $identifier === '' || $password === '') {
    fail('Please enter your account details.');
}

try {
    if ($role === 'student') {
        $statement = database()->prepare(
            'SELECT id, full_name, student_number AS identifier, password_hash
             FROM students WHERE email_address = ? OR student_number = ? LIMIT 1'
        );
        $statement->execute([$identifier, $identifier]);
    } else {
        $statement = database()->prepare(
            'SELECT id, full_name, faculty_id AS identifier, password_hash
             FROM faculty WHERE faculty_id = ? LIMIT 1'
        );
        $statement->execute([$identifier]);
    }
    $record = $statement->fetch();

    if (!$record || !password_verify($password, $record['password_hash'])) {
        fail('Incorrect email/ID number or password.', 401);
    }

    $record['role'] = $role;
    $_SESSION['user'] = publicUser($record);
    reply(['ok' => true, 'user' => $_SESSION['user']]);
} catch (PDOException $exception) {
    error_log($exception->getMessage());
    fail('A database error occurred. Check config.php and your prof_consult database.', 500);
}
