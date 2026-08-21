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

function tableColumns(PDO $db, string $table): array
{
    $statement = $db->query('DESCRIBE `' . $table . '`');
    return array_map(static fn (array $row): string => $row['Field'], $statement->fetchAll());
}

function firstColumn(array $columns, array $candidates): ?string
{
    foreach ($candidates as $candidate) {
        if (in_array($candidate, $columns, true)) {
            return $candidate;
        }
    }
    return null;
}

function quoteIdentifier(string $identifier): string
{
    if (!preg_match('/^[A-Za-z0-9_]+$/', $identifier)) {
        fail('Unexpected database column name.', 500);
    }
    return '`' . $identifier . '`';
}

function preferredTimeStart(string $value): string
{
    if (!preg_match('/(\d{1,2}):(\d{2})\s*(AM|PM)/i', $value, $matches)) {
        return $value;
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

try {
    $db = database();

    $facultyColumns = tableColumns($db, 'faculty');
    $facultyIdColumn = firstColumn($facultyColumns, ['id', 'Faculty_id']);
    if (!$facultyIdColumn) {
        fail('Faculty table is missing its ID column.', 500);
    }

    $faculty = $db->prepare('SELECT ' . quoteIdentifier($facultyIdColumn) . ' FROM faculty WHERE ' . quoteIdentifier($facultyIdColumn) . ' = ? LIMIT 1');
    $faculty->execute([$facultyId]);
    if (!$faculty->fetch()) {
        fail('Faculty member was not found.', 404);
    }

    $consultationColumns = tableColumns($db, 'consultations');
    $studentColumn = firstColumn($consultationColumns, ['student_id', 'Student_id']);
    $consultationFacultyColumn = firstColumn($consultationColumns, ['faculty_id', 'Faculty_id']);
    $purposeColumn = firstColumn($consultationColumns, ['purpose', 'Purpose']);
    $messageColumn = firstColumn($consultationColumns, ['message', 'Message']);
    $dateColumn = firstColumn($consultationColumns, ['preferred_date', 'Request_date']);
    $timeColumn = firstColumn($consultationColumns, ['preferred_time', 'Preferred_time']);

    if (!$studentColumn || !$consultationFacultyColumn || !$purposeColumn || !$dateColumn || !$timeColumn) {
        fail('Consultation table is missing required columns.', 500);
    }

    $insertColumns = [$studentColumn, $consultationFacultyColumn, $purposeColumn, $dateColumn, $timeColumn];
    $insertValues = [$user['id'], $facultyId, $purpose, $date, preferredTimeStart($time)];

    $message = clean((string) ($data['message'] ?? ''));
    if ($messageColumn && $message !== '') {
        $insertColumns[] = $messageColumn;
        $insertValues[] = $message;
    }

    $quotedColumns = array_map('quoteIdentifier', $insertColumns);
    $placeholders = implode(', ', array_fill(0, count($insertColumns), '?'));
    $statement = $db->prepare(
        'INSERT INTO consultations (' . implode(', ', $quotedColumns) . ') VALUES (' . $placeholders . ')'
    );
    $statement->execute($insertValues);

    $consultationId = (int) $db->lastInsertId();

    try {
        $notificationColumns = tableColumns($db, 'notifications');
        $notificationUserColumn = firstColumn($notificationColumns, ['user_id', 'User_id']);
        $titleColumn = firstColumn($notificationColumns, ['title', 'Title']);
        $bodyColumn = firstColumn($notificationColumns, ['body', 'Message']);

        if ($notificationUserColumn && $bodyColumn) {
            $columns = [$notificationUserColumn];
            $values = [$facultyId];

            if ($titleColumn) {
                $columns[] = $titleColumn;
                $values[] = 'New consultation request';
            }

            $columns[] = $bodyColumn;
            $values[] = $user['name'] . ' sent a consultation request.';

            $db->prepare(
                'INSERT INTO notifications (' . implode(', ', array_map('quoteIdentifier', $columns)) . ')
                 VALUES (' . implode(', ', array_fill(0, count($columns), '?')) . ')'
            )->execute($values);
        }
    } catch (PDOException $notificationException) {
        error_log($notificationException->getMessage());
    }

    reply(['ok' => true, 'id' => $consultationId], 201);
} catch (PDOException $exception) {
    error_log($exception->getMessage());
    fail('A database error occurred. Check config.php and import database/schema.sql.', 500);
}
