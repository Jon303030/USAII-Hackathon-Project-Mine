# 后端快速启动指南

## 5 分钟上手

### 1️⃣ 获取 Gemini API Key

1. 访问 https://aistudio.google.com/app/apikeys
2. 点击 "Create API Key"
3. 选择 "Create new secret key in new project"
4. 复制 API Key

### 2️⃣ 配置环境

```bash
# 复制示例配置
cp .env.example .env.local

# 编辑 .env.local，填入 API Key
nano .env.local
# 或用编辑器打开，找到这行：
# GEMINI_API_KEY=your_gemini_api_key_here
# 替换为你的真实 Key
```

### 3️⃣ 安装与启动

```bash
# 安装依赖（如果还未安装）
npm install

# 启动开发服务器
npm run dev

# 访问应用
open http://localhost:8000
```

### 4️⃣ 测试后端 API

#### 方法 A：使用 cURL

```bash
# 1. 初始化会话
curl -X POST http://localhost:8000/api/fill/session \
  -H "Content-Type: application/json" \
  -d '{"phone":"0123456789","language":"zh_CN"}'

# 记下返回的 sessionId，假设为 session_0123456789_xxx

# 2. 发送第一条消息
curl -X POST http://localhost:8000/api/fill/chat \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId":"session_0123456789_xxx",
    "message":"我叫王大明",
    "language":"zh_CN"
  }'

# 3. 搜索表格
curl -X POST http://localhost:8000/api/fill/forms/search \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"session_0123456789_xxx"}'
```

#### 方法 B：使用 VS Code REST Client 扩展

创建 `test.http` 文件：

```http
### 初始化会话
POST http://localhost:8000/api/fill/session
Content-Type: application/json

{
  "phone": "0123456789",
  "language": "zh_CN"
}

### 发送文本消息
POST http://localhost:8000/api/fill/chat
Content-Type: application/json

{
  "sessionId": "session_0123456789_1718617200000",
  "message": "我叫王大明",
  "language": "zh_CN"
}

### 搜索表格
POST http://localhost:8000/api/fill/forms/search
Content-Type: application/json

{
  "sessionId": "session_0123456789_1718617200000"
}

### 获取表格详情
GET http://localhost:8000/api/fill/forms/form_spa
  ?sessionId=session_0123456789_1718617200000
```

右键点击每个请求，选择 "Send Request"。

#### 方法 C：使用 Postman

1. 创建新的 Collection
2. 添加请求（参考上面的 cURL 或 HTTP 文件）
3. 点击 "Send" 执行

---

## 核心流程演示

### 完整对话流程

```
用户: 初始化会话
↓
后端: 欢迎用户，询问电话号码
↓
用户: 说出电话号码
↓
后端: 记录电话，进入 GATHER_PROFILE，开始询问基本资料
↓
用户: 回答一系列问题（姓名、年龄、地址等）
↓
后端: 采集到足够信息，进入 FORM_MATCHING，搜索符合的表格
↓
用户: 选择其中一个表格
↓
后端: 进入 FORM_EXPLANATION，用简单语言解释表格条款
↓
用户: 确认要继续
↓
后端: 进入 FORM_FILLING，逐个询问表格所需的字段
↓
用户: 填充完所有字段
↓
后端: 进入 CONFIRM_TERMS，要求同意免责声明
↓
用户: 同意
↓
后端: 进入 COMPLETED，汇总数据，显示完成消息
↓
系统: 触发后续流程（短信通知、志愿者联系等）
```

---

## 文件位置速查

### 新增文件
- `backend/types.ts` - 类型定义
- `backend/prompts.ts` - 多语言 Prompt
- `backend/ai-service.ts` - Gemini 集成
- `backend/form-matcher.ts` - 表格匹配
- `backend/fill/session-manager.ts` - 会话管理
- `app/api/fill/session/route.ts` - 会话初始化 API
- `app/api/fill/forms/search/route.ts` - 表格搜索 API
- `app/api/fill/forms/[formId]/route.ts` - 表格详情 API
- `app/api/fill/complete/route.ts` - 完成流程 API
- `backend/IMPLEMENTATION.md` - 详细文档

### 修改文件
- `backend/fill/chatbot.ts` - 改造为 Gemini 驱动
- `app/api/fill/chat/route.ts` - 支持音频和新会话模式
- `.env.example` - 新增 Gemini 配置

---

## 故障排除

### 问题：Gemini API 返回错误

**症状**：`Error: Failed to call Gemini API`

**解决**：
1. 检查 API Key 是否正确设置在 `.env.local`
2. 检查网络连接
3. 确认 API Key 的配额没有用完
4. 查看 `console` 的详细错误信息

### 问题：会话文件找不到

**症状**：`Session not found`

**解决**：
1. 确保 `storage/pvc/` 目录存在
2. 检查 sessionId 是否正确
3. 会话可能已过期（超过 30 天自动删除）

### 问题：音频处理失败

**症状**：音频消息没有被正确识别

**解决**：
1. 检查音频格式是否支持（WAV、MP3、WebM）
2. 确保音频质量良好（不要太嘈杂）
3. 前端需要正确编码为 Base64
4. 检查后端日志中的详细错误

### 问题：表格没有被匹配

**症状**：搜索表格返回空列表

**解决**：
1. 确保用户资料已填充（名字、年龄、地址等）
2. 检查用户资料是否符合任何表格的基本条件
3. 查看 `FormMatcher.calculateMatchScore()` 的匹配规则

---

## 架构总结

```
┌─────────────────────────────────────┐
│      前端 (FillClient.tsx)          │
│   语音输入、消息展示、表格展示      │
└──────────────┬──────────────────────┘
               │ HTTP 请求/响应
               ↓
┌─────────────────────────────────────┐
│        API 层 (app/api/fill/*)       │
│  路由、请求验证、响应序列化         │
└──────────────┬──────────────────────┘
               │
      ┌────────┴────────┐
      ↓                 ↓
┌──────────────┐  ┌──────────────────┐
│   Chatbot    │  │ SessionManager   │
│ (chatbot.ts) │  │(session-*.ts)    │
└──────┬───────┘  └────────┬─────────┘
       │                   │
       ├─→ AI Service ←────┤
       │  (ai-service.ts)  │
       │                   │
       ├─→ FormMatcher ←───┤
       │ (form-matcher.ts) │
       │                   │
       └───→ Prompts ←─────┘
          (prompts.ts)
               │
               ↓
         ┌──────────────┐
         │  Gemini API  │
         │   (远程)     │
         └──────────────┘
```

---

## 下一步行动

1. **配置环境**：设置 `.env.local` 和 Gemini API Key ✅
2. **启动服务**：`npm run dev` ✅
3. **测试 API**：使用上面的 cURL 或 Postman 测试 ✅
4. **前端集成**：队友修改 `fill/FillClient.tsx` 调用新 API
5. **部署**：使用 Docker 部署到生产环境

---

## 获取帮助

- 📚 详细文档：[backend/IMPLEMENTATION.md](./IMPLEMENTATION.md)
- 🔍 类型定义：[backend/types.ts](./types.ts)
- 💬 Prompt 示例：[backend/prompts.ts](./prompts.ts)
- 🌐 API 路由：[app/api/fill/](../app/api/fill/)

---

**祝你黑客松顺利！** 🚀
