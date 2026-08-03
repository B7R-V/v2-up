const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// طباعة المسار الحالي للتأكد
console.log('Current directory:', __dirname);

// إنشاء مجلد uploads
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
    console.log('📁 Uploads directory created');
}

// مجلد public
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
    console.error('❌ Public directory not found!');
    process.exit(1);
}

// تقديم الملفات الثابتة
app.use('/uploads', express.static(uploadDir));
app.use(express.static(publicDir));

// توليد اسم عشوائي
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        let name = '';
        for (let i = 0; i < 6; i++) name += chars[Math.floor(Math.random() * chars.length)];
        cb(null, name + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 }
});

// الصفحة الرئيسية
app.get('/', (req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
});

// رفع الملف
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'لم يتم إرسال أي ملف' });
    }
    const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({
        success: true,
        url,
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
    });
});

// معالجة الأخطاء
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ success: false, message: 'حجم الملف يتجاوز 100 ميجابايت' });
        }
    }
    res.status(500).json({ success: false, message: err.message || 'خطأ في الخادم' });
});

// معالجة 404
app.use((req, res) => {
    res.status(404).send('الصفحة غير موجودة');
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📁 Public directory: ${publicDir}`);
    console.log(`📁 Uploads directory: ${uploadDir}`);
});
// ✅ الصفحة الرئيسية - تعرض index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// رفع الملف
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'لم يتم إرسال أي ملف'
        });
    }

    const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({
        success: true,
        url,
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
    });
});

// معالجة أخطاء Multer
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'حجم الملف يتجاوز الحد المسموح (100 ميجابايت)'
            });
        }
    }
    res.status(500).json({
        success: false,
        message: err.message || 'خطأ في الخادم'
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
