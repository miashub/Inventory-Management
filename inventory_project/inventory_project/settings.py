from pathlib import Path
from dotenv import load_dotenv
import dj_database_url
import os

# Load environment variables from .env file
load_dotenv()

# Base directory of the project
BASE_DIR = Path(__file__).resolve().parent.parent

# Debug mode toggle (should be False in production)
DEBUG = os.getenv("DEBUG", "False") == "True"

# Secret key used by Django for cryptographic signing
SECRET_KEY = os.getenv("SECRET_KEY")

# Hosts/domain names allowed to serve the application
ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "").split(",")

# ---------------- CORS & CSRF Settings ----------------

# Allow cookies and credentials to be included in cross-site HTTP requests
CORS_ALLOW_CREDENTIALS = True

# List of frontend domains allowed to make requests (comma-separated in .env)
CORS_ALLOWED_ORIGINS = os.getenv("CORS_ALLOWED_ORIGINS", "").split(",")

# Trusted origins for CSRF protection (used when frontend and backend are on different domains)
CSRF_TRUSTED_ORIGINS = os.getenv("CSRF_TRUSTED_ORIGINS", "").split(",")

# ---------------- Installed Apps ----------------

INSTALLED_APPS = [
    'corsheaders',                       # Enables Cross-Origin Resource Sharing
    'rest_framework',                    # Django REST Framework for APIs
    'inventory',                         # Custom app for inventory logic
    "django.contrib.admin",              # Django admin interface
    "django.contrib.auth",               # Authentication framework
    "django.contrib.contenttypes",       # Content type system
    "django.contrib.sessions",           # Session framework
    "django.contrib.messages",           # Messaging framework
    "django.contrib.staticfiles",        # Manages static files
]

# ---------------- Middleware Stack ----------------

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",         # Handle CORS headers
    "django.middleware.security.SecurityMiddleware", # Security enhancements
    "django.contrib.sessions.middleware.SessionMiddleware", # Session handling
    "django.middleware.common.CommonMiddleware",     # Basic middleware for common operations
    "django.middleware.csrf.CsrfViewMiddleware",     # CSRF protection
    "django.contrib.auth.middleware.AuthenticationMiddleware", # Authentication management
    "django.contrib.messages.middleware.MessageMiddleware",     # Temporary message framework
    "django.middleware.clickjacking.XFrameOptionsMiddleware",   # Prevent clickjacking
]

# ---------------- URL and Template Configuration ----------------

# Main URL configuration file
ROOT_URLCONF = "inventory_project.urls"

# Template rendering configuration
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],  # You can add template directories here
        "APP_DIRS": True,  # Looks for templates in each app's "templates" folder
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",  # Adds 'request' to template context
                "django.contrib.auth.context_processors.auth", # Adds 'user' to template context
                "django.contrib.messages.context_processors.messages",  # Adds 'messages'
            ],
        },
    },
]

# Entry point for WSGI-compatible web servers
WSGI_APPLICATION = "inventory_project.wsgi.application"

# ---------------- Database Configuration ----------------

# Uses DATABASE_URL 
DATABASES = {
    'default': dj_database_url.config(default=os.getenv("DATABASE_URL"))
}

# ---------------- Static Files ----------------

# URL path to access static files (CSS, JS, images)
STATIC_URL = "/static/"

# Directory to collect static files for production
STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")

# ---------------- Security Settings for Production ----------------

# Use secure cookies and HTTPS in production
SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG
SESSION_COOKIE_SAMESITE = 'None' if not DEBUG else 'Lax'
CSRF_COOKIE_SAMESITE = 'None' if not DEBUG else 'Lax'
SECURE_SSL_REDIRECT = not DEBUG  # Redirect all HTTP requests to HTTPS

# ---------------- Password Validation ----------------

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# ---------------- Internationalization ----------------

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# Default type for auto-created primary keys
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Automatically append slashes to URLs (e.g., /admin → /admin/)
APPEND_SLASH = True
