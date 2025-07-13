import express from 'express';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(cors());

// Dữ liệu mẫu cho câu hỏi quizlet
interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
}

const quizQuestions: QuizQuestion[] = [
  {
    question: 'What is the capital of France?',
    options: ['Paris', 'London', 'Berlin', 'Madrid'],
    answer: 'Paris'
  },
  {
    question: 'What is 2 + 2?',
    options: ['3', '4', '5', '6'],
    answer: '4'
  }
  // Thêm nhiều câu hỏi hơn nếu cần
];

// API trả về danh sách câu hỏi
app.get('/api/questions', (req, res) => {
  res.json(quizQuestions);
});

// API trả về một câu hỏi ngẫu nhiên
app.get('/api/question/random', (req, res) => {
  const randomIndex = Math.floor(Math.random() * quizQuestions.length);
  res.json(quizQuestions[randomIndex]);
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});