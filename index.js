const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const app = express()

// إنشاء مجلد uploads إذا لم يكن موجودًا
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads')
}

// جعل الملفات قابلة للوصول بالرابط
app.use('/uploads', express.static('uploads'))

// إنشاء اسم عشوائي من 5 أحرف
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },

    filename: (req, file, cb) => {
        let name = ''

        for (let i = 0; i < 5; i++) {
            name += chars[Math.floor(Math.random() * chars.length)]
        }

        cb(null, name + path.extname(file.originalname))
    }
})

// إعداد Multer
const upload = multer({
    storage,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB
    }
})

// الصفحة الرئيسية
app.get('/', (req, res) => {
    res.send('B7R DEVX 😍')
})

// رفع الملف
app.post('/api/upload', upload.single('file'), (req, res) => {

    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'لم يتم إرسال أي ملف'
        })
    }

    const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`

    res.json({
        success: true,
        url,
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
    })

})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
