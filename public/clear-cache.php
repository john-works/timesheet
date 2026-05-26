<?php
$poolDir = __DIR__ . '/../var/cache/prod/pools';
if (!is_dir($poolDir)) {
    echo "OK - no such dir";
    return;
}
$it = new RecursiveDirectoryIterator($poolDir, RecursiveDirectoryIterator::SKIP_DOTS);
$files = new RecursiveIteratorIterator($it, RecursiveIteratorIterator::CHILD_FIRST);
foreach ($files as $file) {
    if ($file->isDir()) {
        @rmdir($file->getPathname());
    } else {
        @unlink($file->getPathname());
    }
}
@rmdir($poolDir);
echo "OK";
