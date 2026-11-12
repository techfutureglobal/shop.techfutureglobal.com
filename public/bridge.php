<?php
/**
 * bridge.php - Robust API Bridge for Steadfast & Pathao
 * This file handles cross-origin requests and acts as a server-side proxy.
 * Place this file in your public_html (or subdomain) folder.
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

// Enable CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Api-Key, Secret-Key, Authorization");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Check if CURL extension is available
if (!function_exists('curl_init')) {
    die(json_encode([
        'status' => 500, 
        'message' => 'PHP CURL extension is NOT enabled. Please enable it in cPanel (Select PHP Version > Extensions).'
    ]));
}

// Get JSON input
$inputRaw = file_get_contents('php://input');
$input = json_decode($inputRaw, true);

// Health check / Default response
if (!$input || !isset($input['url'])) {
    echo json_encode([
        'status' => 200, 
        'message' => 'Bridge is ALIVE and Ready. Visit https://apononline.com to use the site.',
        'php_version' => PHP_VERSION,
        'server_time' => date('Y-m-d H:i:s')
    ]);
    exit;
}

$targetUrl = $input['url'];
$method = isset($input['method']) ? strtoupper($input['method']) : 'GET';
$headers = isset($input['headers']) ? $input['headers'] : [];
$payload = isset($input['body']) ? $input['body'] : null;

// Initialize CURL
$ch = curl_init($targetUrl);

// Prepare headers for cURL
$curlHeaders = [];
foreach ($headers as $key => $val) {
    if (is_array($val)) {
        $curlHeaders[] = "$key: " . json_encode($val);
    } else {
        $curlHeaders[] = "$key: $val";
    }
}

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
curl_setopt($ch, CURLOPT_HTTPHEADER, $curlHeaders);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Crucial for many shared hosting environments
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

// Set body if POST
if ($method === 'POST' && $payload) {
    curl_setopt($ch, CURLOPT_POSTFIELDS, is_string($payload) ? $payload : json_encode($payload));
}

// Execute call
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($curlError) {
    echo json_encode([
        'status' => 500, 
        'message' => 'CURL Bridge Error: ' . $curlError
    ]);
} else {
    // Return the response from the remote API
    http_response_code($httpCode);
    echo $response;
}
?>
