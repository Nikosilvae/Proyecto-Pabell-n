<?php
// api/guardar_propiedad.php (Versión Robusta y Corregida para Amenities)

require 'db.php';

// --- Headers para comunicación ---
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // Directorio donde se guardarán las imágenes
    $uploadDir = 'uploads/';
    $baseUrl = 'https://dev.pabellon.cl/api/';

    if (!is_dir($uploadDir) || !is_writable($uploadDir)) {
        throw new Exception("Error de configuración del servidor: El directorio de subidas no existe o no tiene permisos de escritura.");
    }

    // Recopilamos todos los datos del formulario
    $titulo = $_POST['titulo'] ?? '';
    $descripcion = $_POST['descripcion'] ?? '';
    $comuna = $_POST['comuna'] ?? '';
    $direccion = $_POST['direccion'] ?? '';
    $uf = $_POST['uf'] ?? 0;
    $dormitorios = $_POST['dormitorios'] ?? 0;
    $banos = $_POST['banos'] ?? 0;
    $amenities = $_POST['amenities'] ?? '[]'; // <-- 1. CAPTURAMOS LOS AMENITIES

    if (empty($titulo) || empty($comuna) || empty($uf)) {
        throw new Exception("Faltan datos obligatorios.");
    }

    $uploadedFileUrls = [];
    if (!empty($_FILES['imagenes'])) {
        $files = $_FILES['imagenes'];
        $fileCount = count($files['name']);

        for ($i = 0; $i < $fileCount; $i++) {
            if ($files['error'][$i] === UPLOAD_ERR_OK) {
                $tmpName = $files['tmp_name'][$i];
                $fileName = uniqid() . '-' . preg_replace("/[^a-zA-Z0-9.]/", "-", basename($files['name'][$i]));
                $targetPath = $uploadDir . $fileName;

                if (move_uploaded_file($tmpName, $targetPath)) {
                    $uploadedFileUrls[] = $baseUrl . $targetPath;
                } else {
                    throw new Exception("No se pudo mover el archivo subido a su destino.");
                }
            } elseif ($files['error'][$i] !== UPLOAD_ERR_NO_FILE) {
                throw new Exception("Error al subir el archivo. Código de error: " . $files['error'][$i]);
            }
        }
    }
    
    $imagenesJson = json_encode($uploadedFileUrls);

    // --- 2. ACTUALIZAMOS LA CONSULTA SQL ---
    $sql = "INSERT INTO propiedades_pendientes (titulo, descripcion, comuna, direccion, uf, dormitorios, banos, amenities, imagenes) VALUES (:titulo, :descripcion, :comuna, :direccion, :uf, :dormitorios, :banos, :amenities, :imagenes)";
    $stmt = $pdo->prepare($sql);
    
    $stmt->bindParam(':titulo', $titulo);
    $stmt->bindParam(':descripcion', $descripcion);
    $stmt->bindParam(':comuna', $comuna);
    $stmt->bindParam(':direccion', $direccion);
    $stmt->bindParam(':uf', $uf);
    $stmt->bindParam(':dormitorios', $dormitorios, PDO::PARAM_INT);
    $stmt->bindParam(':banos', $banos, PDO::PARAM_INT);
    $stmt->bindParam(':amenities', $amenities); // <-- 3. AÑADIMOS EL BINDING PARA AMENITIES
    $stmt->bindParam(':imagenes', $imagenesJson);
    
    $stmt->execute();
    
    http_response_code(201);
    echo json_encode(["status" => "success", "message" => "Propiedad enviada para revisión con éxito."]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>