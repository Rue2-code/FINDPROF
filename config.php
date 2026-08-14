<?php
declare(strict_types=1);

// Database connection settings and the reusable database() function.
// Every PHP handler uses this file to connect to the Prof Consult MySQL database.

/* Update these settings only if your MySQL credentials differ from XAMPP's defaults. */
const DB_HOST = '127.0.0.1';
const DB_NAME = 'prof_consult';
const DB_USER = 'root';
const DB_PASS = '';

function database(): PDO {
    static $pdo;
    if (!$pdo) {
        $pdo = new PDO('mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4', DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    }
    return $pdo;
}
