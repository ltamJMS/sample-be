
import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';

import OpenAI from 'openai';


const app = express();
const port = 3000;
app.use(express.json());


app.use(cors());

const OPENAI_API_KEY = "YOUR_API_KEY_HERE";
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});


// MongoDB config
const uri = 'mongodb+srv://ltam:00000000@cluster0.edfcjbc.mongodb.net/';
const dbName = 'test'; // Đổi tên DB nếu cần
let db: any;


MongoClient.connect(uri)
  .then((client) => {
    db = client.db(dbName);
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

// API ghi data vào collection 'test'
app.post('/api/test', async (req, res) => {
  try {
    const result = await db.collection('test').insertOne(req.body);
    res.json({ insertedId: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: 'Insert failed', details: err });
  }
});

// API lấy data từ collection 'test'
app.get('/api/test', async (req, res) => {
  try {
    const data = await db.collection('test').find({}).toArray();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Fetch failed', details: err });
  }
});


// API sinh câu hỏi bằng AI và lưu vào DB
app.post('/generate-question', async (req, res) => {
  const { prompt, count = 1 } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }
  try {
    // Gọi OpenAI để sinh nhiều câu hỏi trắc nghiệm
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content:
            `Hãy sinh ${count} câu hỏi trắc nghiệm về chủ đề: "${prompt}". Trả về dạng JSON array, mỗi phần tử: {question, options: ["A", "B", "C", "D"], answer: "Đáp án đúng (text)"}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });
    // Parse kết quả
    const aiText = completion.choices[0].message?.content || '';
    let questions: any[] = [];
    try {
      questions = JSON.parse(aiText);
      if (!Array.isArray(questions)) {
        questions = [questions];
      }
    } catch (e) {
      return res.status(500).json({ error: 'AI response parse error', aiText });
    }
    // Lưu từng câu hỏi vào DB
    const insertResult = await db.collection('test').insertMany(questions);
    res.json({ questions, insertedIds: insertResult.insertedIds });
  } catch (err) {
    res.status(500).json({ error: 'AI or DB error', details: err });
  }
});


app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});