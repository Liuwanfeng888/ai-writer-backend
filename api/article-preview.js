import { supabase } from '../utils/supabase.js';

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).send('请提供文章ID');
  }

  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).send('文章不存在');
    }

    // 返回渲染后的HTML页面
    const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.title}</title>
  <style>
    body {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.8;
      color: #333;
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
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 1px solid #eee;
    }
    .content {
      font-size: 16px;
    }
    .back {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #eee;
    }
    .back a {
      color: #1890ff;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="meta">
      <div>热点话题：${data.hot_topic || '无'}</div>
      <div>字数：${data.word_count || 0} | 预计阅读：${data.estimated_read_time || 0}分钟</div>
      <div>生成时间：${new Date(data.generated_at).toLocaleString('zh-CN')}</div>
    </div>
    
    <div class="content">
      ${data.formatted_content}
    </div>

    <div class="back">
      <a href="/api/articles">← 返回文章列表</a>
    </div>
  </div>
</body>
</html>
    `;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(html);

  } catch (error) {
    console.error('获取文章失败:', error);
    res.status(500).send('服务器错误：' + error.message);
  }
}
```

---

## 🎯 提交并测试

**提交代码后，等待2分钟重新部署，然后访问：**
```
https://aiwriter2026.vercel.app/api/article-preview?id=c4b4d90e-7892-4639-b347-25027ec381b9
