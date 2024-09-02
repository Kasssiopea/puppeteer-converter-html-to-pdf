const express = require('express');
const puppeteer = require('puppeteer');
const winston = require('winston');
const helmet = require('helmet');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const dotenv = require('dotenv');
const app = express();


// Загрузка переменных окружения в зависимости от NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.dev';
dotenv.config({ path: envFile });

const PORT = process.env.NODE_PORT || 3000;
const HOST = process.env.NODE_HOST || 'http://localhost';
// const DEBUG = process.env.DEBUG || null;
const BROWSER_OPTIONS = process.env.BROWSER_OPTIONS.split(',') || ['--no-sandbox', '--disable-setuid-sandbox'];

// Middleware для работы с файлами
app.use(helmet());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Настройка winston для логирования
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
  ),
  transports: [
    new winston.transports.Console()
    // new winston.transports.File({ filename: 'error.log', level: 'error' }),
    // new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Swagger настройка
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'HTML to PDF API',
      version: '1.0.0',
      description: 'API для конвертации HTML в PDF'
    },
    servers: [
      {
        url: `${HOST}:${PORT}`
      }
    ]
  },
  apis: ['./app.js'] // Путь к файлу с документацией
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Маршрут для обработки запроса на конвертацию HTML в PDF
/**
 * @swagger
 * /v1/convert-html-to-pdf:
 *   post:
 *     summary: Конвертирует HTML в PDF
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               html:
 *                 type: string
 *                 description: HTML контент
 *                 example: "<html><body><h1>Hello, World!</h1></body></html>"
 *               options:
 *                 type: object
 *                 properties:
 *                   pageSize:
 *                     type: string
 *                     description: Размер страницы
 *                     example: "A4"
 *                   marginTop:
 *                     type: string
 *                     description: Верхнее поле
 *                     example: "10mm"
 *                   marginBottom:
 *                     type: string
 *                     description: Нижнее поле
 *                     example: "10mm"
 *                   marginLeft:
 *                     type: string
 *                     description: Левое поле
 *                     example: "10mm"
 *                   marginRight:
 *                     type: string
 *                     description: Правое поле
 *                     example: "10mm"
 *                   zoom:
 *                     type: number
 *                     description: Масштабирование
 *                     example: 1
 *     responses:
 *       200:
 *         description: PDF файл
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       500:
 *         description: Произошла ошибка при конвертации в PDF
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Текст ошибки
 *                   example: "Помилка при конвертації в PDF"
 *                 message:
 *                   type: string
 *                   description: Додаткове повідомлення про помилку (необов'язково)
 *                   example: "Виникла помилка при обробці HTML контенту"
 */
app.post('/v1/convert-html-to-pdf', async (req, res) => {
  const { html } = req.body; // Принимаем HTML контент из запроса
  const { options } = req.body;

  // Логирование IP-адреса отправителя
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  logger.info(`Получен запрос на конвертацию HTML в PDF от IP: ${ip}`);

  try {
    if (!html) {
      const errorMessage = 'required parameter "html" is missing';
      logger.error('Помилка при конвертації в PDF:', { error: errorMessage });
      return res.status(422).json({ error: errorMessage });
    }

    const browser = await puppeteer.launch({
      headless: true,
      args: BROWSER_OPTIONS,
    });
    const page = await browser.newPage();

    // Установка контента страницы
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Настройка опций для PDF
    const pdfOptions = {
      format: options.pageSize || 'A4',
      margin: {
        top: options.marginTop || '10mm',
        right: options.marginRight || '10mm',
        bottom: options.marginBottom || '10mm',
        left: options.marginLeft || '10mm',
      },
      printBackground: true,
      scale: options.zoom || 1,
      preferCSSPageSize: true,
    };

    // Генерация PDF
    const pdfBuffer = await page.pdf(pdfOptions);

    await browser.close();

    // Отправка PDF в ответе
    res.setHeader('Content-Type', 'application/pdf; charset=utf-8');
    res.setHeader('Content-Disposition', 'inline; filename="output.pdf"'); // Измените на attachment для скачивания
    res.send(pdfBuffer);
  } catch (err) {
    const errorMessage = 'Помилка при конвертації в PDF';
    logger.error('Помилка при конвертації в PDF:', { error: err.message, stack: err.stack });
    res.status(500).json({ error: errorMessage });
  }
});

// if (DEBUG) {
//   app.post('*', async (req, res) => {
//     const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
//     logger.info(`Получен запрос на конвертацию HTML в PDF от IP: ${ip}: ${req}`);
//   });

//   app.get('*', async (req, res) => {
//     const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
//     logger.info(`Получен запрос на конвертацию HTML в PDF от IP: ${ip}: ${req}`);
//   });
// }


// Запускаем Express сервер
app.listen(PORT, () => {
  logger.info(`Сервер запущен на порту ${PORT}`);
  console.log(`Сервер запущен на порту ${PORT}. Swagger документация доступна по адресу ${HOST}:${PORT}/api-docs`);
});
