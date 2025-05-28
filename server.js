
// Import các thư viện cần thiết
const express = require('express');
const sql = require('mssql');
const dotenv = require('dotenv');

// Load các biến môi trường từ file .env 
dotenv.config();

// Cấu hình kết nối đến SQL Server
const dbConfig = {
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: {
      encrypt: false, 
      trustServerCertificate: true 
    }
  };
  
  // Hàm để kết nối đến SQL Server
  async function connectToDatabase() {
    try {
      await sql.connect(dbConfig);
      console.log('Đã kết nối thành công đến SQL Server!');
    } catch (err) {
      console.error('Không thể kết nối đến SQL Server:', err);
    }
  }
  
  // Gọi hàm kết nối khi server khởi động
  connectToDatabase();

// Tạo một ứng dụng Express
const app = express();
const port = process.env.PORT || 3000;

// Middleware để parse JSON trong body của request
app.use(express.json());

// Route gốc (chỉ để kiểm tra server)
app.get('/', (req, res) => {
  res.send('Ứng dụng chấm công Hanet đang chạy!');
});

// Endpoint để nhận dữ liệu từ webhook của Hanet
app.post('/hanet-webhook', async (req, res) => {
    try {
        const hanetData = req.body;
        console.log('Dữ liệu nhận được từ webhook Hanet:', hanetData);

        // Tạo một request SQL
        const request = new sql.Request();

        // Thêm các tham số cho câu lệnh INSERT vào bảng du_lieu_tho
        request.input('keycode', sql.VarChar(255), hanetData.keycode);
        request.input('date', sql.VarChar(20), hanetData.date);
        request.input('personTitle', sql.VarChar(255), hanetData.personTitle);
        request.input('temp', sql.Float, hanetData.temp);
        request.input('data', sql.Text, hanetData.data);
        request.input('action_type', sql.VarChar(50), hanetData.action_type);
        request.input('detected_image_url', sql.VarChar(255), hanetData.detected_image_url);
        request.input('placeID', sql.VarChar(50), hanetData.placeID);
        request.input('deviceID', sql.VarChar(50), hanetData.deviceID);
        request.input('deviceName', sql.NVarChar(255), hanetData.deviceName);
        request.input('personName', sql.NVarChar(255), hanetData.personName);
        request.input('aliasID', sql.VarChar(50), hanetData.aliasID);
        request.input('data_type', sql.VarChar(50), hanetData.data_type);
        request.input('personID', sql.VarChar(50), hanetData.personID);
        request.input('id', sql.VarChar(50), hanetData.id);
        request.input('time', sql.BigInt, hanetData.time);
        request.input('personType', sql.VarChar(10), hanetData.personType);
        request.input('placeName', sql.NVarChar(255), hanetData.placeName);
        request.input('hash', sql.VarChar(255), hanetData.hash);
        request.input('mask', sql.VarChar(10), hanetData.mask);

        // Câu lệnh INSERT INTO bảng du_lieu_tho
        const query = `
            INSERT INTO du_lieu_tho (keycode, date, personTitle, temp, data, action_type, detected_image_url, placeID, deviceID, deviceName, personName, aliasID, data_type, personID, id, time, personType, placeName, hash, mask)
            VALUES (@keycode, @date, @personTitle, @temp, @data, @action_type, @detected_image_url, @placeID, @deviceID, @deviceName, @personName, @aliasID, @data_type, @personID, @id, @time, @personType, @placeName, @hash, @mask)
        `;

        // Thực thi câu lệnh INSERT
        const result = await request.query(query);
        console.log('Dữ liệu đã được lưu vào bảng du_lieu_tho:', result);

        res.status(200).send('Webhook Hanet đã nhận và lưu dữ liệu vào bảng du_lieu_tho thành công!');
    } catch (error) {
        console.error('Lỗi khi xử lý và lưu dữ liệu webhook Hanet:', error);
        res.status(500).send('Lỗi khi xử lý và lưu dữ liệu webhook Hanet');
    }
});

// Khởi động server
app.listen(port, () => {
  console.log(`Server đang lắng nghe tại http://localhost:${port}`);
});