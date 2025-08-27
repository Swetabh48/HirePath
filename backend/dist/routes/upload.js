import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth.js';
import { recognizeFoodFromImage } from '../services/ai.js';
const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
router.post('/image', requireAuth, upload.single('image'), async (req, res) => {
    if (!req.file)
        return res.status(400).json({ error: 'Image required' });
    // In a real app, upload to object storage and obtain a URL; here we return stub
    const imageUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    const items = await recognizeFoodFromImage(imageUrl);
    res.json({ items });
});
export default router;
