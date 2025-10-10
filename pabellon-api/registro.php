<?php
// --- CÓDIGO DE DEPURACIÓN ---
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require 'db.php'; // Reutilizamos tu conexión a la base de datos

// --- Cabeceras para CORS y JSON ---
// Es importante que el origen sea el de tu aplicación
header("Access-Control-Allow-Origin: https://dev.pabellon.cl");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Manejo de la petición pre-vuelo OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Solo aceptamos peticiones POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['error' => 'Método no permitido.']);
    exit();
}

// Obtenemos los datos del cuerpo de la petición (enviados como JSON)
$data = json_decode(file_get_contents("php://input"));

try {
    // 1. Validación de datos de entrada (actualizada)
    if (empty($data->usuario) || empty($data->password) || empty($data->correo_electronico)) {
        http_response_code(400); // Bad Request
        throw new Exception('Usuario, contraseña y correo son obligatorios.');
    }
    if (!filter_var($data->correo_electronico, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        throw new Exception('El formato del correo electrónico no es válido.');
    }

    // 2. Verificar si el usuario o el correo ya existen (actualizada)
    $stmt_check = $pdo->prepare("SELECT id FROM administradores WHERE usuario = ? OR correo_electronico = ?");
    $stmt_check->execute([$data->usuario, $data->correo_electronico]);
    if ($stmt_check->fetch()) {
        http_response_code(409); // Conflict
        throw new Exception('El nombre de usuario o el correo ya están en uso.');
    }

    // 3. Encriptar la contraseña (¡MUY IMPORTANTE!)
    $password_hash = password_hash($data->password, PASSWORD_DEFAULT);
    $telefono = $data->telefono ?? null; // Teléfono es opcional

    // 4. Insertar el nuevo usuario en la base de datos (actualizada)
    $sql = "INSERT INTO administradores (usuario, password_hash, correo_electronico, telefono) VALUES (?, ?, ?, ?)";
    $stmt_insert = $pdo->prepare($sql);
    $stmt_insert->execute([$data->usuario, $password_hash, $data->correo_electronico, $telefono]);

    // 5. Enviar respuesta de éxito
    http_response_code(201); // Created
    echo json_encode(['status' => 'success', 'message' => 'Usuario registrado con éxito.']);

} catch (Exception $e) {
    // Manejo de errores
    if (http_response_code() === 200) {
        http_response_code(500);
    }
    echo json_encode(['error' => $e->getMessage()]);
    exit();
}
?>