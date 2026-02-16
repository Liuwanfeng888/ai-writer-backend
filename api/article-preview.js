import { supabase } from '../utils/supabase.js';

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: '请提供文章ID' });
  }

  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .limit(1);

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).send('<html><body><h1>文章不存在</h1></body></html>');
    }

    const article = data[0];

    // 直接返回格式化的内容
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(`
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${article.title}</title>
        <style>
          body{max-width:800px;margin:40px auto;padding:20px;font-family:sans-serif;line-height:1.8;background:#f5f5f5}
          .container{background:white;padding:40px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1)}
          .meta{color:#999;font-size:14px;margin-bottom:20px;padding-bottom:20px;border-bottom:1px solid #eee}
          .content{font-size:16px}
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
      </html>
    `);

  } catch (error) {
    console.error('获取文章失败:', error);
    res.status(500).send(`<html><body><h1>错误：${error.message}</h1></body></html>`);
  }
}
