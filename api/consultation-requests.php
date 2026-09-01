<?php
declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

$user = currentUser();
$db = database();

try {
    $profile = userProfile($db, $user['id'], $user['role']);
    if (!$profile) {
        fail('Profile was not found.', 404);
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        if ($user['role'] !== 'faculty') {
            fail('Only faculty can update consultation requests.', 403);
        }

        $data = input();
        $requestId = (int) ($data['request_id'] ?? 0);
        $status = clean((string) ($data['status'] ?? ''));
        $response = clean((string) ($data['response'] ?? ''));
        $allowedStatuses = ['pending', 'approved', 'declined', 'rescheduled', 'completed', 'cancelled'];

        if ($requestId <= 0 || !in_array($status, $allowedStatuses, true)) {
            fail('Please provide a valid request update.');
        }

        $update = $db->prepare(
            'UPDATE consultation_requests
             SET Status = ?, Response = ?
             WHERE Request_ID = ? AND Faculty_ID = ?'
        );
        $update->execute([$status, $response !== '' ? $response : null, $requestId, (int) $profile['profile_id']]);

        if ($update->rowCount() === 0) {
            fail('Consultation request was not found.', 404);
        }

        $student = $db->prepare(
            'SELECT u.User_ID
             FROM consultation_requests cr
             INNER JOIN students s ON s.Student_ID = cr.Student_ID
             INNER JOIN users u ON u.User_ID = s.User_ID
             WHERE cr.Request_ID = ?
             LIMIT 1'
        );
        $student->execute([$requestId]);
        $studentRecord = $student->fetch();

        if ($studentRecord) {
            $message = 'Your consultation request was ' . $status . '.';
            $notification = $db->prepare(
                'INSERT INTO notifications (User_ID, Message, Read_Status)
                 VALUES (?, ?, ?)'
            );
            $notification->execute([(int) $studentRecord['User_ID'], $message, 'unread']);
        }

        reply(['ok' => true]);
    }

    if ($user['role'] === 'student') {
        $statement = $db->prepare(
            'SELECT
                cr.Request_ID,
                cr.Purpose,
                cr.Request_Date,
                cr.Preferred_Time,
                cr.Status,
                cr.Response,
                f.Faculty_ID,
                faculty_user.Full_Name AS Faculty_Name,
                f.Department
             FROM consultation_requests cr
             INNER JOIN faculty f ON f.Faculty_ID = cr.Faculty_ID
             INNER JOIN users faculty_user ON faculty_user.User_ID = f.User_ID
             WHERE cr.Student_ID = ?
             ORDER BY cr.Request_Date DESC, cr.Preferred_Time DESC'
        );
    } else {
        $statement = $db->prepare(
            'SELECT
                cr.Request_ID,
                cr.Purpose,
                cr.Request_Date,
                cr.Preferred_Time,
                cr.Status,
                cr.Response,
                s.Student_ID,
                student_user.Full_Name AS Student_Name,
                s.Program,
                s.Year_Level,
                s.Section
             FROM consultation_requests cr
             INNER JOIN students s ON s.Student_ID = cr.Student_ID
             INNER JOIN users student_user ON student_user.User_ID = s.User_ID
             WHERE cr.Faculty_ID = ?
             ORDER BY cr.Request_Date DESC, cr.Preferred_Time DESC'
        );
    }

    $statement->execute([(int) $profile['profile_id']]);
    reply(['ok' => true, 'requests' => $statement->fetchAll()]);
} catch (PDOException $exception) {
    error_log($exception->getMessage());
    fail('Unable to load consultation requests.', 500);
}
