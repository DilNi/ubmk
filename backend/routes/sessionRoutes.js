const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');
const Session = require('../models/Session');
const PdfPrinter = require('pdfmake');
const pdf = require('html-pdf'); 


// PDF indirme
router.get('/pdf/:title', async (req, res) => {
    try {
        const sessionTitle = req.params.title;
        const session = await Session.findOne({ title: sessionTitle });

        if (!session || !session.pdf) {
            return res.status(404).json({ error: 'PDF bulunamadı' });
        }

        const pdfPath = path.join(__dirname, '../public/pdfs', session.pdf);
        if (!fs.existsSync(pdfPath)) {
            return res.status(404).json({ error: 'PDF bulunamadı' });
        }

        res.download(pdfPath, session.pdf, (err) => {
            if (err) {
                console.error('PDF indirme hatası:', err);
                return res.status(500).json({ error: 'PDF indirilemedi' });
            }
        });
    } catch (error) {
        console.error('PDF İndirme Hatası:', error.message);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

// Oturumları listeleme
router.get('/list', async (req, res) => {
    try {
        const sessions = await Session.find();
        res.status(200).json(sessions);
    } catch (error) {
        console.error('Oturum listeleme hatası:', error.message);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

// Tek bir oturum görüntüleme
router.get('/:id', async (req, res) => {
    try {
        const session = await Session.findById(req.params.id);
        if (!session) {
            return res.status(404).json({ error: 'Oturum bulunamadı' });
        }
        res.status(200).json(session);
    } catch (error) {
        console.error('Oturum görüntüleme hatası:', error.message);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});
router.get('/generate-evaluation/:title', async (req, res) => {
    try {
        const sessionTitle = req.params.title;

        // Şablon dosyasının yolu
        const templatePath = path.join(__dirname, './templates/evaluation_template.html');
        const pdfPath = path.join(__dirname, `../public/pdfs/${sessionTitle}_evaluation_form.pdf`);

        console.log('Şablon yolu:', templatePath);

        // Oturum bilgilerini alın
        const sessions = await Session.find({ title: sessionTitle });
        if (!sessions || sessions.length === 0) {
            return res.status(404).json({ error: 'Bu başlıkla oturum bulunamadı!' });
        }

        console.log('Şablon yolu:', templatePath);
        console.log('Şablon işleniyor...');
        ejs.renderFile(templatePath, { session: sessions[0] }, (err, renderedHtml) => {
            if (err) {
                console.error('Şablon işlenirken hata oluştu:', err.message);
                return res.status(500).json({ error: 'Şablon işlenirken bir hata oluştu!' });
            }
            console.log('Şablon işlendi.');
            fs.writeFileSync('output.html', renderedHtml);
            console.log('HTML dosyası kaydedildi.');
            pdf.create(renderedHtml).toFile(pdfPath, (err, result) => {
                if (err) {
                    console.error('PDF oluşturulurken hata oluştu:', err.message);
                    return res.status(500).json({ error: 'PDF oluşturulurken bir hata oluştu!' });
                }
                console.log(`PDF başarıyla oluşturuldu: ${pdfPath}`);
                res.download(pdfPath);
            });
        });
        

    } catch (error) {
        console.error('Hata:', error.message);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

// PDF oluşturma ve kaydetme
const createPDF = async (session, filePath) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);

        // PDF içeriği
        doc.fontSize(16).text('Değerlendirme Formu', { align: 'center' }).moveDown();
        doc.fontSize(12).text(`Session Title: ${session.title}`).moveDown();
        doc.text(`Date: ${session.date}`);
        doc.text(`Code: ${session.code}`);
        doc.text(`Description: ${session.description}`);
        doc.text(`Speaker: ${session.speaker}`);
        doc.text(`Start Time: ${session.startTime}`);
        doc.text(`End Time: ${session.endTime}`);
        doc.text(`Location: ${session.location}`);
        doc.text(`Session Chair: ${session.sessionChair}`);
        doc.end();

        // PDF oluşturma tamamlandığında resolve edilir
        stream.on('finish', () => {
            console.log(`PDF oluşturuldu ve kaydedildi: ${filePath}`);
            resolve();
        });
        stream.on('error', (err) => reject(err));
    });
};

// Otomatik PDF oluşturup kaydederek oturum ekleme
router.post('/add', async (req, res) => {
    try {
        const { title, date, type, speaker, description, code, startTime, endTime, location, sessionChair } = req.body;

        if (!title || !date || !type || !startTime || !endTime || !location) {
            return res.status(400).json({ error: 'Zorunlu alanlar eksik!' });
        }

        const newSession = new Session({
            title,
            date,
            type,
            speaker: speaker || '',
            description: description || '',
            code: code || '',
            startTime,
            endTime,
            location,
            sessionChair: sessionChair || '',
        });

        console.log('Oturum oluşturuldu:', newSession);

        // Oturum kaydediliyor
        await newSession.save();
        console.log('Oturum kaydedildi:', newSession);

        // PDF oluşturma
        const pdfFileName = `${title.replace(/\s+/g, '_')}_evaluation_form.pdf`;
        const pdfFilePath = path.join(__dirname, '../public/pdfs', pdfFileName);
        await createPDF(newSession, pdfFilePath);

        console.log('PDF oluşturuldu:', pdfFileName);

        // PDF dosya adını oturuma ekle
        newSession.pdf = pdfFileName;
        await newSession.save();

        console.log('Oturum güncellendi ve PDF kaydedildi:', newSession);

        res.status(201).json({ message: 'Oturum başarıyla eklendi!', session: newSession });
    } catch (error) {
        console.error('Oturum ekleme hatası:', error.message);
        res.status(500).json({ error: 'Oturum eklenirken bir hata oluştu!' });
    }
});




module.exports = router;
