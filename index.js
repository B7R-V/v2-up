const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// إنشاء مجلد uploads إذا لم يكن موجوداً
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// تقديم الملفات المرفوعة
app.use('/uploads', express.static('uploads'));

// ✅ تقديم الملفات الثابتة من مجلد public
app.use(express.static(path.join(__dirname, 'public')));

// توليد اسم عشوائي للملف
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        let name = '';
        for (let i = 0; i < 6; i++) {
            name += chars[Math.floor(Math.random() * chars.length)];
        }
        cb(null, name + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB
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
