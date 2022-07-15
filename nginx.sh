docker run \
--rm \
-it \
-v $(pwd)/dist/angular-web-push:/usr/share/nginx/html \
-v $(pwd)/nginx.conf:/etc/nginx/nginx.conf \
-p 80:80 \
nginx:1.18.0
