#!/bin/sh
set -e

# Ensure SQLite database file exists (only if DB_CONNECTION is sqlite)
if [ "$DB_CONNECTION" = "sqlite" ] && [ ! -f "/var/www/html/database/database.sqlite" ]; then
    echo "Creating SQLite database..."
    mkdir -p /var/www/html/database
    touch /var/www/html/database/database.sqlite
    chmod 777 /var/www/html/database/database.sqlite
fi

# Wait for MySQL if configured
if [ "$DB_CONNECTION" = "mysql" ]; then
    echo "Waiting for MySQL database connection..."
    until php -r "try { new PDO('mysql:host=' . getenv('DB_HOST') . ';port=' . (getenv('DB_PORT') ?: 3306), getenv('DB_USERNAME'), getenv('DB_PASSWORD')); exit(0); } catch (Exception \$e) { exit(1); }" >/dev/null 2>&1; do
        echo "Database not ready yet, retrying in 2 seconds..."
        sleep 2
    done
    echo "Database connection established!"
fi

# Ensure storage subdirectories exist
mkdir -p /var/www/html/storage/framework/sessions
mkdir -p /var/www/html/storage/framework/views
mkdir -p /var/www/html/storage/framework/cache
mkdir -p /var/www/html/storage/logs

# Set folder permissions for apache user (www-data)
chown -R www-data:www-data /var/www/html/storage
chown -R www-data:www-data /var/www/html/bootstrap/cache
chown -R www-data:www-data /var/www/html/database

# Run migrations
echo "Running database migrations..."
php artisan migrate --force

# Create public storage symlink
echo "Creating storage symlink..."
php artisan storage:link --force || true

# Start Apache in the foreground
echo "Starting Apache..."
exec apache2-foreground
