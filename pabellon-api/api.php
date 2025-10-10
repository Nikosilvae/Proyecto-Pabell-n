<?php
// Archivo: api.php (Versión Final con Sistema de Login Integrado)

// INICIAMOS LA SESIÓN AL PRINCIPIO DE CUALQUIER PETICIÓN
session_start();

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require 'db.php';

// --- SECCIÓN DE HEADERS ACTUALIZADA ---
// Es crucial para que las sesiones con cookies funcionen
header("Access-Control-Allow-Origin: https://dev.pabellon.cl"); 
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");


if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];
$recurso = $_GET['recurso'] ?? null;

// --- MANEJO DE PETICIONES POST ---
if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    try {
        switch ($recurso) {
            case 'login':
                if (empty($data->usuario) || empty($data->password)) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Usuario y contraseña son requeridos.']);
                    exit();
                }
                
                $stmt = $pdo->prepare("SELECT password_hash FROM administradores WHERE usuario = ?");
                $stmt->execute([$data->usuario]);
                $user = $stmt->fetch(PDO::FETCH_ASSOC);

                if ($user && password_verify($data->password, $user['password_hash'])) {
                    $_SESSION['is_logged_in'] = true;
                    $_SESSION['usuario'] = $data->usuario;
                    echo json_encode(['status' => 'success']);
                } else {
                    http_response_code(401);
                    echo json_encode(['error' => 'Usuario o contraseña incorrectos.']);
                }
                break;
            
            case 'logout':
                session_destroy();
                echo json_encode(['status' => 'success', 'message' => 'Sesión cerrada con éxito.']);
                break;

            case 'moderar_propiedad':
                if (!isset($_SESSION['is_logged_in']) || $_SESSION['is_logged_in'] !== true) {
                    http_response_code(403); // Forbidden
                    throw new Exception('Acceso denegado. Debes iniciar sesión.');
                }
                
                if (!isset($data->id) || !isset($data->nuevo_estado)) {
                    throw new Exception("Datos incompletos para la moderación.");
                }
                
                $id_pendiente = $data->id;
                $nuevo_estado = $data->nuevo_estado;

                $pdo->beginTransaction();

                if ($nuevo_estado === 'aprobada') {
                    $stmt_select = $pdo->prepare("SELECT * FROM propiedades_pendientes WHERE id = ?");
                    $stmt_select->execute([$id_pendiente]);
                    $propiedad = $stmt_select->fetch(PDO::FETCH_ASSOC);
                    if (!$propiedad) throw new Exception("La propiedad pendiente no fue encontrada.");

                    $nuevo_id = 'proy_' . uniqid();
                    $imagenes_json = $propiedad['imagenes'];
                    $imagenes_array = json_decode($imagenes_json, true);
                    $imagen_principal = $imagenes_array[0] ?? null;

                    $sql_insert = "INSERT INTO proyectos (id, titulo, descripcion, comuna, direccion, uf, dormitorios, banos, img, fotos, amenities) 
                                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                    $stmt_insert = $pdo->prepare($sql_insert);
                    $stmt_insert->execute([
                        $nuevo_id, $propiedad['titulo'], $propiedad['descripcion'], $propiedad['comuna'],
                        $propiedad['direccion'], $propiedad['uf'], $propiedad['dormitorios'],
                        $propiedad['banos'], $imagen_principal, $imagenes_json, $propiedad['amenities'] ?? '[]'
                    ]);

                    $sql_update = "UPDATE propiedades_pendientes SET estado = ? WHERE id = ?";
                    $stmt_update = $pdo->prepare($sql_update);
                    $stmt_update->execute(['aprobada', $id_pendiente]);
                } elseif ($nuevo_estado === 'rechazada') {
                    $sql_update = "UPDATE propiedades_pendientes SET estado = ? WHERE id = ?";
                    $stmt_update = $pdo->prepare($sql_update);
                    $stmt_update->execute(['rechazada', $id_pendiente]);
                }
                
                $pdo->commit();
                echo json_encode(["status" => "success", "message" => "Moderación procesada con éxito."]);
                break;

            default:
                http_response_code(404);
                echo json_encode(['error' => 'Recurso POST no encontrado.']);
                break;
        }
    } catch (Exception $e) {
        if ($pdo->inTransaction()) { $pdo->rollBack(); }
        http_response_code(500);
        echo json_encode(['error' => 'Error: ' . $e->getMessage()]);
    }
    exit();
}

