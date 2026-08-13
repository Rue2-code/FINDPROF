<?php
declare(strict_types=1);

// Receives student or faculty registration data, validates it,
// hashes the password, and saves the new account in the students or faculty table.

require __DIR__ . '/bootstrap.php';
requirePost();

$data = input();
$role = $data['role'] ?? '';
$idNumber = clean((string) ($data['id_number'] ?? ''));
$name = clean((string) ($data['full_name'] ?? ''));
$email = strtolower(clean((string) ($data['email'] ?? '')));
$phone = preg_replace('/\D/', '', (string) ($data['phone'] ?? ''));
$password = (string) ($data['password'] ?? '');

if (!in_array($role, ['student', 'faculty'], true)
    || $idNumber === ''
    || $name === ''
    || strlen($phone) !== 10
    || !validPassword($password)) {
    fail('Please provide valid registration details.');
}

try {
    $db = database();
    if ($role === 'student') {
        $program = clean((string) ($data['program'] ?? ''));
        $yearLevel = (int) ($data['year_level'] ?? 0);
        if (!filter_var($email, FILTER_VALIDATE_EMAIL) || $program === '' || $yearLevel < 1) {
            fail('Please provide valid student registration details.');
        }

        $check = $db->prepare('SELECT id FROM students WHERE email_address = ? OR student_number = ?');
        $check->execute([$email, $idNumber]);
        if ($check->fetch()) {
            fail('An account with that email or student number already exists.', 409);
        }

        $statement = $db->prepare(
            'INSERT INTO students (student_number, full_name, course_program, year_level, email_address, mobile_number, password_hash)
             VALUES (?, ?, ?, ?, ?, ?, ?)'
        );
        $statement->execute([$idNumber, $name, $program, $yearLevel, $email, $phone, password_hash($password, PASSWORD_DEFAULT)]);
    } else {
        $department = clean((string) ($data['department'] ?? ''));
        if ($department === '') {
            fail('Please provide a faculty department.');
        }

        $check = $db->prepare('SELECT id FROM faculty WHERE faculty_id = ?');
        $check->execute([$idNumber]);
        if ($check->fetch()) {
            fail('An account with that faculty ID already exists.', 409);
        }

        $statement = $db->prepare(
            'INSERT INTO faculty (faculty_id, full_name, department, contact_number, password_hash)
             VALUES (?, ?, ?, ?, ?)'
        );
        $statement->execute([$idNumber, $name, $department, $phone, password_hash($password, PASSWORD_DEFAULT)]);
    }

    $_SESSION['user'] = publicUser([
        'id' => (int) $db->lastInsertId(),
        'role' => $role,
        'full_name' => $name,
        'identifier' => $idNumber,
    ]);
    reply(['ok' => true, 'message' => 'Account created.', 'user' => $_SESSION['user']], 201);
} catch (PDOException $exception) {
    error_log($exception->getMessage());
    fail('A database error occurred. Check config.php and your prof_consult database.', 500);
}
