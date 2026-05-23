# 🌑 SharpShadow — Full Developer Guide

**SharpShadow** is a digital product marketplace where creators upload and sell downloadable files (fonts, UI kits, templates, etc.). Users authenticate via Firebase, pay with Razorpay, and download purchases via secure Firebase Storage signed URLs.

---

## 📐 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                      FRONTEND                           │
│  Vite + React (TypeScript)  ·  Firebase Auth            │
│  Deployed on: Vercel / Netlify                          │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTPS /api/*
┌─────────────────────▼───────────────────────────────────┐
│                      BACKEND                            │
│  Spring Boot 3 (Java 21)  ·  JWT Security               │
│  REST API at port 8080                                  │
│  Deployed on: Railway / Render / VPS                    │
└────┬──────────────────┬────────────────────┬────────────┘
     │                  │                    │
  MySQL DB        Firebase Auth        Firebase Storage
  (PlanetScale/   (User verify)        (Files & Images)
   Railway)
                                      Razorpay
                                    (Payments)
```

---

## 📁 Project Structure

```
Project SharpShadow/
├── frontend/                  # Vite + React app
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Route-level pages
│   │   ├── services/          # API call functions
│   │   ├── hooks/             # Custom React hooks
│   │   └── lib/               # Firebase client setup
│   ├── .env.local             # Frontend secrets (never commit)
│   └── vite.config.ts         # Dev proxy to :8080
│
└── backend/                   # Spring Boot app
    └── src/main/java/com/sharpshadow/
        ├── config/            # Firebase, CORS, Security config
        ├── controller/        # REST endpoints
        │   ├── AuthController       (POST /api/auth/login)
        │   ├── ProductController    (GET/POST /api/products)
        │   ├── OrderController      (POST /api/orders)
        │   ├── DownloadController   (GET /api/download/{id})
        │   └── AdminController      (Admin-only CRUD)
        ├── service/           # Business logic
        │   ├── AuthService          (Firebase token verify → JWT)
        │   ├── ProductService       (CRUD + paging)
        │   ├── OrderService         (Razorpay create/verify)
        │   ├── DownloadService      (Signed URL generation)
        │   └── StorageService       (Firebase Storage upload/delete)
        ├── entity/            # JPA entities (no Lombok — explicit getters)
        │   ├── User, Product, Category, Order, OrderItem
        ├── dto/               # Request / Response POJOs
        ├── repository/        # Spring Data JPA repos
        ├── security/          # JWT filter + Firebase verifier
        └── resources/
            ├── application.properties
            └── firebase-service-account.json  ← NEVER commit this!
```

---

## ⚙️ Local Development Setup

### Prerequisites

| Tool     | Minimum Version        |
| -------- | ---------------------- |
| Java JDK | 21                     |
| Maven    | 3.9+ (or use `./mvnw`) |
| Node.js  | 18+                    |
| MySQL    | 8.0+                   |
| Git      | any                    |

---

### 1. Clone the project

```bash
git clone https://github.com/YOUR_USERNAME/project-sharpshadow.git
cd "Project SharpShadow"
```

---

### 2. MySQL Database

```sql
-- Run in MySQL shell or MySQL Workbench
CREATE DATABASE sharpshadow;
```

Leave the table creation to Spring Boot — it auto-creates tables on startup (`ddl-auto=update`).

---

### 3. Firebase Setup

#### 3a. Create / open Firebase project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a project (or use an existing one)
3. Enable **Authentication → Sign-in method → Google** (and/or Email/Password)
4. Enable **Storage** (choose a region, start in production mode)

#### 3b. Download service account key (for backend)

1. Firebase Console → **⚙️ Project Settings → Service accounts**
2. Click **"Generate new private key"** → download the JSON file
3. Rename it to `firebase-service-account.json`
4. Place it at:
   ```
   backend/src/main/resources/firebase-service-account.json
   ```

> [!CAUTION]
> **NEVER commit this file to Git.** It contains a private RSA key giving full admin access to your Firebase project. It should already be in `.gitignore`.

#### 3c. Get frontend Firebase config

1. Firebase Console → **⚙️ Project Settings → Your apps → Web app**
2. Copy the `firebaseConfig` object values into your `frontend/.env.local`

---

### 4. Frontend Setup

```bash
cd frontend
cp .env.example .env.local   # copy template
```

Edit `frontend/.env.local`:

```env
# Leave blank for local dev — Vite proxy handles /api/* → :8080
VITE_API_BASE_URL=

# From Firebase Console → Project Settings → Your apps
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc...

# From Razorpay Dashboard → API Keys (test key starts with rzp_test_)
VITE_RAZORPAY_KEY_ID=rzp_test_...
```

```bash
npm install
npm run dev      # starts at http://localhost:5173
```

---

### 5. Backend Setup

The backend reads config from environment variables with fallback defaults in `application.properties`.

**Option A — Set environment variables (recommended):**

```powershell
# PowerShell (Windows)
$env:MYSQL_URL="jdbc:mysql://localhost:3306/sharpshadow?useSSL=false&serverTimezone=UTC"
$env:MYSQL_USER="root"
$env:MYSQL_PASSWORD="your_mysql_password"
$env:JWT_SECRET="YourSuperSecretKeyAtLeast256BitsLongForJWT!"
$env:RAZORPAY_KEY_ID="rzp_test_..."
$env:RAZORPAY_KEY_SECRET="your_razorpay_secret"
$env:FIREBASE_STORAGE_BUCKET="your-project.firebasestorage.app"
```

```bash
# Linux / macOS
export MYSQL_URL="jdbc:mysql://localhost:3306/sharpshadow?useSSL=false&serverTimezone=UTC"
export MYSQL_USER="root"
export MYSQL_PASSWORD="your_mysql_password"
export JWT_SECRET="YourSuperSecretKeyAtLeast256BitsLongForJWT!"
export RAZORPAY_KEY_ID="rzp_test_..."
export RAZORPAY_KEY_SECRET="your_razorpay_secret"
export FIREBASE_STORAGE_BUCKET="your-project.firebasestorage.app"
```

**Option B — Edit defaults directly in `application.properties`** (not recommended for secrets)

```bash
cd backend
./mvnw spring-boot:run      # Linux / macOS
mvnw.cmd spring-boot:run    # Windows
```

Backend starts at **http://localhost:8080**

---

### 6. Create First Admin User

After the backend starts and you log in via the frontend for the first time, your `User` row in MySQL will have `role = 'USER'`. Promote yourself to admin:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'your@email.com';
```

Then log out and back in. You'll now have access to the **Admin Panel** at `/admin`.

---

## 🔑 All Environment Variables Reference

### Backend (`application.properties` / env vars)

| Variable                    | Default                                      | Description                                          |
| --------------------------- | -------------------------------------------- | ---------------------------------------------------- |
| `MYSQL_URL`                 | `jdbc:mysql://localhost:3306/sharpshadow...` | Full JDBC connection string                          |
| `MYSQL_USER`                | `root`                                       | MySQL username                                       |
| `MYSQL_PASSWORD`            | _(empty)_                                    | MySQL password                                       |
| `JWT_SECRET`                | _(hardcoded default — change in prod!)_      | HMAC-SHA256 signing key, min 256 bits                |
| `JWT_EXPIRATION_MS`         | `86400000` (24h)                             | JWT token lifetime in milliseconds                   |
| `FIREBASE_CREDENTIALS_PATH` | `firebase-service-account.json`              | Path to service account JSON (relative to classpath) |
| `FIREBASE_STORAGE_BUCKET`   | `sharpshadow-d6d6b.firebasestorage.app`      | Firebase Storage bucket name                         |
| `S3_PRESIGNED_URL_DURATION` | `15`                                         | Signed URL expiry in minutes                         |
| `RAZORPAY_KEY_ID`           | _(test key)_                                 | Razorpay API key ID                                  |
| `RAZORPAY_KEY_SECRET`       | _(test secret)_                              | Razorpay API key secret                              |
| `RAZORPAY_WEBHOOK_SECRET`   | `your_webhook_secret`                        | Razorpay webhook signing secret                      |
| `CORS_ALLOWED_ORIGINS`      | `http://localhost:5173,...`                  | Comma-separated allowed origins                      |

### Frontend (`frontend/.env.local`)

| Variable                            | Description                                                       |
| ----------------------------------- | ----------------------------------------------------------------- |
| `VITE_API_BASE_URL`                 | Backend URL (empty = use Vite proxy in dev)                       |
| `VITE_FIREBASE_API_KEY`             | Firebase web API key                                              |
| `VITE_FIREBASE_AUTH_DOMAIN`         | Firebase auth domain                                              |
| `VITE_FIREBASE_PROJECT_ID`          | Firebase project ID                                               |
| `VITE_FIREBASE_STORAGE_BUCKET`      | Firebase storage bucket                                           |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase sender ID                                                |
| `VITE_FIREBASE_APP_ID`              | Firebase app ID                                                   |
| `VITE_RAZORPAY_KEY_ID`              | Razorpay publishable key (starts with `rzp_test_` or `rzp_live_`) |

---

## 🔄 Switching Storage: Firebase → AWS S3

The entire storage logic lives in one file:
[`StorageService.java`](backend/src/main/java/com/sharpshadow/service/StorageService.java)

### Step 1 — Add AWS SDK to `pom.xml`

```xml
<dependency>
    <groupId>software.amazon.awssdk</groupId>
    <artifactId>s3</artifactId>
    <version>2.25.0</version>
</dependency>
<dependency>
    <groupId>software.amazon.awssdk</groupId>
    <artifactId>presigner</artifactId>
    <version>2.25.0</version>
</dependency>
```

### Step 2 — Add environment variables

```properties
# application.properties — add these
app.aws.access-key=${AWS_ACCESS_KEY_ID}
app.aws.secret-key=${AWS_SECRET_ACCESS_KEY}
app.aws.region=${AWS_REGION:ap-south-1}
app.aws.bucket=${S3_BUCKET_NAME:sharpshadow-files}
app.aws.presigned-url-duration-minutes=${S3_PRESIGNED_URL_DURATION:15}
```

### Step 3 — Replace `StorageService.java`

```java
@Service
public class StorageService {

    private static final Logger log = LoggerFactory.getLogger(StorageService.class);

    @Value("${app.aws.access-key}") private String accessKey;
    @Value("${app.aws.secret-key}") private String secretKey;
    @Value("${app.aws.region}")     private String region;
    @Value("${app.aws.bucket}")     private String bucket;
    @Value("${app.aws.presigned-url-duration-minutes}") private int urlDuration;

    private S3Client s3() {
        return S3Client.builder()
            .region(Region.of(region))
            .credentialsProvider(StaticCredentialsProvider.create(
                AwsBasicCredentials.create(accessKey, secretKey)))
            .build();
    }

    public String uploadFile(String key, InputStream inputStream, long contentLength, String contentType) {
        try (S3Client client = s3()) {
            client.putObject(
                PutObjectRequest.builder().bucket(bucket).key(key).contentType(contentType).build(),
                RequestBody.fromInputStream(inputStream, contentLength)
            );
            log.info("Uploaded to S3: {}", key);
            return key;
        } catch (Exception e) {
            log.error("S3 upload failed: {}", e.getMessage(), e);
            throw new RuntimeException("Upload error: " + e.getMessage(), e);
        }
    }

    public String generatePresignedUrl(String key) {
        try (S3Presigner presigner = S3Presigner.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(
                    AwsBasicCredentials.create(accessKey, secretKey)))
                .build()) {

            GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(urlDuration))
                .getObjectRequest(r -> r.bucket(bucket).key(key))
                .build();

            return presigner.presignGetObject(presignRequest).url().toString();
        }
    }

    public void deleteFile(String key) {
        try (S3Client client = s3()) {
            client.deleteObject(DeleteObjectRequest.builder().bucket(bucket).key(key).build());
            log.info("Deleted from S3: {}", key);
        } catch (Exception e) {
            log.error("S3 delete failed for key {}: {}", key, e.getMessage(), e);
        }
    }

    public String getPublicUrl(String key) {
        return String.format("https://%s.s3.%s.amazonaws.com/%s", bucket, region, key);
    }
}
```

### Step 4 — Remove Firebase Storage dependency from `pom.xml`

Remove the `firebase-admin` dependency or keep it only for Auth (remove `StorageClient` usage).

---

## 🔄 Switching Firebase Projects (Full Account Change)

### Backend changes

1. Download new service account JSON → replace `firebase-service-account.json`
2. Update `FIREBASE_STORAGE_BUCKET` to the new bucket name (e.g., `new-project.firebasestorage.app`)

### Frontend changes

1. Update all `VITE_FIREBASE_*` variables in `.env.local` with the new project's web config
2. In Firebase Console for the new project:
   - Enable Authentication → Google Sign-In
   - Enable Storage → create default bucket
   - Add your domain to **Authentication → Authorized domains**

### Database

- All `users` rows reference Firebase UID (`firebaseUid` column). These will be **invalidated** when switching Firebase projects (UIDs are project-specific).
- Options:
  - **Clean migration**: truncate `users`, `orders`, `order_items` tables and start fresh
  - **Export UIDs**: use Firebase Admin SDK to export/import users between projects (complex)

---

## 🚀 Production Deployment

### Frontend → Vercel (recommended)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → import your repo
3. Set **Root Directory** to `frontend`
4. Add all `VITE_*` environment variables in Vercel's project settings
5. Set `VITE_API_BASE_URL=https://your-backend-url.com` (no trailing slash)
6. Deploy → Vercel gives you `https://your-app.vercel.app`

**Add Vercel domain to Firebase:**
Firebase Console → Authentication → Authorized domains → Add `your-app.vercel.app`

---

### Backend → Railway (recommended for beginners)

1. Go to [railway.app](https://railway.app) → **New Project**
2. Click **Deploy from GitHub repo** → select your repo
3. Set **Root Directory** to `backend`
4. Railway auto-detects Maven and builds the JAR

**Add a MySQL service:**

- In Railway project → **+ New** → **Database → MySQL**
- Railway provides `MYSQL_URL`, `MYSQL_USER`, `MYSQL_PASSWORD` as shared variables

**Set environment variables in Railway:**

```
MYSQL_URL         = (auto-filled by Railway MySQL plugin)
MYSQL_USER        = (auto-filled)
MYSQL_PASSWORD    = (auto-filled)
JWT_SECRET        = YourProductionSecretKeyAtLeast32CharactersLong!
RAZORPAY_KEY_ID   = rzp_live_...
RAZORPAY_KEY_SECRET = your_live_secret
FIREBASE_STORAGE_BUCKET = your-project.firebasestorage.app
CORS_ALLOWED_ORIGINS = https://your-app.vercel.app
```

**Upload service account JSON:**

- Option A: Base64-encode the file and pass as an env var, decode at startup
- Option B: Store in Railway's persistent volume and reference by path

**CORS:**
Update `CORS_ALLOWED_ORIGINS` to include your Vercel URL.

---

### Backend → Render

1. [render.com](https://render.com) → **New Web Service** → connect GitHub
2. **Root Directory**: `backend`
3. **Build command**: `./mvnw package -DskipTests`
4. **Start command**: `java -jar target/sharpshadow-*.jar`
5. Add same environment variables as Railway section above
6. Add a **PostgreSQL** database (or use PlanetScale for MySQL)

> [!NOTE]
> Render free tier spins down after 15 minutes of inactivity. Use the paid tier or Railway for always-on.

---

### Backend → VPS (Ubuntu, full control)

```bash
# 1. Install Java 21
sudo apt update && sudo apt install -y openjdk-21-jdk

# 2. Install MySQL
sudo apt install -y mysql-server
sudo mysql -e "CREATE DATABASE sharpshadow;"
sudo mysql -e "CREATE USER 'ss_user'@'localhost' IDENTIFIED BY 'StrongPassword';"
sudo mysql -e "GRANT ALL ON sharpshadow.* TO 'ss_user'@'localhost';"

# 3. Upload JAR and service account
scp backend/target/sharpshadow-*.jar user@your-vps:/opt/sharpshadow/app.jar
scp backend/src/main/resources/firebase-service-account.json user@your-vps:/opt/sharpshadow/

# 4. Create systemd service
sudo nano /etc/systemd/system/sharpshadow.service
```

```ini
[Unit]
Description=SharpShadow Backend
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/opt/sharpshadow
ExecStart=/usr/bin/java -jar /opt/sharpshadow/app.jar
Environment=MYSQL_URL=jdbc:mysql://localhost:3306/sharpshadow?useSSL=false&serverTimezone=UTC
Environment=MYSQL_USER=ss_user
Environment=MYSQL_PASSWORD=StrongPassword
Environment=JWT_SECRET=YourProductionSecret
Environment=RAZORPAY_KEY_ID=rzp_live_...
Environment=RAZORPAY_KEY_SECRET=...
Environment=FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
Environment=FIREBASE_CREDENTIALS_PATH=/opt/sharpshadow/firebase-service-account.json
Environment=CORS_ALLOWED_ORIGINS=https://your-domain.com
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable sharpshadow
sudo systemctl start sharpshadow
sudo systemctl status sharpshadow

# Nginx reverse proxy (optional but recommended)
sudo apt install -y nginx
sudo nano /etc/nginx/sites-available/sharpshadow
```

```nginx
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/sharpshadow /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# SSL (free via Let's Encrypt)
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.your-domain.com
```

---

## 💳 Razorpay Payment Gateway Setup & Integration

SharpShadow integrates **Razorpay** for seamless, secure digital asset purchases. The payment flow operates as follows:

1. **Frontend** requests a new order for a product.
2. **Backend** contacts Razorpay to generate a unique `razorpay_order_id` and saves a `PENDING` order in the database.
3. **Frontend** receives the order ID and displays the native **Razorpay Checkout** overlay.
4. **User** makes the payment. Razorpay returns a payment signature.
5. **Backend** verifies the signature cryptographically using `HMAC-SHA256` to secure against tampering and marks the order `PAID`, unlocking the download.

---

### 🤝 Client Handover & Account Ownership Guide

If you are developing this project for a **client (your customer)**, follow these crucial guidelines regarding Razorpay account setup:

> [!IMPORTANT]
> **Your client must create and legally own the Razorpay account.** Do not use your own personal or agency Razorpay account to collect payments for them.
> * **Legal KYC & Bank Settlements**: Razorpay requires strict business verification (PAN, GSTIN, Aadhaar). All buyer funds are automatically settled directly into your customer's business bank account.
> * **Taxes & Liabilities**: All sales income, transaction invoices, and GST liabilities are reported directly to the tax authorities under the PAN of the Razorpay account owner. Using your own account would create major tax and legal issues for you.

#### Recommended Setup Methods:

* **Method A: Team Invite (Recommended & Safest)**
  1. Have the client sign up on the [Razorpay Dashboard](https://dashboard.razorpay.com/) and complete KYC.
  2. Ask them to navigate to **Account & Settings → Users** (under Team Management).
  3. They click **Add User** and invite your email address with the **"Developer"** or **"Operations"** role.
  4. You accept the invite, log in safely with your own account, switch to Test Mode, generate keys, and configure webhooks (without seeing their private bank details or settlements).

* **Method B: Secure Key Handover**
  1. The client signs up and completes KYC.
  2. They log in, go to **Settings → API Keys**, generate the **API Key ID** and **Key Secret** (both Test and Live versions), and share them with you securely.
  3. You configure these keys directly into their production hosting environment variables (Vercel, Railway, etc.).

---

### 1. Create a Razorpay Account

1. Sign up on [Razorpay Dashboard](https://dashboard.razorpay.com/).
2. For testing, keep the dashboard in **Test Mode** (no business verification or KYC required immediately).
3. For live sales, complete your KYC verification and activate **Live Mode**.

---

### 2. Generate API Keys

1. Navigate to **Account & Settings** (or the Settings cog on your dashboard sidebar).
2. Under **Developer Controls**, click **API Keys**.
3. Click **Generate Key** (or **Generate Live Key** if you are in Live Mode).
4. Download and save the generated keys immediately:
   - **Key ID** (starts with `rzp_test_` or `rzp_live_`)
   - **Key Secret** (only displayed once!)

---

### 3. Configure Environments

#### Frontend (`frontend/.env.local`)

Add your **Key ID** to your frontend configuration:

```env
VITE_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID_HERE
```

#### Backend (System Environment Variables)

Add both keys to your Spring Boot execution environment:

```properties
# System env variables (or application.properties)
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID_HERE
RAZORPAY_KEY_SECRET=YOUR_KEY_SECRET_HERE
```

---

### 4. Simulating Payments (Test Mode)

When testing in local development, you do not need to use real money. Razorpay provides standard mock coordinates to simulate transactions:

- **Mock Card Details**:
  - **Card Number**: `4111 1111 1111 1111` (Standard Visa test card)
  - **Expiry**: Any future date (e.g. `12/30`)
  - **Cardholder Name**: Any name (e.g. `John Doe`)
  - **CVV**: `123`
  - **OTP / 3D Secure Code**: `123456` (or click the mock "Success" button)
- **Netbanking**: Select any bank, and on the mock gateway page click **Success**.
- **UPI**: Enter any UPI ID (e.g., `success@razorpay`) to trigger a successful mock transaction, or `fail@razorpay` to trigger a simulated failure.

---

### 5. Webhook Setup (Recommended for Production)

Webhooks ensure your database order status gets updated even if a customer closes their browser window before the frontend payment verification call finishes.

1. Go to **Settings → Webhooks → Add New Webhook**.
2. **Webhook URL**: `https://your-api-domain.com/api/orders/webhook`
   _(For testing locally, use a tunneling tool like **ngrok** to get a public URL: `ngrok http 8080`)_.
3. **Secret**: Enter a strong random string (e.g., `MySuperSecureWebhookSecretString123`).
4. **Active Events**: Select `payment.captured` and `payment.failed`.
5. Save the webhook.
6. Configure the webhook secret in your backend:
   ```properties
   RAZORPAY_WEBHOOK_SECRET=MySuperSecureWebhookSecretString123
   ```

---

### 6. Going Live Checklist

Once you are ready to process real transactions:

1. Complete Razorpay KYC.
2. Toggle the dashboard switch to **Live Mode**.
3. Generate **Live Keys** (`rzp_live_...`).
4. Replace the environment variables on your production hosting server (Vercel, Railway, Render, or VPS) with your Live Key and Live Secret.
5. Create a Live Webhook in your Razorpay dashboard and update the `RAZORPAY_WEBHOOK_SECRET` environment variable accordingly.

---

---

## 🔒 Security Checklist Before Going Live

- [ ] Change `JWT_SECRET` to a random 64+ character string (use `openssl rand -hex 32`)
- [ ] Remove hardcoded Razorpay test keys from `application.properties`
- [ ] Set `spring.jpa.hibernate.ddl-auto=validate` (not `update`) in production
- [ ] Add `firebase-service-account.json` to `.gitignore` ✅ (already done)
- [ ] Set `CORS_ALLOWED_ORIGINS` to only your production domain
- [ ] Enable HTTPS on your backend domain
- [ ] Set Razorpay to live mode with live keys
- [ ] Add your production domain to Firebase Authorized Domains

---

## 🧪 API Reference

All endpoints (except `GET /api/products/**`) require an `Authorization: Bearer <jwt>` header.

| Method   | Path                        | Auth             | Description                        |
| -------- | --------------------------- | ---------------- | ---------------------------------- |
| `POST`   | `/api/auth/login`           | None             | Exchange Firebase ID token for JWT |
| `GET`    | `/api/products`             | None             | List products (paged)              |
| `GET`    | `/api/products/{id}`        | None             | Get single product                 |
| `POST`   | `/api/orders`               | User             | Create Razorpay order              |
| `POST`   | `/api/orders/verify`        | User             | Verify payment signature           |
| `GET`    | `/api/download/{productId}` | User (purchased) | Get signed download URL            |
| `POST`   | `/api/admin/products`       | Admin            | Create product (with files)        |
| `PUT`    | `/api/admin/products/{id}`  | Admin            | Update product                     |
| `DELETE` | `/api/admin/products/{id}`  | Admin            | Delete product                     |
| `GET`    | `/api/admin/orders`         | Admin            | List all orders                    |
| `GET`    | `/api/admin/users`          | Admin            | List all users                     |

---

## 🐛 Common Issues & Fixes

| Error                                     | Cause                                        | Fix                                                                               |
| ----------------------------------------- | -------------------------------------------- | --------------------------------------------------------------------------------- |
| `cannot find symbol: variable log`        | Lombok `@Slf4j` not processing               | Add `private static final Logger log = LoggerFactory.getLogger(ClassName.class);` |
| `cannot find symbol: method getXxx()`     | Lombok `@Data` not processing                | Add explicit getters/setters (already done for all entities)                      |
| White screen on frontend                  | Missing or wrong `VITE_FIREBASE_*` values    | Check browser console; fill in `.env.local`                                       |
| `401 Unauthorized` on API                 | JWT expired or wrong secret                  | Re-login to get new token; verify `JWT_SECRET` matches                            |
| `Firebase Storage bucket not initialized` | Wrong bucket name or missing service account | Check `FIREBASE_STORAGE_BUCKET` and verify JSON file is present                   |
| `CORS error`                              | Backend CORS not allowing frontend origin    | Add frontend URL to `CORS_ALLOWED_ORIGINS`                                        |
| `Access denied to download`               | User hasn't purchased product                | Expected behavior — purchase first                                                |
| MySQL `Unknown column`                    | Schema out of sync                           | Set `ddl-auto=update` and restart backend                                         |

---

## 📦 Building for Production

### Frontend

```bash
cd frontend
npm run build        # outputs to frontend/dist/
# Upload dist/ contents to Vercel / Netlify / your CDN
```

### Backend

```bash
cd backend
./mvnw package -DskipTests    # Linux / macOS
mvnw.cmd package -DskipTests  # Windows
# JAR is at: backend/target/sharpshadow-0.0.1-SNAPSHOT.jar
```

Run the JAR directly:

```bash
java -jar target/sharpshadow-0.0.1-SNAPSHOT.jar \
  --MYSQL_URL="jdbc:mysql://..." \
  --JWT_SECRET="..." \
  --RAZORPAY_KEY_ID="..."
```

---

_Last updated: May 2026 · SharpShadow by YuvinaTech_
#   p r o j e c t - s h a r p s h a d o w  
 