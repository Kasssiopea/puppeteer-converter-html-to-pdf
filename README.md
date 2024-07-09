
# htmltopdf

Це Node.js додаток для конвертації HTML у PDF за допомогою Puppeteer.

## Встановлення

1. Завантажте код за допомогою Git:

    ```bash
    git clone <repository_url>
    ```

2. Встановіть залежності:

    ```bash
    npm install
    ```

3. Створіть файл `.env` з необхідними змінними середовища, наприклад:

```dotenv
    NODE_PORT=3000
    NODE_HOST=http://localhost
    BROWSER_OPTIONS=--no-sandbox,--disable-setuid-sandbox
 ```

4. Запустіть додаток:

    ```bash
    npm start
    ```

## Використання

### API Endpoint

#### Конвертування HTML в PDF

- **URL:** `/convertHtmlToPdf`
- **Метод:** POST
- **Параметри запиту:**

```json
   {
      "html": "<html><body><h1>Hello, World!</h1></body></html>",
      "options": {
         "pageSize": "A4",
         "marginTop": "10mm",
         "marginBottom": "10mm",
         "marginLeft": "10mm",
         "marginRight": "10mm",
         "zoom": 1
      }
   }
```

- **Успішна відповідь:** PDF файл.
- **Помилкова відповідь:** JSON об'єкт з текстом помилки.

### Swagger Документація

Swagger документація доступна за адресою:

 ```
   http://localhost:3000/api-docs
```

---

    За додатковою інформацією звертайтеся до [документації Puppeteer](https://pptr.dev/) та [документації Express](https://expressjs.com/).