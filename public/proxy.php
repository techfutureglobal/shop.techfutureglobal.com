<?php
// PHP Proxy for Steadfast API - Final Robust Version
// If you get 500 error, check your server error logs or PHP version (7.4+ recommended)

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Api-Key, Secret-Key, Authorization");
header("Content-Type: application/json");

// Exit early for preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 1. Check if CURL is enabled
if (!function_exists('curl_init')) {
    echo json_encode(['status' => 500, 'message' => 'PHP CURL extension is NOT enabled on your server. Please enable it in cPanel or contact host.']);
    exit;
}

// 2. Get Input
$inputRaw = file_get_contents('php://input');
$input = json_decode($inputRaw, true);

// If called directly without JSON (test mode)
if (!$input || !isset($input['url'])) {
    echo json_encode(['status' => 200, 'message' => 'Proxy is ALIVE. Send a JSON request with a "url" field to use it.']);
    exit;
}

$targetUrl = $input['url'];
$method = isset($input['method']) ? strtoupper($input['method']) : 'GET';
$headers = isset($input['headers']) ? $input['headers'] : [];
$payload = isset($input['body']) ? $input['body'] : null;

// 3. Prepare CURL
$ch = curl_init($targetUrl);
$curlHeaders = [];
foreach ($headers as $key => $val) {
    $curlHeaders[] = "$key: $val";
}

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
curl_setopt($ch, CURLOPT_HTTPHEADER, $curlHeaders);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Crucial for shared hosting
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

if ($method === 'POST' && $payload) {
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
}

// 4. Fire!
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

if ($error) {
    echo json_encode(['status' => 500, 'message' => 'CURL Error: ' . $error]);
} else {
    // Forward result
    http_response_code($httpCode);
    echo $response;
}
?>
