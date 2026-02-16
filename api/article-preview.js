import { supabase } from '../utils/supabase.js';

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).send('<html><body><h1>请提供文章ID</h1></body></html>');
  }

  try {
    // 直接使用 eq 查询并返回数组
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id);

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    // 检查是否有结果
    if (!data || data.length === 0) {
      return res.status(404).send('<html><body><h1>文章不存在</h1><p>ID: ' + id + '</p></body></html>');
    }

    const article = data[0];

    // 构建HTML页面
    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${article.title}</title>
  <style>
    body {
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      line-height: 1.8;
      background: #f5f5f5;
    }
    .container {
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .meta {
      color: #999;
      font-size: 14px;
      margin-bottom: 20px;
      padding-bottom: 20px;
      border-bottom: 1px solid #eee;
    }
    .content {
      font-size: 16px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="meta">
      <div>热点话题：${article.hot_topic || '无'}</div>
      <div>字数：${article.word_count || 0} | 预计阅读：${article.estimated_read_time || 0}分钟</div>
    </div>
    <div class="content">
      ${article.formatted_content}
    </div>
  </div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(html);

  } catch (error) {
    console.error('获取文章失败:', error);
    res.status(500).send('<html><body><h1>服务器错误</h1><pre>' + error.message + '</pre></body></html>');
  }
}
```

---

**修改并提交后，等2分钟，然后再访问：**
```
https://aiwriter2026.vercel.app/api/article-preview?id=0c0eb739-994a-4bd3-9397-7c5c2b9e09aa
