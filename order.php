<?php
/**
 * order.php — TRAVELITRIX Order Handler (JSON API)
 * Works with fetch() from any origin (GitHub Pages, local file, localhost).
 * Web Development Fundamentals | A.Y. 2025-2026
 */

/* ── CORS headers — MUST be first, before any output ── */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'errors' => ['Method not allowed.']]);
    exit;
}

/* ── Database Config ── */
define('DB_HOST', 'localhost');
define('DB_NAME', 'travelitrix');
define('DB_USER', 'root');
define('DB_PASS', '');       // XAMPP default: blank password
define('DB_CHAR', 'utf8mb4');

/* ── Read & Sanitize ── */
$name           = trim($_POST['name']           ?? '');
$email          = trim($_POST['email']          ?? '');
$address        = trim($_POST['address']        ?? '');
$quantity       = (int)($_POST['quantity']      ?? 1);
$payment_method = trim($_POST['payment_method'] ?? '');
$notes          = trim($_POST['notes']          ?? '');

$unit_price  = 9999.00;
$total_price = $unit_price * $quantity;

/* ── Server-side Validation ── */
$errors = [];
if ($name === '')                                   $errors[] = 'Full Name is required.';
if ($email === '')                                  $errors[] = 'Email Address is required.';
elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'Enter a valid email address.';
if ($address === '')                                $errors[] = 'Shipping Address is required.';
if ($quantity < 1 || $quantity > 10)               $errors[] = 'Quantity must be between 1 and 10.';
if ($payment_method === '')                         $errors[] = 'Payment Method is required.';

if (!empty($errors)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'errors' => $errors]);
    exit;
}

/* ── Database Insert ── */
try {
    $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=' . DB_CHAR;
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);

    $sql = "INSERT INTO orders
                (name, email, address, quantity, unit_price, total_price, payment_method, notes)
            VALUES
                (:name, :email, :address, :quantity, :unit_price, :total_price, :payment_method, :notes)";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':name'           => htmlspecialchars($name,           ENT_QUOTES, 'UTF-8'),
        ':email'          => htmlspecialchars($email,          ENT_QUOTES, 'UTF-8'),
        ':address'        => htmlspecialchars($address,        ENT_QUOTES, 'UTF-8'),
        ':quantity'       => $quantity,
        ':unit_price'     => $unit_price,
        ':total_price'    => $total_price,
        ':payment_method' => htmlspecialchars($payment_method, ENT_QUOTES, 'UTF-8'),
        ':notes'          => htmlspecialchars($notes,          ENT_QUOTES, 'UTF-8'),
    ]);

    $order_id = $pdo->lastInsertId();

    echo json_encode([
        'success'  => true,
        'order_id' => (int)$order_id,
        'name'     => $name,
        'email'    => $email,
        'total'    => number_format($total_price, 2),
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'errors'  => ['Database error: ' . $e->getMessage()]
    ]);
}
