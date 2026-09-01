<?php
declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

try {
    $statement = database()->query(
        'SELECT
            f.Faculty_ID,
            f.Department,
            f.Office,
            f.Consultation_Hours,
            u.Full_Name,
            u.Email,
            u.Mobile_Number,
            (
                SELECT a.Status
                FROM availability a
                WHERE a.Faculty_ID = f.Faculty_ID AND a.Date = CURDATE()
                ORDER BY a.Time DESC
                LIMIT 1
            ) AS Current_Status
         FROM faculty f
         INNER JOIN users u ON u.User_ID = f.User_ID
         WHERE u.Role = "faculty" AND u.Account_Status = "active"
         ORDER BY u.Full_Name'
    );

    reply(['ok' => true, 'faculty' => $statement->fetchAll()]);
} catch (PDOException $exception) {
    error_log($exception->getMessage());
    fail('Unable to load faculty directory.', 500);
}
