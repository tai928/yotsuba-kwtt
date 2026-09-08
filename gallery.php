<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

$galleryDirectory = __DIR__ . '/images/gallery';
$galleryWebPath = 'images/gallery/';
$allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'];

if (!is_dir($galleryDirectory) || !is_readable($galleryDirectory)) {
    echo json_encode(['images' => []], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

$entries = scandir($galleryDirectory);
$images = [];

if ($entries !== false) {
    foreach ($entries as $entry) {
        if ($entry === '' || $entry[0] === '.') {
            continue;
        }

        $absolutePath = $galleryDirectory . DIRECTORY_SEPARATOR . $entry;
        $extension = strtolower(pathinfo($entry, PATHINFO_EXTENSION));

        if (!is_file($absolutePath) || !in_array($extension, $allowedExtensions, true)) {
            continue;
        }

        // ファイル名に空白や日本語が含まれていてもURLとして扱えるようにします。
        $images[] = $galleryWebPath . rawurlencode($entry);
    }
}

natcasesort($images);

echo json_encode(
    ['images' => array_values($images)],
    JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
);