// --- MANEJO DE PETICIONES GET ---
if ($method === 'GET') {
    if (!$recurso) { http_response_code(400); echo json_encode(['error' => 'No se especificó un recurso GET.']); exit(); }

    try {
        $stmt = null;
        switch ($recurso) {
            case 'check_session':
                if (isset($_SESSION['is_logged_in']) && $_SESSION['is_logged_in'] === true) {
                    echo json_encode(['isAuthenticated' => true, 'usuario' => $_SESSION['usuario']]);
                } else {
                    echo json_encode(['isAuthenticated' => false]);
                }
                exit();

            case 'propiedades_pendientes':
                if (!isset($_SESSION['is_logged_in']) || $_SESSION['is_logged_in'] !== true) {
                    http_response_code(403);
                    echo json_encode(['error' => 'Acceso denegado.']);
                    exit();
                }
                $stmt = $pdo->query("SELECT * FROM propiedades_pendientes WHERE estado = 'en_revision' ORDER BY fecha_creacion DESC");
                break;
            
            case 'proyectos': $stmt = $pdo->query("SELECT * FROM proyectos ORDER BY created_at DESC"); break;
            case 'subsidios': $stmt = $pdo->query("SELECT * FROM subsidios ORDER BY created_at DESC"); break;
            case 'noticias': $stmt = $pdo->query("SELECT * FROM noticias ORDER BY fecha DESC"); break;
            case 'inmobiliarias': $stmt = $pdo->query("SELECT * FROM inmobiliarias ORDER BY nombre ASC"); break;
            case 'proyectos_destacados': $stmt = $pdo->query("SELECT id, titulo, img FROM proyectos WHERE img IS NOT NULL AND img != '' ORDER BY RAND() LIMIT 5"); break;
            case 'comunas': echo json_encode($pdo->query("SELECT nombre FROM comunas ORDER BY nombre ASC")->fetchAll(PDO::FETCH_COLUMN, 0)); exit();
            case 'rangos_uf': $stmt = $pdo->query("SELECT * FROM rangos_uf ORDER BY min_uf ASC"); break;
            case 'filtros_dorms': $stmt = $pdo->query("SELECT * FROM filtros_dorms ORDER BY valor ASC"); break;
            case 'noticia_detalle': $slug = $_GET['slug'] ?? ''; $stmt = $pdo->prepare("SELECT * FROM noticias WHERE slug = ?"); $stmt->execute([$slug]); $resultado = $stmt->fetch(PDO::FETCH_ASSOC); if (!$resultado) { http_response_code(404); echo json_encode(['error' => 'Noticia no encontrada.']); exit(); } if (isset($resultado['contenido'])) $resultado['contenido'] = json_decode($resultado['contenido']); echo json_encode($resultado); exit();
            case 'proyectos_por_ids': $ids_str = $_GET['ids'] ?? ''; if (empty($ids_str)) { echo json_encode([]); exit(); } $ids = explode(',', $ids_str); $placeholders = implode(',', array_fill(0, count($ids), '?')); $stmt = $pdo->prepare("SELECT * FROM proyectos WHERE id IN ($placeholders) ORDER BY FIELD(id, $placeholders)"); $stmt->execute(array_merge($ids, $ids)); break;
            case 'subsidios_por_ids': $ids_str = $_GET['ids'] ?? ''; if (empty($ids_str)) { echo json_encode([]); exit(); } $ids = explode(',', $ids_str); $placeholders = implode(',', array_fill(0, count($ids), '?')); $stmt = $pdo->prepare("SELECT * FROM subsidios WHERE id IN ($placeholders) ORDER BY FIELD(id, $placeholders)"); $stmt->execute(array_merge($ids, $ids)); break;
            default: http_response_code(404); echo json_encode(['error' => 'Recurso GET no encontrado.']); exit();
        }
        
        $resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($resultados as &$fila) {
            if (isset($fila['amenities']) && is_string($fila['amenities'])) $fila['amenities'] = json_decode($fila['amenities']);
            if (isset($fila['fotos']) && is_string($fila['fotos'])) $fila['fotos'] = json_decode($fila['fotos']);
            if (isset($fila['requisitos']) && is_string($fila['requisitos'])) $fila['requisitos'] = json_decode($fila['requisitos']);
            if (isset($fila['beneficio']) && is_string($fila['beneficio'])) $fila['beneficio'] = json_decode($fila['beneficio']);
            if (isset($fila['contenido']) && is_string($fila['contenido'])) $fila['contenido'] = json_decode($fila['contenido']);
            if (isset($fila['imagenes']) && is_string($fila['imagenes'])) $fila['imagenes'] = json_decode($fila['imagenes']);
        }
        echo json_encode($resultados);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error: ' . $e->getMessage()]);
        exit();
    }
}