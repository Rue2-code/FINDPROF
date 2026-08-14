<?php
declare(strict_types=1);

// Receives a student's consultation form, stores the request in the database,
// and creates a notification for the selected faculty member.

require __DIR__ . '/bootstrap.php';
requirePost();

$user = currentUser();
if ($user['role'] !== 'student') {
    fail('Only students can request consultations.', 403);
}

$data = input();
$facultyId = (int) ($data['faculty_id'] ?? 0);
$purpose = clean((string) ($data['purpose'] ?? ''));
$date = $data['preferred_date'] ?? '';
$time = clean((string) ($data['preferred_time'] ?? ''));

if (!$facultyId || !$purpose || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $date) || !$time) {
    fail('Please complete all required request fields.');
}

try {
    $db = database();
    $faculty = $db->prepare("SELECT id FROM users WHERE id = ? AND role = 'faculty'");
    $faculty->execute([$facultyId]);
    if (!$faculty->fetch()) {
        fail('Faculty member was not found.', 404);
    }

    $statement = $db->prepare(
        'INSERT INTO consultations (student_id, faculty_id, purpose, message, preferred_date, preferred_time)
         VALUES (?, ?, ?, ?, ?, ?)'
    );
    $statement->execute([
        $user['id'],
        $facultyId,
        $purpose,
        clean((string) ($data['message'] ?? '')) ?: null,
        $date,
        $time,
    ]);

    $consultationId = (int) $db->lastInsertId();
    $db->prepare('INSERT INTO notifications (user_id, title, body) VALUES (?, ?, ?)')->execute([
        $facultyId,
        'New consultation request',
        $user['name'] . ' sent a consultation request.',
    ]);

    reply(['ok' => true, 'id' => $consultationId], 201);
} catch (PDOException $exception) {
    error_log($exception->getMessage());
    fail('A database error occurred. Check api/config.php and import database/schema.sql.', 500);
}
