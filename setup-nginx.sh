#!/bin/bash
set -e

cat > /etc/nginx/sites-available/kimai << 'EOF'
server {
    listen 80;
    server_name kimai.local;

    root /var/www/html/kimai/public;
    index index.php;

    location / {
        try_files $uri /index.php$is_args$args;
    }

    location ~ ^/index\.php(/|$) {
        fastcgi_pass unix:/run/php/php8.4-fpm.sock;
        fastcgi_split_path_info ^(.+\.php)(/.*)$;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        fastcgi_param DOCUMENT_ROOT $realpath_root;
        internal;
    }

    location ~ \.php$ {
        return 404;
    }

    location ~ /\.ht {
        deny all;
    }
}
EOF

rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/kimai /etc/nginx/sites-enabled/kimai
nginx -t && systemctl reload nginx

echo "Done! Visit http://kimai.local"
